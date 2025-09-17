import { NextResponse } from 'next/server'
import pricingToForm from '@/app/data/service-pricing-to-form.json'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'missing key query param' }, { status: 400 })
    const map = pricingToForm as unknown as Record<string, string>
    const mapped = map[key] ?? null
    return NextResponse.json({ key, mapped })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}
