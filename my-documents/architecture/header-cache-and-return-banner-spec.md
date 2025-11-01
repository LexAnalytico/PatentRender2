# Minimal Header User Cache and Soft Return Banner — Implementation Spec

Last updated: 2025-11-01

## Goals

- Eliminate header “missing username” flicker on tab-in/refresh while Supabase rehydrates.
- Keep security tight: never persist tokens or privileged state client-side.
- Provide a gentle UX cue when users return to forms after tabbing away.
- Integrate cleanly with existing return-to-main on tab-in policy (hard reset path).

## Non-goals

- Do not change Supabase auth/session persistence. That remains source of truth.
- Do not auto-restore to Forms when force-hard-reset policy is on.

---

## Feature flags (build-time, public)

- `NEXT_PUBLIC_HEADER_CACHE_TTL_MS` (default: `600000` = 10 minutes)
  - Controls max age for the header user cache. Cache is ignored and cleared when stale.

- `NEXT_PUBLIC_ENABLE_RETURN_BANNER` (default: `1`)
  - Enables the soft “You switched away…” banner when returning to Forms.

- `NEXT_PUBLIC_RETURN_BANNER_COOLDOWN_MS` (default: `15000` = 15 seconds)
  - Prevents showing the return banner more than once within the cooldown window.

- Existing (kept as-is): `NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR`
  - When `1`, we already force a hard refresh on tab-in from sensitive views and land on Home.

Optional (future):
- `NEXT_PUBLIC_PRIVACY_LOCK` (default: `0`)
  - When `1`, show a privacy overlay after hidden/idle thresholds. Not part of this immediate implementation.

---

## Header user cache

### Storage key and schema

- LocalStorage key: `app:header_user_cache`
- JSON schema (v1):
  ```json
  {
    "ver": 1,
    "ts": 1730448000000,            // write timestamp (ms)
    "uid": "uuid-or-null",         // Supabase user id
    "email": "user@example.com",  // lowercased
    "name": "Display Name",       // optional safe display
    "avatarUrl": "https://..."     // optional
  }
  ```

Notes:
- No tokens or roles are ever stored.
- Only minimal, non-sensitive header display fields.

### Write points

Preferred single writer to avoid races:
- In `app/useAuthProfile.ts` (or a small shared hook used by Header), after a successful session/user resolution:
  - If `session.user.id` exists, write the cache object with `ver=1`, `ts=Date.now()`.
  - Normalize: lowercase `email`, trim `name`.
  - If SIGNED_OUT event fires, immediately `removeItem('app:header_user_cache')`.

Fallback writer (if decoupled):
- In `components/layout/Header.tsx`, when we render a confirmed user for the first time, write the cache too. This ensures the cache exists even if profile hook refactors later.

### Read points

- In `components/layout/Header.tsx` on mount:
  1) Attempt to read `app:header_user_cache` once.
  2) Validate TTL (`Date.now() - ts <= HEADER_CACHE_TTL_MS`). If stale, remove and ignore.
  3) If valid and we do not yet have a Supabase user, render the header with the cached values as a “hinted” state.
  4) When Supabase session rehydrates:
     - If `rehydratedUser.id === cache.uid`, keep showing data (now authoritative).
     - If mismatch or null, immediately clear the cache and update UI accordingly.

### Invalidation rules

- SIGNED_OUT event → remove cache.
- User id mismatch → remove cache.
- TTL expired → remove cache on read.
- Optional: clear cache if we detect a server-driven username/email change that differs from cache (rare; rely on id match + TTL for now).

### Edge cases & safeguards

- Multi-tab sign-out: each tab listens to auth events; cache is removed everywhere on next focus/pageshow or auth event.
- Offline: cached header can still show; once online, auth rehydrates and reconciles.
- Privacy: data is minimal; still safe to clear on `beforeunload` if required, but recommended to keep TTL behavior for UX.

---

## Soft return banner (Forms)

### Purpose

When a user tabs away from an active form (or a recently active forms context) and returns, show a small, non-blocking reminder to review/save their inputs.

### Triggers

- On `focus` or `pageshow` in `app/page.tsx`:
  - If any of the following markers are true in localStorage/sessionStorage:
    - `app:forms_active` === `"1"` (set when any form view is active)
    - `app:form_dirty` === `"1"` (set when a controlled field changes)
    - `app:last_view` starts with `"quote:forms"` (legacy mapping) and `app:last_view_home_lock` not set in last 2s
  - AND banner cooldown satisfied (see below), then show banner.

### Cooldown and suppression

- LocalStorage key: `app:last_return_banner_ts`
- Show only if `Date.now() - Number(app:last_return_banner_ts || 0) >= RETURN_BANNER_COOLDOWN_MS`.
- Do not show if we landed on Home via a forced hard reset and there is no recent forms activity marker.
- Do not show if no user is signed in (avoid confusion on public landing).

### Banner content (copy)

- Title: "You switched away from the app"
- Body: "Please review and save your form details to avoid losing changes."
- Actions:
  - Primary: "Review forms" → navigates to Orders with the last opened form(s) banner (re-using existing transient banner logic, if present).
  - Secondary: "Dismiss" → closes the banner.

