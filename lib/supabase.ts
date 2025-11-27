
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side supabase client for use in client components
// For SSR with cookies, use getSupabaseServer() from './supabase-server'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


