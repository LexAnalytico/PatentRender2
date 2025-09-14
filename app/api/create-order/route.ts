import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
  const { amount, currency, user_id, service_id, custom_price } = await req.json();

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

      const amtToStore = custom_price ?? amount ?? 0;
      const { data: inserted, error: insErr } = await serverSupabase
        .from('payments')
        .insert([
          {
            user_id: user_id ?? null,
            total_amount: amtToStore,
            payment_status: 'created',
            payment_date: null,
            razorpay_order_id: order.id,
            razorpay_payment_id: null,
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