import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const serverSupabase = createClient(url, key)

    const body = await req.json().catch(() => null as any)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const user_id: string | null = body.user_id || null
    const order_id: number | null = typeof body.order_id === 'number' ? body.order_id : (typeof body.order_id === 'string' ? Number(body.order_id) : null)
    const form_type: string | null = body.form_type || null
    const data: Record<string, any> | null = body.data || null
    const fields_filled_count: number | null = typeof body.fields_filled_count === 'number' ? body.fields_filled_count : null
    const fields_total: number | null = typeof body.fields_total === 'number' ? body.fields_total : null

    if (!user_id || !form_type) {
      return NextResponse.json({ error: 'Missing user_id or form_type' }, { status: 400 })
    }

    // Upsert confirmation; order_id may be null (pre-order form), still store by (user_id, form_type)
    const payload: any = {
      user_id,
      order_id: order_id ?? null,
      form_type,
      data: data ?? {},
      completed: true,
      fields_filled_count: fields_filled_count ?? null,
      fields_total: fields_total ?? null,
    }

    const { error } = await serverSupabase
      .from('form_responses')
      .upsert(payload, { onConflict: 'user_id,order_id,form_type' })

    if (error) {
      return NextResponse.json({ error: error.message || 'DB upsert failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}
