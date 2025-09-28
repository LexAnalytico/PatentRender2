"use client"
export const dynamic = "force-dynamic"
import { Suspense, useState, useCallback } from "react"
import FormClient from "./FormClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
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
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <FormClient onPrefillStateChange={handlePrefillStateChange} />
      </Suspense>
    </div>
  )
}