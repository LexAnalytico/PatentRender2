/*
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
*/

import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

async function processPaymentAndNotify({
  user_id,
  service_id,
  custom_price,
  form_completed,
  form_response,
  option_id,
  payment_id,
}: {
  user_id: string;
  service_id: number;
  custom_price?: number;
  form_completed?: boolean;
  form_response?: Record<string, any>;
  option_id?: number;
  payment_id: string;
}){
  const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : supabase;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ No SUPABASE_SERVICE_ROLE_KEY set; RLS might block inserts.');
  }
/*
  // ---- Insert into user_service_selections ----
  try {
    const { error: dbError } = await serverSupabase
      .from('user_service_selections')
      .insert([
        {
          user_id,
          service_id,
          custom_price,
          form_completed,
          form_response,
          option_id,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (dbError) {
      console.error('❌ Supabase Insert Error:', dbError);
      return { success: false, message: 'Failed to save to Supabase', dbError };
    }
  } catch (e) {
    console.error('❌ Exception while inserting into Supabase:', e);
    return { success: false, message: 'Exception while saving to Supabase', error: String(e) };
  }
*/
  // ---- Send Email Notification ----
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Resolve payment/quote/category info to populate the email
    const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
      : supabase;

    let paymentRow: any = null;
    try {
      const { data: pay, error: payErr } = await serverSupabase
        .from('payments')
        .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id')
        .eq('razorpay_payment_id', payment_id)
        .maybeSingle();
      if (payErr) console.error('❌ Payment lookup error in verify-payment email flow:', payErr);
      if (pay) paymentRow = pay as any;
    } catch (e) {
      console.error('❌ Exception fetching payment for email:', e);
    }

    let quoteData: any = null;
    if (paymentRow?.user_id) {
      try {
        const { data: recentQuote, error: rqErr } = await serverSupabase
          .from('quotes')
          .select('id, user_id, category_id, service_id, total, created_at')
          .eq('user_id', paymentRow.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (rqErr) console.error('❌ Quote lookup error in verify-payment email flow:', rqErr);
        if (recentQuote) quoteData = recentQuote as any;
      } catch (e) {
        console.error('❌ Exception fetching quote for email:', e);
      }
    }

    let categoryLabel = 'N/A';
    if (quoteData?.category_id) {
      try {
        const { data: cat, error: catErr } = await serverSupabase.from('categories').select('name').eq('id', quoteData.category_id).maybeSingle();
        if (catErr) console.error('❌ Category lookup error in verify-payment email flow:', catErr);
        categoryLabel = (cat as any)?.name ?? 'N/A';
      } catch (e) {
        console.error('❌ Exception fetching category for email:', e);
      }
    }

    const quoteTotal = quoteData?.total ?? paymentRow?.total_amount ?? custom_price ?? 'N/A';
    const quoteCreatedAt = quoteData?.created_at ? new Date(quoteData.created_at).toLocaleString() : (paymentRow?.payment_date ? new Date(paymentRow.payment_date).toLocaleString() : 'N/A');
    const paymentStatus = paymentRow?.payment_status ?? 'Payment Signature Verified';

    const html = `
      <p>We have received your payment. Below are the details:</p>
      <ul>
        <li><strong>Service Category:</strong> ${categoryLabel}</li>
        <li><strong>Payment Cost:</strong> ${quoteTotal}</li>
        <li><strong>Date:</strong> ${quoteCreatedAt}</li>
        <li><strong>Status:</strong> ${paymentStatus}</li>
        <li><strong>Payment ID:</strong> ${payment_id}</li>
      </ul>
      <p>Best regards,<br/>IPprotectionIndia Team</p>
    `;

    await transporter.sendMail({
      from: `"Patent Site" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: '✅ Verified New Patent Inquiry + Payment Received',
      html,
    });
  } catch (emailError) {
    console.error('❌ Email Notification Error:', emailError);
    // Continue even if email fails
  }

  return { success: true, message: 'Payment verified, lead saved, and email sent' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      service_id,
      custom_price,
      form_completed,
      form_response,
      option_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET is not set.');
      return NextResponse.json({ verified: false, error: 'Server configuration error' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      console.log('✅ Payment signature verified successfully!');
          // Ensure we persist a payments row so subsequent lookups (email/quotes) can resolve details
          const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
            ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
            : supabase;

          let persistedPayment: any = null;
          // Try to find existing payment by order id to reuse stored amount if present
          let existingPaymentByOrder: any = null;
          try {
            const { data: existingByOrder, error: existingByOrderErr } = await serverSupabase
              .from('payments')
              .select('id, total_amount')
              .eq('razorpay_order_id', razorpay_order_id)
              .maybeSingle();
            if (existingByOrderErr) console.debug('No existing payment by order id or fetch error:', existingByOrderErr);
            if (existingByOrder) existingPaymentByOrder = existingByOrder as any;
          } catch (e) {
            console.error('❌ Exception while checking existing payment by order:', e);
          }
          try {
            // Try updating an existing payment by razorpay_payment_id
            if (razorpay_payment_id) {
              const amt = existingPaymentByOrder?.total_amount ?? custom_price ?? 0;
              const { data: updated, error: updErr } = await serverSupabase
                .from('payments')
                .update({
                  user_id: user_id ?? null,
                  total_amount: amt,
                  payment_status: 'paid',
                  payment_date: new Date().toISOString(),
                  razorpay_order_id: razorpay_order_id,
                  razorpay_payment_id: razorpay_payment_id,
                })
                .eq('razorpay_payment_id', razorpay_payment_id)
                .select()
                .maybeSingle();
              if (updErr) console.error('❌ Payment update error:', JSON.stringify(updErr, Object.getOwnPropertyNames(updErr)));
              if (updated) persistedPayment = updated as any;
            }

            // If no existing row, insert a new payment record
            if (!persistedPayment) {
              const amt = existingPaymentByOrder?.total_amount ?? custom_price ?? 0;
              const { data: inserted, error: insErr } = await serverSupabase
                .from('payments')
                .insert([
                  {
                    user_id: user_id ?? null,
                    total_amount: amt,
                    payment_status: 'paid',
                    payment_date: new Date().toISOString(),
                    razorpay_order_id: razorpay_order_id,
                    razorpay_payment_id: razorpay_payment_id,
                    created_at: new Date().toISOString(),
                  },
                ])
                .select()
                .maybeSingle();
              if (insErr) console.error('❌ Payment insert error:', JSON.stringify(insErr, Object.getOwnPropertyNames(insErr)));
              if (inserted) persistedPayment = inserted as any;
            }
          } catch (e) {
            console.error('❌ Exception persisting payment:', e);
          }

          // If we persisted a payment, verify the user exists and create an orders row
          try {
            if (persistedPayment && persistedPayment.user_id) {
              // Confirm user exists
              const { data: userRow, error: userErr } = await serverSupabase
                .from('users')
                .select('id')
                .eq('id', persistedPayment.user_id)
                .maybeSingle();
              if (userErr) console.error('❌ Error verifying user for order creation:', userErr);
              if (userRow) {
                // Resolve category/service ids: prefer provided service_id/category via payload, otherwise try recent quote
                let resolvedServiceId = service_id ?? null;
                let resolvedCategoryId = null;
                if (!resolvedServiceId) {
                  const { data: recentQuote, error: rqErr } = await serverSupabase
                    .from('quotes')
                    .select('service_id, category_id')
                    .eq('user_id', persistedPayment.user_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                  if (rqErr) console.error('❌ Error fetching recent quote for order resolution:', rqErr);
                  if (recentQuote) {
                    resolvedServiceId = (recentQuote as any).service_id ?? resolvedServiceId;
                    resolvedCategoryId = (recentQuote as any).category_id ?? resolvedCategoryId;
                  }
                } else {
                  // If service_id provided, try to fetch its category
                  const { data: svc, error: svcErr } = await serverSupabase.from('services').select('category_id').eq('id', resolvedServiceId).maybeSingle();
                  if (svcErr) console.error('❌ Error fetching service for category resolution:', svcErr);
                  if (svc) resolvedCategoryId = (svc as any).category_id ?? resolvedCategoryId;
                }

                // Insert order row (payment_id references payments.id)
                try {
                  const { data: orderInserted, error: orderErr } = await serverSupabase
                    .from('orders')
                    .insert([
                      {
                        user_id: persistedPayment.user_id,
                        service_id: resolvedServiceId,
                        category_id: resolvedCategoryId,
                        payment_id: persistedPayment.id,
                        created_at: new Date().toISOString(),
                      },
                    ])
                    .select()
                    .maybeSingle();
                  if (orderErr) console.error('❌ Order insert error:', orderErr);
                  else console.debug('Order created', { order: orderInserted });
                } catch (orderEx) {
                  console.error('❌ Exception inserting order row:', orderEx);
                }
              }
            }
          } catch (orderFlowErr) {
            console.error('❌ Exception in order creation flow:', orderFlowErr);
          }

          const result = await processPaymentAndNotify({
            user_id,
            service_id,
            custom_price,
            form_completed,
            form_response,
            option_id,
            payment_id: razorpay_payment_id,
          });
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } else {
      console.warn('❌ Payment signature mismatch.');
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    return NextResponse.json({ verified: false, error: 'Internal Server Error' }, { status: 500 });
  }
}