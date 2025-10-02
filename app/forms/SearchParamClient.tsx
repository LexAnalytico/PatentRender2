"use client"
import { useSearchParams } from 'next/navigation'
import { PropsWithChildren } from 'react'

export function SearchParamsProvider({ children }: PropsWithChildren) {
  // Accessing useSearchParams inside a dedicated client component that will always be wrapped in Suspense
  useSearchParams()
  return <>{children}</>
}
