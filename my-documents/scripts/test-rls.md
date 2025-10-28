# DB RLS tests: how to run

This repo includes direct database RLS tests in `rls_testing/database.specs.ts`. They use admin and anon Supabase clients and don’t require a browser.

## Prereqs
- Node 18+
- Supabase project with the app schema deployed
- Environment variables available to the test runner:
  - `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
  - `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - `SUPABASE_SERVICE_ROLE_KEY`

You can set them in a local `.env.local` at the repo root, or export them in your shell/CI.

```
SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The spec file has a tiny `.env.local` reader built-in; process env wins over file values.

## Option A — Run with Playwright’s test runner
This is the quickest path if you already use Playwright.

1) Install dev dependency (one-time):

```bash
npm i -D @playwright/test
```

2) Run just the DB RLS specs:

```bash
npx playwright test rls_testing/database.specs.ts --reporter=dot
```

Notes
- These tests don’t open a browser; Playwright is used as a convenient runner/asserter.
- The file includes `// @ts-nocheck` so your app’s TS config doesn’t need Playwright types.
- Tests will `skip()` automatically if required tables/env are not present to avoid false reds in partial envs.

## Option B — Run with Vitest (faster local loop)
If you prefer a lighter runner for Node-only tests:

1) Install dev dependencies:

```bash
npm i -D vitest
```

2) Add a minimal script in `package.json`:

```json
{
  "scripts": {
    "test:rls": "vitest run rls_testing/database.vitest.ts --reporter=dot"
  }
}
```

3) Create a Vitest copy of the spec (simple import swap). Example content for `rls_testing/database.vitest.ts`:

```ts
// Same content as database.specs.ts but:
// - Replace: import { test, expect } from '@playwright/test'
// - With:    import { describe as test, it as testIt, expect } from 'vitest'
//   Then replace usages of `test('name'...)` with `testIt('name'...)` OR
//   change to: import { describe, it, expect } from 'vitest' and
//   replace test.describe -> describe, test(...) -> it(...)
```

4) Run:

```bash
npm run test:rls
```

Tips for CI
- Export the three required Supabase env vars in your CI job.
- If you don’t use Playwright elsewhere, prefer the Vitest path for faster cold starts.

## Troubleshooting
- Error: missing module `@playwright/test`
  - Install it (Option A), or use the Vitest path (Option B).
- Tests are skipped: “No services/categories found” or table missing
  - Seed your database with minimal `categories`, `services`, and the optional `patentrender` table.
- RLS errors pop up where success is expected
  - Ensure your policies match the Phase 1 docs and that service role is used only in server contexts.

## What these tests cover (Phase 1)
- `service_pricing_rules` anon read OK, anon writes denied; constraints and uniqueness
- `patentrender` anon read OK, anon write denied; admin update allowed
- `quotes` RLS: owner lifecycle, cannot forge user_id; finalize only via admin; timestamps monotonic; visibility isolation
- `quote_items` RLS: insert/update allowed only while parent draft; read isolation; delete denied/no-op; updated_at monotonic
- Cascades and FK: deleting category cascades service; service cannot be deleted when referenced by quotes

They’re written to be idempotent, create temp rows with high IDs, and clean up after themselves.
