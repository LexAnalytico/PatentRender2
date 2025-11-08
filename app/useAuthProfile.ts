"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export type AuthProfile = {
  isAuthenticated: boolean
  user: User | null
  displayName: string
  setDisplayName: (v: string) => void
  wantsCheckout: boolean
  setWantsCheckout: (v: boolean) => void
  handleGoogleLogin: () => Promise<void>
  handleLogout: () => Promise<void>
  refreshDisplayName: () => Promise<void>
  upsertUserProfileFromSession: () => Promise<void>
}

export function useAuthProfile(): AuthProfile {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [wantsCheckout, setWantsCheckout] = useState(false)

  // Cache for performance on slow networks
  const [lastDisplayNameUpdate, setLastDisplayNameUpdate] = useState(0)
  const [cachedDisplayName, setCachedDisplayName] = useState("")

  const upsertUserProfileFromSession = useCallback(async () => {
    // Prefer getSession to avoid transient nulls during hydration on Vercel
    const { data: s } = await supabase.auth.getSession()
    const u = s?.session?.user
    if (!u) return

    const fullName = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || ""
    const given = (u.user_metadata?.given_name as string) || ""
    const family = (u.user_metadata?.family_name as string) || ""

    let firstName = given
    let lastName = family
    if (!firstName && !lastName && fullName) {
      const parts = fullName.split(" ")
      firstName = parts[0] || ""
      lastName = parts.slice(1).join(" ") || ""
    }

    const { error: upsertErr } = await supabase.from("users").upsert(
      [{
        id: u.id,
        email: u.email || null,
        first_name: firstName || null,
        last_name: lastName || null,
        company: null,
      }],
      { onConflict: "id" }
    )
    if (upsertErr) console.error("[auth] upsert profile failed:", upsertErr.message)
  }, [])

  const refreshDisplayName = useCallback(async () => {
    // Performance optimization: avoid unnecessary refreshes within 30 seconds
    const now = Date.now()
    if (cachedDisplayName && (now - lastDisplayNameUpdate) < 30000) {
      console.log('🔍 Using cached display name (performance optimization):', cachedDisplayName)
      setDisplayName(cachedDisplayName)
      return
    }

    // First, check for a live session; avoids getUser() returning null during initial hydration
    const { data: s } = await supabase.auth.getSession()
    if (!s?.session) {
      console.log('🔍 No session found, clearing display name')
      setDisplayName("")
      setUser(null)
      setIsAuthenticated(false)
      setCachedDisplayName("")
      setLastDisplayNameUpdate(0)
      return
    }
    const u = s.session.user
    setUser(u)
    setIsAuthenticated(true)

    console.log('🔍 User metadata:', u.user_metadata)
    console.log('🔍 User email:', u.email)

    const meta = u.user_metadata || {}
    const given = (meta.given_name as string) || ""
    const family = (meta.family_name as string) || ""
    const full = (meta.full_name as string) || (meta.name as string) || ""
    
    console.log('🔍 Extracted from metadata - given:', given, 'family:', family, 'full:', full)
    
    let name = ""
    if (given || family) name = [given, family].filter(Boolean).join(" ")
    else if (full) name = full
    else if (u.email) name = u.email.split("@")[0]

    console.log('🔍 Computed name from metadata/email:', name)

    if (name) {
      console.log('🔍 Setting display name from metadata/email:', name)
      setDisplayName(name)
      setCachedDisplayName(name)
      setLastDisplayNameUpdate(now)
      return
    }

    console.log('🔍 No name from metadata, checking database with timeout...')
    
    try {
      // Add timeout for slow networks (5 seconds max)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
      
      const dbPromise = supabase.from("users").select("first_name,last_name,email").eq("id", u.id).maybeSingle()
      
      const { data: row } = await Promise.race([dbPromise, timeoutPromise]) as any
      console.log('🔍 Database row:', row)
      
      if (row) {
        const n = [row.first_name, row.last_name].filter(Boolean).join(" ") || (row.email?.split("@")[0] ?? "")
        console.log('🔍 Setting display name from database:', n)
        setDisplayName(n)
        setCachedDisplayName(n)
        setLastDisplayNameUpdate(now)
      } else {
        console.log('🔍 No database row found, using email fallback')
        const fallbackName = u.email?.split("@")[0] ?? ""
        setDisplayName(fallbackName)
        setCachedDisplayName(fallbackName)
        setLastDisplayNameUpdate(now)
      }
    } catch (error) {
      console.warn('🔍 Database query failed or timed out, using email fallback:', error)
      const fallbackName = u.email?.split("@")[0] ?? ""
      setDisplayName(fallbackName)
      setCachedDisplayName(fallbackName)
      setLastDisplayNameUpdate(now)
    }
  }, [cachedDisplayName, lastDisplayNameUpdate])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        console.log('🔍 [PERF] Starting auth session check...')
        const startTime = performance.now()
        
        const { data } = await supabase.auth.getSession()
        
        const endTime = performance.now()
        console.log(`🔍 [PERF] Auth session check took ${(endTime - startTime).toFixed(2)}ms`)
        
        if (!active) return
                setIsAuthenticated(!!data?.session)
        setUser(data?.session?.user ?? null)
        refreshDisplayName()
      } catch (e) {
        console.warn('[auth] getSession failed', e)
      }
    })()
