-- =====================================================
-- FORCE FIX SERVICE_PRICING_RULES RLS
-- Run this if anon users can still write to the table
-- =====================================================

-- Check current RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'service_pricing_rules';

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'service_pricing_rules'
ORDER BY policyname;

-- Force disable and re-enable RLS
ALTER TABLE service_pricing_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'service_pricing_rules'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON service_pricing_rules', pol.policyname);
  END LOOP;
END $$;

-- Create fresh policies with explicit role restrictions
CREATE POLICY "anon_authenticated_can_select_pricing_rules"
ON service_pricing_rules
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "service_role_full_access_pricing_rules"
ON service_pricing_rules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify no other policies exist that might allow anon writes
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'service_pricing_rules'
ORDER BY policyname;

-- Test query (should return rls_enabled = true and 2 policies)
SELECT 
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'service_pricing_rules') as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'service_pricing_rules') as policy_count;

SELECT 'service_pricing_rules RLS policies refreshed!' as status;
