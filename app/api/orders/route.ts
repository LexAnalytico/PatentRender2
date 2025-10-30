import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { fetchOrdersMerged } from '@/lib/orders'

export async function GET(req: NextRequest) {
  try {
    // Use server-side client bound to cookies to get the authenticated user
    const supabase = getSupabaseServer()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return NextResponse.json({ error: 'AUTH_ERROR' }, { status: 401 })
    const userId = user?.id
    if (!userId) return NextResponse.json({ error: 'NO_SESSION' }, { status: 401 })
    const result = await fetchOrdersMerged(supabase as any, userId, { includeProfile: true, cacheMs: 0, force: true })
    return NextResponse.json(result.orders)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}