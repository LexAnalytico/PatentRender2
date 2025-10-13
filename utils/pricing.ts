import { supabase } from "@/lib/supabase"

export type ApplicationType = "individual" | "startup_msme" | "others"
export type PricingKey =
  | "option1"
  | "nice_classes"
  | "goods_services"
  | "prior_use_yes"
  | "professional_fee"
  | "turnaround_standard"
  | "turnaround_expediated"
  | "turnaround_rush"
  | "search_type_quick"
  | "search_type_full_without_opinion"
  | "search_type_full_with_opinion"
  // Drafting (PS/CS/PS-CS) combined with turnaround
  | "provisional_specification_standard"
  | "provisional_specification_expediated"
  | "provisional_specification_rush"
  | "complete_specification_standard"
  | "complete_specification_expediated"
  | "complete_specification_rush"
  | "ps_cs_standard"
  | "ps_cs_expediated"
  | "ps_cs_rush"
  // Patent Application Filing (direct keys)
  | "provisional_filing"
  | "complete_specification_filing"
  | "ps_cs_filing"
  | "pct_filing"
  // First Examination Response (direct keys)
  | "base_fee"
  | "response_due_anytime_after_15_days"
  | "response_due_within_11_15_days"
  | "response_due_within_4_10_days"

export interface PricingRule {
  id: number
  service_id: number
  application_type: ApplicationType
  key: PricingKey
  unit: "fixed" | "per_class"
  amount: number
}

export interface SelectedOptions {
  applicationType: ApplicationType
  niceClasses: number[]
  goodsServices: {
    // For turnaround selection (Standard/Expediated/Rush)
    dropdown?: string
    customText?: string
  }
  // Search type: quick | full_without_opinion | full_with_opinion
  searchType?: string
  priorUse: {
    used: boolean
    firstUseDate?: string
    proofFiles?: string[]
  }
  // any other options like option1 toggles
  option1?: boolean
}

// ---- Lightweight client-side cache for rules (per-session via localStorage) ----
let rulesCache: PricingRule[] | null = null
let rulesCacheLoadedAt: number | null = null
const CACHE_VER = process.env.NEXT_PUBLIC_PRICING_CACHE_VER || '1'
const RULES_CACHE_KEY = `pricing:service_rules:v${CACHE_VER}`

export async function ensureRulesCache(client = supabase): Promise<PricingRule[]> {
  // Server guards: only attempt localStorage in browser
  const isBrowser = typeof window !== 'undefined'
  if (rulesCache && rulesCache.length > 0) return rulesCache
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(RULES_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PricingRule[]
        if (Array.isArray(parsed) && parsed.length >= 0) {
          rulesCache = parsed.map((r) => ({ ...r, amount: Number((r as any).amount) }))
          rulesCacheLoadedAt = Date.now()
          return rulesCache
        }
      }
    } catch {}
  }

  // Fallback: fetch all rules once from Supabase and cache
  const { data, error } = await client
    .from('service_pricing_rules')
    .select('id, service_id, application_type, key, unit, amount')

  if (error) throw new Error(error.message)
  rulesCache = (data ?? []).map((r: any) => ({ ...r, amount: Number(r.amount) })) as PricingRule[]
  rulesCacheLoadedAt = Date.now()
  if (isBrowser) {
    try { window.localStorage.setItem(RULES_CACHE_KEY, JSON.stringify(rulesCache)) } catch {}
  }
  return rulesCache!
}

export async function fetchServicePricingRules(serviceId: number): Promise<PricingRule[]> {
  // Use cache in browser if available, else fall back to targeted query
  const isBrowser = typeof window !== 'undefined'
  try {
    const cached = await ensureRulesCache()
    if (cached && cached.length > 0) {
      return cached.filter((r) => r.service_id === serviceId)
    }
  } catch {
    // ignore cache errors; fall through to direct fetch
  }

  const { data, error } = await supabase
    .from('service_pricing_rules')
    .select('id, service_id, application_type, key, unit, amount')
    .eq('service_id', serviceId)

  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({ ...r, amount: Number(r.amount) })) as PricingRule[]
}

// ---- Patentrender (base pricing table) cache ----
export interface PatentrenderRow {
  patent_search: number | null
  patent_application: number | null
  patent_portfolio: number | null
  first_examination: number | null
  trademark_search: number | null
  trademark_registration: number | null
  trademark_monitoring: number | null
  copyright_registration: number | null
  dmca_services: number | null
  copyright_licensing: number | null
  design_registration: number | null
  design_search: number | null
  design_portfolio: number | null
}

