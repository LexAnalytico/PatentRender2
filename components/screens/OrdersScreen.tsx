"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

export type Order = { id: string | number; name?: string }
export type OrdersScreenProps = {
  fetchUrl?: string
}

export default function OrdersScreen({ fetchUrl = '/api/orders' }: OrdersScreenProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  // Transient banner for last opened form (persisted by Forms on tab-out)
  type SingleCtx = { orderId: number | null; formType: string | null; formTypeLabel?: string | null }
  type MultiCtx = { multi: Array<{ orderId: number; formType: string | null; formTypeLabel?: string | null }>; ts?: number }
  const [banner, setBanner] = useState<null | { single?: SingleCtx; multi?: MultiCtx['multi'] }>(null)
  const [bannerVisible, setBannerVisible] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(fetchUrl)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      setHasFetched(true)
    } catch (e) {
      console.error('Failed to load orders', e)
      setOrders([])
      setHasFetched(true)
    } finally {
      setLoading(false)
    }
  }, [fetchUrl])

  // Manual-only: do not auto-load on mount or focus
  useEffect(() => {
    // Emit screen ready immediately so FocusProvider overlay can clear
    try { window.dispatchEvent(new Event('screen:ready')) } catch {}
  }, [])

  // Listen for manual:orders:fetched events (dispatched by header buttons) and populate
  useEffect(() => {
    const onManual = (ev: any) => {
      try {
        const sample = ev?.detail?.sample
        if (Array.isArray(sample)) {
          setOrders(sample)
          setHasFetched(true)
        }
      } catch {}
    }
    window.addEventListener('manual:orders:fetched', onManual as EventListener)
    return () => window.removeEventListener('manual:orders:fetched', onManual as EventListener)
  }, [])

  // On tab return, reset to a blank state (require manual fetch again)
  useEffect(() => {
    const resetBlank = () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
        setOrders([])
        setHasFetched(false)
      } catch {}
    }
    const onFocus = () => resetBlank()
    const onVis = () => { if (!document.hidden) resetBlank() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Read and display the last form context as a transient banner on mount/visibility
  useEffect(() => {
    const maybeShowBanner = () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
        const raw = localStorage.getItem('app:last_form_ctx')
        if (!raw) return
        const parsed = JSON.parse(raw)
        const ts = typeof parsed?.ts === 'number' ? parsed.ts : 0
        // Show only if recent (within 24h) to avoid stale messages
        if (ts && Date.now() - ts > 24 * 60 * 60 * 1000) { localStorage.removeItem('app:last_form_ctx'); return }
        if (parsed && Array.isArray(parsed.multi)) {
          // Multi-form context
          const multi: MultiCtx['multi'] = parsed.multi
            .filter((e: any) => e && typeof e.orderId === 'number')
            .map((e: any) => ({ orderId: e.orderId as number, formType: (e.formType ?? null) as string | null, formTypeLabel: (e.formTypeLabel ?? null) as string | null }))
          if (multi.length === 0) { localStorage.removeItem('app:last_form_ctx'); return }
          setBanner({ multi })
        } else {
          // Single-form context
          const ctx = parsed as SingleCtx & { ts?: number }
          setBanner({ single: { orderId: (ctx.orderId ?? null) as any, formType: (ctx.formType ?? null) as any, formTypeLabel: (ctx.formTypeLabel ?? null) as any } })
        }
        setBannerVisible(true)
        // Debug beacon for traceability
        try {
          const payload = { event: 'orders:last-form-banner-shown', kind: parsed && Array.isArray(parsed.multi) ? 'multi' : 'single', ts: Date.now() }
          if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            try { (navigator as any).sendBeacon('/api/debug-log', new Blob([JSON.stringify(payload)], { type: 'application/json' })) } catch {}
          } else {
            fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
          }
        } catch {}
        // Only show once; clear the key
        localStorage.removeItem('app:last_form_ctx')
        // Auto-hide after ~6s
        const t = setTimeout(() => setBannerVisible(false), 6000)
        return () => clearTimeout(t)
      } catch {}
    }
    maybeShowBanner()
    const onFocus = () => maybeShowBanner()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', maybeShowBanner)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', maybeShowBanner)
    }
  }, [])

  // Signal to the shell that the screen is render-ready (first content painted)
  useEffect(() => {
    if (!loading) {
      try { window.dispatchEvent(new Event('screen:ready')) } catch {}
    }
  }, [loading])

  // Simple helpers for display
  const formatINR = (v: number | null | undefined) => {
    try { return v != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v)) : '—' } catch { return '—' }
  }
  const deriveStatus = (o: any): string => {
    const wf = (o?.workflow_status || '').toLowerCase()
    if (wf === 'require_info' || o?.require_info_message) return 'Details Required'
    if (wf === 'completed' || wf === 'done') return 'Completed'
    if (wf === 'in_progress' || wf === 'processing') return 'In Progress'
    if (wf) return wf.replace(/_/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase())
    return 'N/A'
  }

  return (
    <div>
      <h1 id="page-heading" tabIndex={-1}>Orders</h1>
      <div className="mb-3">
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Fetching orders…' : 'Fetch orders'}
        </Button>
      </div>
      {banner && bannerVisible && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 mb-4 rounded-md border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 flex items-start gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden>
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.75 6.75a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 0 1.5 0V9Zm0 7.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
          </svg>
          <div className="min-w-0 flex-1 text-sm">
            <div className="font-medium">{banner.multi ? 'Last opened forms' : 'Last opened form'}</div>
            {banner.multi ? (
              <div className="text-blue-800 space-x-2 space-y-1">
                {banner.multi.map((e, i) => (
                  <span key={e.orderId} className="inline-block">
                    #{e.orderId}{e.formTypeLabel || e.formType ? ` (${e.formTypeLabel || e.formType})` : ''}{i < banner.multi!.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-blue-800">
                {(banner.single?.formTypeLabel || banner.single?.formType || 'Form')}{typeof banner.single?.orderId === 'number' ? ` · Order #${banner.single?.orderId}` : ''}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setBannerVisible(false)}
            className="ml-2 rounded p-1 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      {/* Orders table: render only when data is available or we're loading after a fetch */}
      {loading && (
        <div className="mt-2 text-sm text-gray-500">Loading…</div>
      )}
      {!loading && hasFetched && orders.length === 0 && (
        <div className="mt-2 text-sm text-gray-500">No orders found.</div>
      )}
      {!loading && hasFetched && orders.length > 0 && (
        <div className="overflow-x-auto overscroll-x-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
          <table className="table-auto border border-slate-300 rounded-md overflow-hidden min-w-[980px]">
            <thead className="border-b border-slate-300">
              <tr className="text-left text-base text-slate-700 bg-blue-50/70 divide-x divide-slate-300">
                <th className="px-3 py-2 font-semibold tracking-wide">Order ID</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Category</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Service</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Amount</th>
                <th className="px-3 py-2 font-semibold tracking-wide whitespace-nowrap">Payment Mode</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Status</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Date</th>
                <th className="px-3 py-2 font-semibold tracking-wide">Forms</th>
                <th className="px-3 py-2 font-semibold tracking-wide whitespace-nowrap">Download Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {orders.map((o: any) => (
                <tr key={String(o.id)} className="bg-white divide-x divide-slate-300">
                  <td className="p-2">{o?.id ?? '—'}</td>
                  <td className="p-2">{o?.categories?.name ?? 'N/A'}</td>
                  <td className="p-2">{o?.services?.name ?? 'N/A'}</td>
                  <td className="p-2">{formatINR(o?.amount)}</td>
                  <td className="p-2">{o?.payments?.payment_method || '—'}</td>
                  <td className="p-2">{deriveStatus(o)}</td>
                  <td className="p-2">{o?.created_at ? new Date(o.created_at).toLocaleString() : 'N/A'}</td>
                  {/* For now, keep actions minimal in manual test mode */}
                  <td className="p-2 text-gray-400">—</td>
                  <td className="p-2 text-gray-400">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
