import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isAdmin(email: string | null): boolean {
  if (!email) return false
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.toLowerCase())
}

// GET /api/order-messages/summary?orderIds=1,2,3
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get('orderIds') || ''
    if (!raw) return NextResponse.json({ summaries: [] })
    const ids = raw.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
    if (ids.length === 0) return NextResponse.json({ summaries: [] })
    const callerEmail = req.headers.get('x-user-email') || null
    if (!callerEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // For non-admin, restrict to their own orders
    if (!isAdmin(callerEmail)) {
      const { data: userRow } = await supabase.from('users').select('id').eq('email', callerEmail).maybeSingle()
      if (!userRow) return NextResponse.json({ summaries: [] })
      const { data: ownedOrders } = await supabase.from('orders').select('id').in('id', ids).eq('user_id', userRow.id)
      const ownedIds = new Set((ownedOrders || []).map(o => o.id))
      if (ownedIds.size === 0) return NextResponse.json({ summaries: [] })
      for (let i = ids.length - 1; i >= 0; i--) { if (!ownedIds.has(ids[i])) ids.splice(i,1) }
      if (ids.length === 0) return NextResponse.json({ summaries: [] })
    }

    const { data, error } = await supabase
      .from('order_messages')
      .select('order_id, created_at')
      .in('order_id', ids)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const agg: Record<number, { order_id: number; message_count: number; last_created_at: string | null }> = {}
    for (const row of (data || [])) {
      const oid = (row as any).order_id as number
      const created = (row as any).created_at as string
      if (!agg[oid]) agg[oid] = { order_id: oid, message_count: 0, last_created_at: null }
      agg[oid].message_count += 1
      if (!agg[oid].last_created_at || new Date(created) > new Date(agg[oid].last_created_at!)) {
        agg[oid].last_created_at = created
      }
    }
    return NextResponse.json({ summaries: Object.values(agg) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}