# RLS Testing Setup Guide

This directory contains comprehensive RLS (Row Level Security) testing for your Supabase database.

## 📁 Files Overview

1. **`database.specs.ts`** - Playwright test suite for RLS policies
2. **`01-create-schema.sql`** - Creates missing tables and schema (RUN FIRST)
3. **`02-fix-rls-policies.sql`** - Adds RLS policies (RUN SECOND)

## 🚀 Quick Start

### Step 1: Create Missing Tables

Your database is missing the `quote_items` table. Run this script first:

```sql
-- In Supabase SQL Editor, run:
01-create-schema.sql
```

**What this does:**
- ✅ Creates `quote_items` table with proper structure
- ✅ Adds foreign key constraints to `quotes` table
- ✅ Creates indexes for performance
- ✅ Adds `updated_at` triggers
- ✅ Ensures `service_pricing_rules`, `categories`, `services` tables exist
- ✅ Safe to run multiple times (uses `CREATE IF NOT EXISTS`)

### Step 2: Apply RLS Policies

After schema is ready, apply the security policies:

```sql
-- In Supabase SQL Editor, run:
02-fix-rls-policies.sql
```

**What this does:**
- ✅ Adds INSERT policy for `quotes` (users can create their own)
- ✅ Adds SELECT policy for `quotes` (users can view their own)
- ✅ Adds UPDATE policy for `quotes` (users can update draft only)
- ✅ Adds complete RLS policies for `quote_items`
- ✅ Restricts `service_pricing_rules` writes to service_role
- ✅ Adds missing enum values (`turnaround_standard`, etc.)

### Step 3: Run Tests

After applying both SQL scripts:

```bash
npm run test:rls
```

## 🔍 Expected Test Results

After applying the fixes, all 13 tests should pass:

- ✅ service_pricing_rules is readable with anon key
- ✅ quotes RLS: owner can insert/select/update while draft
- ✅ quote_items RLS: insert allowed only when parent quote is draft
- ✅ service_pricing_rules RLS and constraints
- ✅ categories/services RLS, uniqueness, and cascade
- ✅ quotes RLS: cannot forge user_id; owner cannot finalize
- ✅ quote_items RLS: read isolation; update only while draft
- ✅ quotes visibility: owner can read own quotes
- ✅ quote_items delete: no rows affected due to RLS
- ✅ patentrender RLS: anon read ok; anon write denied
- ✅ service_pricing_rules: anon update/delete denied
- ✅ quote_items trigger: updated_at monotonic while draft
- ✅ quotes delete: owner cannot delete when items exist

## 🔒 Security Policies Summary

### Quotes Table
```
INSERT: Authenticated users can create quotes for themselves only
SELECT: Users can view their own quotes (any status)
UPDATE: Users can only update their own DRAFT quotes
DELETE: Not allowed when items exist (FK constraint)
```

### Quote Items Table
```
INSERT: Only for draft quotes owned by user
SELECT: Only items from user's own quotes
UPDATE: Only for items in draft quotes
DELETE: No policy = silent failure (0 rows affected)
```

### Service Pricing Rules
```
SELECT: Public read access (anon + authenticated)
INSERT/UPDATE/DELETE: Service role only
```

## 📊 Database Schema

### quote_items Table Structure
```sql
id              BIGSERIAL PRIMARY KEY
quote_id        BIGINT (FK to quotes.id, CASCADE DELETE)
key             TEXT (CHECK constraint with valid keys)
label           TEXT
unit            TEXT (CHECK: 'fixed', 'per_class', 'per_item')
quantity        INTEGER (CHECK: > 0)
unit_amount     NUMERIC(10,2)
amount          NUMERIC(10,2)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ (auto-updated via trigger)
```

### Valid Pricing Keys
- `option1`
- `nice_classes`
- `goods_services`
- `prior_use_yes`
- `professional_fee`
- `turnaround_standard`
- `turnaround_expediated`
- `turnaround_rush`
- `turnaround_fast`
- `turnaround_urgent`

## ❌ Current Issues Found

The test run revealed these database issues:

1. **Missing Table**: `quote_items` table doesn't exist
2. **Missing RLS Policies**: `quotes` table has no INSERT policy
3. **Missing Enum Value**: `turnaround_standard` not in allowed keys
4. **Weak Security**: `service_pricing_rules` allows anon writes
5. **Schema Mismatch**: `patentrender.professional_fee` column missing

All issues are fixed by running the SQL scripts in order.

## 🛠️ Troubleshooting

### Error: "relation quote_items does not exist"
**Solution:** Run `01-create-schema.sql` first

### Error: "new row violates row-level security policy for table quotes"
**Solution:** Run `02-fix-rls-policies.sql` to add INSERT policy

### Tests still failing after applying fixes
**Solution:** 
1. Clear browser cache and restart Supabase connection
2. Verify policies were created: Check verification queries at end of SQL scripts
3. Ensure you're using service_role key in `.env.local`

### How to verify policies are applied
```sql
-- Run in Supabase SQL Editor:
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('quotes', 'quote_items', 'service_pricing_rules')
ORDER BY tablename, policyname;
```

## 📝 Environment Variables Required

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 Next Steps After Tests Pass

1. ✅ Deploy schema changes to production Supabase
2. ✅ Test application flows (quotes, cart, checkout)
3. ✅ Verify users can create quotes in production
4. ✅ Set up continuous RLS testing in CI/CD pipeline

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

**Last Updated:** November 20, 2025  
**Author:** GitHub Copilot  
**Version:** 1.0
