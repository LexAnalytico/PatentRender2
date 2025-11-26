-- =====================================================
-- DIAGNOSTIC SCRIPT - Run this FIRST
-- Check existing data before applying constraints
-- =====================================================

-- 1. Check what keys currently exist in service_pricing_rules
SELECT 
  'service_pricing_rules.key' as column_name,
  key as current_value,
  COUNT(*) as row_count
FROM service_pricing_rules
GROUP BY key
ORDER BY key;

-- 2. Check what application_types exist
SELECT 
  'service_pricing_rules.application_type' as column_name,
  application_type as current_value,
  COUNT(*) as row_count
FROM service_pricing_rules
GROUP BY application_type
ORDER BY application_type;

-- 3. Check what units exist
SELECT 
  'service_pricing_rules.unit' as column_name,
  unit as current_value,
  COUNT(*) as row_count
FROM service_pricing_rules
GROUP BY unit
ORDER BY unit;

-- 4. Check existing constraints on service_pricing_rules
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'service_pricing_rules'::regclass
ORDER BY conname;

-- 5. Check if quote_items table exists
SELECT 
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'quote_items'
  ) as quote_items_exists;

-- 6. Check quotes table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;

-- 7. Check existing RLS policies on quotes
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'quotes'
ORDER BY policyname;

-- 8. Sample data from service_pricing_rules (to see structure)
SELECT 
  service_id,
  application_type,
  key,
  unit,
  amount
FROM service_pricing_rules
LIMIT 10;

-- =====================================================
-- NOTES:
-- =====================================================
-- Run this diagnostic script to understand your current database state
-- Use the output to verify the fix scripts will work with your data
-- =====================================================
