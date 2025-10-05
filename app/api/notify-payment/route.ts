
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { formatISTInvoice, formatISTDebug } from '@/lib/datetime';

export async function POST(req: Request) {
  try {
  const body = await req.json();
  const { name, email, phone, message, payment_id, complexity, urgency, razorpay_payment_id, service_id: incoming_service_id } = body;

    // Basic validation: we need the customer's email to send confirmation
    if (!email) {
      console.error('Missing customer email in request body', body);
      return NextResponse.json({ success: false, message: 'Customer email required' }, { status: 400 });
    }

    // Use a server-side Supabase client if a service role key is provided (safer for server reads when RLS is enabled)
    const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
      : supabase;

  // Debug: log whether we're using the service role key (required for server-side reads when RLS is enabled)
  console.debug('notify-payment: usingServiceRoleKey=', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Debug: log incoming request body keys important for lookups
  console.debug('notify-payment: incoming payload keys', { payment_id: payment_id, has_razorpay_id: !!(body as any)?.razorpay_payment_id, email });

  // Prepare vars used across multiple lookup strategies
  let serviceName = 'N/A';
  let categoryName = 'N/A';
  let paymentTotal: any = null;
  let paymentDate: any = null;
  let paymentRow: any = null;

    // Payment-first resolution: prefer razorpay_payment_id (added after payment), fallback to internal payments.id
    let quoteData: any = null;
    try {
      if (razorpay_payment_id) {
        const { data: payByRzp, error: payByRzpErr } = await serverSupabase
          .from('payments')
          .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id')
          .eq('razorpay_payment_id', String(razorpay_payment_id))
          .maybeSingle();
        if (payByRzpErr) console.error('❌ Payment lookup (by razorpay id) error:', payByRzpErr);
        if (payByRzp) {
          paymentRow = payByRzp as any;
          paymentTotal = paymentRow.total_amount ?? paymentTotal;
          paymentDate = paymentRow.payment_date ?? paymentDate;
        }
      }

      // fallback to internal id if needed
      if (!paymentRow && payment_id) {
        const { data: payById, error: payByIdErr } = await serverSupabase
          .from('payments')
          .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id')
          .eq('id', payment_id)
          .maybeSingle();
        if (payByIdErr) console.error('❌ Payment lookup (by internal id) error:', payByIdErr);
        if (payById) {
          paymentRow = payById as any;
          paymentTotal = paymentRow.total_amount ?? paymentTotal;
          paymentDate = paymentRow.payment_date ?? paymentDate;
        }
      }

      // Optionally fetch a recent quote for context (only if you actually have quotes and want to show quote data)
      // Avoid querying quotes.payment_id since your quotes schema doesn't have that column.
      if (paymentRow?.user_id) {
        const { data: recentQuote, error: recentQuoteErr } = await serverSupabase
          .from('quotes')
          .select('id, user_id, category_id, service_id, total, created_at, form_id')
          .eq('user_id', paymentRow.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (recentQuoteErr) console.error('❌ Quote fetch by user_id error (optional):', recentQuoteErr);
        if (recentQuote) quoteData = recentQuote as any;
      }
    } catch (e) {
      console.error('❌ Exception during payment resolution:', e);
    }

      console.debug('notify-payment: resolved (initial)', { quoteData, paymentRow, incoming_service_id });

      // Persist service_id onto the payments row early if we can determine it so subsequent
      // resolution for service name always reads the persisted value (avoids race conditions)
      try {
        const resolvedServiceId = paymentRow?.service_id ?? incoming_service_id ?? (quoteData ? (quoteData as any).service_id ?? null : null);
        console.debug('notify-payment: resolvedServiceId candidate', { resolvedServiceId });
        if (paymentRow && !paymentRow.service_id && resolvedServiceId) {
          const { data: updatedPay, error: updErr } = await serverSupabase
            .from('payments')
            .update({ service_id: resolvedServiceId })
            .eq('id', paymentRow.id)
            .select()
            .maybeSingle();
          if (updErr) console.error('❌ Failed to persist service_id on payment (early):', updErr);
          else if (updatedPay) {
            paymentRow = updatedPay as any;
            console.debug('notify-payment: paymentRow updated with service_id', { paymentRow });
          }
        }
      } catch (e) {
        console.error('❌ Exception persisting service_id early on payment:', e);
      }

    // Extra fallback: sometimes client sends the Razorpay id in `payment_id` (string like 'pay_...')
    try {
      if (!paymentRow && payment_id && typeof payment_id === 'string' && payment_id.startsWith('pay_')) {
        const { data: payByRzp2, error: payByRzp2Err } = await serverSupabase
          .from('payments')
          .select('*, service_id')
          .eq('razorpay_payment_id', payment_id)
          .maybeSingle();
        if (payByRzp2Err) console.error('❌ Fallback payment lookup (razorpay id in payment_id) error:', payByRzp2Err);
        if (payByRzp2) {
          paymentRow = payByRzp2 as any;
          paymentTotal = paymentRow.total_amount ?? paymentTotal;
          paymentDate = paymentRow.payment_date ?? paymentDate;
        }
      }
    } catch (e) {
      console.error('❌ Exception during extra payment lookup:', e);
    }

  // If we have quote ids, resolve service/category/payment rows

    if (quoteData) {
      const { service_id, category_id, payment_id: quotePaymentId } = quoteData as any;

      if (service_id) {
        const { data: svc, error: svcErr } = await serverSupabase.from('services').select('name').eq('id', service_id).maybeSingle();
        if (svcErr) console.error('❌ Service fetch error:', svcErr);
        serviceName = (svc as any)?.name ?? 'N/A';
      }

      if (category_id) {
        const { data: cat, error: catErr } = await serverSupabase.from('categories').select('name').eq('id', category_id).maybeSingle();
        if (catErr) console.error('❌ Category fetch error:', catErr);
        categoryName = (cat as any)?.name ?? 'N/A';
      }

      if (quotePaymentId) {
        const { data: pay, error: payErr } = await serverSupabase
          .from('payments')
          .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id')
          .eq('id', quotePaymentId)
          .maybeSingle();
        if (payErr) console.error('❌ Payment fetch error:', payErr);
        if (pay) {
          paymentRow = pay as any;
          paymentTotal = paymentRow.total_amount ?? null;
          paymentDate = paymentRow.payment_date ?? null;
        }
      }
    }

  // If we couldn't find a payment via quote.payment_id, try to find via razorpay_payment_id
    if (!paymentTotal && payment_id) {
      const { data: payByRzp, error: payByRzpErr } = await serverSupabase
        .from('payments')
        .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id')
        .eq('razorpay_payment_id', payment_id)
        .maybeSingle();
      if (payByRzpErr) console.error('❌ Payment fetch by razorpay id error:', payByRzpErr);
      if (payByRzp) {
        paymentRow = payByRzp as any;
        paymentTotal = paymentRow.total_amount ?? paymentTotal;
        paymentDate = paymentRow.payment_date ?? paymentDate;
      }
  }

  // Resolve service/category from paymentRow.service_id if present (prefer payment-level info)
  try {
    if (paymentRow?.service_id) {
      const { data: svc, error: svcErr } = await serverSupabase.from('services').select('name, category_id').eq('id', paymentRow.service_id).maybeSingle();
      if (svcErr) console.error('❌ Service fetch by payment.service_id error:', svcErr);
      if (svc) {
        serviceName = (svc as any).name ?? serviceName;
        // if payment-level service has a category, prefer it
        if ((svc as any).category_id) {
          const { data: cat, error: catErr } = await serverSupabase.from('categories').select('name').eq('id', (svc as any).category_id).maybeSingle();
          if (catErr) console.error('❌ Category fetch for service error:', catErr);
          categoryName = (cat as any)?.name ?? categoryName;
        }
      }
    }
    console.debug('notify-payment: final resolution', { paymentRowServiceId: paymentRow?.service_id, resolvedServiceName: serviceName, categoryName });
  } catch (e) {
    console.error('❌ Exception resolving service from paymentRow.service_id:', e);
  }

  // Persist service_id onto the payments row if we can determine it and the payment row lacks it
  try {
    const resolvedServiceId = paymentRow?.service_id ?? incoming_service_id ?? (quoteData ? (quoteData as any).service_id ?? null : null);
    if (paymentRow && !paymentRow.service_id && resolvedServiceId) {
      const { data: updatedPay, error: updErr } = await serverSupabase
        .from('payments')
        .update({ service_id: resolvedServiceId })
        .eq('id', paymentRow.id)
        .select()
        .maybeSingle();
      if (updErr) console.error('❌ Failed to persist service_id on payment:', updErr);
      else if (updatedPay) {
        paymentRow = updatedPay as any;
        // refresh service/category labels from the newly written service_id
        try {
          const { data: svc, error: svcErr } = await serverSupabase.from('services').select('name, category_id').eq('id', updatedPay.service_id).maybeSingle();
          if (!svcErr && svc) {
            serviceName = (svc as any).name ?? serviceName;
            if ((svc as any).category_id) {
              const { data: cat } = await serverSupabase.from('categories').select('name').eq('id', (svc as any).category_id).maybeSingle();
              categoryName = (cat as any)?.name ?? categoryName;
            }
          }
        } catch (e) {
          console.error('❌ Exception fetching service/category after persisting service_id:', e);
        }
      }
    }
  } catch (e) {
    console.error('❌ Exception persisting service_id on payment:', e);
  }

    // Fetch requested user fields
  const { data: userData, error: userError } = await serverSupabase
      .from('users')
      .select('first_name, last_name, email, phone, state')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('❌ Supabase User Fetch Error:', userError);
    }

    // Prepare values for the email
  // Debug logs to help trace missing data
  console.debug('notify-payment debug', { payment_id, quoteData, paymentRow, userData });

    // Centralized formatting: use shared invoice style (matches UI invoice: 10/5/2025, 4:49:08 PM)
    const fmtInvoice = (v: any) => formatISTInvoice(v);
  // Build payment details HTML from the full paymentRow if available (after formatIST definition)
  let paymentDetailsHtml = '';
  if (paymentRow) {
    paymentDetailsHtml = '<ul>';
    for (const [k, v] of Object.entries(paymentRow)) {
      const lower = k.toLowerCase();
      const isDateLike = /(date|_at|time)/.test(lower);
      const val = v == null ? 'N/A' : (isDateLike ? fmtInvoice(v) : String(v));
      paymentDetailsHtml += `<li><strong>${k}:</strong> ${val}</li>`;
    }
    paymentDetailsHtml += '</ul>';
  } else {
    paymentDetailsHtml = '<p>No payment row found for the provided id. If you expect the row to exist, ensure the server has permission to read the payments table (set SUPABASE_SERVICE_ROLE_KEY in your server env).</p>';
  }

  const dbUser = (userData ?? {}) as any;
  const dbQuote = (quoteData ?? {}) as any;
  const clientFirstName = dbUser.first_name ?? name ?? '';
  const clientLastName = dbUser.last_name ?? '';
  const clientFullName = `${clientFirstName}${clientLastName ? ' ' + clientLastName : ''}`.trim() || 'Client';
  const clientEmail = dbUser.email ?? email;
  const clientPhone = dbUser.phone ?? phone ?? 'N/A';
  const clientState = dbUser.state ?? 'N/A';
  // Prefer quote.total, otherwise fallback to payments.total_amount
  const quoteTotal = dbQuote.total != null ? dbQuote.total : (paymentTotal != null ? paymentTotal : 'N/A');
  const rawQuoteCreatedAt = dbQuote.created_at || paymentDate || null;
  const quoteCreatedAt = fmtInvoice(rawQuoteCreatedAt);
  let debugTimeBlock = '';
  if (process.env.EMAIL_DEBUG_TIMES === '1') {
    debugTimeBlock = `<li><strong>_debug_raw:</strong> ${rawQuoteCreatedAt || 'N/A'}</li>` +
      `<li><strong>_debug_ist_invoice:</strong> ${quoteCreatedAt}</li>` +
      `<li><strong>_debug_ist_24h:</strong> ${formatISTDebug(rawQuoteCreatedAt)}</li>`;
  }
  const serviceLabel = typeof serviceName === 'string' ? serviceName : 'N/A';
  const categoryLabel = typeof categoryName === 'string' ? categoryName : 'N/A';

    // Build invoice URL - expects INVOICE_BASE_URL env var, otherwise a placeholder
    const invoiceBase = (process.env.INVOICE_BASE_URL || process.env.NEXT_PUBLIC_INVOICE_BASE_URL || '').replace(/\/$/, '');
    const invoiceUrl = invoiceBase && payment_id ? `${invoiceBase}/invoice/${encodeURIComponent(String(payment_id))}` : '#';

    const smtpPort = Number(process.env.EMAIL_PORT || '587');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  // Generated timestamp (invoice-style IST)
  const generatedAt = fmtInvoice(Date.now())

  // Format HTML exactly as requested
  const html = `
      <p>Dear ${clientFullName},</p>

      <p>Thank you for submitting your order with IPprotectionIndia. We have successfully received your request.</p>

  <p>Below is a brief summary of the payment and quote received:</p>
  <div class='sub' style="font-size:12px;color:#555;margin:6px 0 12px">Generated: ${generatedAt} (IST)</div>
      <ul>
        <li><strong>Payment ID (razorpay / provided):</strong> ${razorpay_payment_id || payment_id || 'N/A'}</li>
    <li><strong>Quote Total:</strong> ${quoteTotal}</li>
  <li><strong>Quote Created At:</strong> ${quoteCreatedAt}</li>
  ${debugTimeBlock}
      </ul>

  <h4>Payment details</h4>
  <ul>
    <li><strong>Category:</strong> ${categoryLabel}</li>
    <li><strong>Service:</strong> ${serviceLabel}</li>
    <li><strong>Payment Cost:</strong> ${typeof quoteTotal === 'number' ? quoteTotal.toLocaleString('en-IN') : quoteTotal}</li>
  <li><strong>Date:</strong> ${quoteCreatedAt}</li>
    <li><strong>Status:</strong> ${paymentRow?.payment_status ?? 'N/A'}</li>
  </ul>

  ${paymentDetailsHtml}

      <p>For your reference, a copy of the form you filled out is attached to this email.</p>

      <p>Our team will now review the information and connect with you shortly regarding the next steps. In the meantime, if you would like to share any additional documents or clarifications, please feel free to reply to this email.</p>

      <p>We look forward to assisting you in protecting and maximizing the value of your intellectual property.</p>

      <p>Best regards,<br/>IPprotectionIndia Team</p>

      <p>You can download your invoice here: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
    `;

    const mailOptions = {
      from: `"IPprotectionIndia" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      bcc: process.env.EMAIL_TO || undefined,
      subject: 'Order Received — IPprotectionIndia',
      html,
      attachments: [
        {
          filename: 'submitted-form.json',
          content: JSON.stringify(body, null, 2),
          contentType: 'application/json',
        },
      ],
    } as any;

    // Send confirmation email to client (and BCC admin if configured)
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent', { messageId: info.messageId, accepted: info.accepted });
    } catch (mailErr) {
      console.error('❌ sendMail error:', mailErr);
      // continue — we still save the record; return a 502 if you prefer to fail hard here
    }

  // No ipfiling table in your DB — skip DB insert. Return success and include resolved DB rows for debugging.
  return NextResponse.json({
    success: true,
    message: 'Confirmation email sent (if SMTP allowed)',
    data: { paymentRow: paymentRow ?? null, quoteData: quoteData ?? null, usingServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
  });
  } catch (err) {
    console.error('❌ Email/Supabase Error:', err);
    return NextResponse.json({ success: false, message: 'Failed to process lead' }, { status: 500 });
  }
}