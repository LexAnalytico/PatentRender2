"use client"
import { Suspense, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import FormClient from './FormClient'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientFormsPage() {
  const searchParams = useSearchParams()
  const orderIdsParam = searchParams?.get('order_ids') || ''
  const multiOrderIds = orderIdsParam
    .split(',')
    .map(s => s.trim())
    .filter(s => /^\d+$/.test(s))
    .map(Number)
    .filter(n => !Number.isNaN(n))
  const isMulti = multiOrderIds.length > 1
  const [prefillAvailable, setPrefillAvailable] = useState(false)
  const [prefillApplyFn, setPrefillApplyFn] = useState<(() => void) | null>(null)

  const handlePrefillStateChange = useCallback((info: { available: boolean; apply: () => void }) => {
    setPrefillAvailable(info.available)
    setPrefillApplyFn(() => (info.available ? info.apply : null))
  }, [])

  // Resize/focus hard-refresh guard for Forms page (mirrors main page behavior)
  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const handler = () => {
      const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
      if (!RESET_ON_RESIZE && !winFlag) return
      // If hidden, mark for refresh on focus and capture dims
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
      // Debounced refresh using shared global trigger
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
      ;(handler as any)._t = setTimeout(() => {
        try {
          // Stash debug payload
          try {
            const dpr = (window as any).devicePixelRatio || 1
            const scr = (window as any).screen
            const screenSize = (scr && typeof scr.width === 'number' && typeof scr.height === 'number') ? `${scr.width}x${scr.height}` : ''
            localStorage.setItem('app_debug_refresh', JSON.stringify({
              reason: 'resize', ts: Date.now(), details: { dims: `${window.innerWidth}x${window.innerHeight}`, dpr, screen: screenSize, page: 'forms' }
            }))
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

  // Visibility regain: if dims/DPR/screen changed while hidden (or marker set), force hard reset
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
          try { localStorage.setItem('app_debug_refresh', JSON.stringify({ reason: 'resize-hidden', ts: Date.now(), details: { marker, prevDims, nowDims, prevDpr, nowDpr, prevScreen, nowScreen, hiddenDur, page: 'forms' } })) } catch {}
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

  // Debug overlay for forms page
  useEffect(() => {
    const DEBUG_REFRESH = process.env.NEXT_PUBLIC_DEBUG_REFRESH === '1'
    const winDebug = (typeof window !== 'undefined') && ((window as any).DEBUG_REFRESH === true)
    if (!DEBUG_REFRESH && !winDebug) return
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
      title.textContent = 'Auto refresh debug (forms)'
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
          >Prefill Saved Data</Button>
        </div>
      </div>
      {!isMulti && (
        <Suspense fallback={<div className="p-6">Loading form…</div>}>
          <FormClient onPrefillStateChange={handlePrefillStateChange} />
        </Suspense>
      )}
      {isMulti && (
        <div className="space-y-12">
          {multiOrderIds.map(oid => (
            <div key={oid} className="border rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">{oid}</span>
                Service Form (Order #{oid})
              </h2>
              <Suspense fallback={<div className="p-4">Loading form for order {oid}…</div>}>
                <FormClient orderIdProp={oid} onPrefillStateChange={() => {}} />
              </Suspense>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
