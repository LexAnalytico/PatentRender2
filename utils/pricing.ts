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