### Integration points

- Set/clear `app:forms_active` and `app:form_dirty` in the forms components/hooks where field edits are tracked.
- In `app/page.tsx` focus/pageshow handlers (already present), after handling return-to-main logic:
  - If `NEXT_PUBLIC_ENABLE_RETURN_BANNER !== '1'`, skip.
  - Read markers and cooldown; render a toast/banner component in-page (no modal).
  - On show, update `app:last_return_banner_ts = Date.now()`.

---

## Interaction with force-hard-reset policy

- When `NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR=1`, we already land on Home using the same hard refresh as the manual Refresh button.
- Header cache ensures the username shows immediately even after the hard refresh while auth rehydrates.
- Soft banner only appears when there’s a recent forms context and cooldown is satisfied, preventing noise.

---

## Implementation notes (files and touchpoints)

- `components/layout/Header.tsx`
  - Read cache on mount; render hinted values until Supabase rehydrates.
  - Write cache when user becomes available.

- `app/useAuthProfile.ts`
  - On session/user success: write cache.
  - On SIGNED_OUT: clear cache.

- `app/page.tsx`
  - Focus/pageshow: after existing hard reset path, evaluate soft banner conditions and cooldown.
  - Provide banner UI (toast) and click-through to Orders with existing last-form banner logic if available.

- Forms components/hooks
  - Set `app:forms_active = '1'` on mount; clear on unmount.
  - Toggle `app:form_dirty` to `"1"` on first change; optionally clear on save/submission.

---

## Pseudocode

### Header cache (read in Header)

```ts
const TTL = Number(process.env.NEXT_PUBLIC_HEADER_CACHE_TTL_MS || '600000')
function readHeaderCache() {
  try {
    const raw = localStorage.getItem('app:header_user_cache')
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (obj?.ver !== 1) return null
    if (Date.now() - Number(obj.ts || 0) > TTL) {
      localStorage.removeItem('app:header_user_cache')
      return null
    }
    return obj as { uid: string, email?: string, name?: string, avatarUrl?: string }
  } catch { return null }
}
```

### Header cache (write in useAuthProfile or Header when user ready)

```ts
function writeHeaderCache(u: { id: string, email?: string|null, user_metadata?: any }) {
  try {
    const cache = {
      ver: 1,
      ts: Date.now(),
      uid: u.id,
      email: (u.email || '').toLowerCase(),
      name: (u.user_metadata?.full_name || '').toString().trim().slice(0, 128),
      avatarUrl: (u.user_metadata?.avatar_url || '').toString().slice(0, 1024)
    }
    localStorage.setItem('app:header_user_cache', JSON.stringify(cache))
  } catch {}
}

function clearHeaderCache() { try { localStorage.removeItem('app:header_user_cache') } catch {} }
```

### Soft return banner (in app/page.tsx focus/pageshow path)

```ts
const ENABLE = process.env.NEXT_PUBLIC_ENABLE_RETURN_BANNER === '1'
const COOLDOWN = Number(process.env.NEXT_PUBLIC_RETURN_BANNER_COOLDOWN_MS || '15000')

function shouldShowReturnBanner() {
  if (!ENABLE) return false
  try {
    const lastTs = Number(localStorage.getItem('app:last_return_banner_ts') || '0')
    if (Date.now() - lastTs < COOLDOWN) return false
    const active = localStorage.getItem('app:forms_active') === '1'
    const dirty = localStorage.getItem('app:form_dirty') === '1'
    const lastView = localStorage.getItem('app:last_view') || ''
    const fromForms = active || dirty || lastView.startsWith('quote:forms')
    return !!fromForms
  } catch { return false }
}

function markReturnBannerShown() {
  try { localStorage.setItem('app:last_return_banner_ts', String(Date.now())) } catch {}
}
```

---

## Rollout plan

1) Implement header cache read/write/clear with TTL (feature flag TTL only). Verify no tokens/roles are persisted.
2) Implement soft banner with cooldown and forms markers.
3) Validate against the force-hard-reset flow on Safari/Chrome in production.
4) (Optional) Add privacy lock feature flag in a separate PR.

---

## Success criteria

- On tab-in after hard reset, header shows username immediately (from cache) and remains correct after auth rehydrates.
- No stale or mismatched header data persists after sign-out or user switch.
- Soft banner shows only when returning from a forms context and not more than once per cooldown.

---

## Test checklist

- Header cache
  - Sign in → refresh → username shows instantly; after rehydrate, id matches and header persists.
  - Sign out in another tab → current tab clears cache on focus/pageshow; header shows signed-out state.
  - TTL expiry → cache ignored and removed.

- Soft banner
  - Start a form, make an edit (dirty) → tab out/in → banner shows once; clicking “Review forms” navigates appropriately.
  - Within cooldown → banner does not reappear.
  - No forms context → banner does not show.

---

## Security notes

- Only minimal, non-sensitive fields are written to localStorage. No tokens or roles.
- Cache is short-lived and cleared on sign-out and user-id mismatch.
- Works across browsers and Vercel without server changes.
