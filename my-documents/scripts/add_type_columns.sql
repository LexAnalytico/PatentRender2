-- Add `type` column to payments and orders (safe to run multiple times)
-- Run this in Supabase SQL editor or via psql as a privileged user (service-role).

BEGIN;

-- Add columns
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS type text;

-- Optional: restrict to known application type keys (adjust keys if you change them)
ALTER TABLE IF EXISTS payments
  ADD CONSTRAINT IF NOT EXISTS payments_type_check
  CHECK (type IS NULL OR type IN (
    'patentability_search','provisional_filing','complete_provisional_filing','pct_filing','ps_cs','trademark','copyrights','design'
  ));

ALTER TABLE IF EXISTS orders
  ADD CONSTRAINT IF NOT EXISTS orders_type_check
  CHECK (type IS NULL OR type IN (
    'patentability_search','provisional_filing','complete_provisional_filing','pct_filing','ps_cs','trademark','copyrights','design'
  ));

-- Indexes (useful for filtering/sorting)
CREATE INDEX IF NOT EXISTS payments_type_idx ON payments (type);
CREATE INDEX IF NOT EXISTS orders_type_idx ON orders (type);

COMMIT;

-- Notes:
-- 1) If your DB enforces strict migrations you may prefer to split these into separate migration steps.
-- 2) The CHECK constraint is optional; remove if you want free-form values.
-- 3) Run in a safe window; these statements are ACID but may take locks on the tables.
