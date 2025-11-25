//components/utils/resolve-form-type.ts
// Map various incoming keys (pricing keys, rough service names, old slugs) to canonical application types
const CANONICAL_MAP: Record<string,string> = {
  patentability_search: 'patentability_search',
  drafting: 'drafting',
  provisional_filing: 'provisional_filing',
  complete_non_provisional_filing: 'complete_non_provisional_filing',
  pct_filing: 'pct_filing',
  ps_cs: 'ps_cs',
  fer_response: 'fer_response',
  trademark: 'trademark',
  copyrights: 'copyrights',
  copyright: 'copyrights',
  design: 'design',
  // Common legacy / alternative tokens
  // Map human-facing labels to canonical types
  'patent application filing': 'complete_non_provisional_filing',
  'patentability search': 'patentability_search',
  'first examination response': 'fer_response',
  'complete provisional filing': 'complete_non_provisional_filing',
  'trademark registration': 'trademark',
  'copyright registration': 'copyrights',
  'design filing': 'design',
  basic: 'patentability_search', // example mapping; adjust if needed
  premium: 'drafting',           // example mapping; adjust if needed
  enterprise: 'pct_filing',      // example mapping; adjust if needed
}

const normalize = (v: any): string | null => {
  if (!v) return null
  const s = String(v).trim().toLowerCase()
  // direct match
  if (CANONICAL_MAP[s]) return CANONICAL_MAP[s]
  // try replace spaces & dashes with underscores
  const key = s.replace(/[-\s]+/g, '_')
  if (CANONICAL_MAP[key]) return CANONICAL_MAP[key]
  return null
}

export const resolveFormTypeFromOrderLike = (order: any): string => {
  if (!order) return 'service-form'

  // Priority 1: explicit order.type (if already canonical)
  const byOrderType = normalize(order.type)
  if (byOrderType) return byOrderType

  // Priority 2: payment / parent payment reference
  const byPaymentType = normalize(order.payment_type || order?.payment?.type)
  if (byPaymentType) return byPaymentType

  // Priority 3: service object hints
  const svc = order.services || order.service || null
  if (svc) {
    const fromService = normalize(svc.form_type || svc.slug || svc.type || svc.category || svc.name)
    if (fromService) return fromService
  }

  // Priority 4: pricing key
  const fromPricing = normalize(order.service_pricing_key)
  if (fromPricing) return fromPricing

  return 'service-form'
}