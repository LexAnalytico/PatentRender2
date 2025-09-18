export const dynamic = "force-dynamic"
import { Suspense } from "react"
import FormClient from "./FormClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <FormClient />
    </Suspense>
  )
}