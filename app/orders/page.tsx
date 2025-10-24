"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// Polling interval ms
const POLL_INTERVAL = 1800
const MAX_POLLS = 40 // ~72s
let FLOW_DEBUG = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PAYMENT_FLOW_DEBUG === '1'
let BG_SYNC = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FORM_BG_SYNC === '1'
function flowLog(phase: string, msg: string, extra?: any) {
  if (!FLOW_DEBUG) return
  const ts = new Date().toISOString()
  try { console.debug(`[flow][orders-page][${phase}][${ts}] ${msg}`, extra || '') } catch {}
}
function syncLog(phase: string, msg: string, extra?: any) {
  if (!BG_SYNC) return
  const ts = new Date().toISOString()
  try { console.debug(`[sync][orders-page][${phase}][${ts}] ${msg}`, extra || '') } catch {}
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

  // Resize/focus hard-refresh guard for Orders page
  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const handler = () => {
      const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
      if (!RESET_ON_RESIZE && !winFlag) return
      if (typeof document !== 'undefined' && (document as any).hidden) {
        try {
          localStorage.setItem('app_refresh_on_focus', '1')
          localStorage.setItem('app_prev_dims_on_hide', `${window.innerWidth}x${window.innerHeight}`)
          localStorage.setItem('app_prev_dpr_on_hide', String((window as any).devicePixelRatio || 1))
          const scr = (window as any).screen
          if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') localStorage.setItem('app_prev_screen_on_hide', `${scr.width}x${scr.height}`)
          localStorage.setItem('app_hidden_at', String(Date.now()))
        } catch {}
        return
      }
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
      ;(handler as any)._t = setTimeout(() => {
        try {
          try {
            const dpr = (window as any).devicePixelRatio || 1
            const scr = (window as any).screen
            const screenSize = (scr && typeof scr.width === 'number' && typeof scr.height === 'number') ? `${scr.width}x${scr.height}` : ''
            localStorage.setItem('app_debug_refresh', JSON.stringify({ reason: 'resize', ts: Date.now(), details: { dims: `${window.innerWidth}x${window.innerHeight}`, dpr, screen: screenSize, page: 'orders' } }))
          } catch {}
          const w = window as any
          if (typeof w.triggerAppReset === 'function') { w.triggerAppReset(); return }
          try { window.dispatchEvent(new Event('app:refresh')) } catch {}
        } catch {}
        const now = Date.now()
        const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
        if (now - last < 3000) return
        localStorage.setItem('app_manual_refresh_ts', String(now))
        window.location.reload()
      }, 350)
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
    }
  }, [])

  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const RESET_ON_FOCUS = process.env.NEXT_PUBLIC_RESET_ON_FOCUS === '1'
    const FORCE_REFRESH_ON_FOCUS_MS = Number(process.env.NEXT_PUBLIC_FORCE_REFRESH_ON_FOCUS_MS || '0') || 0
    const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
    if (!RESET_ON_RESIZE && !winFlag && !RESET_ON_FOCUS && FORCE_REFRESH_ON_FOCUS_MS <= 0) return
    const onVisChange = () => {
      try {
        if (document.hidden) return
        const marker = localStorage.getItem('app_refresh_on_focus') === '1'
        const prevDims = localStorage.getItem('app_prev_dims_on_hide') || ''
        const nowDims = `${window.innerWidth}x${window.innerHeight}`
        const prevDpr = localStorage.getItem('app_prev_dpr_on_hide') || ''
        const nowDpr = String((window as any).devicePixelRatio || 1)
        const prevScreen = localStorage.getItem('app_prev_screen_on_hide') || ''
        let nowScreen = ''
        try { const scr = (window as any).screen; if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') nowScreen = `${scr.width}x${scr.height}` } catch {}
        const changedDims = !!prevDims && prevDims !== nowDims
        const changedDpr = !!prevDpr && prevDpr !== nowDpr
        const changedScreen = !!prevScreen && nowScreen && prevScreen !== nowScreen
        const hiddenAt = Number(localStorage.getItem('app_hidden_at') || '0')
        const hiddenDur = hiddenAt ? (Date.now() - hiddenAt) : 0
        const longHidden = FORCE_REFRESH_ON_FOCUS_MS > 0 && hiddenDur >= FORCE_REFRESH_ON_FOCUS_MS
        if (marker || changedDims || changedDpr || changedScreen || RESET_ON_FOCUS || longHidden) {
          try { localStorage.setItem('app_debug_refresh', JSON.stringify({ reason: 'resize-hidden', ts: Date.now(), details: { marker, prevDims, nowDims, prevDpr, nowDpr, prevScreen, nowScreen, hiddenDur, page: 'orders' } })) } catch {}
          localStorage.removeItem('app_refresh_on_focus')
          localStorage.removeItem('app_prev_dims_on_hide')
          localStorage.removeItem('app_prev_dpr_on_hide')
          localStorage.removeItem('app_prev_screen_on_hide')
          const w: any = window
          if (typeof w.triggerAppResetForce === 'function') { w.triggerAppResetForce('resize-hidden'); return }
          try { window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force: true, reason: 'resize-hidden' } })) } catch {}
          const now = Date.now()
          localStorage.setItem('app_manual_refresh_ts', String(now))
          window.location.reload()
        }
      } catch {}
    }
    document.addEventListener('visibilitychange', onVisChange)
    return () => document.removeEventListener('visibilitychange', onVisChange)
  }, [])

  useEffect(() => {
    const DEBUG_REFRESH = process.env.NEXT_PUBLIC_DEBUG_REFRESH === '1'
    const winDebug = (typeof window !== 'undefined') && ((window as any).DEBUG_REFRESH === true)
    // Only show overlay when BOTH env flag and runtime flag are set
    if (!(DEBUG_REFRESH && winDebug)) return
    try {
      const raw = localStorage.getItem('app_debug_refresh')
      if (!raw) return
      const info = JSON.parse(raw)
      localStorage.removeItem('app_debug_refresh')
      const ts = info?.ts || Date.now()
      if (Date.now() - ts > 15000) return
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.bottom = '12px'
      container.style.left = '12px'
      container.style.zIndex = '99999'
      container.style.maxWidth = '320px'
      container.style.background = 'rgba(17,24,39,0.95)'
      container.style.color = '#f8fafc'
      container.style.padding = '10px 12px'
      container.style.borderRadius = '8px'
      container.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)'
      container.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
      container.style.fontSize = '12px'
      const pre = document.createElement('pre')
      pre.style.margin = '6px 0 0 0'
      pre.style.whiteSpace = 'pre-wrap'
      pre.style.wordBreak = 'break-word'
      pre.textContent = JSON.stringify({ reason: info?.reason, details: info?.details }, null, 2)
      const title = document.createElement('div')
      title.style.fontWeight = '600'
      title.style.display = 'flex'
      title.style.alignItems = 'center'
      title.style.justifyContent = 'space-between'
      title.textContent = 'Auto refresh debug (orders)'
      const close = document.createElement('button')
      close.textContent = '×'
      close.setAttribute('aria-label', 'Close')
      close.style.marginLeft = '12px'
      close.style.fontSize = '14px'
      close.style.lineHeight = '1'
      close.style.background = 'transparent'
      close.style.color = '#e5e7eb'
      close.style.border = 'none'
      close.style.cursor = 'pointer'
      close.onclick = () => { try { document.body.removeChild(container) } catch {} }
      title.appendChild(close)
      container.appendChild(title)
      container.appendChild(pre)
      document.body.appendChild(container)
      setTimeout(() => { try { document.body.removeChild(container) } catch {} }, 8000)
    } catch {}
  }, [])

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

      // Enable/disable background draft sync via URL/localStorage
      const syncParam = search.get('syncDrafts') === '1'
      const lsSync = typeof window !== 'undefined' ? window.localStorage.getItem('FORM_BG_SYNC') === '1' : false
      if (syncParam || lsSync) {
        BG_SYNC = true
        if (syncParam) window.localStorage.setItem('FORM_BG_SYNC', '1')
        syncLog('init', 'Background draft sync enabled', { syncParam, lsSync })
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

  // Background draft sync: first-write baseline (no overwrite of existing rows)
  const lastSyncRef = useRef<number>(0)
  const syncingRef = useRef<boolean>(false)
  const backgroundSyncDrafts = useCallback(async () => {
    if (!BG_SYNC) return
    if (syncingRef.current) return
    const now = Date.now()
    if (now - lastSyncRef.current < 10000) return // throttle 10s
    syncingRef.current = true
    lastSyncRef.current = now
    try {
      const { data: s } = await supabase.auth.getSession()
      const uid = s?.session?.user?.id || null
      if (!uid) { syncingRef.current = false; return }
      const candidates: Array<{ key: string; orderId: number; type: string; payload: any }> = []
      try {
        if (typeof window === 'undefined') { syncingRef.current = false; return }
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i) || ''
          if (!k.startsWith('form_draft_v1::')) continue
          const parts = k.split('::') // [form_draft_v1, uid|nouser, orderId|none, type|notype]
          if (parts.length < 4) continue
          const kUid = parts[1]
          const kOrder = parts[2]
          const kType = parts[3]
          if (kUid !== uid) continue
          if (kOrder === 'none') continue
          if (!kType || kType === 'notype') continue
          const orderNum = Number(kOrder)
          if (!Number.isFinite(orderNum)) continue
          const raw = window.localStorage.getItem(k)
          if (!raw) continue
          let parsed: any
          try { parsed = JSON.parse(raw) } catch { continue }
          if (!parsed || !parsed.values || typeof parsed.values !== 'object') continue
          candidates.push({ key: k, orderId: orderNum, type: kType, payload: parsed })
        }
      } catch {}

      const limited = candidates.slice(0, 8) // cap per cycle
      for (const c of limited) {
        try {
          // Check if a row already exists; skip to avoid overwrite
          const { data: existing, error: selErr } = await supabase
            .from('form_responses')
            .select('user_id, order_id, form_type, completed')
            .eq('user_id', uid)
            .eq('order_id', c.orderId)
            .eq('form_type', c.type)
            .maybeSingle()
          if (selErr) { syncLog('select-error', 'Select error', { key: c.key, err: selErr.message }); continue }
          if (existing) { syncLog('skip-exists', 'Row already exists, skipping', { key: c.key }); continue }

          const dataJson = { ...c.payload.values, __draft_ts: c.payload.ts || Date.now() }
          const ins = {
            user_id: uid,
            order_id: c.orderId,
            form_type: c.type,
            data: dataJson,
            completed: false,
          }
          const { error: insErr } = await supabase
            .from('form_responses')
            .insert(ins)
          if (insErr) {
            // Ignore duplicate key violations if any race occurs
            const code = (insErr as any)?.code || ''
            if (code !== '23505') {
              syncLog('insert-error', 'Insert error', { key: c.key, err: insErr.message })
            }
          } else {
            syncLog('insert-ok', 'Inserted draft row', { key: c.key, orderId: c.orderId, type: c.type })
          }
        } catch (e: any) {
          syncLog('sync-error', 'Unexpected sync error', { key: c.key, err: String(e?.message || e) })
        }
      }
    } finally {
      syncingRef.current = false
    }
  }, [])

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
      // Kick background draft sync
      backgroundSyncDrafts()
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

  // One-time background sync on mount
  useEffect(() => {
    backgroundSyncDrafts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