const PATENTRENDER_CACHE_KEY = `pricing:patentrender:v${CACHE_VER}`
let patentrenderCache: PatentrenderRow | null = null
export async function ensurePatentrenderCache(client = supabase): Promise<PatentrenderRow | null> {
  const isBrowser = typeof window !== 'undefined'
  if (patentrenderCache) return patentrenderCache
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(PATENTRENDER_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PatentrenderRow
        if (parsed && typeof parsed === 'object') {
          patentrenderCache = parsed
          return patentrenderCache
        }
      }
    } catch {}
  }
  const { data, error } = await client
    .from('patentrender')
    .select(
      'patent_search, patent_application, patent_portfolio, first_examination, trademark_search, trademark_registration, trademark_monitoring, copyright_registration, dmca_services, copyright_licensing, design_registration, design_search, design_portfolio'
    )
    .maybeSingle()
  if (error) {
    console.error('[pricing] patentrender fetch failed', error)
    return null
  }
  const normalized: PatentrenderRow | null = data
    ? {
        patent_search: Number(data.patent_search ?? 0),
        patent_application: Number(data.patent_application ?? 0),
        patent_portfolio: Number(data.patent_portfolio ?? 0),
        first_examination: Number(data.first_examination ?? 0),
        trademark_search: Number(data.trademark_search ?? 0),
        trademark_registration: Number(data.trademark_registration ?? 0),
        trademark_monitoring: Number(data.trademark_monitoring ?? 0),
        copyright_registration: Number(data.copyright_registration ?? 0),
        dmca_services: Number(data.dmca_services ?? 0),
        copyright_licensing: Number(data.copyright_licensing ?? 0),
        design_registration: Number(data.design_registration ?? 0),
        design_search: Number(data.design_search ?? 0),
        design_portfolio: Number(data.design_portfolio ?? 0),
      }
    : null
  patentrenderCache = normalized
  if (isBrowser && normalized) {
    try { window.localStorage.setItem(PATENTRENDER_CACHE_KEY, JSON.stringify(normalized)) } catch {}
  }
  return normalized
}
export function computePriceFromRules(rules: PricingRule[], opts: SelectedOptions): number {
  const byKey = new Map<string, PricingRule>()
  const anyKey = new Map<string, PricingRule>()
  for (const r of rules) {
    // Map of rules for the selected application type
    if (r.application_type === opts.applicationType) {
      byKey.set(r.key, r)
    }
    // Unfiltered map (used as fallback)
    if (!anyKey.has(r.key)) anyKey.set(r.key, r)
  }

  const getRule = (key: string) => byKey.get(key) ?? anyKey.get(key)

  let total = 0

  // Option1 (if relevant)
  if (opts.option1) {
    const rule = getRule("option1")
    if (rule) total += rule.amount
  }

  // NICE classes (per class)
  const niceRule = getRule("nice_classes")
  if (niceRule && opts.niceClasses?.length) {
    if (niceRule.unit === "per_class") {
      total += niceRule.amount * opts.niceClasses.length
    } else {
      total += niceRule.amount
    }
  }

  // Goods/Services selection cost (fixed add-on if any)
  const goodsRule = getRule("goods_services")
  if (goodsRule && (opts.goodsServices?.dropdown || opts.goodsServices?.customText)) {
    total += goodsRule.amount
  }

  // Combined key logic for service-specific type and turnaround
  // Patentability Search: quick/full_without_opinion/full_with_opinion + standard/expediated/rush
  // Drafting: ps/cs/ps_cs + standard/expediated/rush
  const st = (opts.searchType || "").toLowerCase();
  const t = (opts.goodsServices?.dropdown || "").toLowerCase();
  let combinedKey = "";
  let appliedCore = false; // whether we've applied a core search/drafting pricing component
  if (st === "full_without_opinion" && t) {
    combinedKey = `full_without_opinion_${t}`;
  } else if (st === "full_with_opinion" && t) {
    combinedKey = `full_with_opinion_${t}`;
  } else if (st === "quick" && t) {
    combinedKey = `turnaround_${t}`;
  } else if ((st === "ps" || st === "cs" || st === "ps_cs") && t) {
    const base = st === "ps" ? "provisional_specification" : st === "cs" ? "complete_specification" : "ps_cs";
    combinedKey = `${base}_${t}`;
  }
  if (combinedKey) {
    const r = getRule(combinedKey);
    if (r) {
      // Pricing precedence change: the combined key (search type + turnaround) represents the core
      // amount and should REPLACE any previously accumulated turnaround/search base portion.
      // Current accumulated components before this line: option1, NICE classes, goods_services add-on.
      // We keep those, but ensure we do not double count a professional base fee later.
      total += r.amount;
      appliedCore = true;
    }
  }

  // Fallback: if no turnaround selected yet but user chose a search type, use its base rule
  if (!appliedCore && st) {
    const baseKeyMap: Record<string,string> = {
      quick: 'search_type_quick',
      full_without_opinion: 'search_type_full_without_opinion',
      full_with_opinion: 'search_type_full_with_opinion',
    }
    const k = baseKeyMap[st]
    if (k) {
      const r = getRule(k)
      if (r) {
        total += r.amount
        appliedCore = true
      }
    }
  }

  // Patent Application Filing: goodsServices.dropdown holds a direct key
  const filingKeys = new Set([
    "provisional_filing",
    "complete_specification_filing",
    "ps_cs_filing",
    "pct_filing",
  ])
  if (t && filingKeys.has(t)) {
    const r = getRule(t)
    if (r) total += r.amount
  }

  // First Examination Response: searchType holds a direct key
  const ferKeys = new Set([
    "base_fee",
    "response_due_anytime_after_15_days",
    "response_due_within_11_15_days",
    "response_due_within_4_10_days",
  ])
  if (st && ferKeys.has(st)) {
    const r = getRule(st)
    if (r) total += r.amount
  }

  // Prior use
  const priorRule = getRule("prior_use_yes")
  if (priorRule && opts.priorUse?.used) {
    total += priorRule.amount
  }

  // Professional fee applies only if we did NOT already apply a combined search/turnaround key.
  if (!appliedCore) {
    const profRule = getRule("professional_fee")
    if (profRule) total += profRule.amount
  }

  return total
}  

