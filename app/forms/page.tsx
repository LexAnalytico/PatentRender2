import { Suspense } from 'react'
import ClientFormsPage from './pageClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 max-w-5xl mx-auto">Loading…</div>}>
      <ClientFormsPage />
    </Suspense>
  )
}