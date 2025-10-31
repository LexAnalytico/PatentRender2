import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { fetchOrdersMerged } from '@/lib/orders'

// Route handler that uses first-party cookies to authenticate the user on the server.
// This avoids 401s on Vercel when the tab is restored and the client calls /api/orders.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseFromCookies = createRouteHandlerClient({ cookies: () => cookieStore })
    // 1) Try cookies-backed session first
    const { data: { session } } = await supabaseFromCookies.auth.getSession()
    let userId = session?.user?.id || null
    if (userId) {
      const result = await fetchOrdersMerged(supabaseFromCookies as any, userId, { includeProfile: true, cacheMs: 0, force: true })
      return NextResponse.json(result.orders)
    }

    // 2) Fallback: accept Authorization: Bearer <access_token> from client
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    const m = authHeader && authHeader.match(/^Bearer\s+(.+)$/i)
    const accessToken = m ? m[1] : null
    if (!accessToken) return NextResponse.json({ error: 'NO_SESSION' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseWithToken = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    // Validate token and get user id
    const { data: userRes, error: userErr } = await supabaseWithToken.auth.getUser()
    if (userErr || !userRes?.user?.id) return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 })
    userId = userRes.user.id

    const result = await fetchOrdersMerged(supabaseWithToken as any, userId, { includeProfile: true, cacheMs: 0, force: true })
    return NextResponse.json(result.orders)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}