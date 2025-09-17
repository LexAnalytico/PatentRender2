import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import pricingToForm from '@/app/data/service-pricing-to-form.json'
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
  const { amount, currency, user_id, service_id, custom_price, type } = await req.json();

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
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

    const { data: inserted, error: insErr } = await serverSupabase
        .from('payments')
        .insert([
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
        ])
        .select()
        .maybeSingle();

      if (insErr) console.error('❌ Payment insert after order creation error:', JSON.stringify(insErr, Object.getOwnPropertyNames(insErr)));
      else console.debug('Payment row created for order', { order: order.id, paymentRow: inserted });
    } catch (e) {
      console.error('❌ Exception while inserting payment row after order creation:', e);
    }

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error('❌ Razorpay Order Creation Error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}