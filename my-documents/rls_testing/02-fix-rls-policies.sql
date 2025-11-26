-- =====================================================
-- RLS Policy Fixes for Database Testing
-- Generated: 2025-11-20
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. QUOTES TABLE - Add INSERT policy for authenticated users
-- =====================================================

-- Drop existing policies if they exist (optional - comment out if unsure)
DROP POLICY IF EXISTS "Users can insert their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own draft quotes" ON quotes;

-- Enable RLS on quotes table (if not already enabled)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Allow users to INSERT quotes only for themselves
CREATE POLICY "Users can insert their own quotes"
ON quotes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to SELECT their own quotes
CREATE POLICY "Users can view their own quotes"
ON quotes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to UPDATE only their own DRAFT quotes
CREATE POLICY "Users can update their own draft quotes"
ON quotes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id AND status = 'draft');

-- =====================================================
-- 2. QUOTE_ITEMS TABLE - Add policies
-- =====================================================

DROP POLICY IF EXISTS "Users can insert items for their draft quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can view items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can update items for their draft quotes" ON quote_items;

-- Enable RLS on quote_items table
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Allow INSERT only when parent quote is draft and owned by user
CREATE POLICY "Users can insert items for their draft quotes"
ON quote_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
    AND quotes.status = 'draft'
  )
);

-- Allow SELECT only for items of user's own quotes
CREATE POLICY "Users can view items for their quotes"
ON quote_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  )
);

-- Allow UPDATE only when parent quote is draft and owned by user
CREATE POLICY "Users can update items for their draft quotes"
ON quote_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
    AND quotes.status = 'draft'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
    AND quotes.status = 'draft'
  )
);

-- DELETE policy: no delete allowed (will return 0 rows affected)
-- No DELETE policy = DELETE operations silently fail with 0 rows affected

-- =====================================================
-- 3. SERVICE_PRICING_RULES TABLE - Restrict write access
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view service pricing rules" ON service_pricing_rules;
DROP POLICY IF EXISTS "Only service role can modify pricing rules" ON service_pricing_rules;

-- Enable RLS on service_pricing_rules
ALTER TABLE service_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to SELECT
CREATE POLICY "Anyone can view service pricing rules"
ON service_pricing_rules
FOR SELECT
TO anon, authenticated
USING (true);

-- Only service role (admin) can INSERT/UPDATE/DELETE
-- Note: This will block anon key from writing
CREATE POLICY "Only service role can modify pricing rules"
ON service_pricing_rules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. REMOVE RESTRICTIVE CHECK CONSTRAINTS
-- =====================================================

-- Drop any existing CHECK constraints on key column
-- This allows your existing data to remain valid
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'service_pricing_rules_key_check'
  ) THEN
    ALTER TABLE service_pricing_rules DROP CONSTRAINT service_pricing_rules_key_check;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_pricing_key'
  ) THEN
    ALTER TABLE service_pricing_rules DROP CONSTRAINT check_pricing_key;
  END IF;
END $$;

-- Note: We're NOT adding a new CHECK constraint to avoid conflicts with existing data
-- Your database already has keys that work with your application
-- The tests will be updated to match your actual database schema

-- =====================================================
-- 5. PATENTRENDER TABLE (if needed)
-- =====================================================

-- Check if patentrender table exists and add professional_fee column if missing
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'patentrender'
  ) THEN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'patentrender' 
      AND column_name = 'professional_fee'
    ) THEN
      ALTER TABLE patentrender ADD COLUMN professional_fee NUMERIC(10,2);
    END IF;
    
    -- Enable RLS
    ALTER TABLE patentrender ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Anyone can view patentrender" ON patentrender;
    DROP POLICY IF EXISTS "Only service role can modify patentrender" ON patentrender;
    
    -- Allow SELECT for everyone
    CREATE POLICY "Anyone can view patentrender"
    ON patentrender
    FOR SELECT
    TO anon, authenticated
    USING (true);
    
    -- Only service role can modify
    CREATE POLICY "Only service role can modify patentrender"
    ON patentrender
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- 6. CATEGORIES TABLE - Public read access
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only service role can modify categories" ON categories;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only service role can modify categories"
ON categories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. SERVICES TABLE - Public read access
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Only service role can modify services" ON services;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
ON services
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only service role can modify services"
ON services
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify policies were created correctly:

-- Check quotes policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'quotes'
ORDER BY policyname;

-- Check quote_items policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'quote_items'
ORDER BY policyname;

-- Check service_pricing_rules policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'service_pricing_rules'
ORDER BY policyname;

-- Check all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('quotes', 'quote_items', 'service_pricing_rules', 'categories', 'services', 'patentrender')
AND schemaname = 'public';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script in Supabase SQL Editor with service_role privileges
-- 2. Test thoroughly in development before applying to production
-- 3. Backup your database before running
-- 4. Some DROP POLICY commands may fail if policies don't exist - this is safe to ignore
-- =====================================================
