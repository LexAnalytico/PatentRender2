import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchOrdersMerged } from '@/lib/orders'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Use auth session to find user id (lightweight call)
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return NextResponse.json({ error: 'AUTH_ERROR' }, { status: 401 })
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'NO_SESSION' }, { status: 401 })
    const result = await fetchOrdersMerged(supabase as any, userId, { includeProfile: true, cacheMs: 0, force: true })
    return NextResponse.json(result.orders)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}