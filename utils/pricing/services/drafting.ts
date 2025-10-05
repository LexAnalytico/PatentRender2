// Drafting pricing helpers
// Mirrors the pattern used for Patentability Search for consistency.

import { computePriceFromRules } from '@/utils/pricing'

export type DraftingTurnaround = 'standard' | 'expediated' | 'rush'
export type DraftingType = 'ps' | 'cs' | 'ps_cs'

export interface DraftingCommonInput {
	pricingRules: any[] | null
	applicationType: 'individual' | 'startup_msme' | 'others'
	niceClasses: number[]
	priorUse: boolean
}

interface BuildSelArgs extends DraftingCommonInput {
	draftingType: DraftingType
	turnaround: DraftingTurnaround
}

function buildSelection(args: BuildSelArgs) {
	const { applicationType, niceClasses, priorUse, draftingType, turnaround } = args
	return {
		applicationType,
		niceClasses,
		goodsServices: { dropdown: turnaround },
		searchType: draftingType,
		priorUse: { used: priorUse },
		option1: true,
	}
}

export function computeDraftingPrice(args: BuildSelArgs): number {
	if (!args.pricingRules) return 0
	try {
		return computePriceFromRules(args.pricingRules as any, buildSelection(args) as any)
	} catch {
		return 0
	}
}

export function computeAllTurnaroundsForDraftingType(args: Omit<BuildSelArgs, 'turnaround'>) {
	return {
		standard: computeDraftingPrice({ ...args, turnaround: 'standard' }),
		expediated: computeDraftingPrice({ ...args, turnaround: 'expediated' }),
		rush: computeDraftingPrice({ ...args, turnaround: 'rush' }),
	}
}

