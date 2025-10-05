// Patentability Search pricing helpers
// Centralized pure functions wrapping computePriceFromRules for readability & testability.
// Each function expects already-fetched pricingRules (array) and the caller-provided selection context.

import { computePriceFromRules } from '@/utils/pricing'

export type PatentabilityTurnaround = 'standard' | 'expediated' | 'rush'
export type PatentabilitySearchType = 'quick' | 'full_without_opinion' | 'full_with_opinion'

export interface PatentabilityCommonInput {
	pricingRules: any[] | null
	applicationType: 'individual' | 'startup_msme' | 'others'
	niceClasses: number[]
	priorUse: boolean
}

interface BuildSelArgs extends PatentabilityCommonInput {
	searchType: PatentabilitySearchType
	turnaround: PatentabilityTurnaround
}

function buildSelection(args: BuildSelArgs) {
	const { applicationType, niceClasses, priorUse, searchType, turnaround } = args
	return {
		applicationType,
		niceClasses,
		goodsServices: { dropdown: turnaround },
		searchType,
		priorUse: { used: priorUse },
		option1: true,
	}
}

export function computePatentabilityPrice(args: BuildSelArgs): number {
	if (!args.pricingRules) return 0
	try {
		return computePriceFromRules(args.pricingRules as any, buildSelection(args) as any)
	} catch {
		return 0
	}
}

// Convenience layered helpers
export function computeAllTurnaroundsForSearchType(args: Omit<BuildSelArgs, 'turnaround'>) {
	return {
		standard: computePatentabilityPrice({ ...args, turnaround: 'standard' }),
		expediated: computePatentabilityPrice({ ...args, turnaround: 'expediated' }),
		rush: computePatentabilityPrice({ ...args, turnaround: 'rush' }),
	}
}

