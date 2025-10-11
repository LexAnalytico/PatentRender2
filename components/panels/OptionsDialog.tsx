"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

export interface OptionsFormState {
  applicantTypes: string[]
  niceClasses: string[]
  goodsServices: string
  goodsServicesCustom: string
  useType: string
  firstUseDate: string
  proofFileNames: string[]
  searchType: string
}

interface OptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedServiceTitle: string | null
  optionsForm: OptionsFormState
  setOptionsForm: React.Dispatch<React.SetStateAction<OptionsFormState>>
  addToCartWithOptions: () => void
  closeOptionsPanel: () => void
  // Pricing / preview values & helpers
  formatINR: (n: number) => string
  computeDraftingPrice?: (type: any, turn?: any) => number
  computeTurnaroundTotal: (turn: any) => number
  computeFilingPrice?: (filingType: any, appType: any) => number
  computePatentSearchPrice?: (type: any, turn?: any) => number
  applicantPrices: { individual?: number; others?: number }
  ferPrices: Record<string, number | undefined>
  previewTotal: number
  patentSearchTotal: number
  draftingTotal: number
  filingTotal: number
  ferTotal?: number
  expediatedDiff: number
  rushDiff: number
  patentSearchPrices?: { quick?: number; full_without_opinion?: number; full_with_opinion?: number }
  filingTypePrices?: { provisional_filing?: number; complete_specification_filing?: number; ps_cs_filing?: number; pct_filing?: number }
  basePricePS?: number
  DiffWithoutPS?: number
  DiffWithPS?: number
}

