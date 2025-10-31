
"use client"
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Factory to create a browser-side Supabase client (persists auth in cookies/localStorage)
export function getSupabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Convenient singleton for standard client components
export const supabaseBrowser = getSupabaseBrowser()


