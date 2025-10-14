// Unified order fetching & joining logic with lightweight in-memory caching.
// This consolidates the previously duplicated logic in app/page.tsx (fetchOrdersCore & loadOrders).
// Provides a single function `fetchOrdersMerged` that performs:
//  - Base orders query (by user id)
//  - Ancillary lookups: services, categories, payments
//  - Optional current user profile fetch (for invoice rendering)
//  - Simple per-user in-memory cache (default 10s) to avoid thrashing on rapid navigations / focus events
//
// Future extensions:
//  - Support AbortSignal for cancellation
//  - SWR-style stale-while-revalidate
//  - Pagination (limit/offset) when orders list grows large
//  - Server-side API endpoint using the same logic for SSR / RSC

import type { SupabaseClient } from '@supabase/supabase-js'

interface FetchOrdersOptions {
  includeProfile?: boolean
  cacheMs?: number
  force?: boolean
}

interface FetchOrdersResult {
  orders: any[]
  rawCount: number
  error: string | null
}

type CacheEntry = {
  ts: number
  orders: any[]
  rawCount: number
}

const ordersCache: Map<string, CacheEntry> = new Map()

async function fetchCurrentUserProfile(supabase: SupabaseClient): Promise<{
  id: string | null
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
} | null> {
  try {
    const { data: s } = await supabase.auth.getSession()
    const uid = s?.session?.user?.id || null
    const email = s?.session?.user?.email || null
    if (!uid) return null
    const { data: u, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone')
      .eq('id', uid)
      .maybeSingle()
    if (error) return { id: uid, email, first_name: null, last_name: null, phone: null }
    return {
      id: u?.id ?? uid,
      email: u?.email ?? email,
      first_name: u?.first_name ?? null,
      last_name: u?.last_name ?? null,
      phone: u?.phone ?? null,
    }
  } catch {
    return null
  }
}

export async function fetchOrdersMerged(
  supabase: SupabaseClient,
  userId: string,
  { includeProfile = true, cacheMs = 10_000, force = false }: FetchOrdersOptions = {}
): Promise<FetchOrdersResult> {
  if (!userId) return { orders: [], rawCount: 0, error: 'NO_USER' }

  const now = Date.now()
  const cached = ordersCache.get(userId)
  if (!force && cached && now - cached.ts < cacheMs) {
    return { orders: cached.orders, rawCount: cached.rawCount, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, service_id, category_id, payment_id, type, amount, responsible, workflow_status, require_info_message, require_info_reply')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { orders: [], rawCount: 0, error: error.message || 'QUERY_ERROR' }
    }

    const ordersRaw = (data as any[]) ?? []
    if (ordersRaw.length === 0) {
      // Cache empty result briefly to suppress bursts
      ordersCache.set(userId, { ts: now, orders: [], rawCount: 0 })
      return { orders: [], rawCount: 0, error: null }
    }

  const serviceIds = Array.from(new Set(ordersRaw.map(o => o.service_id).filter(Boolean)))
  const categoryIds = Array.from(new Set(ordersRaw.map(o => o.category_id).filter(Boolean)))
  const paymentIds = Array.from(new Set(ordersRaw.map(o => o.payment_id).filter(Boolean)))
  const orderIds = Array.from(new Set(ordersRaw.map(o => o.id).filter(Boolean)))

    let servicesRes: any = { data: [], error: null }
    let categoriesRes: any = { data: [], error: null }
    let paymentsRes: any = { data: [], error: null }
    let formsRes: any = { data: [], error: null }
    try {
      ;[servicesRes, categoriesRes, paymentsRes, formsRes] = await Promise.all([
        serviceIds.length ? supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
        categoryIds.length ? supabase.from('categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
        paymentIds.length ? supabase.from('payments').select('id, razorpay_order_id, razorpay_payment_id, payment_method, total_amount, payment_status, payment_date, service_id, type').in('id', paymentIds) : Promise.resolve({ data: [], error: null }),
        orderIds.length ? supabase.from('form_responses').select('order_id, form_type, data, fields_filled_count, fields_total, completed').in('order_id', orderIds) : Promise.resolve({ data: [], error: null }),
      ])
    } catch (joinErr) {
      // Non-fatal; continue with base orders
      if (process.env.NEXT_PUBLIC_DEBUG === '1') console.warn('[orders.join] ancillary lookup error', joinErr)
    }

    const servicesMap = new Map((servicesRes?.data ?? []).map((s: any) => [s.id, s]))
    const categoriesMap = new Map((categoriesRes?.data ?? []).map((c: any) => [c.id, c]))
    const paymentsMap = new Map((paymentsRes?.data ?? []).map((p: any) => [p.id, p]))
    // Build form responses aggregation per order id
    const uploadsFieldNames = new Set(['upload','uploads','attachments','files','file_upload','disclosure document','drawings / figures'])
    const commentFieldNames = new Set(['comments','comment','notes','additional instructions','additional_instructions','instructions','message'])
  const formAgg: Record<string, { filled_fields: number; total_fields: number; form_core_complete: boolean; form_values: Record<string, any> | null; any_confirmed: boolean }> = {}
    try {
      for (const r of (formsRes?.data ?? [])) {
        const oid = r.order_id
        if (!oid) continue
        const total = Number(r.fields_total) || 0
        const filled = Number(r.fields_filled_count) || 0
  const hardConfirmed = !!r.completed
  const completed = hardConfirmed || (total > 0 && filled >= total)
        // Sanitize data (remove uploads/comments) & only keep non-empty core values
        let sanitized: Record<string, any> | null = null
        if (r.data && typeof r.data === 'object') {
          sanitized = {}
          for (const [k,v] of Object.entries(r.data as Record<string, any>)) {
            const keyNorm = k.trim().toLowerCase()
            if (uploadsFieldNames.has(keyNorm) || commentFieldNames.has(keyNorm)) continue
            if (v == null) continue
            if (typeof v === 'string' && v.trim() === '') continue
            if (Array.isArray(v) && v.length === 0) continue
            sanitized[k] = v
          }
          if (Object.keys(sanitized).length === 0) sanitized = null
        }
        // If duplicate rows per order (multiple form types), merge: take max totals & union values
        if (!formAgg[oid]) {
          formAgg[oid] = { filled_fields: filled, total_fields: total, form_core_complete: completed, form_values: sanitized, any_confirmed: hardConfirmed }
        } else {
          const prev = formAgg[oid]
            prev.filled_fields = Math.max(prev.filled_fields, filled)
            prev.total_fields = Math.max(prev.total_fields, total)
            prev.form_core_complete = prev.form_core_complete || completed
            prev.any_confirmed = prev.any_confirmed || hardConfirmed
            if (sanitized) {
              prev.form_values = { ...(prev.form_values || {}), ...sanitized }
            }
        }
      }
    } catch (e) {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') console.warn('[orders.join] form aggregation error', e)
    }

    let userProfile: any | null = null
    if (includeProfile) userProfile = await fetchCurrentUserProfile(supabase)

    const merged = ordersRaw.map(o => {
      const form = formAgg[o.id]
      return {
        ...o,
        services: servicesMap.get(o.service_id) ?? null,
        categories: categoriesMap.get(o.category_id) ?? null,
        payments: paymentsMap.get(o.payment_id) ?? null,
        user: userProfile || undefined,
        // Expose standardized field names consumed by formsCoreComplete heuristic
        filled_fields: form?.filled_fields ?? null,
        total_fields: form?.total_fields ?? null,
  form_core_complete: form?.form_core_complete ?? null,
  form_confirmed: form?.any_confirmed ?? false,
        form_values: form?.form_values ?? null,
      }
    })

    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      try {
        console.debug('[orders.join] merged orders with form metrics', merged.slice(0,5).map(o => ({ id: o.id, filled_fields: o.filled_fields, total_fields: o.total_fields, form_core_complete: o.form_core_complete, has_values: !!o.form_values })))
      } catch {}
    }

    ordersCache.set(userId, { ts: now, orders: merged, rawCount: ordersRaw.length })
    return { orders: merged, rawCount: ordersRaw.length, error: null }
  } catch (e: any) {
    return { orders: [], rawCount: 0, error: e?.message || 'UNEXPECTED' }
  }
}

// Utility to clear cache (e.g. after mutation / new order creation)
export function invalidateOrdersCache(userId?: string) {
  if (userId) ordersCache.delete(userId)
  else ordersCache.clear()
}
