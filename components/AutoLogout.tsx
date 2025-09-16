"use client"

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AutoLogout() {
  const triggeredRef = useRef(false)

  useEffect(() => {
    const logoutNow = async () => {
      if (triggeredRef.current) return
      triggeredRef.current = true
      try {
        // best-effort sign out; may not complete if browser closes immediately
        await supabase.auth.signOut()
      } catch (e) {
        console.debug('AutoLogout signOut error', e)
      }
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // attempt sign out when the page is being unloaded (tab closed / navigation away)
      // keep it synchronous as possible, but call the async signOut too as best-effort
      try {
        // navigator.sendBeacon is unreliable for session cookies, but we call it for a lightweight signal
        // Also call async signOut (may not finish before unload)
        logoutNow()
      } catch (err) {
        // ignore
      }
      // No need to set e.returnValue unless you want to show confirmation
    }

    const onPageHide = (e: PageTransitionEvent) => {
      // pagehide fires on unload-like events; handle similarly
      logoutNow()
    }

    // visibility change: sometimes pages become hidden before close (mobile)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // give the browser a moment then sign out
        setTimeout(() => {
          logoutNow()
        }, 500)
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return null
}
