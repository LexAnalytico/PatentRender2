import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { fetchOrdersMerged } from '@/lib/orders'

// Route handler that uses first-party cookies to authenticate the user on the server.
// This avoids 401s on Vercel when the tab is restored and the client calls /api/orders.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    // Use the authenticated session from cookies
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null
    if (!userId) return NextResponse.json({ error: 'NO_SESSION' }, { status: 401 })
    const result = await fetchOrdersMerged(supabase as any, userId, { includeProfile: true, cacheMs: 0, force: true })
    return NextResponse.json(result.orders)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}