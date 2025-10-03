"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
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
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) return
    const u = data.user

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
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      setDisplayName("")
      setUser(null)
      setIsAuthenticated(false)
      return
    }
    const u = data.user
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
      return
    }

    const { data: row } = await supabase.from("users").select("first_name,last_name,email").eq("id", u.id).maybeSingle()
    if (row) {
      const n = [row.first_name, row.last_name].filter(Boolean).join(" ") || (row.email?.split("@")[0] ?? "")
      setDisplayName(n)
    }
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setIsAuthenticated(!!data?.session)
      setUser(data?.session?.user ?? null)
      refreshDisplayName()
    })

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

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      const u = session?.user ?? null
      setIsAuthenticated(!!session)
      setUser(u)
      if (event === "SIGNED_IN" && u) {
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