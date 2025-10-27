"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string | number | null
  email: string | null
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMissing, setAuthMissing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: sessionRes } = await supabase.auth.getSession()
      const email = sessionRes?.session?.user?.email || null
      const userId = sessionRes?.session?.user?.id || null
      if (!email || !userId) {
        setAuthMissing(true)
        setProfile(null)
        return
      }
      setAuthMissing(false)
      // Try by id first
      let prof: Profile | null = null
      const { data: byId, error: errById } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, company, phone, address, city, state, country')
        .eq('id', userId)
        .maybeSingle()
      if (!errById && byId) prof = byId as unknown as Profile
      if (!prof) {
        const { data: byEmail } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, company, phone, address, city, state, country')
          .eq('email', email)
          .maybeSingle()
        if (byEmail) prof = byEmail as unknown as Profile
      }
      if (!prof) prof = { id: userId, email }
      setProfile(prof)
    } catch (e) {
      console.error('[ProfileScreen] load failed', e)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onFocus = () => {
      // On focus, refresh if we have no profile or were unauthenticated previously
      if (authMissing || !profile) load()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load, authMissing, profile])

  // Signal to the shell that the screen is render-ready (first meaningful content painted)
  useEffect(() => {
    if (!loading) {
      try { window.dispatchEvent(new Event('screen:ready')) } catch {}
    }
  }, [loading])

  return (
    <div>
      <h1 id="page-heading" tabIndex={-1}>Profile</h1>
      {loading ? (
        <p>Loading…</p>
      ) : authMissing ? (
        <p>Please sign in to view your profile.</p>
      ) : !profile ? (
        <p>Profile not found.</p>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
          <div><strong>Email:</strong> {profile.email || '—'}</div>
          <div><strong>Name:</strong> {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—'}</div>
          {profile.company ? <div><strong>Company:</strong> {profile.company}</div> : null}
          {profile.phone ? <div><strong>Phone:</strong> {profile.phone}</div> : null}
          {profile.address ? <div><strong>Address:</strong> {profile.address}</div> : null}
          {[profile.city, profile.state, profile.country].filter(Boolean).length > 0 ? (
            <div><strong>Location:</strong> {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
