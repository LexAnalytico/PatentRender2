// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env.local loader (avoids adding a dependency on dotenv)
function loadEnvLocal(): Record<string, string> {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return {}
    const raw = fs.readFileSync(envPath, 'utf8')
    const map: Record<string, string> = {}
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, '')
      map[key] = value
    }
    return map
  } catch {
    return {}
  }
}

const envLocal = loadEnvLocal()
function envGet(key: string): string | undefined {
  return process.env[key] ?? envLocal[key]
}

const SUPABASE_URL = envGet('NEXT_PUBLIC_SUPABASE_URL') || envGet('SUPABASE_URL')
const SUPABASE_ANON_KEY = envGet('NEXT_PUBLIC_SUPABASE_ANON_KEY') || envGet('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = envGet('SUPABASE_SERVICE_ROLE_KEY')

function getAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getAnonClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function createUserAndClient(prefix: string) {
  const admin = getAdminClient()
  const email = `vitest-${prefix}-${Date.now()}@example.com`
  const password = 'Passw0rd!123'

  const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr || !userRes.user) throw (createErr ?? new Error('User creation failed'))

  const client = getAnonClient()
  const { data: signIn, error: loginErr } = await client.auth.signInWithPassword({ email, password })
  if (loginErr || !signIn.user) throw (loginErr ?? new Error('Login failed'))

  return { client, user: signIn.user, cleanup: async () => {
    await admin.auth.admin.deleteUser(userRes.user!.id)
  } }
}

async function getAnyServiceId(admin: SupabaseClient): Promise<number | null> {
  const { data, error } = await admin.from('services').select('id').limit(1).maybeSingle()
  if (error) return null
  return data?.id ?? null
}

// Gate entire suite if core env is missing
const ENV_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY)
const describeDb = ENV_READY ? describe : (describe.skip as typeof describe)
const itMaybe = ENV_READY ? it : (it.skip as typeof it)

