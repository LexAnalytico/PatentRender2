"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Global auth watcher:
// - We DO NOT auto-logout on close/refresh to avoid breaking payment redirects.
// - We DO redirect to home on SIGNED_OUT so protected pages clear quickly.
export default function AutoLogout() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        try {
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