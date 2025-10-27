import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      return NextResponse.json({ error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 })
    }
    const server = createClient(url, key)
    const { data, error } = await server
      .from('patentrender')
      .select(
        'patent_search, patent_application, patent_portfolio, first_examination, trademark_search, trademark_registration, trademark_monitoring, copyright_registration, dmca_services, copyright_licensing, design_registration, design_search, design_portfolio'
      )
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ row: null })
    const row = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Number(v ?? 0)]))
    return NextResponse.json({ row })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'UNEXPECTED' }, { status: 500 })
  }
}
