"use client"
export const dynamic = "force-dynamic"
import { Suspense, useState, useCallback } from "react"
import FormClient from "./FormClient"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  const searchParams = useSearchParams()
  // Support multiple order IDs: order_ids=1,2,3
  const orderIdsParam = searchParams?.get('order_ids') || ''
  const multiOrderIds = orderIdsParam
    .split(',')
    .map(s => s.trim())
    .filter(s => /^(\d+)$/.test(s))
    .map(s => Number(s))
    .filter(n => !Number.isNaN(n))
  const isMulti = multiOrderIds.length > 1
  const [prefillAvailable, setPrefillAvailable] = useState(false)
  const [prefillApplyFn, setPrefillApplyFn] = useState<(() => void) | null>(null)

  const handlePrefillStateChange = useCallback((info: { available: boolean; apply: () => void }) => {
    setPrefillAvailable(info.available)
    setPrefillApplyFn(() => (info.available ? info.apply : null))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
          <p className="text-gray-600 text-sm">Fill and save your application details</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/">Back Home</Link></Button>
          <Button
            variant="outline"
            onClick={() => { if (prefillAvailable && prefillApplyFn) prefillApplyFn() }}
            disabled={!prefillAvailable}
            className={`border-blue-500 text-blue-600 hover:bg-blue-50 ${!prefillAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Prefill Saved Data
          </Button>
        </div>
      </div>
      {!isMulti && (
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <FormClient onPrefillStateChange={handlePrefillStateChange} />
        </Suspense>
      )}
      {isMulti && (
        <div className="space-y-12">
          {multiOrderIds.map((oid) => (
            <div key={oid} className="border rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">{oid}</span>
                Service Form (Order #{oid})
              </h2>
              <Suspense fallback={<div className="p-4">Loading form for order {oid}…</div>}>
                <FormClient orderIdProp={oid} onPrefillStateChange={() => { /* per-form prefill controls not shown in multi mode */ }} />
              </Suspense>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}