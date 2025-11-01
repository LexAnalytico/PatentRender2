  "use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FocusProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  // track previous pathname for transition logging
  const prevRef = typeof window !== 'undefined' ? (window as any).__prev_pathname_ref__ ||= { current: pathname } : { current: pathname }
  // lightweight transition overlay state (shows a blur while restoring a screen)
  const [overlayActive, setOverlayActive] = useState(false)
  // Track whether we're in a restore cycle to adjust last_view after screen ready
  const restoreCycleRef = typeof window !== 'undefined' ? (window as any).__restore_cycle_ref__ ||= { current: false } : { current: false }

  const setOverlay = (active: boolean, reason: string) => {
    setOverlayActive(active)
    try {
      const payload = { event: active ? 'overlay-show' : 'overlay-hide', reason, pathname, ts: Date.now() }
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
      } else {
        fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
      }
    } catch {}
  }

  // Helper: after a restore completes, set last_view to 'home' so a full refresh renders home
  const setLastViewHome = (reason: string) => {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
      if (process.env.NEXT_PUBLIC_DISABLE_HOME_POST_RESTORE === '1') return
      const LAST_VIEW_KEY = 'app:last_view'
      localStorage.setItem(LAST_VIEW_KEY, 'home')
      // short-lived lock so other persisters skip writing quote:* immediately after restore
      try { localStorage.setItem('app:last_view_home_lock', String(Date.now())) } catch {}
      const payload = { event: 'last-view-set-home-post-restore', reason, pathname, ts: Date.now() }
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
      } else {
        fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
      }
    } catch {}
  }

  // Helper: dump current last-view value to server terminal
  const dumpLastView = (source?: string) => {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
      const LAST_VIEW_KEY = 'app:last_view'
      const last = localStorage.getItem(LAST_VIEW_KEY)
      const payload = { event: 'last-view-dump', last, source: source || null, pathname, ts: Date.now() }
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
      } else {
        fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
      }
    } catch {}
  }
  // Helper: reset last-view quickly from console and log it
  const resetLastView = (source?: string) => {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
      const LAST_VIEW_KEY = 'app:last_view'
      localStorage.removeItem(LAST_VIEW_KEY)
      const payload = { event: 'last-view-reset', source: source || null, pathname, ts: Date.now() }
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
      } else {
        fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
      }
    } catch {}
  }

  useEffect(() => {
    // Wait a tick so the new page DOM mounts
    const t = setTimeout(() => {
      try {
        // Debug: record focus action and pathname (also post to server for terminal logs)
        try {
          const prev = prevRef.current
          const payload = { event: 'focus-change', prev, pathname, ts: Date.now() }
          // Prefer beacon so the message is delivered even during unload
          if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
          } else {
            fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
          }
          // update prev
          try { prevRef.current = pathname } catch {}
        } catch {}
        // Persist last-view for dedicated dashboard routes so visibility restore can pick it up
        try {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            const LAST_VIEW_KEY = 'app:last_view'
            let val: string | null = null
            try {
              if (pathname && pathname.startsWith('/orders')) val = 'quote:orders'
              else if (pathname && pathname.startsWith('/profile')) val = 'quote:profile'
              else if (pathname && pathname.startsWith('/forms')) val = (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') ? 'home' : 'quote:forms'
              else if (pathname === '/main' || pathname === '/') val = 'home'
              // Persist only when we resolved a value
              if (val) {
                localStorage.setItem(LAST_VIEW_KEY, val)
                const p2 = { event: 'last-view-save-from-focusprovider', val, pathname, ts: Date.now() }
                if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
                  try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p2)) } catch {}
                } else {
                  fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p2) }).catch(() => {})
                }
              }
            } catch {}
          }
        } catch {}
        const el = document.getElementById('page-heading') as HTMLElement | null
        if (el) {
          console.debug('[FocusProvider] focusing page-heading for', pathname)
          el.focus()
          return
        }
        const main = document.querySelector('main[role="main"]') as HTMLElement | null
        if (main) {
          // Make sure main is programmatically focusable
          if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
          console.debug('[FocusProvider] no heading; focusing main for', pathname)
          main.focus()
        }
      } catch (e) {
        // swallow
      }
    }, 40)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    // log blur/tab-out events so we can correlate with restores
    const onBlur = () => {
      try {
        const payload = { event: 'window-blur', pathname, ts: Date.now() }
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
        } else {
          fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
        }

        // Save last view for dedicated quote routes before navigating away.
        try {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            const LAST_VIEW_KEY = 'app:last_view'
            let val: string | null = null
            if (pathname && pathname.startsWith('/orders')) {
              // New policy: when hard-reset-on-blur is enabled, restore to main instead of Orders
              const forceHome = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
              val = forceHome ? 'home' : 'quote:orders'
            }
            else if (pathname && pathname.startsWith('/profile')) {
              const forceHome = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
              val = forceHome ? 'home' : 'quote:profile'
            }
            else if (pathname && pathname.startsWith('/forms')) {
              const forceHome = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
              // Under force policy: normalize to home. Otherwise: map forms -> orders as before.
              val = forceHome ? 'home' : 'quote:orders'
            }
            // Only persist when we're on a dedicated quote route
            if (val) {
              try { localStorage.setItem(LAST_VIEW_KEY, val) } catch {}
              try { if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'last-view-save-from-focusprovider-on-blur', val, pathname, ts: Date.now() })) } catch {}
              // Also dump current last-view to terminal for quick inspection
              try { dumpLastView('blur') } catch {}
            }
          }
        } catch {}

        // Navigate back to main on tab-out when leaving a dedicated route.
        try {
          if (typeof window !== 'undefined' && pathname) {
            const isDedicated = pathname.startsWith('/orders') || pathname.startsWith('/profile') || pathname.startsWith('/forms')
            if (isDedicated) {
              try { router.push('/main') } catch {}
            }
          }
        } catch {}
      } catch {}
    }
    const onBeforeUnload = () => {
      try {
        const payload = { event: 'beforeunload', pathname, ts: Date.now() }
        try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
      } catch {}
    }
    window.addEventListener('blur', onBlur)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [pathname])

  // On mount: expose a manual helper and dump once so you can see the current value in the terminal
  useEffect(() => {
    try {
      (window as any).dumpLastView = () => dumpLastView('manual')
      ;(window as any).resetLastView = () => resetLastView('manual')
    } catch {}
    dumpLastView('mount')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show a quick blur overlay on tab-in when we'll restore a dedicated screen (orders/profile/forms)
  useEffect(() => {
    const LAST_VIEW_KEY = 'app:last_view'
    const onVisOrFocus = () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
        if (typeof window === 'undefined') return
        const last = localStorage.getItem(LAST_VIEW_KEY)
        const onRoot = window.location.pathname === '/'
        if (onRoot && last && last.startsWith('quote:')) {
          restoreCycleRef.current = true
          setOverlay(true, 'restore-start')
        }
      } catch {}
    }
    const onReady = () => {
      setOverlay(false, 'screen-ready')
      if (restoreCycleRef.current) {
        restoreCycleRef.current = false
        setLastViewHome('screen-ready')
      }
    }
    window.addEventListener('focus', onVisOrFocus)
    document.addEventListener('visibilitychange', onVisOrFocus)
    window.addEventListener('screen:ready', onReady as any)
    return () => {
      window.removeEventListener('focus', onVisOrFocus)
      document.removeEventListener('visibilitychange', onVisOrFocus)
      window.removeEventListener('screen:ready', onReady as any)
    }
  }, [])

  // Fallback: if overlay is active and we navigated to a dedicated route, hide it shortly after
  useEffect(() => {
    if (!overlayActive) return
    const isDedicated = pathname?.startsWith('/orders') || pathname?.startsWith('/profile') || pathname?.startsWith('/forms')
    if (!isDedicated) return
    const t = setTimeout(() => {
      setOverlay(false, 'route-arrived')
      if (restoreCycleRef.current) {
        restoreCycleRef.current = false
        setLastViewHome('route-arrived')
      }
    }, 600)
    return () => clearTimeout(t)
  }, [pathname, overlayActive])

  useEffect(() => {
    // Instrument navigation APIs so we can see which code navigates to '/'
    if (typeof window === 'undefined') return
    const sendNav = (payload: any) => {
      try {
        payload.ts = Date.now()
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          try { navigator.sendBeacon('/api/debug-log', JSON.stringify(payload)) } catch {}
        } else {
          fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
        }
      } catch {}
    }

    // wrap history methods
    const originalPush = history.pushState
    const originalReplace = history.replaceState
    history.pushState = function (data: any, unused: string, url?: string | null) {
      try { sendNav({ event: 'history.pushState', url: String(url || window.location.href), stack: (new Error()).stack }) } catch {}
      return originalPush.apply(this, arguments as any)
    }
    history.replaceState = function (data: any, unused: string, url?: string | null) {
      try { sendNav({ event: 'history.replaceState', url: String(url || window.location.href), stack: (new Error()).stack }) } catch {}
      return originalReplace.apply(this, arguments as any)
    }

    // wrap location.assign if writable on this platform (some browsers make it non-writable)
    let origAssign: any = null
    let patchedAssign = false
    try {
      const desc = Object.getOwnPropertyDescriptor(window.location, 'assign')
      const protoDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window.location), 'assign')
      const writable = (desc && typeof desc.writable === 'boolean') ? desc.writable : (protoDesc && typeof protoDesc.writable === 'boolean') ? protoDesc.writable : false
      if (writable) {
        origAssign = window.location.assign
        // @ts-ignore - intentionally monkeypatching built-in
        window.location.assign = function (url: string) {
          try { sendNav({ event: 'location.assign', url: String(url), stack: (new Error()).stack }) } catch {}
          return origAssign.apply(this, arguments as any)
        }
        patchedAssign = true
      } else {
        // not writable — don't attempt to assign, just emit a debug note
        try { sendNav({ event: 'location.assign-not-patched', url: window.location.href }) } catch {}
      }
    } catch (e) {
      // defensive: if anything throws, avoid patching
      try { sendNav({ event: 'location.assign-patch-error', error: String(e) }) } catch {}
    }

    // listen for popstate (back/forward)
    const onPop = (e: PopStateEvent) => {
      try { sendNav({ event: 'popstate', url: window.location.href, stack: (new Error()).stack }) } catch {}
    }
    window.addEventListener('popstate', onPop)

    return () => {
      try { history.pushState = originalPush } catch {}
      try { history.replaceState = originalReplace } catch {}
      try { if (patchedAssign && origAssign) (window.location as any).assign = origAssign } catch {}
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  return (
    <>
      {overlayActive && (
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0 as any, zIndex: 2147483000,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
          transition: 'opacity 160ms ease',
          pointerEvents: 'none'
        }} />
      )}
      {children}
    </>
  )
}
