"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Order = { id: string | number; name?: string }
export type OrdersScreenProps = {
  fetchUrl?: string
}

export default function OrdersScreen({ fetchUrl = '/api/orders' }: OrdersScreenProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [pageDebugId, setPageDebugId] = useState<string>('')
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
    // Resolve current user for debug chips and logs
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const email = data?.session?.user?.email ?? null
        const id = data?.session?.user?.id ?? null
        setUserEmail(email)
        setUserId(id)
        // Console trace for tab-in/out debugging
        console.debug('[OrdersScreen][user]', { pageDebugId, id, email, visibility: typeof document !== 'undefined' ? document.visibilityState : 'unknown', hasFocus: typeof document !== 'undefined' ? document.hasFocus?.() : undefined })
      } catch (e) {
        console.debug('[OrdersScreen][user] resolve error', e)
      }
    })()
    // Generate debug id after mount to avoid SSR/client hydration mismatch
    try { if (!pageDebugId) setPageDebugId((globalThis as any).crypto?.randomUUID?.() || `dbg_${Math.random().toString(36).slice(2)}`) } catch { setPageDebugId(`dbg_${Date.now()}`) }
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

  // Simple status helper (mirrors main page logic, condensed)
  const deriveStatus = (o: any): string => {
    try {
      const paymentSucceeded = !!(
        (o.payments && ((o.payments as any).payment_status === 'paid' || (o.payments as any).status === 'captured')) ||
        o.payment_status === 'paid'
      )
      if (!paymentSucceeded) return 'Payment Pending'
      const confirmed = !!o.form_confirmed
      if (!confirmed) return 'Details Required'
      const wf = (o.workflow_status || '').toLowerCase()
      if (wf === 'completed') return 'Completed'
      if (wf === 'require_info') return 'Details Required'
      if (wf === 'in_progress') return 'In Progress'
      const responsible = (o.responsible || o.assigned_to || '').trim()
      if (responsible) return 'Assigned'
      return 'Details Completed'
    } catch {
      return 'Payment Pending'
    }
  }

  return (
    <div>
      <h1 id="page-heading" tabIndex={-1}>Orders</h1>
      {/* Debug chip: show user id/email and a per-page debug id when enabled */}
      {useMemo(() => {
        const fromEnv = process.env.NEXT_PUBLIC_DEBUG_USER === '1'
        const fromWin = typeof window !== 'undefined' && (window as any).DEBUG_USER === true
        return fromEnv || fromWin
      }, []) && (
        <div className="mt-2 mb-3 inline-flex items-center gap-2 rounded border px-2 py-1 text-xs text-gray-700 bg-gray-50">
          <span className="font-medium">User</span>
          <span className="text-gray-900">{userEmail || '—'}</span>
          <span className="text-gray-400">({userId || 'no-id'})</span>
          <span className="ml-2 text-gray-500">debug:{pageDebugId || '—'}</span>
        </div>
      )}
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
      <div className="overflow-x-auto mt-2">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-2" colSpan={4}>Loading…</td></tr>
            )}
            {!loading && (!orders || orders.length === 0) && (
              <tr><td className="p-2" colSpan={4}>No orders found.</td></tr>
            )}
            {!loading && orders && orders.length > 0 && orders.map((r: any) => (
              <tr key={String(r.id)} className="border-t">
                <td className="p-2">{r?.categories?.name ?? 'N/A'}</td>
                <td className="p-2">{r?.services?.name ?? 'N/A'}</td>
                <td className="p-2">{deriveStatus(r)}</td>
                <td className="p-2">{r?.payments?.total_amount ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
