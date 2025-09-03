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

export async function fetchServicePricingRules(serviceId: number): Promise<PricingRule[]> {
  const { data, error } = await supabase
    .from("service_pricing_rules")
    .select("id, service_id, application_type, key, unit, amount")
    .eq("service_id", serviceId)

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount) }))
}

export function computePriceFromRules(rules: PricingRule[], opts: SelectedOptions): number {
  const byKey = new Map<string, PricingRule>()
  for (const r of rules) {
    if (r.application_type === opts.applicationType) {
      byKey.set(r.key, r)
    }
  }

  let total = 0

  // Option1 (if relevant)
  if (opts.option1) {
    const rule = byKey.get("option1")
    if (rule) total += rule.amount
  }

  // NICE classes (per class)
  const niceRule = byKey.get("nice_classes")
  if (niceRule && opts.niceClasses?.length) {
    if (niceRule.unit === "per_class") {
      total += niceRule.amount * opts.niceClasses.length
    } else {
      total += niceRule.amount
    }
  }

  // Goods/Services selection cost (fixed add-on if any)
  const goodsRule = byKey.get("goods_services")
  if (goodsRule && (opts.goodsServices?.dropdown || opts.goodsServices?.customText)) {
    total += goodsRule.amount
  }

  // Turnaround from dropdown (DB-driven)
  const t = (opts.goodsServices?.dropdown || "").toLowerCase()
  if (t === "standard") {
    const r = byKey.get("turnaround_standard")
    if (r) total += r.amount
  } else if (t === "expediated") {
    const r = byKey.get("turnaround_expediated")
    if (r) total += r.amount
  } else if (t === "rush") {
    const r = byKey.get("turnaround_rush")
    if (r) total += r.amount
  }

  // Search type (DB-driven)
  const st = (opts.searchType || "").toLowerCase()
  if (st === "quick") {
    const r = byKey.get("search_type_quick")
    if (r) total += r.amount
  } else if (st === "full_without_opinion") {
    const r = byKey.get("search_type_full_without_opinion")
    if (r) total += r.amount
  } else if (st === "full_with_opinion") {
    const r = byKey.get("search_type_full_with_opinion")
    if (r) total += r.amount
  }

  // Prior use
  const priorRule = byKey.get("prior_use_yes")
  if (priorRule && opts.priorUse?.used) {
    total += priorRule.amount
  }

  // Professional fee always applies (if defined)
  const profRule = byKey.get("professional_fee")
  if (profRule) total += profRule.amount

  return total
}
