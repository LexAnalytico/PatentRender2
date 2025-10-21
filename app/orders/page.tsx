"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

// Polling interval ms
const POLL_INTERVAL = 1800
const MAX_POLLS = 40 // ~72s
let FLOW_DEBUG = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PAYMENT_FLOW_DEBUG === '1'
function flowLog(phase: string, msg: string, extra?: any) {
  if (!FLOW_DEBUG) return
  const ts = new Date().toISOString()
  try { console.debug(`[flow][orders-page][${phase}][${ts}] ${msg}`, extra || '') } catch {}
}

// Local cache for fast UI seed after tab-out/tab-in
const ORDERS_CACHE_VER = 'v1'
function ordersStatusKey(ref: { razorpayOrderId?: string | undefined; orderIdParam?: string | undefined }) {
  const base = ref.razorpayOrderId ? `r:${ref.razorpayOrderId}` : (ref.orderIdParam ? `o:${ref.orderIdParam}` : 'none')
  return `orders_status_${ORDERS_CACHE_VER}::${base}`
}

interface StatusPayload {
  ok: boolean
  stage: string
  ready: boolean
  payment?: any
  orders?: any[]
  meta?: { paid?: boolean; orderCount?: number }
}

export const dynamic = 'force-dynamic'

function OrdersPageInner() {
  const search = useSearchParams()
  const router = useRouter()
  const showThanks = search.get('showThanks') === '1' || search.get('thankyou') === '1'
  const razorpayOrderId = search.get('razorpay_order_id') || search.get('order_ref') || undefined
  const orderIdParam = search.get('order_id') || undefined

  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState<boolean>(showThanks)
  const [stopped, setStopped] = useState(false)
  const firstReadyRef = useRef(false)
  const mountedRef = useRef(false)

  // On mount decide if debug should be enabled from query/localStorage
  useEffect(() => {
    try {
      const debugParam = search.get('debug') === '1'
      const lsFlag = typeof window !== 'undefined' ? window.localStorage.getItem('ORDERS_FLOW_DEBUG') === '1' : false
      if (debugParam || lsFlag) {
        FLOW_DEBUG = true
        flowLog('debug-init', 'Runtime debug logging enabled', { debugParam, lsFlag })
        if (debugParam) {
          // Persist for subsequent navigations
          window.localStorage.setItem('ORDERS_FLOW_DEBUG', '1')
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clean URL (drop showThanks) after mount
  useEffect(() => {
    if (showThanks) {
      const base = '/orders' + (razorpayOrderId ? `?razorpay_order_id=${encodeURIComponent(razorpayOrderId)}` : (orderIdParam ? `?order_id=${orderIdParam}` : ''))
      router.replace(base, { scroll: false })
      flowLog('mount', 'Cleaned URL after thankyou param')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cache-first seed on mount: hydrate last known status immediately for snappy UI
  useEffect(() => {
    mountedRef.current = true
    try {
      const key = ordersStatusKey({ razorpayOrderId, orderIdParam })
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      const parsed = raw ? (() => { try { return JSON.parse(raw) as { ts: number; value: StatusPayload } } catch { return null } })() : null
      if (parsed?.value && !status) {
        setStatus(parsed.value)
        flowLog('cache-seed', 'Hydrated status from cache', { stage: parsed.value.stage, ready: parsed.value.ready })
      }
    } catch {}
    return () => { mountedRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildStatusUrl = () => {
    const qs: string[] = []
    if (razorpayOrderId) qs.push(`razorpay_order_id=${encodeURIComponent(razorpayOrderId)}`)
    if (orderIdParam) qs.push(`order_id=${encodeURIComponent(orderIdParam)}`)
    return '/api/order-status' + (qs.length ? `?${qs.join('&')}` : '')
  }

  const poll = useCallback(async () => {
    try {
      const res = await fetch(buildStatusUrl(), { cache: 'no-store' })
      const json: StatusPayload = await res.json()
      setStatus(json)
      // Persist to local cache for fast rehydration on focus
      try {
        const key = ordersStatusKey({ razorpayOrderId, orderIdParam })
        const payload = { ts: Date.now(), value: json }
        if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(payload))
      } catch {}
      flowLog('poll', 'Status response', { stage: json.stage, ready: json.ready, paid: json?.meta?.paid, orders: json?.meta?.orderCount })
      if (json.ready && !firstReadyRef.current) {
        firstReadyRef.current = true
        flowLog('ready', 'First ready detected')
      }
      // Stop conditions
      if (json.ready || pollCount + 1 >= MAX_POLLS) {
        setStopped(true)
        flowLog('poll-stop', 'Stopping polling', { reason: json.ready ? 'ready' : 'max-polls' })
      } else {
        setPollCount(c => c + 1)
      }
    } catch (e) {
      console.error('[orders] poll error', e)
      if (pollCount + 1 >= MAX_POLLS) setStopped(true)
      else setPollCount(c => c + 1)
      flowLog('poll-error', 'Error during poll', { error: String(e) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [razorpayOrderId, orderIdParam, pollCount])

  useEffect(() => {
    if (stopped) return
    const id = setTimeout(() => { poll() }, pollCount === 0 ? 50 : POLL_INTERVAL)
    return () => clearTimeout(id)
  }, [pollCount, poll, stopped])

  // Resume polling and rehydrate on focus/visibility
  useEffect(() => {
    function onFocus() {
      try {
        // Rehydrate from cache if status empty or stale
        const key = ordersStatusKey({ razorpayOrderId, orderIdParam })
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
        const parsed = raw ? (() => { try { return JSON.parse(raw) as { ts: number; value: StatusPayload } } catch { return null } })() : null
        if (parsed?.value && (!status || status.stage === 'initial')) {
          setStatus(parsed.value)
          flowLog('focus-cache', 'Rehydrated from cache on focus', { stage: parsed.value.stage, ready: parsed.value.ready })
        }
      } catch {}
      // If we had stopped but not ready, resume and trigger an immediate poll
      if (stopped && !(status?.ready)) {
        setStopped(false)
        flowLog('focus', 'Resuming polling on focus')
        // Trigger immediate poll
        poll()
      }
    }
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') onFocus()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus)
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped, status, razorpayOrderId, orderIdParam, poll])

  const handleViewForms = () => {
    // Prefer a single order id if available; pass order_id + type for locking form
    const firstOrder = status?.orders && status.orders.length > 0 ? status.orders[0] : null
    const orderId = firstOrder?.id
    const type = firstOrder?.type || status?.payment?.type || ''
    const params: string[] = []
    if (orderId) params.push(`order_id=${orderId}`)
    if (type) params.push(`type=${encodeURIComponent(type)}`)
    flowLog('navigate', 'Navigating to forms', { orderId, type })
    router.push('/forms' + (params.length ? `?${params.join('&')}` : ''))
  }

  const stage = status?.stage || 'initial'
  const ready = !!status?.ready

  return (
    <div className="relative p-6 max-w-5xl mx-auto space-y-6">
      {/* Static header (does not scroll horizontally) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-600 text-sm">Review your order status and proceed to forms</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          <Button variant="outline" onClick={() => poll()} disabled={stopped && !ready}>Refresh</Button>
        </div>
      </div>

      {/* Horizontal scroll limited exactly to the content width (no side padding) */}
      <div className="overflow-x-auto overscroll-x-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="w-fit min-w-full">
          <div className="border rounded-md p-4 bg-white shadow-sm mb-6 w-fit min-w-full">
            <h2 className="font-semibold mb-2 text-sm tracking-wide text-gray-700">Status</h2>
            <div className="text-xs space-y-1 font-mono">
              <div><span className="font-semibold">Stage:</span> {stage}</div>
              <div><span className="font-semibold">Ready:</span> {String(ready)}</div>
              <div><span className="font-semibold">Polls:</span> {pollCount}{stopped ? ' (stopped)' : ''}</div>
              {status?.meta && (
                <div><span className="font-semibold">Paid:</span> {String(status.meta.paid)} | Orders: {status.meta.orderCount}</div>
              )}
            </div>
            {status?.orders && status.orders.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="text-sm border border-slate-300 min-w-[860px]">
                  <thead className="bg-slate-50 border-b border-slate-300">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold whitespace-nowrap sticky left-0 bg-slate-50 border-r border-slate-300 shadow-[2px_0_0_0_rgba(0,0,0,0.06)]">Order #</th>
                      <th className="px-3 py-2 font-semibold whitespace-nowrap">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {status.orders.map(o => (
                      <tr key={o.id} className="bg-white">
                        <td className="px-3 py-2 font-medium sticky left-0 bg-white border-r border-slate-200 shadow-[2px_0_0_0_rgba(0,0,0,0.04)]">{o.id}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{o.type || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {overlayVisible && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center space-y-4 border">
            <h2 className="text-lg font-semibold">Thank you!</h2>
            <p className="text-sm text-gray-600">
              {ready ? 'Your order is ready. You can proceed to forms.' : stage === 'orders_materializing' ? 'Creating order records…' : stage === 'payment_pending' ? 'Waiting for payment confirmation…' : 'Finalizing…'}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button onClick={handleViewForms} disabled={!ready} className={!ready ? 'opacity-60 cursor-not-allowed' : ''}>
                  {ready ? 'View Forms' : 'Please Wait'}
                </Button>
                {ready && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      try {
                        const firstOrder = status?.orders && status.orders.length > 0 ? status.orders[0] : null
                        if (!firstOrder) { alert('No order available to invoice yet.'); return }
                        // Placeholder: implement real invoice generation; for now open printable window
                        const html = `<html><head><title>Invoice #${firstOrder.id}</title></head><body><h1>Invoice</h1><p>Order ID: ${firstOrder.id}</p><p>Type: ${firstOrder.type || ''}</p><p>Status: Paid</p></body></html>`
                        const w = window.open('', '_blank')
                        if (w) { w.document.write(html); w.document.close(); w.focus(); }
                      } catch (e) { console.error('Invoice download error', e); alert('Failed to open invoice.') }
                    }}
                  >
                    Download Invoice
                  </Button>
                )}
              </div>
              {ready && <Button variant="outline" onClick={() => setOverlayVisible(false)}>Stay on Orders</Button>}
            </div>
            {!ready && pollCount > 5 && (
              <p className="text-[11px] text-gray-500 mt-2">Still working… This can take a few seconds if email/notifications run.</p>
            )}
            {stopped && !ready && (
              <p className="text-[11px] text-red-600 mt-2">Timeout waiting for readiness. You can refresh or contact support.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  // Wrap inner component that uses useSearchParams with Suspense to satisfy Next.js requirement
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <OrdersPageInner />
    </Suspense>
  )
}
