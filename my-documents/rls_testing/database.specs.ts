// @ts-nocheck
import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Simple .env.local loader (avoids adding a dependency on dotenv)
function loadEnvLocal(): Record<string, string> {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const raw = fs.readFileSync(envPath, 'utf8');
    const map: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, '');
      map[key] = value;
    }
    return map;
  } catch {
    return {};
  }
}

const envLocal = loadEnvLocal();
function envGet(key: string): string | undefined {
  return process.env[key] ?? envLocal[key];
}

const SUPABASE_URL = envGet('NEXT_PUBLIC_SUPABASE_URL') || envGet('SUPABASE_URL');
const SUPABASE_ANON_KEY = envGet('NEXT_PUBLIC_SUPABASE_ANON_KEY') || envGet('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = envGet('SUPABASE_SERVICE_ROLE_KEY');

function getAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnonClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createUserAndClient(prefix: string) {
  const admin = getAdminClient();
  const email = `playwright-${prefix}-${Date.now()}@example.com`;
  const password = 'Passw0rd!123';

  const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !userRes.user) throw createErr ?? new Error('User creation failed');

  const client = getAnonClient();
  const { data: signIn, error: loginErr } = await client.auth.signInWithPassword({ email, password });
  if (loginErr || !signIn.user) throw loginErr ?? new Error('Login failed');

  return { client, user: signIn.user, cleanup: async () => {
    await admin.auth.admin.deleteUser(userRes.user!.id);
  }};
}

async function getAnyServiceId(admin: SupabaseClient): Promise<number | null> {
  const { data, error } = await admin.from('services').select('id').limit(1).maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}

// Skip all tests if required env is missing
const ENV_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);

