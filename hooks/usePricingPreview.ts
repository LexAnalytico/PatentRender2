import { useEffect, useMemo, useState } from 'react'
import { computePriceFromRules } from '@/utils/pricing'
import { computePatentabilityPrice } from '@/utils/pricing/services/patentabilitySearch'
import { computeDraftingPrice } from '@/utils/pricing/services/drafting'
import { computeFilingPrice } from '@/utils/pricing/services/patentFiling'
import { computeFerPrice, computeAllFerVariants } from '@/utils/pricing/services/fer'

/**
 * Consolidated pricing preview hook.
 * Encapsulates the previously scattered pricing effects in page.tsx.
 */
export function usePricingPreview(params: {
  pricingRules: any[] | null
  selectedServiceTitle: string | null
  optionsForm: any
  servicePricing: Record<string, number>
  visibilityTick: number
}) {
  const { pricingRules, selectedServiceTitle, optionsForm, servicePricing, visibilityTick } = params

  // Lightweight memoization for price computations across effects (per hook instance)
  // Keyed by JSON of selection + hash of rules length.
  const priceCacheRef = (globalThis as any).__PRICE_CACHE_REF__ || { map: new Map<string, number>() }
  ;(globalThis as any).__PRICE_CACHE_REF__ = priceCacheRef
  const cacheKeyFor = (sel: any) => {
    const rulesLen = Array.isArray(pricingRules) ? pricingRules.length : 0
    try { return JSON.stringify({ r: rulesLen, s: sel }) } catch { return Math.random().toString(36) }
  }
  const cachedCompute = (sel: any): number => {
    const key = cacheKeyFor(sel)
    const existing = priceCacheRef.map.get(key)
    if (typeof existing === 'number') return existing
    const val = computePriceFromRules(pricingRules as any, sel as any)
    priceCacheRef.map.set(key, val)
    return val
  }

  const [preview, setPreview] = useState({ total: 0, professional: 0, government: 0 })
  const [applicantPrices, setApplicantPrices] = useState<{ individual?: number; others?: number }>({})
  const [ferPrices, setFerPrices] = useState<Record<string, number>>({})

  // Normalize derived fields reused across calculations
  const applicationType = useMemo(() => {
    let base: 'individual' | 'startup_msme' | 'others' = 'individual'
    if (optionsForm.applicantTypes?.includes('Individual / Sole Proprietor')) base = 'individual'
    else if (optionsForm.applicantTypes?.includes('Startup / Small Enterprise')) base = 'startup_msme'
    else if (optionsForm.applicantTypes?.includes('Others (Company, Partnership, LLP, Trust, etc.)')) base = 'others'
    // For filing, applicant type can override via searchType
    if (selectedServiceTitle === 'Patent Application Filing' && (optionsForm.searchType === 'individual' || optionsForm.searchType === 'others')) {
      return optionsForm.searchType as 'individual' | 'others'
    }
    return base
  }, [optionsForm.applicantTypes, optionsForm.searchType, selectedServiceTitle])

  const niceClasses: number[] = useMemo(
    () => (optionsForm.niceClasses || []).map((v: string) => Number(v)).filter((n: number) => !Number.isNaN(n)),
    [optionsForm.niceClasses]
  )
  const priorUse = optionsForm.useType === 'yes'

  // Master preview total for current selection
  useEffect(() => {
    if (!pricingRules || !selectedServiceTitle) {
      setPreview({ total: 0, professional: 0, government: 0 })
      return
    }
    const sel = {
      applicationType,
      niceClasses,
      goodsServices: {
        dropdown: optionsForm.goodsServices || undefined,
        customText: optionsForm.goodsServicesCustom || undefined,
      },
      searchType: optionsForm.searchType || undefined,
      priorUse: { used: priorUse, firstUseDate: optionsForm.firstUseDate || undefined, proofFiles: optionsForm.proofFileNames },
      option1: true,
    } as const
    try {
      const total = cachedCompute(sel as any)
      const profRule = (pricingRules as any).find((r: any) => r.application_type === applicationType && r.key === 'professional_fee')
      const professional = profRule ? Number(profRule.amount) : 0
      const government = Math.max(0, total - professional)
      setPreview({ total, professional, government })
    } catch {
      setPreview({ total: 0, professional: 0, government: 0 })
    }
  }, [pricingRules, selectedServiceTitle, optionsForm.goodsServices, optionsForm.goodsServicesCustom, optionsForm.searchType, optionsForm.firstUseDate, optionsForm.proofFileNames, applicationType, niceClasses, priorUse, visibilityTick])

  // Applicant type comparison prices (Patent Application Filing)
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== 'Patent Application Filing') {
      setApplicantPrices({})
      return
    }
    const filingType = optionsForm.goodsServices && optionsForm.goodsServices !== '0' ? optionsForm.goodsServices : 'provisional_filing'
    const baseSel = {
      niceClasses,
      goodsServices: { dropdown: filingType },
      searchType: undefined,
      priorUse: { used: priorUse },
      option1: true,
    } as any
    try {
      const ind = cachedCompute({ ...baseSel, applicationType: 'individual' }) || 0
      const oth = cachedCompute({ ...baseSel, applicationType: 'others' }) || 0
      const fallback = servicePricing['Patent Application Filing'] || 0
      setApplicantPrices({
        individual: ind > 0 ? ind : fallback,
        others: oth > 0 ? oth : fallback,
      })
    } catch {
      setApplicantPrices({})
    }
  }, [pricingRules, selectedServiceTitle, optionsForm.goodsServices, priorUse, niceClasses, servicePricing])

  // FER variant prices
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== 'First Examination Response') {
      setFerPrices({})
      return
    }
    const appType = applicationType === 'startup_msme' ? 'individual' : (applicationType as any) // maintain parity with earlier logic
    const variants = computeAllFerVariants({
      pricingRules,
      applicationType: appType,
      niceClasses,
      priorUse,
    } as any)
    const fallbackFER = servicePricing['First Examination Response'] || 0
    const normalized: Record<string, number> = {}
    for (const k of Object.keys(variants)) {
      const v = (variants as any)[k]
      normalized[k] = v && v > 0 ? v : fallbackFER
    }
    setFerPrices(normalized)
  }, [pricingRules, selectedServiceTitle, applicationType, priorUse, niceClasses, servicePricing])

  // Convenience one-off totals for specific service contexts
  const patentSearchTotal = useMemo(() => {
    if (selectedServiceTitle !== 'Patentability Search') return 0
    const st = optionsForm.searchType as any
    if (!st) return 0
    const turn = (optionsForm.goodsServices as any) || 'standard'
    return computePatentabilityPrice({
      pricingRules: pricingRules || null,
      applicationType: applicationType as any,
      niceClasses,
      priorUse,
      searchType: st,
      turnaround: turn,
    })
  }, [selectedServiceTitle, optionsForm.searchType, optionsForm.goodsServices, pricingRules, applicationType, niceClasses, priorUse])

  const draftingTotal = useMemo(() => {
    if (selectedServiceTitle !== 'Drafting') return 0
    const dt = optionsForm.searchType as any
    if (!dt) return 0
    const turn = (optionsForm.goodsServices as any) || 'standard'
    return computeDraftingPrice({
      pricingRules: pricingRules || null,
      applicationType: applicationType as any,
      niceClasses,
      priorUse,
      draftingType: dt,
      turnaround: turn,
    })
  }, [selectedServiceTitle, optionsForm.searchType, optionsForm.goodsServices, pricingRules, applicationType, niceClasses, priorUse])

  const filingTotal = useMemo(() => {
    if (selectedServiceTitle !== 'Patent Application Filing') return 0
    if (!(optionsForm.searchType === 'individual' || optionsForm.searchType === 'others')) return 0
    const effectiveFilingType = (optionsForm.goodsServices && optionsForm.goodsServices !== '' ? optionsForm.goodsServices : 'provisional_filing') as any
    return computeFilingPrice({
      pricingRules: pricingRules || null,
      filingType: effectiveFilingType,
      applicationType: (optionsForm.searchType === 'individual' ? 'individual' : 'others'),
      niceClasses,
      priorUse,
      searchType: optionsForm.searchType,
    })
  }, [selectedServiceTitle, optionsForm.searchType, optionsForm.goodsServices, pricingRules, niceClasses, priorUse])

  // FER total: if base preview total is zero (due to no professional_fee split) but we have a variant price, use it.
  const ferTotal = useMemo(() => {
    if (selectedServiceTitle !== 'First Examination Response') return 0
    // If preview already computed something non-zero, use it.
    if (preview.total > 0) return preview.total
    const key = optionsForm.searchType
    if (key && ferPrices[key] && ferPrices[key] > 0) return ferPrices[key]
    return 0
  }, [selectedServiceTitle, preview.total, optionsForm.searchType, ferPrices])

  return {
    preview,
    applicantPrices,
    ferPrices,
    patentSearchTotal,
    draftingTotal,
    filingTotal,
    ferTotal,
  }
}
