import { NextRequest, NextResponse } from 'next/server'
import { fetchOrdersMerged } from '@/lib/orders'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function GET(_req: NextRequest) {
  try {
    // Bind Supabase to request cookies so auth is available server-side
    const supabase = getSupabaseServer()
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      return NextResponse.json({ error: 'AUTH_ERROR', detail: userErr.message }, { status: 401 })
    }
    const userId = userRes?.user?.id || null
    if (!userId) {
      return NextResponse.json({ error: 'NO_SESSION' }, { status: 401 })
    }
    const result = await fetchOrdersMerged(supabase as any, userId, { includeProfile: true, cacheMs: 0, force: true })
    return NextResponse.json(result.orders)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}