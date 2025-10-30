import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export a client that works in client components (browser) and still
// functions in non-browser contexts. For SSR, prefer getSupabaseServer().
//
// Important: Use the standard supabase-js browser client in the browser and
// enforce a single global instance + storageKey to avoid multiple GoTrue
// clients under the same key across route transitions.
let browserClient: ReturnType<typeof createClient> | null = null

function getClient() {
	if (typeof window !== 'undefined') {
		// Reuse a single global instance across modules/chunks
		const w = window as any
		if (!w.__supabase_singleton__) {
			w.__supabase_singleton__ = createClient(supabaseUrl, supabaseAnonKey, {
				auth: {
					persistSession: true,
					// Use a stable custom key to avoid collisions with other clients
					storageKey: 'lip-auth'
				}
			})
		}
		browserClient = w.__supabase_singleton__
		return browserClient
	}
	// Fallback for server contexts that still import from '@/lib/supabase'
	// Note: for true SSR with cookies, use getSupabaseServer() from './supabase-server'
	return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getClient()