-- Update type constraints to include all canonical form types
-- Run this in Supabase SQL editor or via psql as a privileged user (service-role).

BEGIN;

-- Drop existing constraints
ALTER TABLE IF EXISTS payments DROP CONSTRAINT IF EXISTS payments_type_check;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_type_check;

-- Add updated constraints with all canonical form types
ALTER TABLE IF EXISTS payments
  ADD CONSTRAINT payments_type_check
  CHECK (type IS NULL OR type IN (
    'patentability_search',
    'drafting', 
    'provisional_filing',
    'complete_non_provisional_filing',
    'pct_filing',
    'ps_cs',
    'fer_response',
    'trademark',
    'copyrights',
    'design'
  ));

ALTER TABLE IF EXISTS orders
  ADD CONSTRAINT orders_type_check
  CHECK (type IS NULL OR type IN (
    'patentability_search',
    'drafting',
    'provisional_filing', 
    'complete_non_provisional_filing',
    'pct_filing',
    'ps_cs',
    'fer_response',
    'trademark',
    'copyrights',
    'design'
  ));

COMMIT;

-- Test query to verify constraint allows fer_response
-- SELECT 'fer_response' IN ('patentability_search','drafting','provisional_filing','complete_non_provisional_filing','pct_filing','ps_cs','fer_response','trademark','copyrights','design') AS fer_response_allowed;