/*
useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const { data:s } = await supabase.auth.getSession()
        if (!s?.session) {reset state; return} 
           const u = s.session.user
        setUser(s?.session?.user ?? null)
        refreshDisplayName()
      } catch (e) {
        console.warn('[auth] getSession failed', e)
      }
    })()
      */
    // Safari deferred logout completion
    ;(async () => {
      try {
        const marker = typeof window !== 'undefined' ? localStorage.getItem('pending_logout') : null
        if (marker === '1') {
          console.debug('[auth] processing pending Safari logout')
          localStorage.removeItem('pending_logout')
          try { await supabase.auth.signOut() } catch (e) { console.warn('[auth] pending logout signOut error', e) }
          try { await supabase.auth.signOut({ scope: 'global' } as any) } catch {}
          setIsAuthenticated(false)
          setUser(null)
          setDisplayName('')
        }
      } catch {}
    })()

    const { data: sub } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!active) return
      const u = session?.user ?? null
      setIsAuthenticated(!!session)
      setUser(u)
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && u) {
        await upsertUserProfileFromSession()
        await refreshDisplayName()
      }
      if (!session) setDisplayName("")
    })

    return () => {
      active = false
      sub?.subscription?.unsubscribe()
    }
  }, [refreshDisplayName, upsertUserProfileFromSession])

  const handleGoogleLogin = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    })
    if (error) {
      console.error("Google login error:", error.message)
      alert("Google login failed!")
    }
  }, [])

  const handleLogout = useCallback(async () => {
    const isSafari = typeof navigator !== 'undefined' && /safari/i.test(navigator.userAgent) && !/chrome|chromium|android/i.test(navigator.userAgent)
    if (isSafari) {
      try { localStorage.setItem('pending_logout', '1') } catch {}
      // Immediate hard reload; signOut will be finalized on mount
      try { window.location.replace(window.location.origin + '/') } catch { window.location.href = '/' }
      return
    }
    // Non-Safari normal path
    try { await supabase.auth.signOut() } catch (e) { console.error('[logout] signOut error', e) }
    setIsAuthenticated(false)
    setUser(null)
    setDisplayName('')
    setWantsCheckout(false)
  }, [])

  return useMemo(
    () => ({
      isAuthenticated,
      user,
      displayName,
      setDisplayName,
      wantsCheckout,
      setWantsCheckout,
      handleGoogleLogin,
      handleLogout,
      refreshDisplayName,
      upsertUserProfileFromSession,
    }),
    [
      isAuthenticated,
      user,
      displayName,
      wantsCheckout,
      handleGoogleLogin,
      handleLogout,
      refreshDisplayName,
      upsertUserProfileFromSession,
    ]
  )
}