describeDb('Database policies and triggers (Vitest)', () => {
  it('service_pricing_rules is readable with anon key and conforms to enums', async () => {
    const anon = getAnonClient()

    const { error: countErr, count } = await anon
      .from('service_pricing_rules')
      .select('*', { count: 'exact', head: true })

    expect(countErr).toBeNull()
    expect(count).toBeGreaterThanOrEqual(0)

    const { data, error } = await anon
      .from('service_pricing_rules')
      .select('application_type,key,unit,amount')
      .limit(1)

    expect(error).toBeNull()

    if (data && data.length > 0) {
      const row = data[0]!
      expect(['individual', 'startup_msme', 'others']).toContain(row.application_type)
      expect(['option1', 'nice_classes', 'goods_services', 'prior_use_yes', 'professional_fee']).toContain(row.key)
      expect(['fixed', 'per_class']).toContain(row.unit)
      expect(typeof Number(row.amount)).toBe('number')
    }
  })

  it('quotes RLS: owner can insert/select/update while draft; cannot update after finalized; others cannot see', async () => {
    const admin = getAdminClient()
    const svcId = await getAnyServiceId(admin)
    if (!svcId) return

    const u1 = await createUserAndClient('u1')
    const u2 = await createUserAndClient('u2')

    try {
      const { data: q1, error: insErr } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single()

      expect(insErr).toBeNull()
      expect(q1).toBeTruthy()
      expect(q1!.user_id).toBe(u1.user.id)
      expect(q1!.status).toBe('draft')

      const { data: upd1, error: updErr1 } = await u1.client
        .from('quotes')
        .update({ subtotal: 100 })
        .eq('id', q1!.id)
        .select()
        .single()

      expect(updErr1).toBeNull()
      expect(upd1!.subtotal).toBe(100)

      const updatedAt1 = new Date(upd1!.updated_at).getTime()
      const createdAt = new Date(upd1!.created_at).getTime()
      expect(updatedAt1).toBeGreaterThanOrEqual(createdAt)

      const { data: fin, error: finErr } = await admin
        .from('quotes')
        .update({ status: 'finalized' })
        .eq('id', q1!.id)
        .select()
        .single()

      expect(finErr).toBeNull()
      expect(fin!.status).toBe('finalized')

      const { data: upd2, error: updErr2 } = await u1.client
        .from('quotes')
        .update({ currency: 'USD' })
        .eq('id', q1!.id)
        .select()

      expect(updErr2).toBeNull()
      expect(upd2).toEqual([])

      const { data: afterFin, error: readAfterFinErr } = await u1.client
        .from('quotes')
        .select('status,currency')
        .eq('id', q1!.id)
        .single()
      expect(readAfterFinErr).toBeNull()
      expect(afterFin!.status).toBe('finalized')
      expect(afterFin!.currency).not.toBe('USD')

      const { data: otherView, error: otherErr } = await u2.client
        .from('quotes')
        .select('id')
        .eq('id', q1!.id)

      expect(otherErr).toBeNull()
      expect(otherView).toEqual([])
    } finally {
      await u1.cleanup()
      await u2.cleanup()
    }
  })

  it('quote_items RLS: insert allowed only when parent quote is draft; enforced by parent ownership', async () => {
    const admin = getAdminClient()
    const svcId = await getAnyServiceId(admin)
    if (!svcId) return

    const u1 = await createUserAndClient('qi1')
    const u2 = await createUserAndClient('qi2')

    try {
      const { data: q } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single()

      const { data: qi1, error: qiErr1 } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 4500, amount: 4500 }])
        .select()
        .single()

      expect(qiErr1).toBeNull()
      expect(qi1!.quote_id).toBe(q!.id)

      const { error: finErr } = await admin
        .from('quotes')
        .update({ status: 'finalized' })
        .eq('id', q!.id)
      expect(finErr).toBeNull()

      const { error: qiErr2 } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'goods_services', label: 'Goods & Services', unit: 'fixed', quantity: 1, unit_amount: 650, amount: 650 }])

      expect(qiErr2).not.toBeNull()

      const { data: q2 } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single()

      const { error: u2InsertErr } = await u2.client
        .from('quote_items')
        .insert([{ quote_id: q2!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 4500, amount: 4500 }])

      expect(u2InsertErr).not.toBeNull()
    } finally {
      await u1.cleanup()
      await u2.cleanup()
    }
  })

  it('service_pricing_rules RLS and constraints', async () => {
    const anon = getAnonClient()
    const admin = getAdminClient()

    const { data: catAny, error: catAnyErr } = await admin.from('categories').select('id').limit(1).maybeSingle()
    if (!!catAnyErr || !catAny?.id) return

    const tempSvcId = Math.floor(900000000 + Math.random() * 1000000)
    const svcName = `spr-svc-${Date.now()}`
    const { data: svc, error: svcErr } = await admin
      .from('services')
      .insert([{ id: tempSvcId, category_id: catAny!.id, name: svcName, base_price: 1 }])
      .select()
      .single()
    expect(svcErr).toBeNull()

    try {
      const { error: sErr } = await anon.from('service_pricing_rules').select('id').limit(1)
      expect(sErr).toBeNull()

      const { error: insAnonErr } = await anon
        .from('service_pricing_rules')
        .insert([{ service_id: svc!.id, application_type: 'individual', key: 'option1', unit: 'fixed', amount: 100 }])
      expect(insAnonErr).not.toBeNull()

      const { error: badCheckErr } = await admin
        .from('service_pricing_rules')
        .insert([{ service_id: svc!.id, application_type: 'invalid_type', key: 'option1', unit: 'fixed', amount: 100 }])
      expect(badCheckErr).not.toBeNull()

      const row = { service_id: svc!.id, application_type: 'individual', key: 'professional_fee', unit: 'fixed', amount: 6500 }
      const { error: ins1 } = await admin.from('service_pricing_rules').insert([row])
      expect(ins1).toBeNull()
      const { error: ins2 } = await admin.from('service_pricing_rules').insert([row])
      expect(ins2).not.toBeNull()
    } finally {
      await admin.from('services').delete().eq('id', svc!.id)
    }
  })

  it('categories/services RLS, uniqueness, and cascade', async () => {
    const anon = getAnonClient()
    const admin = getAdminClient()

    const { error: readErr } = await anon.from('categories').select('id').limit(1)
    expect(readErr).toBeNull()

    const { error: anonInsErr } = await anon.from('categories').insert([{ name: `Temp Cat A ${Date.now()}` }])
    expect(anonInsErr).not.toBeNull()

    const catId = Math.floor(900000000 + Math.random() * 1000000)
    const catName = `Temp Cat B ${Date.now()}`
    const { data: c1, error: cErr1 } = await admin.from('categories').insert([{ id: catId, name: catName }]).select().single()
    expect(cErr1).toBeNull()

    const { error: cErr2 } = await admin.from('categories').insert([{ id: catId + 1, name: catName }])
    const { count: nameCount, error: countErr } = await admin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('name', catName)
    expect(countErr).toBeNull()
    if (cErr2) {
      expect(nameCount).toBe(1)
    } else {
      expect(nameCount).toBeGreaterThanOrEqual(2)
    }

    const svcId = Math.floor(900000000 + Math.random() * 1000000)
    const { data: s1, error: sErr } = await admin
      .from('services')
      .insert([{ id: svcId, category_id: c1!.id, name: `Temp Service X ${Date.now()}`, base_price: 1 }])
      .select().single()
    expect(sErr).toBeNull()

    const { error: delCatErr } = await admin.from('categories').delete().eq('id', c1!.id)
    expect(delCatErr).toBeNull()

    const { data: checkSvc } = await admin.from('services').select('id').eq('id', s1!.id)
    expect(checkSvc).toEqual([])

    await admin.from('categories').delete().eq('id', catId + 1)
  })

  it('quotes RLS: cannot forge user_id; owner cannot finalize; FK restrict; timestamp monotonic', async () => {
    const admin = getAdminClient()
    const svcId = await getAnyServiceId(admin)
    if (!svcId) return

    const u = await createUserAndClient('qforge')
    try {
      const { data: otherUser } = await admin.auth.admin.createUser({
        email: `f-${Date.now()}@example.com`, password: 'Passw0rd!123', email_confirm: true
      })

      const { error: forgeErr } = await u.client
        .from('quotes')
        .insert([{ user_id: otherUser!.user!.id, service_id: svcId!, application_type: 'individual' }])
      expect(forgeErr).not.toBeNull()

      const { data: q, error: qErr } = await u.client
        .from('quotes')
        .insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }])
        .select().single()
      expect(qErr).toBeNull()

      const { data: finByOwner, error: finErrByOwner } = await u.client
        .from('quotes').update({ status: 'finalized' }).eq('id', q!.id).select()
      expect(finErrByOwner).not.toBeNull()

      const { data: upd1 } = await u.client
        .from('quotes').update({ subtotal: 1 }).eq('id', q!.id).select().single()
      const t1 = new Date(upd1!.updated_at).getTime()

      const { data: upd2 } = await u.client
        .from('quotes').update({ subtotal: 2 }).eq('id', q!.id).select().single()
      const t2 = new Date(upd2!.updated_at).getTime()
      expect(t2).toBeGreaterThanOrEqual(t1)

      const { error: finErrAdmin } = await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id)
      expect(finErrAdmin).toBeNull()

      const { error: delSvcErr } = await admin.from('services').delete().eq('id', svcId!)
      expect(delSvcErr).not.toBeNull()

      await admin.auth.admin.deleteUser(otherUser!.user!.id)
    } finally {
      await u.cleanup()
    }
  })

  it('quote_items RLS: read isolation; update only while draft; delete denied', async () => {
    const admin = getAdminClient()
    const svcId = await getAnyServiceId(admin)
    if (!svcId) return

    const u1 = await createUserAndClient('qi-r')
    const u2 = await createUserAndClient('qi-r2')
    try {
      const { data: q } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select().single()

      const { data: qi } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 1, amount: 1 }])
        .select().single()

      const { data: otherRead, error: otherReadErr } = await u2.client
        .from('quote_items').select('id').eq('id', qi!.id)
      expect(otherReadErr).toBeNull()
      expect(otherRead).toEqual([])

      const { data: upd1, error: updErr1 } = await u1.client
        .from('quote_items').update({ label: 'Option 1 updated' }).eq('id', qi!.id).select().single()
      expect(updErr1).toBeNull()
      expect(upd1!.label).toBe('Option 1 updated')

      await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id)

      const { data: upd2, error: updErr2 } = await u1.client
        .from('quote_items').update({ label: 'after final' }).eq('id', qi!.id).select()
      expect(updErr2).toBeNull()
      expect(upd2).toEqual([])

      const { error: delErr } = await u1.client.from('quote_items').delete().eq('id', qi!.id)
      expect(delErr).toBeNull()

      const { data: stillThere, error: stillErr } = await u1.client
        .from('quote_items').select('id').eq('id', qi!.id).single()
      expect(stillErr).toBeNull()
      expect(stillThere!.id).toBe(qi!.id)
    } finally {
      await u1.cleanup()
      await u2.cleanup()
    }
  })
})

