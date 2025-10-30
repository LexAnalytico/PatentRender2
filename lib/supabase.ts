import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export a client that works in client components (browser) and still
// functions in non-browser contexts. For SSR, prefer getSupabaseServer().
//
// Important:
// - Use the standard supabase-js browser client in the browser to avoid SSR
//   cookie adapter quirks that can cause unexpected SIGNED_OUT events.
// - Persist a single browser instance on globalThis to prevent multiple
//   GoTrueClient instances during HMR in dev (which triggers warnings).
type BrowserSupabase = ReturnType<typeof createClient>
let browserClient: BrowserSupabase | null = null

function getClient() {
	if (typeof window !== 'undefined') {
		const g = globalThis as any
		if (g.__supabase_client) {
			return g.__supabase_client as BrowserSupabase
		}
		// Lazily create a singleton browser client to persist auth state.
		// Use the standard supabase-js client in the browser (localStorage-based).
		if (!browserClient) browserClient = createClient(supabaseUrl, supabaseAnonKey)
		// Persist across HMR reloads in dev
		g.__supabase_client = browserClient
		return browserClient
	}
	// Fallback for server contexts that still import from '@/lib/supabase'
	// Note: for true SSR with cookies, use getSupabaseServer() from './supabase-server'
	return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getClient()