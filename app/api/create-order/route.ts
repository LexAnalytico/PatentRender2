import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const order = await instance.orders.create({
      amount: amount,
      currency: currency,
      receipt: `receipt_order_${Date.now()}`,
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error('❌ Razorpay Order Creation Error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}