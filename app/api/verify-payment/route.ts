import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

// Send notification email using the persisted payment row to avoid races
async function sendPaymentNotification(serverSupabase: any, opts: { paymentId: string; dbPayment?: any }) {
  const { paymentId, dbPayment } = opts;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let paymentRow: any = dbPayment ?? null;
    if (!paymentRow) {
      const { data: pay, error: payErr } = await serverSupabase
        .from('payments')
        .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id')
        .eq('razorpay_payment_id', paymentId)
        .maybeSingle();
      if (payErr) console.error('Payment fetch error before email:', payErr);
      paymentRow = pay ?? null;
    }
    // category and service from payment (preferred) or recent quote
    let serviceLabel = 'N/A';
    let categoryLabel = 'N/A';

    // If payment row contains service_id, prefer that and resolve the name/category now
    if (paymentRow?.service_id) {
      try {
        const { data: svc, error: svcErr } = await serverSupabase.from('services').select('name, category_id').eq('id', paymentRow.service_id).maybeSingle();
        if (svc && !(svcErr)) {
          serviceLabel = (svc as any)?.name ?? serviceLabel;
          if ((svc as any).category_id) {
            try {
              const { data: cat } = await serverSupabase.from('categories').select('name').eq('id', (svc as any).category_id).maybeSingle();
              categoryLabel = (cat as any)?.name ?? categoryLabel;
            } catch (e) {
              console.error('Category fetch error before email:', e);
            }
          }
        }
      } catch (e) {
        console.error('Service fetch error before email:', e);
      }
    }

    let userRow: any = null;
    if (paymentRow?.user_id) {
      const { data: u, error: uErr } = await serverSupabase.from('users').select('first_name,last_name,email,phone').eq('id', paymentRow.user_id).maybeSingle();
      if (uErr) console.error('User fetch error before email:', uErr);
      userRow = u ?? null;
    }

  // category from recent quote (may override if more recent quote exists)
    let quoteCreatedAt = paymentRow?.payment_date ? new Date(paymentRow.payment_date).toLocaleString() : 'N/A';
    if (paymentRow?.user_id) {
      const { data: recentQuote } = await serverSupabase
        .from('quotes')
        .select('category_id, service_id, created_at')
        .eq('user_id', paymentRow.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recentQuote) {
        if ((recentQuote as any).created_at) quoteCreatedAt = new Date((recentQuote as any).created_at).toLocaleString();
        if ((recentQuote as any).category_id) {
          const { data: cat } = await serverSupabase.from('categories').select('name').eq('id', (recentQuote as any).category_id).maybeSingle();
          categoryLabel = (cat as any)?.name ?? 'N/A';
        }
        if ((recentQuote as any).service_id) {
          const { data: svc } = await serverSupabase.from('services').select('name').eq('id', (recentQuote as any).service_id).maybeSingle();
          serviceLabel = (svc as any)?.name ?? 'N/A';
        }
      }
    }

    let displayTotal: any = 'N/A';
    if (paymentRow?.total_amount != null) {
      const n = Number(paymentRow.total_amount);
      if (!Number.isNaN(n)) displayTotal = n;
    }

    const clientFullName = userRow ? `${userRow.first_name ?? ''}${userRow.last_name ? ' ' + userRow.last_name : ''}`.trim() : 'Client';
    const clientEmail = userRow?.email ?? process.env.EMAIL_TO ?? 'N/A';
    const clientPhone = userRow?.phone ?? 'N/A';
    const paymentStatus = paymentRow?.payment_status ?? 'N/A';
    const paymentIdLabel = paymentRow?.razorpay_payment_id ?? paymentId ?? 'N/A';

    const html = `
      <p>Dear ${clientFullName},</p>
      <p>We have received your payment. Below are the details:</p>
      <h4>Customer</h4>
      <ul>
        <li><strong>Name:</strong> ${clientFullName}</li>
        <li><strong>Email:</strong> ${clientEmail}</li>
        <li><strong>Phone:</strong> ${clientPhone}</li>
      </ul>
      <h4>Payment</h4>
      <ul>
  <li><strong>Category:</strong> ${categoryLabel}</li>
  <li><strong>Services:</strong> ${serviceLabel}</li>
        <li><strong>Payment Cost:</strong> ${displayTotal === 'N/A' ? 'N/A' : displayTotal.toLocaleString('en-IN')}</li>
        <li><strong>Date:</strong> ${quoteCreatedAt}</li>
        <li><strong>Status:</strong> ${paymentStatus}</li>
        <li><strong>Payment ID:</strong> ${paymentIdLabel}</li>
      </ul>
      <p>Best regards,<br/>IPprotectionIndia Team</p>
    `;

    await transporter.sendMail({
      from: `"IPprotectionIndia" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      bcc: process.env.EMAIL_TO || undefined,
      subject: 'Order Received — IPprotectionIndia',
      html,
    });

    return { success: true };
  } catch (err) {
    console.error('sendPaymentNotification error:', err);
    return { success: false, error: String(err) };
  }
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
    if (!secret) return NextResponse.json({ verified: false, error: 'Server configuration error' }, { status: 500 });

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.warn('Payment signature mismatch');
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }

    const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
      : supabase;

    // Try to reuse existing payment amount if present (created at order time)
  let existingPaymentByOrder: any = null;
    try {
      const { data: existingByOrder, error: existingByOrderErr } = await serverSupabase
    .from('payments')
    .select('id, user_id, total_amount, service_id')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();
      if (existingByOrderErr) console.debug('existingPaymentByOrder fetch error', existingByOrderErr);
      existingPaymentByOrder = existingByOrder ?? null;
    } catch (e) {
      console.error('Exception checking existing payment by order:', e);
    }

  // Determine amount to store: prefer existing payment.total_amount, otherwise custom_price, otherwise derive from body.amount (assume paise)
  let amtToStore = existingPaymentByOrder?.total_amount ?? null;
  // Determine service to store: prefer existing payment.service_id, then incoming payload service_id, will fallback to recent quote later
  let serviceToStore: any = existingPaymentByOrder?.service_id ?? service_id ?? null;
    if (amtToStore == null) {
      if (custom_price != null) amtToStore = Number(custom_price);
      else if ((body as any).amount != null) amtToStore = Number((body as any).amount) / 100; // paise -> rupees
      else amtToStore = 0;
    }

    // Upsert payment record
    let persistedPayment: any = null;
    try {
      if (razorpay_payment_id) {
        // If we still don't have a serviceToStore, try to resolve from recent quote later (kept as variable)
        const { data: updated, error: updErr } = await serverSupabase
          .from('payments')
          .update({
            user_id: existingPaymentByOrder?.user_id ?? user_id ?? null,
            total_amount: amtToStore,
            payment_status: 'paid',
            payment_date: new Date().toISOString(),
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            service_id: serviceToStore ?? null,
          })
          .eq('razorpay_payment_id', razorpay_payment_id)
          .select()
          .maybeSingle();
        if (updErr) console.debug('payment update error', updErr);
        persistedPayment = updated ?? null;
      }

      if (!persistedPayment) {
        const { data: inserted, error: insErr } = await serverSupabase
          .from('payments')
          .insert([
            {
              user_id: existingPaymentByOrder?.user_id ?? user_id ?? null,
              total_amount: amtToStore,
              payment_status: 'paid',
              payment_date: new Date().toISOString(),
              razorpay_order_id: razorpay_order_id,
              razorpay_payment_id: razorpay_payment_id,
              service_id: serviceToStore ?? null,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .maybeSingle();
        if (insErr) console.error('payment insert error', insErr);
        persistedPayment = inserted ?? null;
      }
    } catch (e) {
      console.error('Exception persisting payment:', e);
    }

    // Attach user if missing and can be derived from form_response
    try {
      if (persistedPayment && !persistedPayment.user_id) {
        const extractEmail = (fr: any) => {
          if (!fr) return null;
          if (typeof fr === 'string') return fr;
          const candidates = [fr.email, fr.email_address, fr.contact_email, fr.clientEmail, fr.emailAddress, fr.values?.email, fr.fields?.email];
          for (const c of candidates) if (c) return String(c).toLowerCase();
          return null;
        };
        const possibleEmail = extractEmail(form_response);
        if (possibleEmail) {
          const { data: userByEmail } = await serverSupabase.from('users').select('id').eq('email', possibleEmail).maybeSingle();
          if (userByEmail && (userByEmail as any).id) {
            const { data: upd } = await serverSupabase.from('payments').update({ user_id: (userByEmail as any).id }).eq('id', persistedPayment.id).select().maybeSingle();
            if (upd) persistedPayment = upd as any;
          }
        }
      }
    } catch (e) {
      console.error('Exception attaching user to payment:', e);
    }

    // Create order row if we have a user
    try {
      if (persistedPayment && persistedPayment.user_id) {
        let resolvedServiceId = service_id ?? null;
        let resolvedCategoryId = null;
        if (!resolvedServiceId) {
          const { data: recentQuote } = await serverSupabase.from('quotes').select('service_id, category_id').eq('user_id', persistedPayment.user_id).order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (recentQuote) {
            resolvedServiceId = (recentQuote as any).service_id ?? resolvedServiceId;
            resolvedCategoryId = (recentQuote as any).category_id ?? resolvedCategoryId;
          }
        } else {
          const { data: svc } = await serverSupabase.from('services').select('category_id').eq('id', resolvedServiceId).maybeSingle();
          if (svc) resolvedCategoryId = (svc as any).category_id ?? resolvedCategoryId;
        }

        const { data: orderInserted, error: orderErr } = await serverSupabase.from('orders').insert([
          {
            user_id: persistedPayment.user_id,
            service_id: resolvedServiceId,
            category_id: resolvedCategoryId,
            payment_id: persistedPayment.id,
            created_at: new Date().toISOString(),
          },
        ]).select().maybeSingle();
        if (orderErr) console.error('order insert error', orderErr);
        else console.debug('Order created', orderInserted);
      }
    } catch (e) {
      console.error('Exception creating order row:', e);
    }

    // Send notification using persistedPayment to avoid race
    const notifyResult = await sendPaymentNotification(serverSupabase, { paymentId: razorpay_payment_id, dbPayment: persistedPayment });

    return NextResponse.json({ success: true, persistedPayment, notifyResult }, { status: 200 });
  } catch (err) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ verified: false, error: 'Internal Server Error' }, { status: 500 });
  }
}