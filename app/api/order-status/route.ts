import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/*
  GET /api/order-status?razorpay_order_id=... OR ?payment_id=... OR ?order_id=...
  Returns a readiness snapshot so the Orders page can decide when to enable navigation.
*/
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const razorpayOrderId = url.searchParams.get('razorpay_order_id') || undefined
  const paymentId = url.searchParams.get('payment_id') || undefined // internal payments.id (UUID?) or numeric; we attempt both
  const orderIdRaw = url.searchParams.get('order_id') || undefined
  const debug = process.env.PAYMENT_DEBUG === '1'

  try {
    const serverSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY)
      : supabase

    let paymentRow: any = null
    let orders: any[] = []

    // Resolution precedence: order_id -> payment row, else razorpay_order_id, else payment_id
    if (orderIdRaw) {
      const orderIdNum = Number(orderIdRaw)
      if (!Number.isNaN(orderIdNum)) {
        const { data: ord, error: ordErr } = await serverSupabase.from('orders').select('id,payment_id,user_id,service_id,type,created_at').eq('id', orderIdNum).maybeSingle()
        if (ordErr && debug) console.debug('[order-status] order fetch error', ordErr)
        if (ord) {
          orders = [ord]
          if (ord.payment_id) {
            const { data: pay, error: payErr } = await serverSupabase.from('payments').select('id,payment_status,total_amount,razorpay_order_id,razorpay_payment_id,type,user_id,service_id,created_at').eq('id', ord.payment_id).maybeSingle()
            if (payErr && debug) console.debug('[order-status] payment fetch by payment_id error', payErr)
            paymentRow = pay ?? null
          }
        }
      }
    }

    if (!paymentRow && razorpayOrderId) {
      const { data: payByRz, error: payByRzErr } = await serverSupabase.from('payments').select('id,payment_status,total_amount,razorpay_order_id,razorpay_payment_id,type,user_id,service_id,created_at').eq('razorpay_order_id', razorpayOrderId).maybeSingle()
      if (payByRzErr && debug) console.debug('[order-status] payment fetch by razorpay_order_id error', payByRzErr)
      paymentRow = payByRz ?? null
    }

    if (!paymentRow && paymentId) {
      const { data: payDirect, error: payDirectErr } = await serverSupabase.from('payments').select('id,payment_status,total_amount,razorpay_order_id,razorpay_payment_id,type,user_id,service_id,created_at').eq('id', paymentId).maybeSingle()
      if (payDirectErr && debug) console.debug('[order-status] payment fetch by id error', payDirectErr)
      paymentRow = payDirect ?? null
    }

    if (paymentRow && orders.length === 0) {
      // find orders referencing this payment
      const { data: ords, error: ordsErr } = await serverSupabase.from('orders').select('id,payment_id,user_id,service_id,type,created_at').eq('payment_id', paymentRow.id)
      if (ordsErr && debug) console.debug('[order-status] orders fetch by payment_id error', ordsErr)
      if (ords) orders = ords as any[]
    }

    const paymentStatus = paymentRow?.payment_status || 'unknown'
    const paid = paymentStatus === 'paid'
    const orderCount = orders.length

    // Derive a readiness stage
    let stage: string = 'initial'
    if (!paymentRow) stage = 'awaiting_payment_row'
    else if (!paid) stage = 'payment_pending'
    else if (paid && orderCount === 0) stage = 'orders_materializing'
    else if (paid && orderCount > 0) stage = 'ready'

    const ready = stage === 'ready'

    return NextResponse.json({
      ok: true,
      stage,
      ready,
      payment: paymentRow,
      orders,
      meta: {
        paid,
        orderCount,
      },
    })
  } catch (e) {
    console.error('order-status error', e)
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
