import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isAdmin(email: string | null): boolean {
  if (!email) return false
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}

// GET /api/admin/forms?orderId=123
// Returns: { formResponses: [ { field: string, value: any } ] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderIdRaw = searchParams.get('orderId')
    const orderId = orderIdRaw ? Number(orderIdRaw) : null
    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 })
    }
    const email = req.headers.get('x-user-email') || null
    if (!isAdmin(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch form_responses row(s) for this order. There can be multiple form types; consolidate.
    const { data, error } = await supabase
      .from('form_responses')
      .select('form_type, data')
      .eq('order_id', orderId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const responses: Array<{ field: string; value: any }> = []
    for (const row of (data || [])) {
      const payload = (row as any).data || {}
      if (payload && typeof payload === 'object') {
        for (const [k, v] of Object.entries(payload)) {
          responses.push({ field: k, value: v })
        }
      }
    }

    // Sort fields for stable output (alphabetical)
    responses.sort((a,b) => a.field.localeCompare(b.field))

    return NextResponse.json({ formResponses: responses })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}
