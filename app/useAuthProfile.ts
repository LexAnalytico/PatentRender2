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
    // First, check for a live session; avoids getUser() returning null during initial hydration
    const { data: s } = await supabase.auth.getSession()
    if (!s?.session) {
      // During initial hydration, Supabase can briefly return null before restoring the session.
      // Do NOT clear the header cache here; it serves as our immediate fallback for the greeting.
      // Only clear cache on explicit sign-out paths or confirmed SIGNED_OUT events.
      setDisplayName("")
      setUser(null)
      setIsAuthenticated(false)
      return
    }
    const u = s.session.user
    setUser(u)
    setIsAuthenticated(true)

    const meta = u.user_metadata || {}
    const given = (meta.given_name as string) || ""
    const family = (meta.family_name as string) || ""
    const full = (meta.full_name as string) || (meta.name as string) || ""
    let name = ""
    if (given || family) name = [given, family].filter(Boolean).join(" ")
    else if (full) name = full
    else if (u.email) name = u.email.split("@")[0]

    if (name) {
      setDisplayName(name)
      // Write minimal header cache for instant header rendering on focus/refresh
      try {
        const cache = {
          ver: 1,
          ts: Date.now(),
          uid: u.id,
          email: (u.email || '').toLowerCase(),
          name: String(name).trim().slice(0, 128),
          avatarUrl: String(u.user_metadata?.avatar_url || '').slice(0, 1024),
        }
        localStorage.setItem('app:header_user_cache', JSON.stringify(cache))
      } catch {}
      return
    }

    const { data: row } = await supabase.from("users").select("first_name,last_name,email").eq("id", u.id).maybeSingle()
    if (row) {
      const n = [row.first_name, row.last_name].filter(Boolean).join(" ") || (row.email?.split("@")[0] ?? "")
      setDisplayName(n)
      // Update cache from DB-backed display name
      try {
        const { data: s2 } = await supabase.auth.getSession()
        const uid2 = s2?.session?.user?.id
        if (uid2) {
          const cache = {
            ver: 1,
            ts: Date.now(),
            uid: uid2,
            email: (row.email || '').toLowerCase(),
            name: String(n).trim().slice(0, 128),
            avatarUrl: '',
          }
          localStorage.setItem('app:header_user_cache', JSON.stringify(cache))
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
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
          try { localStorage.removeItem('app:header_user_cache') } catch {}
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
        // Ensure cache reflects latest auth user
        try {
          const cache = {
            ver: 1,
            ts: Date.now(),
            uid: u.id,
            email: (u.email || '').toLowerCase(),
            name: String((u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || '')).trim().slice(0,128),
            avatarUrl: String(u.user_metadata?.avatar_url || '').slice(0, 1024),
          }
          localStorage.setItem('app:header_user_cache', JSON.stringify(cache))
        } catch {}
      }
      if (!session) {
        setDisplayName("")
        try { localStorage.removeItem('app:header_user_cache') } catch {}
      }
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
      try { localStorage.removeItem('app:header_user_cache') } catch {}
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
    try { localStorage.removeItem('app:header_user_cache') } catch {}
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