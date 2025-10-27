"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Global auth watcher:
// - We DO NOT auto-logout on close/refresh to avoid breaking payment redirects.
// - We DO redirect to home on SIGNED_OUT so protected pages clear quickly.
export default function AutoLogout() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        try {
          // debug beacon so we can see in terminal when sign-outs trigger redirects
          try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'auth-signed-out', pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() })) } catch {}
          // Hard redirect to ensure state is reset across the app
          window.location.assign('/')
        } catch {
          // no-op
        }
      }
    })
    return () => {
      try { listener.subscription.unsubscribe() } catch { /* no-op */ }
    }
  }, [])

  return null
}