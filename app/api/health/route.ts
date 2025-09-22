import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hasKeyId = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasEmailHost = !!process.env.EMAIL_HOST
    const hasEmailPort = !!process.env.EMAIL_PORT
    const hasEmailUser = !!process.env.EMAIL_USER
    const hasEmailPass = !!process.env.EMAIL_PASS

    return NextResponse.json({
      ok: true,
      env: {
        razorpay: { hasKeyId, hasKeySecret },
        supabase: { hasSupabaseUrl, hasSupabaseAnon, hasServiceRole },
        email: { hasEmailHost, hasEmailPort, hasEmailUser, hasEmailPass },
      },
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
