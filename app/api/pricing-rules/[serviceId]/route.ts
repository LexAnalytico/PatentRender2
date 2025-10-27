import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_req: NextRequest, { params }: { params: { serviceId: string } }) {
  try {
    const serviceIdNum = Number(params.serviceId)
    if (!serviceIdNum || Number.isNaN(serviceIdNum)) {
      return NextResponse.json({ error: 'INVALID_SERVICE_ID' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 })
    }
    const server = createClient(url, key)
    const { data, error } = await server
      .from('service_pricing_rules')
      .select('id, service_id, application_type, key, unit, amount')
      .eq('service_id', serviceIdNum)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const normalized = (data || []).map((r: any) => ({ ...r, amount: Number(r.amount) }))
    return NextResponse.json({ rules: normalized })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}
