"use client"

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Intentionally disabled AutoLogout behavior. Signing users out automatically
// on `beforeunload` or `pagehide` caused users to be logged out when they
// returned from the external payment provider. Keep this component as a
// no-op to avoid accidental sign-outs. If you want a server-side revoke on
// close, implement a beacon endpoint and call it here (without clearing
// client-side session data).

export default function AutoLogout() {
  return null
}
