import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pricingToForm from '@/app/data/service-pricing-to-form.json'

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!url || !key) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    const serverSupabase = createClient(url, key)
    const q = new URL(req.url)
    const orderId = q.searchParams.get('order_id')
    if (!orderId) return NextResponse.json({ error: 'missing order_id' }, { status: 400 })

    const { data: ord } = await serverSupabase.from('orders').select('id,service_id,payment_id,type').eq('id', orderId).maybeSingle()
    if (!ord) return NextResponse.json({ error: 'order not found' }, { status: 404 })

    // prefer explicit order.type
    if (ord.type) return NextResponse.json({ resolved: ord.type, source: 'order.type', order: ord })

    // check payment.type
    let pay: any = null
    if (ord.payment_id) {
      const { data: p } = await serverSupabase.from('payments').select('id,type,service_id,razorpay_payment_id').eq('id', ord.payment_id).maybeSingle()
      pay = p
      if (pay && pay.type) return NextResponse.json({ resolved: pay.type, source: 'payment.type', order: ord, payment: pay })
    }

    // check service_pricing_rules for this service
    if (ord.service_id) {
      const { data: pricing } = await serverSupabase.from('service_pricing_rules').select('service_id,key').eq('service_id', ord.service_id).limit(1)
      const keyFound = pricing && pricing.length > 0 ? pricing[0].key : null
      if (keyFound) {
        const map = pricingToForm as unknown as Record<string,string>
        const mapped = map[keyFound] ?? null
        return NextResponse.json({ resolved: mapped ?? keyFound, source: 'service_pricing_rules', key: keyFound, mapped })
      }
    }

    // fallback map from service name
    const { data: svc } = await serverSupabase.from('services').select('id,name').eq('id', ord.service_id).maybeSingle()
    const svcName = svc?.name ?? null
    const mapping: Record<string,string> = {
      'Patentability Search': 'patentability_search',
      'Patentability search': 'patentability_search',
      'Drafting': 'drafting',
      'Provisional Filing': 'provisional_filing',
      'Complete Non Provisional Filing': 'complete_non_provisional_filing',
      'PCT Filing': 'pct_filing',
      'PS-CS': 'ps_cs',
      'PS CS': 'ps_cs',
      'FER Response': 'fer_response',
      'Trademark Registration': 'trademark',
      'Copyright Registration': 'copyrights',
      'Design Filing': 'design',
    }
    if (svcName && mapping[svcName]) return NextResponse.json({ resolved: mapping[svcName], source: 'service.name', name: svcName })

    return NextResponse.json({ resolved: null, source: 'none' })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}
