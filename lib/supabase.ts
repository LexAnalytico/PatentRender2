import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export a client that works in client components (browser) and still
// functions in non-browser contexts. For SSR, prefer getSupabaseServer().
let browserClient: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
	if (typeof window !== 'undefined') {
		// Lazily create a singleton browser client to persist auth state
		if (!browserClient) browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
		return browserClient
	}
	// Fallback for server contexts that still import from '@/lib/supabase'
	// Note: for true SSR with cookies, use getSupabaseServer() from './supabase-server'
	return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getClient()