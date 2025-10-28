Tab-Out / Tab-In Focus Issue – Summary and Solution

Problem Summary
- Users reported that switching tabs (or backgrounding the window) and returning caused:
  • Noticeable lag (~4 seconds) before the Save button responded
  • Occasionally missing/restored-empty field values
- Root causes:
  • DB-only hydration on focus could be slow and racy
  • No immediate local restore; depended on network roundtrip
  • Drafts not consistently cached per (user, order, form type)

Solution Overview
- Implement a cache-first draft system in the Forms screen using localStorage, mirroring the main screen’s strategy.
- Add a small debounce for autosave to keep local drafts fresh without spamming storage
- Clear the precise draft key on final Confirm to avoid stale rehydration later
- Keep server hydration in place as a background fallback (and for cross-device continuity)

Text Block Diagram

  [User types in fields]
        |
        v
  FormClient state (formValues)
        |
        | debounced (≈350ms)
        v
  localStorage (JSON draft)
  - Keys:
    • form_draft_v1::<uid>::<orderId|none>::<type|notype>
    • form_last_by_type_v1::<uid>::<type|notype>
        ^
        | on mount/focus
        |
  Cache-first seed
  - If exact draft exists, set formValues immediately
  - Else, use last-by-type as soft prefill
        |
        v
  Background DB lookup
  - Load latest form_responses for (user, order, type)
  - If none, optionally suggest prefill from latest response of same type
        |
        v
  Confirm action
  - Persist to DB with completed=true
  - Clear exact draft key to avoid stale reopen values

Key Code Touchpoints
- File: app/forms/FormClient.tsx
  • Helpers: FORM_CACHE_VER, formDraftKey, lastByTypeKey, hasNonEmpty
  • Cache-first seed effect: runs when selectedType/orderId changes; seeds from exact key, else last-by-type
  • Autosave effect: debounce 350ms; writes to both exact and last-by-type keys
  • On Confirm: after successful upsert, removes the exact draft key
  • FLOW_DEBUG: debug-only logs/attachment info rendering; not shown to end users

UX Impact
- Immediate field restoration when returning to the tab (no spinner/lag dependency)
- Save button remains responsive; background saves continue
- Confirmed forms re-open in read-only confirm mode if completed on that order

Edge Cases
- Empty forms: autosave skipped until a non-empty value exists (avoid polluting cache)
- Type switch: last-by-type fallback seeds relevant keys only
- Multi-order: draft keys include order id so drafts don’t leak across orders
- Storage errors: try/catch guards prevent failures from breaking the UI
- Server failures: local drafts still present; user can retry save

Operational Notes
- Keys are versioned (FORM_CACHE_VER) for future migrations
- Debounce interval (350ms) tuned for perceived responsiveness
- LocalStorage size is small due to text-only fields; attachments are stored in Supabase Storage, not cached locally

Follow-ups (if desired)
- Add “Clear Draft” button for manual reset
- Surface a subtle “Restored from draft” toast on seed for user clarity
- Persist font-size/bold prefs (implemented) and consider per-field restore cues
