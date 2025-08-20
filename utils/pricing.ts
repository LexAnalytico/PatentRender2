import { supabase } from "@/lib/supabase"

export type ApplicationType = "individual" | "startup_msme" | "others"
export type PricingKey = "option1" | "nice_classes" | "goods_services" | "prior_use_yes" | "professional_fee"

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
    dropdown?: string
    customText?: string
  }
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
