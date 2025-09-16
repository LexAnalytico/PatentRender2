import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!url || !key) {
      return NextResponse.json({ error: 'Service role key or Supabase URL not configured on server' }, { status: 500 })
    }

    const serverSupabase = createClient(url, key)
    const q = new URL(req.url)
    const userId = q.searchParams.get('user_id')

    let ordersQuery: any = serverSupabase.from('orders').select('id,user_id,service_id,category_id,payment_id,created_at').order('created_at', { ascending: false }).limit(50)
    if (userId) ordersQuery = ordersQuery.eq('user_id', userId)
    const { data: orders, error: ordersErr } = await ordersQuery
    if (ordersErr) console.error('debug-orders: ordersErr', ordersErr)

    const paymentIds = Array.from(new Set((orders ?? []).map((o: any) => o.payment_id).filter(Boolean)))
    const paymentsRes = paymentIds.length
      ? await serverSupabase.from('payments').select('id,user_id,total_amount,payment_status,razorpay_payment_id,service_id,created_at').in('id', paymentIds)
      : { data: [], error: null }
    const payments = paymentsRes.data
    if (paymentsRes.error) console.error('debug-orders: paymentsErr', paymentsRes.error)

    const serviceIds = Array.from(new Set((orders ?? []).map((o: any) => o.service_id).filter(Boolean)))
    const servicesRes = serviceIds.length ? await serverSupabase.from('services').select('id,name,category_id').in('id', serviceIds) : { data: [] }
    const services = servicesRes.data

    const categoryIds = Array.from(new Set((orders ?? []).map((o: any) => o.category_id).filter(Boolean)))
    const categoriesRes = categoryIds.length ? await serverSupabase.from('categories').select('id,name').in('id', categoryIds) : { data: [] }
    const categories = categoriesRes.data

    return NextResponse.json({ orders, payments, services, categories })
  } catch (e) {
    console.error('debug-orders exception', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
