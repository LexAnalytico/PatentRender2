import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs'  

// A helper function to save payment data and send an email notification.
// This is the same logic you had in your original `notify-payment` route.
async function processPaymentAndNotify(paymentDetails: any) {
  const { name, email, phone, message, payment_id, complexity, urgency } = paymentDetails;
  // Use a server-side Supabase client when available (service role key)
  const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
    : supabase;

  // Save to Supabase
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!usingServiceRole) {
    console.warn('\u26A0\ufe0f No SUPABASE_SERVICE_ROLE_KEY set; using anon/public Supabase client which may be blocked by RLS.');
  }

  try {
    const { data, error: dbError } = await serverSupabase.from('ipfiling').insert([
      {
        name,
        email,
        phone,
        message,
        payment_id,
        complexity,
        urgency,
        created_at: new Date().toISOString(),
        // Make sure to add any other required fields from your table schema here
      },
    ]).select();

    if (dbError) {
      // Log full error object and common fields for easier debugging
      console.error('\u274c Supabase Insert Error (full):', dbError);
      try {
        console.error('dbError.message:', (dbError as any)?.message);
        console.error('dbError.details:', (dbError as any)?.details);
        console.error('dbError.hint:', (dbError as any)?.hint);
        console.error('dbError.code:', (dbError as any)?.code);
      } catch (logErr) {
        console.error('Error while printing dbError fields', logErr);
      }

      return { success: false, message: 'Failed to save to Supabase', dbError };
    }
  } catch (e) {
    console.error('\u274c Exception while inserting into Supabase:', e);
    return { success: false, message: 'Exception while saving to Supabase', error: String(e) };
  }

  // Send email notification
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Patent Site" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: '✅ Verified New Patent Inquiry + Payment Received',
      html: `
        <h2>New Lead</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Complexity:</strong> ${complexity || 'N/A'}</p>
        <p><strong>Urgency:</strong> ${urgency || 'N/A'}</p>
        <p><strong>Payment ID:</strong> ${payment_id || 'N/A'}</p>
        <p><strong>Status:</strong> Payment Signature Verified</p>
      `,
    });
  } catch (emailError) {
    console.error('❌ Email Notification Error:', emailError);
    // You might want to return an error here, but the payment is still valid.
    // For this example, we'll continue.
  }

  return { success: true, message: 'Payment verified, lead saved, and email sent' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ...userData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not set.');
      return NextResponse.json({ verified: false, error: 'Server configuration error' }, { status: 500 });
    }

    // Generate the signature on the server using the secret key
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    // Compare the generated signature with the one received from Razorpay
    if (generatedSignature === razorpay_signature) {
      console.log('✅ Payment signature verified successfully!');

      // If the signature is verified, it is safe to process the payment data.
      const result = await processPaymentAndNotify({
        ...userData,
        payment_id: razorpay_payment_id
      });
      
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
      
    } else {
      console.warn('❌ Payment signature mismatch. Possible fraud attempt.');
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    return NextResponse.json({ verified: false, error: 'Internal Server Error' }, { status: 500 });
  }
}