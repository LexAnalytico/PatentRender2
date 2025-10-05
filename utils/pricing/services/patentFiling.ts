// Patent Application Filing pricing helpers
// Provides computation for different filing types combined with applicant type.

import { computePriceFromRules } from '@/utils/pricing'

export type FilingType = 'provisional_filing' | 'complete_specification_filing' | 'ps_cs_filing' | 'pct_filing'
export type FilingApplicant = 'individual' | 'others'

export interface FilingInput {
	pricingRules: any[] | null
	filingType: FilingType
	applicationType: FilingApplicant
	niceClasses: number[]
	priorUse: boolean
	searchType?: string | undefined
}

function buildSelection(i: FilingInput) {
	return {
		applicationType: i.applicationType,
		niceClasses: i.niceClasses,
		goodsServices: { dropdown: i.filingType },
		searchType: i.searchType, // applicant type selection may already be represented upstream
		priorUse: { used: i.priorUse },
		option1: true,
	}
}

export function computeFilingPrice(i: FilingInput): number {
	if (!i.pricingRules) return 0
	try {
		return computePriceFromRules(i.pricingRules as any, buildSelection(i) as any)
	} catch {
		return 0
	}
}

