Tab Focus Guidelines (Value Fields & Control Buttons)

Goal
- Ensure screens remain responsive and stateful across tab-out/tab-in, minimizing user-visible lag and preventing lost input.

Text Block Diagram

  [User Interaction]
       |                 (blur/focus)
       v                        |
  Controlled Inputs  ---->  Focus Manager
       |                        |
       | debounce save          | on focus: restore state, re-enable controls
       v                        v
  Local Draft Cache  <----  Availability Guard (network/auth)
       |                        |
       | background sync        | stale/slow network tolerant
       v                        v
  Server Persistence      Progressive UI (spinner, retry)

Core Rules

1) Cache-first drafts for values
- Use versioned keys with user/order/type context:
  • form_draft_v1::<uid>::<orderId|none>::<type|notype>
  • form_last_by_type_v1::<uid>::<type|notype>
- On mount/focus: hydrate from exact key; if absent, from last-by-type
- Debounce autosave (≈300–500ms) on change; skip when form is entirely empty
- Clear the exact draft key on final Confirm/Submit

2) Non-blocking server loads
- Never block inputs on network; seed from cache, then merge server data when it arrives
- If server returns a complete response for the same (user, order, type), replace state; else suggest prefill subset

3) Focus/visibility handling
- Listen to visibilitychange and window focus to:
  • Re-run cache seed if state is empty
  • Kick off background refresh when stale (optional)
  • Re-enable controls (disable only during explicit, short operations)

4) Control buttons (Save/Submit/Refill)
- Keep buttons responsive; guard long ops with a short timeout fallback (e.g., 10–15s)
- On timeout: surface a friendly message, allow retry, and keep local draft intact
- Do not permanently disable controls after focus changes

5) Read-only/confirm state
- Enter confirm mode only after explicit Submit; keep readOnly true until Edit is chosen
- When leaving confirm (Edit), programmatically focus a top anchor and scroll it into view

6) Error and debug visibility
- Show only user-friendly messages by default; gate verbose debug behind a runtime flag (e.g., window.FORM_FLOW_DEBUG)
- Avoid leaking internal states like RLS timeouts or row counts in normal UI

7) Preferences persistence
- Persist small UI preferences (font size, bold) in localStorage independently from drafts
- Restore them on mount without blocking

8) Attachments
- Never cache files in localStorage; rely on Supabase Storage and metadata rows
- Load attachments with a safety timeout; allow manual Reload
- Scope attachment lists by (user, order, form type); filter by category prefixes in names

9) Keyed isolation
- Ensure drafts are isolated across users, orders, and form types by including all three in the exact key
- For multi-order screens, ensure each embedded form instance uses its own key space

10) Testing checklist
- Type → tab-out → tab-in: values present immediately; Save responsive
- Switch types: last-by-type prefill works; no cross-leak between orders
- Confirm clears drafts; reopen shows read-only with saved values
- Simulate slow network: UI remains usable; server data merges later
- Attachment reloads handle timeouts; manual reload works

Reference Implementation
- See app/forms/FormClient.tsx
  • Cache helpers: formDraftKey, lastByTypeKey, hasNonEmpty
  • Cache-first seed effect on mount/type/order change
  • Debounced autosave (≈350ms)
  • Clear-on-confirm logic after upsert
  • FLOW_DEBUG-gated logs and attachment debug rendering
