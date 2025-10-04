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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-600 text-sm">Review your order status and proceed to forms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          <Button variant="outline" onClick={() => poll()} disabled={stopped && !ready}>Refresh</Button>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-white shadow-sm">
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
          <ul className="mt-4 space-y-2 text-sm">
            {status.orders.map(o => (
              <li key={o.id} className="border rounded p-2 flex flex-col gap-1">
                <div>Order #{o.id}</div>
                {o.type && <div className="text-xs text-gray-500">Type: {o.type}</div>}
              </li>
            ))}
          </ul>
        )}
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
