"use client"

import React, { useEffect, useState } from 'react'

export type Order = { id: string | number; name?: string }
export type OrdersScreenProps = {
  fetchUrl?: string
}

export default function OrdersScreen({ fetchUrl = '/api/orders' }: OrdersScreenProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  // Transient banner for last opened form (persisted by Forms on tab-out)
  type SingleCtx = { orderId: number | null; formType: string | null; formTypeLabel?: string | null }
  type MultiCtx = { multi: Array<{ orderId: number; formType: string | null; formTypeLabel?: string | null }>; ts?: number }
  const [banner, setBanner] = useState<null | { single?: SingleCtx; multi?: MultiCtx['multi'] }>(null)
  const [bannerVisible, setBannerVisible] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(fetchUrl)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load orders', e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl])

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

  return (
    <div>
      <h1 id="page-heading" tabIndex={-1}>Orders</h1>
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
      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={String(o.id)}>{o.name ?? String(o.id)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
