// First Examination Response (FER) pricing helpers

import { computePriceFromRules } from '@/utils/pricing'

export type FerKey = 'base_fee' | 'response_due_anytime_after_15_days' | 'response_due_within_11_15_days' | 'response_due_within_4_10_days'

export interface FerInput {
	pricingRules: any[] | null
	applicationType: 'individual' | 'startup_msme' | 'others'
	ferKey: FerKey
	niceClasses: number[]
	priorUse: boolean
}

function buildSelection(i: FerInput) {
	return {
		applicationType: i.applicationType,
		niceClasses: i.niceClasses,
		goodsServices: { dropdown: 'standard' }, // FER uses searchType to encode variant
		searchType: i.ferKey,
		priorUse: { used: i.priorUse },
		option1: true,
	}
}

export function computeFerPrice(i: FerInput): number {
	if (!i.pricingRules) return 0
	try { return computePriceFromRules(i.pricingRules as any, buildSelection(i) as any) } catch { return 0 }
}

export function computeAllFerVariants(base: Omit<FerInput, 'ferKey'>) {
	const variants: FerKey[] = [
		'base_fee',
		'response_due_anytime_after_15_days',
		'response_due_within_11_15_days',
		'response_due_within_4_10_days'
	]
	const out: Record<string, number> = {}
	for (const v of variants) out[v] = computeFerPrice({ ...base, ferKey: v })
	return out as Record<FerKey, number>
}

