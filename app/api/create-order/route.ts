import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import pricingToForm from '@/app/data/service-pricing-to-form.json'
import { createClient } from '@supabase/supabase-js';

// Razorpay's Node SDK requires a Node.js runtime (not Edge). Force Node on Vercel.
export const runtime = 'nodejs'
// This route is dynamic and should never be statically optimized.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
  const { amount, currency, user_id, service_id, custom_price, type } = await req.json();

    // Validate server configuration early for clearer prod errors
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string | undefined
    const keySecret = process.env.RAZORPAY_KEY_SECRET as string | undefined
    if (!keyId || !keySecret) {
      console.error('❌ Missing Razorpay credentials in env. Have NEXT_PUBLIC_RAZORPAY_KEY_ID?', !!keyId, 'Have RAZORPAY_KEY_SECRET?', !!keySecret)
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: amount,
      currency: currency,
      receipt: `receipt_order_${Date.now()}`,
    });

  // Persist a payment row so verify/notify flows can resolve details
    try {
      const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
        : supabase;

      // Frontend sends `amount` in paise (integer). Store total_amount in rupees.
      const amtToStore = custom_price != null
        ? Number(custom_price)
        : (amount != null ? Number(amount) / 100 : 0);

  // Map incoming `type` (which may be a pricing key) to canonical form key
      const map = pricingToForm as unknown as Record<string,string>
      let mappedType: string | null = null
      if (typeof type !== 'undefined' && type != null) {
        mappedType = map[type] ?? type
      }

  // Validate provided user_id exists; do not trust client-provided ids
      let userToStore: string | null = null;
      try {
        if (user_id) {
          const { data: userRow, error: userErr } = await serverSupabase.from('users').select('id').eq('id', user_id).maybeSingle();
          if (userErr) console.debug('User lookup error when validating user_id for order:', userErr);
          if (userRow && (userRow as any).id) userToStore = (userRow as any).id;
        }
      } catch (uEx) {
        console.error('❌ Exception while validating user_id for order:', uEx);
      }

      // Validate provided service_id (optional) and store it on the payments row so
      // verify/notify can show the selected service without needing to rely on quotes.
      let serviceToStore: number | null = null;
      try {
        if (service_id != null) {
          const { data: svcRow, error: svcErr } = await serverSupabase.from('services').select('id').eq('id', service_id).maybeSingle();
          if (svcErr) console.debug('Service lookup error when validating service_id for order:', svcErr);
          if (svcRow && (svcRow as any).id) serviceToStore = Number((svcRow as any).id);
        }
      } catch (sEx) {
        console.error('❌ Exception while validating service_id for order:', sEx);
      }

    let inserted: any = null
    let insErr: any = null
    const insertPayload = [
      {
        user_id: userToStore,
        total_amount: amtToStore,
        payment_status: 'created',
        payment_date: null,
        razorpay_order_id: order.id,
        razorpay_payment_id: null,
        service_id: serviceToStore,
        type: mappedType ?? null,
        created_at: new Date().toISOString(),
      },
    ]
    ;({ data: inserted, error: insErr } = await serverSupabase
        .from('payments')
        .insert(insertPayload)
        .select()
        .maybeSingle());

      // Retry without type if a CHECK constraint fails
      if (insErr && insErr.code === '23514') {
        try {
          ;({ data: inserted, error: insErr } = await serverSupabase
            .from('payments')
            .insert([{ ...insertPayload[0], type: null }])
            .select()
            .maybeSingle())
        } catch (retryErr) {
          console.error('Retry insert payment without type failed:', retryErr)
        }
      }

  if (insErr && !inserted) console.error('❌ Payment insert after order creation error:', JSON.stringify(insErr, Object.getOwnPropertyNames(insErr)));
  else console.debug('Payment row created for order', { order: order.id, paymentRow: inserted });
    } catch (e) {
      console.error('❌ Exception while inserting payment row after order creation:', e);
    }

  return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error('❌ Razorpay Order Creation Error:', err);
    const safe: any = { error: 'Failed to create order' }
    try {
      const e = err as any
      if (e && (e.message || e.description)) safe.message = e.message || e.description
      if (e && e.code) safe.code = e.code
    } catch {}
    return NextResponse.json(safe, { status: 500 });
  }
}