"use client";
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import FormClient from '@/app/forms/FormClient'

export interface EmbeddedFormEntry { id: number; type: string }

interface FormsPanelProps {
  embeddedMultiForms: EmbeddedFormEntry[] | null
  selectedFormOrderId: number | null
  selectedFormType: string | null
  lastSavedSnapshot: { type: string; orderId: number | null; values: Record<string,string> } | null
  prefillAvailable: boolean
  onPrefillApply: () => void
  onPrefillStateChange: (info: { available: boolean; apply: () => void }) => void
  onSetActive: (id: number, type: string) => void
  goToOrders: () => void
  backToServices: () => void
  formPrefillHandleFirst: (info: { available: boolean; apply: () => void }) => void
  setLastSavedSnapshot: (info: { type: string; orderId: number | null; values: Record<string,string> }) => void
  embeddedOrders: any[]
  checkoutOrders: any[]
}

const FormsPanelComponent: React.FC<FormsPanelProps> = ({
  embeddedMultiForms,
  selectedFormOrderId,
  selectedFormType,
  lastSavedSnapshot,
  prefillAvailable,
  onPrefillApply,
  onPrefillStateChange,
  onSetActive,
  goToOrders,
  backToServices,
  formPrefillHandleFirst,
  setLastSavedSnapshot,
  embeddedOrders,
  checkoutOrders,
}) => {
  const renderHeader = () => (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
        <p className="text-gray-600 text-sm">Fill and save your application details</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={goToOrders}>Back to Orders</Button>
        <Button variant="outline" onClick={backToServices}>Back to Selected Services</Button>
        <Button
          variant="outline"
          onClick={() => { if (prefillAvailable) onPrefillApply() }}
          disabled={!prefillAvailable}
          className={!prefillAvailable ? 'opacity-40 cursor-not-allowed' : ''}
        >
          Prefill Saved Data
        </Button>
      </div>
    </div>
  )

  if (!embeddedMultiForms) {
    return (
      <>
        {renderHeader()}
        <Card className="bg-white">
          <CardContent className="p-0">
            <FormClient
              orderIdProp={selectedFormOrderId}
              typeProp={selectedFormType}
              onPrefillStateChange={onPrefillStateChange}
              externalPrefill={lastSavedSnapshot}
              onSaveLocal={(info) => setLastSavedSnapshot(info)}
            />
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      {renderHeader()}
      <div className="space-y-12">
        {embeddedMultiForms.map((f, idx) => {
          // Attempt to find the corresponding order object (from embeddedOrders or checkoutOrders) to pull payment id
          const sourceOrder = (embeddedOrders || []).find(o => Number(o.id) === Number(f.id)) || (checkoutOrders || []).find(o => Number(o.id) === Number(f.id))
          const payId = (sourceOrder && (sourceOrder.payments as any)?.razorpay_payment_id) || null
          return (
            <Card id={`embedded-form-${f.id}`} key={f.id} className="bg-white border border-slate-200 shadow-sm scroll-mt-24 transition-shadow">
              <CardContent className="p-0">
                <div className="px-6 pt-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">{idx+1}</span>
                    {payId ? `Payment ${payId}` : `Order #${f.id}`}
                  </h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={selectedFormOrderId === f.id ? 'default' : 'outline'}
                          onClick={() => onSetActive(f.id, f.type)}
                        >
                          Focus
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs leading-snug">
                        Make this form the active one: scroll it into view, highlight it briefly, and sync shared prefill context.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="mt-4">
                  <FormClient
                    orderIdProp={f.id}
                    typeProp={f.type}
                    externalPrefill={lastSavedSnapshot}
                    onPrefillStateChange={idx === 0 ? formPrefillHandleFirst : () => {}}
                    onSaveLocal={(info) => setLastSavedSnapshot(info)}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function propsEqual(prev: FormsPanelProps, next: FormsPanelProps) {
  // Re-render only if the structure of embedded forms or selected ids/types changed or snapshot reference changed
  if (prev.embeddedMultiForms?.length !== next.embeddedMultiForms?.length) return false
  if (prev.selectedFormOrderId !== next.selectedFormOrderId) return false
  if (prev.selectedFormType !== next.selectedFormType) return false
  if (prev.lastSavedSnapshot !== next.lastSavedSnapshot) return false
  // Basic shallow compare of ids/types when length matches
  if (prev.embeddedMultiForms && next.embeddedMultiForms) {
    for (let i = 0; i < prev.embeddedMultiForms.length; i++) {
      const a = prev.embeddedMultiForms[i]; const b = next.embeddedMultiForms[i]
      if (a.id !== b.id || a.type !== b.type) return false
    }
  }
  return true
}

const FormsPanel = React.memo(FormsPanelComponent, propsEqual)
export default FormsPanel