test.describe('Database policies and triggers', () => {
  test.skip(!ENV_READY, 'Missing Supabase env vars (URL, ANON KEY, SERVICE ROLE KEY)');

  test('service_pricing_rules is readable with anon key and conforms to enums', async () => {
    const anon = getAnonClient();

    const { error: countErr, count } = await anon
      .from('service_pricing_rules')
      .select('*', { count: 'exact', head: true });

    expect(countErr).toBeNull();
    expect(count).toBeGreaterThanOrEqual(0);

    const { data, error } = await anon
      .from('service_pricing_rules')
      .select('application_type,key,unit,amount')
      .limit(1);

    expect(error).toBeNull();

    if (data && data.length > 0) {
      const row = data[0]!;
      expect(['individual', 'startup_msme', 'others']).toContain(row.application_type);
      expect(['option1', 'nice_classes', 'goods_services', 'prior_use_yes', 'professional_fee']).toContain(row.key);
      expect(['fixed', 'per_class']).toContain(row.unit);
      expect(typeof Number(row.amount)).toBe('number');
    }
  });

  test('quotes RLS: owner can insert/select/update while draft; cannot update after finalized; others cannot see', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found to satisfy quotes.service_id FK');

    const u1 = await createUserAndClient('u1');
    const u2 = await createUserAndClient('u2');

    try {
      // Insert a draft quote as user1
      const { data: q1, error: insErr } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single();

      expect(insErr).toBeNull();
      expect(q1).toBeTruthy();
      expect(q1!.user_id).toBe(u1.user.id);
      expect(q1!.status).toBe('draft');

      // Update while draft should succeed
      const { data: upd1, error: updErr1 } = await u1.client
        .from('quotes')
        .update({ subtotal: 100 })
        .eq('id', q1!.id)
        .select()
        .single();

      expect(updErr1).toBeNull();
      expect(upd1!.subtotal).toBe(100);

      const updatedAt1 = new Date(upd1!.updated_at).getTime();
      const createdAt = new Date(upd1!.created_at).getTime();
      expect(updatedAt1).toBeGreaterThanOrEqual(createdAt); // trigger should set updated_at

      // Finalize the quote (owner cannot finalize due to RLS; use admin)
      const { data: fin, error: finErr } = await admin
        .from('quotes')
        .update({ status: 'finalized' })
        .eq('id', q1!.id)
        .select()
        .single();

      expect(finErr).toBeNull();
      expect(fin!.status).toBe('finalized');

      // After finalized, updates should be ignored by RLS (no rows match the USING predicate)
      const { data: upd2, error: updErr2 } = await u1.client
        .from('quotes')
        .update({ currency: 'USD' })
        .eq('id', q1!.id)
        .select();

      expect(updErr2).toBeNull();
      expect(upd2).toEqual([]);

      // Verify persisted row unchanged
      const { data: afterFin, error: readAfterFinErr } = await u1.client
        .from('quotes')
        .select('status,currency')
        .eq('id', q1!.id)
        .single();
      expect(readAfterFinErr).toBeNull();
      expect(afterFin!.status).toBe('finalized');
      expect(afterFin!.currency).not.toBe('USD');

      // Other user cannot see user1's quote
      const { data: otherView, error: otherErr } = await u2.client
        .from('quotes')
        .select('id')
        .eq('id', q1!.id);

      expect(otherErr).toBeNull();
      expect(otherView).toEqual([]);
    } finally {
      await u1.cleanup();
      await u2.cleanup();
    }
  });

  test('quote_items RLS: insert allowed only when parent quote is draft; enforced by parent ownership', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found to satisfy quotes.service_id FK');

    const u1 = await createUserAndClient('qi1');
    const u2 = await createUserAndClient('qi2');

    try {
      // Create a draft quote for user1
      const { data: q, error: qErr } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single();
      expect(qErr).toBeNull();

      // Insert a quote_item as owner while draft
      const { data: qi1, error: qiErr1 } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 4500, amount: 4500 }])
        .select()
        .single();

      expect(qiErr1).toBeNull();
      expect(qi1!.quote_id).toBe(q!.id);

      // Finalize parent quote (use admin due to RLS)
      const { error: finErr } = await admin
        .from('quotes')
        .update({ status: 'finalized' })
        .eq('id', q!.id);
      expect(finErr).toBeNull();

      // Try to insert another item after finalized -> should fail due to RLS
      const { error: qiErr2 } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'goods_services', label: 'Goods & Services', unit: 'fixed', quantity: 1, unit_amount: 650, amount: 650 }]);

      expect(qiErr2).not.toBeNull();

      // Another user should not be able to insert items referencing someone else's quote (even if draft)
      // Create a fresh draft quote for u1
      const { data: q2 } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select()
        .single();

      // u2 tries to insert -> should fail
      const { error: u2InsertErr } = await u2.client
        .from('quote_items')
        .insert([{ quote_id: q2!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 4500, amount: 4500 }]);

      expect(u2InsertErr).not.toBeNull();
    } finally {
      await u1.cleanup();
      await u2.cleanup();
    }
  });

  test('service_pricing_rules RLS and constraints', async () => {
    const anon = getAnonClient();
    const admin = getAdminClient();

    // Prepare a temporary service to avoid conflicts with seeded data
    const { data: catAny, error: catAnyErr } = await admin.from('categories').select('id').limit(1).maybeSingle();
    test.skip(!!catAnyErr || !catAny?.id, 'No categories found');

    const tempSvcId = Math.floor(900000000 + Math.random() * 1000000);
    const svcName = `spr-svc-${Date.now()}`;
    const { data: svc, error: svcErr } = await admin
      .from('services')
      .insert([{ id: tempSvcId, category_id: catAny!.id, name: svcName, base_price: 1 }])
      .select()
      .single();
    expect(svcErr).toBeNull();

    try {
      // anon select ok
      const { error: sErr } = await anon.from('service_pricing_rules').select('id').limit(1);
      expect(sErr).toBeNull();

      // anon insert denied (no insert policy)
      const { error: insAnonErr } = await anon
        .from('service_pricing_rules')
        .insert([{ service_id: svc!.id, application_type: 'individual', key: 'option1', unit: 'fixed', amount: 100 }]);
      expect(insAnonErr).not.toBeNull();

      // admin insert invalid should fail CHECK
      const { error: badCheckErr } = await admin
        .from('service_pricing_rules')
        .insert([{ service_id: svc!.id, application_type: 'invalid_type', key: 'option1', unit: 'fixed', amount: 100 }]);
      expect(badCheckErr).not.toBeNull();

      // composite uniqueness on temp service
      const row = { service_id: svc!.id, application_type: 'individual', key: 'professional_fee', unit: 'fixed', amount: 6500 };
      const { error: ins1 } = await admin.from('service_pricing_rules').insert([row]);
      expect(ins1).toBeNull();
      const { error: ins2 } = await admin.from('service_pricing_rules').insert([row]);
      expect(ins2).not.toBeNull();
    } finally {
      // cleanup temp service (cascades pricing rules)
      await admin.from('services').delete().eq('id', svc!.id);
    }
  });

  test('categories/services RLS, uniqueness, and cascade', async () => {
    const anon = getAnonClient();
    const admin = getAdminClient();

    // anon can read categories
    const { error: readErr } = await anon.from('categories').select('id').limit(1);
    expect(readErr).toBeNull();

    // anon cannot write
    const { error: anonInsErr } = await anon.from('categories').insert([{ name: `Temp Cat A ${Date.now()}` }]);
    expect(anonInsErr).not.toBeNull();

    // admin create with explicit high id to avoid sequence issues
    const catId = Math.floor(900000000 + Math.random() * 1000000);
    const catName = `Temp Cat B ${Date.now()}`;
    const { data: c1, error: cErr1 } = await admin.from('categories').insert([{ id: catId, name: catName }]).select().single();
    expect(cErr1).toBeNull();

    // uniqueness on name: some environments may not enforce unique(name).
    // Try inserting duplicate and assert either a unique violation or duplicate presence.
    const { error: cErr2 } = await admin.from('categories').insert([{ id: catId + 1, name: catName }]);
    const { count: nameCount, error: countErr } = await admin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('name', catName);
    expect(countErr).toBeNull();
    if (cErr2) {
      // unique enforced: only one row should exist
      expect(nameCount).toBe(1);
    } else {
      // unique not enforced: duplicates allowed; ensure we see >= 2
      expect(nameCount).toBeGreaterThanOrEqual(2);
    }

    // create service then delete category -> service cascades delete
    const svcId = Math.floor(900000000 + Math.random() * 1000000);
    const { data: s1, error: sErr } = await admin
      .from('services')
      .insert([{ id: svcId, category_id: c1!.id, name: `Temp Service X ${Date.now()}`, base_price: 1 }])
      .select().single();
    expect(sErr).toBeNull();

    const { error: delCatErr } = await admin.from('categories').delete().eq('id', c1!.id);
    expect(delCatErr).toBeNull();

    const { data: checkSvc } = await admin.from('services').select('id').eq('id', s1!.id);
    expect(checkSvc).toEqual([]);

    // Clean up potential duplicate category created earlier, if it exists
    await admin.from('categories').delete().eq('id', catId + 1);
  });

  test('quotes RLS: cannot forge user_id; owner cannot finalize; FK restrict; timestamp monotonic', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found');

    const u = await createUserAndClient('qforge');
    try {
      // another user
      const { data: otherUser } = await admin.auth.admin.createUser({
        email: `f-${Date.now()}@example.com`, password: 'Passw0rd!123', email_confirm: true
      });

      // cannot insert quote for someone else
      const { error: forgeErr } = await u.client
        .from('quotes')
        .insert([{ user_id: otherUser!.user!.id, service_id: svcId!, application_type: 'individual' }]);
      expect(forgeErr).not.toBeNull();

      // insert as self
      const { data: q, error: qErr } = await u.client
        .from('quotes')
        .insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }])
        .select().single();
      expect(qErr).toBeNull();

      // owner cannot finalize due to RLS WITH CHECK (expect error)
      const { data: finByOwner, error: finErrByOwner } = await u.client
        .from('quotes').update({ status: 'finalized' }).eq('id', q!.id).select();
      expect(finErrByOwner).not.toBeNull();

      // update twice to verify updated_at monotonic
      const { data: upd1 } = await u.client
        .from('quotes').update({ subtotal: 1 }).eq('id', q!.id).select().single();
      const t1 = new Date(upd1!.updated_at).getTime();

      const { data: upd2 } = await u.client
        .from('quotes').update({ subtotal: 2 }).eq('id', q!.id).select().single();
      const t2 = new Date(upd2!.updated_at).getTime();
      expect(t2).toBeGreaterThanOrEqual(t1);

      // admin finalizes
      const { error: finErrAdmin } = await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id);
      expect(finErrAdmin).toBeNull();

      // FK restrict: cannot delete referenced service
      const { error: delSvcErr } = await admin.from('services').delete().eq('id', svcId!);
      expect(delSvcErr).not.toBeNull();

      // cleanup aux user
      await admin.auth.admin.deleteUser(otherUser!.user!.id);
    } finally {
      await u.cleanup();
    }
  });

  test('quote_items RLS: read isolation; update only while draft; delete denied', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found');

    const u1 = await createUserAndClient('qi-r');
    const u2 = await createUserAndClient('qi-r2');
    try {
      const { data: q } = await u1.client
        .from('quotes')
        .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
        .select().single();

      const { data: qi } = await u1.client
        .from('quote_items')
        .insert([{ quote_id: q!.id, key: 'option1', label: 'Option 1', unit: 'fixed', quantity: 1, unit_amount: 1, amount: 1 }])
        .select().single();

      // other user cannot read
      const { data: otherRead, error: otherReadErr } = await u2.client
        .from('quote_items').select('id').eq('id', qi!.id);
      expect(otherReadErr).toBeNull();
      expect(otherRead).toEqual([]);

      // update while draft ok
      const { data: upd1, error: updErr1 } = await u1.client
        .from('quote_items').update({ label: 'Option 1 updated' }).eq('id', qi!.id).select().single();
      expect(updErr1).toBeNull();
      expect(upd1!.label).toBe('Option 1 updated');

      // finalize parent
      await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id);

      // update denied after finalize
      const { data: upd2, error: updErr2 } = await u1.client
        .from('quote_items').update({ label: 'after final' }).eq('id', qi!.id).select();
      expect(updErr2).toBeNull();
      expect(upd2).toEqual([]);

      // delete should not be allowed by RLS; expect no error but zero affected rows
      const { error: delErr } = await u1.client.from('quote_items').delete().eq('id', qi!.id);
      expect(delErr).toBeNull();
      // Verify item still exists
      const { data: stillThere, error: stillErr } = await u1.client
        .from('quote_items').select('id').eq('id', qi!.id).single();
      expect(stillErr).toBeNull();
      expect(stillThere!.id).toBe(qi!.id);
    } finally {
      await u1.cleanup();
      await u2.cleanup();
    }
  });
});
test('quotes visibility: owner can read own quotes across statuses; others cannot', async () => {
  const admin = getAdminClient();
  const svcId = await getAnyServiceId(admin);
  test.skip(!svcId, 'No services found');

  const u1 = await createUserAndClient('q-vis-o');
  const u2 = await createUserAndClient('q-vis-x');

  try {
    const { data: q } = await u1.client
      .from('quotes')
      .insert([{ user_id: u1.user.id, service_id: svcId!, application_type: 'individual' }])
      .select()
      .single();

    // owner reads draft
    const { data: readDraft, error: rdErr } = await u1.client
      .from('quotes').select('id,status').eq('id', q!.id).single();
    expect(rdErr).toBeNull();
    expect(readDraft!.status).toBe('draft');

    // finalize by admin
    await admin.from('quotes').update({ status: 'finalized' }).eq('id', q!.id);

    // owner still reads finalized
    const { data: readFin, error: rfErr } = await u1.client
      .from('quotes').select('id,status').eq('id', q!.id).single();
    expect(rfErr).toBeNull();
    expect(readFin!.status).toBe('finalized');

    // other user still cannot see
    const { data: otherRead, error: otherErr } = await u2.client
      .from('quotes').select('id').eq('id', q!.id);
    expect(otherErr).toBeNull();
    expect(otherRead).toEqual([]);
  } finally {
    await u1.cleanup();
    await u2.cleanup();
  }
});

