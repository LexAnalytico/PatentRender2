"use client"
// Reuse the unified browser/client Supabase instance from lib/supabase,
// which is persisted on globalThis to avoid multiple GoTrueClient instances.
import { supabase } from '@/lib/supabase'

export function getSupabaseBrowser() {
  return supabase
}

export const supabaseBrowser = supabase