const OptionsDialog: React.FC<OptionsDialogProps> = ({
  open,
  onOpenChange,
  selectedServiceTitle,
  optionsForm,
  setOptionsForm,
  addToCartWithOptions,
  closeOptionsPanel,
  formatINR,
  computeDraftingPrice,
  computeTurnaroundTotal,
  computeFilingPrice,
  computePatentSearchPrice,
  applicantPrices,
  ferPrices,
  previewTotal,
  patentSearchTotal,
  draftingTotal,
  filingTotal,
  expediatedDiff,
  rushDiff,
  basePricePS,
  DiffWithoutPS,
  DiffWithPS,
  patentSearchPrices,
  filingTypePrices,
  ferTotal,
}) => {
  const disabledAdd = (
    (selectedServiceTitle === 'Patentability Search' && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
    (selectedServiceTitle === 'Drafting' && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
    (selectedServiceTitle === 'Patent Application Filing' && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
    (selectedServiceTitle === 'First Examination Response' && (!optionsForm.searchType))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Options for: {selectedServiceTitle}</DialogTitle>
          <DialogDescription>Select the options for this service.</DialogDescription>

          {selectedServiceTitle === 'Drafting' && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700">Specification Type</Label>
                <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm(p => ({ ...p, searchType: v, goodsServices: '' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose specification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ps">Provisional Specification (PS){computeDraftingPrice ? ` — ${formatINR(computeDraftingPrice('ps','standard'))}` : ''}</SelectItem>
                    <SelectItem value="cs">Complete Specification (CS){computeDraftingPrice ? ` — ${formatINR(computeDraftingPrice('cs','standard'))}` : ''}</SelectItem>
                    <SelectItem value="ps_cs">PS-CS{computeDraftingPrice ? ` — ${formatINR(computeDraftingPrice('ps_cs','standard'))}` : ''}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {optionsForm.searchType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                  <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm(p => ({ ...p, goodsServices: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose turnaround" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (12-15 days) — {formatINR(computeTurnaroundTotal('standard'))}</SelectItem>
                      <SelectItem value="expediated">Expediated (8-10 Days) — {formatINR(expediatedDiff)}</SelectItem>
                      <SelectItem value="rush">Rush (5-7 days) — {formatINR(rushDiff)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="rounded-md border p-3 bg-gray-50 mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Professional Fee</span>
                  <span>{formatINR(draftingTotal || previewTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Government Fee</span>
                  <span>{formatINR(0)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                  <span>Total</span>
                  <span>{formatINR(draftingTotal || previewTotal)}</span>
                </div>
              </div>
            </>
          )}

          {selectedServiceTitle === 'Patent Application Filing' && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700">Applicant Type</Label>
                <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm(p => ({ ...p, searchType: v, goodsServices: '' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Start-Up/Individuals/MSMEs/Educational Institute {applicantPrices.individual !== undefined ? `— ₹${applicantPrices.individual}` : ''}</SelectItem>
                    <SelectItem value="others">Large Entity/Others {applicantPrices.others !== undefined ? `— ₹${applicantPrices.others}` : ''}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {optionsForm.searchType && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Filing Type</Label>
                  <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm(p => ({ ...p, goodsServices: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose filing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provisional_filing">Provisional Filing (4 days){filingTypePrices?.provisional_filing ? ` — ${formatINR(filingTypePrices.provisional_filing)}` : ''}</SelectItem>
                      <SelectItem value="complete_specification_filing">Complete Specification Filing (4 days){filingTypePrices?.complete_specification_filing ? ` — ${formatINR(filingTypePrices.complete_specification_filing)}` : ''}</SelectItem>
                      <SelectItem value="ps_cs_filing">PS-CS Filing (4 days){filingTypePrices?.ps_cs_filing ? ` — ${formatINR(filingTypePrices.ps_cs_filing)}` : ''}</SelectItem>
                      <SelectItem value="pct_filing">PCT Filing{filingTypePrices?.pct_filing ? ` — ${formatINR(filingTypePrices.pct_filing)}` : ''}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="rounded-md border p-3 bg-gray-50 mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Professional Fee</span>
                  <span>{formatINR(filingTotal || previewTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm"><span>Government Fee</span><span>{formatINR(0)}</span></div>
                <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                  <span>Total</span>
                  <span>{formatINR(filingTotal || previewTotal)}</span>
                </div>
              </div>
            </>
          )}

          {selectedServiceTitle === 'First Examination Response' && (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700">Response Due</Label>
                <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm(p => ({ ...p, searchType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base_fee">Base Fee (Response due date after 3 months) — {ferPrices.base_fee !== undefined ? formatINR(ferPrices.base_fee) : ''}</SelectItem>
                    <SelectItem value="response_due_anytime_after_15_days">Response due anytime after 15 days — {ferPrices.response_due_anytime_after_15_days !== undefined ? formatINR(ferPrices.response_due_anytime_after_15_days) : ''}</SelectItem>
                    <SelectItem value="response_due_within_11_15_days">Response due within 11-15 days — {ferPrices.response_due_within_11_15_days !== undefined ? formatINR(ferPrices.response_due_within_11_15_days) : ''}</SelectItem>
                    <SelectItem value="response_due_within_4_10_days">Response due within 4-10 days — {ferPrices.response_due_within_4_10_days !== undefined ? formatINR(ferPrices.response_due_within_4_10_days) : ''}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border p-3 bg-gray-50 mt-4">
                <div className="flex items-center justify-between text-sm mb-1"><span>Professional Fee</span><span>{formatINR((ferTotal && ferTotal > 0) ? ferTotal : previewTotal)}</span></div>
                <div className="flex items-center justify-between text-sm"><span>Government Fee</span><span>{formatINR(0)}</span></div>
                <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2"><span>Total</span><span>{formatINR((ferTotal && ferTotal > 0) ? ferTotal : previewTotal)}</span></div>
              </div>
            </>
          )}
        </DialogHeader>

        {/* Patentability Search Section */}
        {selectedServiceTitle === 'Patentability Search' && (
          <TooltipProvider>
            <div className="space-y-6 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Search Type</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Select the scope of search and whether a legal opinion is included.</TooltipContent>
                  </Tooltip>
                </div>
                <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm(p => ({ ...p, searchType: v, goodsServices: '' }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose search type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Knockout Search {patentSearchPrices?.quick ? `— ${formatINR(patentSearchPrices.quick)}` : ''}</SelectItem>
                    <SelectItem value="full_without_opinion">Full Patentability Search (Without Opinion) {patentSearchPrices?.full_without_opinion ? `— ${formatINR(patentSearchPrices.full_without_opinion)}` : ''}</SelectItem>
                    <SelectItem value="full_with_opinion">Full Patentability Search with Opinion {patentSearchPrices?.full_with_opinion ? `— ${formatINR(patentSearchPrices.full_with_opinion)}` : ''}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {optionsForm.searchType && (
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Choose delivery speed. Faster options may add to the fee per rules.</TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm(p => ({ ...p, goodsServices: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choose turnaround" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (7-10 days) — {formatINR(computeTurnaroundTotal('standard'))}</SelectItem>
                      <SelectItem value="expediated">Expediated (3-5 Days) — {formatINR(expediatedDiff)}</SelectItem>
                      <SelectItem value="rush">Rush (1-2 days) — {formatINR(rushDiff)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="rounded-md border p-3 bg-gray-50">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Professional Fee</span>
                  <span>{formatINR(patentSearchTotal || previewTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm"><span>Government Fee</span><span>{formatINR(0)}</span></div>
                <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2"><span>Total</span><span>{formatINR(patentSearchTotal || previewTotal)}</span></div>
              </div>
            </div>
          </TooltipProvider>
        )}

        <DialogFooter>
          <Button
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addToCartWithOptions}
            disabled={disabledAdd}
          >
            Add
          </Button>
            <Button variant="outline" onClick={closeOptionsPanel}>Cancel</Button>
        </DialogFooter>
        <p className="text-xs text-gray-500 mt-2 text-center">*Prices are estimates. Final costs may vary.</p>
      </DialogContent>
    </Dialog>
  )
}

export default OptionsDialog
