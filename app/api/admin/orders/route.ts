import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route returns ALL orders with basic joins for admin users only.
// It relies on RLS policies in Supabase to restrict access.
// Ensure you have an RLS policy that allows select for the configured admin emails.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

// We prefer using the service role key for an admin aggregate fetch on the server (never expose to client!)
// If not available, we fall back to anon key but then depend entirely on RLS to filter.
const supabase = createClient(supabaseUrl, serviceRoleKey || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string))

export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get('x-user-email') || null
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    if (!email || !adminEmails.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, service_id, category_id, payment_id, type, amount, user_id, assigned_to, responsible, workflow_status, require_info_message, require_info_reply')
      .order('created_at', { ascending: false })
      .limit(500) // safety limit

    if (error) {
      console.error('[AdminOrders] base fetch error', error)
      return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
    }

    const orders = data || []
    const serviceIds = Array.from(new Set(orders.map(o => o.service_id).filter(Boolean)))
    const categoryIds = Array.from(new Set(orders.map(o => o.category_id).filter(Boolean)))
    const paymentIds = Array.from(new Set(orders.map(o => o.payment_id).filter(Boolean)))
    const userIds = Array.from(new Set(orders.map(o => o.user_id).filter(Boolean)))

    const [servicesRes, categoriesRes, paymentsRes, usersRes] = await Promise.all([
      serviceIds.length ? supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
      categoryIds.length ? supabase.from('categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
      paymentIds.length ? supabase.from('payments').select('id, razorpay_payment_id, total_amount, payment_status, payment_date, type').in('id', paymentIds) : Promise.resolve({ data: [], error: null }),
      userIds.length ? supabase.from('users').select('id, email, first_name, last_name, company').in('id', userIds) : Promise.resolve({ data: [], error: null })
    ])

    const servicesMap = new Map((servicesRes.data || []).map((s: any) => [s.id, s]))
    const categoriesMap = new Map((categoriesRes.data || []).map((c: any) => [c.id, c]))
    const paymentsMap = new Map((paymentsRes.data || []).map((p: any) => [p.id, p]))
    const usersMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]))

    const merged = orders.map(o => ({
      ...o,
      services: servicesMap.get(o.service_id) || null,
      categories: categoriesMap.get(o.category_id) || null,
      payments: paymentsMap.get(o.payment_id) || null,
      user: usersMap.get(o.user_id) || null,
    }))

    return NextResponse.json({ orders: merged })
  } catch (e: any) {
    console.error('[AdminOrders] unexpected error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// PATCH: assign / forward one or many orders to another admin.
// Body: { orderIds: number[], assigned_to: string }
// Security: only primary admin (first email in NEXT_PUBLIC_ADMIN_EMAILS) may assign.
export async function PATCH(req: NextRequest) {
  try {
  const body = await req.json().catch(() => null) as { orderIds?: number[]; assigned_to?: string; workflow_status?: string; require_info_message?: string | null } | null
    if (!body || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const email = req.headers.get('x-user-email') || ''
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    if (!email || !adminEmails.length) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const primaryAdmin = adminEmails[0]
    if (email.toLowerCase() !== primaryAdmin) {
      return NextResponse.json({ error: 'Only primary admin can modify' }, { status: 403 })
    }

    const updates: Record<string, any> = {}
    if (body.assigned_to) {
      if (!adminEmails.includes(body.assigned_to.toLowerCase())) {
        return NextResponse.json({ error: 'Assigned target must be an admin' }, { status: 400 })
      }
      updates.assigned_to = body.assigned_to.toLowerCase()
      updates.responsible = body.assigned_to.toLowerCase()
    }
    if (body.workflow_status) {
      const allowed = new Set(['in_progress','require_info','completed'])
      const norm = body.workflow_status.toLowerCase().replace(/\s+/g,'_')
      if (!allowed.has(norm)) {
        return NextResponse.json({ error: 'Invalid workflow_status' }, { status: 400 })
      }
      updates.workflow_status = norm
    }
    if (Object.prototype.hasOwnProperty.call(body, 'require_info_message')) {
      const msg = (body.require_info_message || '').trim()
      if (msg.length > 25) {
        return NextResponse.json({ error: 'Message exceeds 25 chars' }, { status: 400 })
      }
      updates.require_info_message = msg || null
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .in('id', body.orderIds)
    if (error) {
      console.error('[AdminOrders] update error', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, updates })
  } catch (e: any) {
    console.error('[AdminOrders] unexpected PATCH error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