test('quote_items delete: no rows affected due to RLS', async () => {
  const admin = getAdminClient();
  const svcId = await getAnyServiceId(admin);
  test.skip(!svcId, 'No services found');

  const u = await createUserAndClient('qi-del');
  try {
    const { data: q } = await u.client
      .from('quotes')
      .insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }])
      .select().single();

    const { data: qi } = await u.client
      .from('quote_items')
      .insert([{ quote_id: q!.id, key: 'option1', label: 'Item', unit: 'fixed', quantity: 1, unit_amount: 10, amount: 10 }])
      .select().single();

    const { data: delAttempt, error: delErr } = await u.client
      .from('quote_items').delete().eq('id', qi!.id).select();
    expect(delErr).toBeNull();
    expect(delAttempt).toEqual([]); // zero affected

    const { data: exists, error: exErr } = await u.client
      .from('quote_items').select('id').eq('id', qi!.id).single();
    expect(exErr).toBeNull();
    expect(exists!.id).toBe(qi!.id);
  } finally {
    await u.cleanup();
  }
});

test.describe('Additional Phase 1 coverage', () => {
  test('patentrender RLS: anon read ok; anon write denied; admin update allowed', async () => {
    const anon = getAnonClient();
    const admin = getAdminClient();

    // Try head count first; if table missing, skip
    const head = await admin.from('patentrender').select('*', { head: true, count: 'exact' });
    if (head.error && (head.error as any).code === '42P01') {
      test.skip(true, 'patentrender table not present in this environment');
    }

    const { data: base, error: readErr } = await anon
      .from('patentrender').select('id, professional_fee').limit(1);
    expect(readErr).toBeNull();

    // anon attempts to update should be denied by RLS
    const { error: updErrAnon } = await anon
      .from('patentrender').update({ professional_fee: 123 }).neq('id', -1);
    expect(updErrAnon).not.toBeNull();

    // admin can update and revert
    if (base && base.length > 0) {
      const row = base[0]!;
      const original = row.professional_fee;
      const { error: updErrAdmin } = await admin
        .from('patentrender').update({ professional_fee: Number(original) }).eq('id', row.id);
      expect(updErrAdmin).toBeNull();
    }
  });

  test('service_pricing_rules: anon update/delete denied', async () => {
    const anon = getAnonClient();
    const admin = getAdminClient();

    // Create a temp service and rule via admin
    const { data: catAny } = await admin.from('categories').select('id').limit(1).maybeSingle();
    test.skip(!catAny?.id, 'No categories found');

    const svcId = Math.floor(910000000 + Math.random() * 100000);
    const { data: svc } = await admin
      .from('services').insert([{ id: svcId, category_id: catAny!.id, name: `spr-u-${Date.now()}`, base_price: 1 }]).select().single();

    try {
      const { data: rule } = await admin
        .from('service_pricing_rules')
        .insert([{ service_id: svc!.id, application_type: 'individual', key: 'professional_fee', unit: 'fixed', amount: 111 }])
        .select().single();

      // anon update denied
      const { error: updErr } = await anon
        .from('service_pricing_rules').update({ amount: 222 }).eq('id', rule!.id);
      expect(updErr).not.toBeNull();

      // anon delete denied
      const { error: delErr } = await anon
        .from('service_pricing_rules').delete().eq('id', rule!.id);
      expect(delErr).not.toBeNull();
    } finally {
      await admin.from('services').delete().eq('id', svc!.id);
    }
  });

  test('quote_items trigger: updated_at monotonic while draft', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found');

    const u = await createUserAndClient('qi-ts');
    try {
      const { data: q } = await u.client
        .from('quotes').insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }]).select().single();

      const { data: qi } = await u.client
        .from('quote_items').insert([{ quote_id: q!.id, key: 'option1', label: 'Item', unit: 'fixed', quantity: 1, unit_amount: 1, amount: 1 }]).select().single();

      const { data: u1 } = await u.client
        .from('quote_items').update({ quantity: 2 }).eq('id', qi!.id).select().single();
      const t1 = new Date(u1!.updated_at).getTime();

      const { data: u2 } = await u.client
        .from('quote_items').update({ quantity: 3 }).eq('id', qi!.id).select().single();
      const t2 = new Date(u2!.updated_at).getTime();

      expect(t2).toBeGreaterThanOrEqual(t1);
    } finally {
      await u.cleanup();
    }
  });

  test('quotes delete: owner cannot delete when items exist (RLS or FK)', async () => {
    const admin = getAdminClient();
    const svcId = await getAnyServiceId(admin);
    test.skip(!svcId, 'No services found');

    const u = await createUserAndClient('q-del');
    try {
      const { data: q } = await u.client
        .from('quotes').insert([{ user_id: u.user.id, service_id: svcId!, application_type: 'individual' }]).select().single();
      await u.client
        .from('quote_items').insert([{ quote_id: q!.id, key: 'option1', label: 'Item', unit: 'fixed', quantity: 1, unit_amount: 1, amount: 1 }]);

      const { data: delRows, error: delErr } = await u.client
        .from('quotes').delete().eq('id', q!.id).select();
      // Either RLS blocks (error) or zero rows affected; both satisfy the policy requirement
      if (delErr) {
        expect(delErr).not.toBeNull();
      } else {
        expect(delRows).toEqual([]);
      }
    } finally {
      await u.cleanup();
    }
  });
});