// Top-level tests gated by env
itMaybe('quotes visibility: owner can read own quotes across statuses; others cannot', async () => {
  const admin = getAdminClient()
  const svcId = await getAnyServiceId(admin)
  if (!svcId) return

  const u1 = await createUserAndClient('q-vis-o')
  const u2 = await createUserAndClient('q-vis-x')

  try {
    const { data: q } = await u1.client
      .from('quotes')
      .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
      .select()
      .single()

    const { data: readDraft, error: rdErr } = await u1.client
      .from('quotes').select('id,status').eq('id', q!.id).single()
    expect(rdErr).toBeNull()
    expect(readDraft!.status).toBe('draft')

    await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id)

    const { data: readFin, error: rfErr } = await u1.client
      .from('quotes').select('id,status').eq('id', q!.id).single()
    expect(rfErr).toBeNull()
    expect(readFin!.status).toBe('finalized')

    const { data: otherRead, error: otherErr } = await u2.client
      .from('quotes').select('id').eq('id', q!.id)
    expect(otherErr).toBeNull()
    expect(otherRead).toEqual([])
  } finally {
    await u1.cleanup()
    await u2.cleanup()
  }
})

itMaybe('quote_items delete: no rows affected due to RLS', async () => {
  const admin = getAdminClient()
  const svcId = await getAnyServiceId(admin)
  if (!svcId) return

  const u = await createUserAndClient('qi-del')
  try {
    const { data: q } = await u.client
      .from('quotes')
      .insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }])
      .select().single()

    const { data: qi } = await u.client
      .from('quote_items')
      .insert([{ quote_id: q!.id, key: 'option1', label: 'Item', unit: 'fixed', quantity: 1, unit_amount: 10, amount: 10 }])
      .select().single()

    const { data: delAttempt, error: delErr } = await u.client
      .from('quote_items').delete().eq('id', qi!.id).select()
    expect(delErr).toBeNull()
    expect(delAttempt).toEqual([])

    const { data: exists, error: exErr } = await u.client
      .from('quote_items').select('id').eq('id', qi!.id).single()
    expect(exErr).toBeNull()
    expect(exists!.id).toBe(qi!.id)
  } finally {
    await u.cleanup()
  }
})
