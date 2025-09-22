import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import pricingToForm from '@/app/data/service-pricing-to-form.json'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        .select('id, user_id, total_amount, payment_status, payment_date, razorpay_payment_id, service_id, type')
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
      type,
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
        .select('id, user_id, total_amount, service_id, type')
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
  // Map incoming type (can be pricing key) to canonical form key
  const map = pricingToForm as unknown as Record<string,string>
  let typeToStore: any = existingPaymentByOrder?.type ?? (type ? (map[type] ?? type) : type) ?? null;
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
              type: typeToStore ?? null,
          })
          .eq('razorpay_payment_id', razorpay_payment_id)
          .select()
          .maybeSingle();
        if (updErr) {
          console.debug('payment update error', updErr)
          // Retry update without type on CHECK constraint failure
          if ((updErr as any).code === '23514') {
            const { data: updated2, error: updErr2 } = await serverSupabase
              .from('payments')
              .update({
                user_id: existingPaymentByOrder?.user_id ?? user_id ?? null,
                total_amount: amtToStore,
                payment_status: 'paid',
                payment_date: new Date().toISOString(),
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: razorpay_payment_id,
                service_id: serviceToStore ?? null,
                type: null,
              })
              .eq('razorpay_payment_id', razorpay_payment_id)
              .select()
              .maybeSingle();
            if (!updErr2) {
              persistedPayment = updated2 ?? null
            }
          }
        } else {
          persistedPayment = updated ?? null;
        }
      }

      if (!persistedPayment) {
        let inserted: any = null
        let insErr: any = null
        const baseRow = {
          user_id: existingPaymentByOrder?.user_id ?? user_id ?? null,
          total_amount: amtToStore,
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          service_id: serviceToStore ?? null,
          type: typeToStore ?? null,
          created_at: new Date().toISOString(),
        }
        ;({ data: inserted, error: insErr } = await serverSupabase
          .from('payments')
          .insert([baseRow])
          .select()
          .maybeSingle());
        if (insErr && (insErr as any).code === '23514') {
          // Retry without type
          const { data: inserted2, error: insErr2 } = await serverSupabase
            .from('payments')
            .insert([{ ...baseRow, type: null }])
            .select()
            .maybeSingle();
          if (!insErr2) {
            inserted = inserted2
          } else {
            console.error('payment insert retry without type failed', insErr2)
          }
        } else if (insErr) {
          console.error('payment insert error', insErr);
        }
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

    // Create order rows from cart items (multi-service). Fallback to a single order if cart missing.
  let createdOrders: any[] = []
  let createdOrdersClient: any[] = []
  try {
      if (persistedPayment && persistedPayment.user_id) {
        const cartItems = Array.isArray((body as any)?.cart) ? (body as any).cart : []
        if (cartItems.length > 0) {
          // Resolve service/category info for each item
          const svcIds = Array.from(new Set(cartItems.map((it:any) => it.service_id).filter((v:any) => v != null)))
          const svcNames = Array.from(new Set(cartItems.map((it:any) => it.name).filter(Boolean)))

          // Load services by ids and names to build a map
          const [byId, byName] = await Promise.all([
            svcIds.length ? serverSupabase.from('services').select('id,name,category_id').in('id', svcIds) : Promise.resolve({ data: [], error: null }),
            svcNames.length ? serverSupabase.from('services').select('id,name,category_id').in('name', svcNames) : Promise.resolve({ data: [], error: null }),
          ])
          const serviceRows: any[] = ([] as any[]).concat(byId?.data || []).concat(byName?.data || [])
          const serviceById = new Map(serviceRows.map((r:any) => [r.id, r]))
          const serviceByName = new Map(serviceRows.map((r:any) => [String(r.name), r]))

          const rowsToInsert = cartItems.map((it:any) => {
            let svcId = it.service_id ?? null
            let catId = null
            if (svcId && serviceById.has(svcId)) {
              catId = serviceById.get(svcId)?.category_id ?? null
            } else if (it.name && serviceByName.has(String(it.name))) {
              const row = serviceByName.get(String(it.name))
              svcId = row?.id ?? svcId
              catId = row?.category_id ?? null
            }
            return {
              user_id: persistedPayment.user_id,
              service_id: svcId ?? null,
              category_id: catId ?? null,
              payment_id: persistedPayment.id,
              // We do not have per-item type reliably from client; leave null or fallback to payment type
              type: null,
              created_at: new Date().toISOString(),
            }
          })

          if (rowsToInsert.length > 0) {
            const { data: insertedOrders, error: insOrdersErr } = await serverSupabase.from('orders').insert(rowsToInsert).select()
            if (insOrdersErr) console.error('order insert (multi) error', insOrdersErr)
            else {
              console.debug('Orders created (multi)', insertedOrders)
              createdOrders = insertedOrders as any[]
              // Build a client-friendly payload with service labels
              const svcMap = new Map(serviceRows.map((r: any) => [r.id, r]))
              createdOrdersClient = (createdOrders || []).map((o: any) => ({
                id: o.id,
                service_id: o.service_id,
                category_id: o.category_id,
                payment_id: o.payment_id,
                type: o.type ?? (persistedPayment?.type ?? null),
                created_at: o.created_at,
                services: svcMap.get(o.service_id) ? { name: String((svcMap.get(o.service_id) as any).name || 'Service') } : null,
                service_pricing_key: null,
              }))
            }
          }
        } else {
          // Fallback: create a single order using resolved service/category
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
              type: typeToStore ?? persistedPayment.type ?? null,
              created_at: new Date().toISOString(),
            },
          ]).select().maybeSingle();
          if (orderErr) console.error('order insert error', orderErr);
          else {
            console.debug('Order created', orderInserted);
            if (orderInserted) {
              createdOrders = [orderInserted]
              // Fetch service label for the single order
              let svcName: string | null = null
              try {
                if (orderInserted.service_id) {
                  const { data: svc } = await serverSupabase.from('services').select('name').eq('id', orderInserted.service_id).maybeSingle()
                  if (svc) svcName = (svc as any).name ?? null
                }
              } catch {}
              createdOrdersClient = [{
                id: orderInserted.id,
                service_id: orderInserted.service_id,
                category_id: orderInserted.category_id,
                payment_id: orderInserted.payment_id,
                type: orderInserted.type ?? (persistedPayment?.type ?? null),
                created_at: orderInserted.created_at,
                services: svcName ? { name: svcName } : null,
                service_pricing_key: null,
              }]
            }
          }
        }
      }
    } catch (e) {
      console.error('Exception creating order row(s):', e);
    }

    // Send notification using persistedPayment to avoid race
    const notifyResult = await sendPaymentNotification(serverSupabase, { paymentId: razorpay_payment_id, dbPayment: persistedPayment });

  return NextResponse.json({ success: true, persistedPayment, createdOrders, createdOrdersClient: createdOrdersClient, notifyResult }, { status: 200 });
  } catch (err) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ verified: false, error: 'Internal Server Error' }, { status: 500 });
  }
}