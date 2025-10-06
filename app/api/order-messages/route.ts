import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We intentionally use service role only if available (server-side) similar to admin/orders pattern.
// Otherwise fall back to anon and depend on RLS.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isAdmin(email: string | null): boolean {
  if (!email) return false
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.toLowerCase())
}

// GET /api/order-messages?orderId=123
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }
  // Caller provides x-user-email (mirrors admin/orders route) to identify context.
  const callerEmail = req.headers.get('x-user-email') || null
  if (!callerEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Non-admin users should only see their own order's messages. We trust RLS OR we can enforce by join.
  // Lightweight enforcement: fetch order owner if not admin.
  if (!isAdmin(callerEmail)) {
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .maybeSingle()
    if (orderErr || !orderRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // We only have the email, not the user_id; optionally map email->id in users table
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('email', callerEmail)
      .maybeSingle()
    if (!userRow || userRow.id !== orderRow.user_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch messages
  const { data, error } = await supabase
    .from('order_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data || [] })
}

// POST /api/order-messages  { orderId, message }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const { orderId, message } = body as { orderId?: number; message?: string }
  if (!orderId || !message) {
    return NextResponse.json({ error: 'orderId and message required' }, { status: 400 })
  }
  if (message.length > 500) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  const callerEmail = req.headers.get('x-user-email') || null
  if (!callerEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let sender_role: 'admin' | 'user' = isAdmin(callerEmail) ? 'admin' : 'user'
  // Validate ownership for non-admin
  if (sender_role === 'user') {
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .maybeSingle()
    if (orderErr || !orderRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('email', callerEmail)
      .maybeSingle()
    if (!userRow || userRow.id !== orderRow.user_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('order_messages')
    .insert({ order_id: orderId, message, sender_role, sender_email: callerEmail })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}
