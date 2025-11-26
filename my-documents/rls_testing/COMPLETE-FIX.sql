-- =====================================================
-- COMPLETE FIX - Run this single script
-- Combines schema creation + RLS policies
-- =====================================================

-- =====================================================
-- PART 1: FIX QUOTES TABLE SCHEMA
-- =====================================================

-- Add status column with default if it doesn't exist or has no default
DO $$ 
BEGIN
  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'status'
  ) THEN
    ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
  
  -- Set default for existing column
  ALTER TABLE quotes ALTER COLUMN status SET DEFAULT 'draft';
  
  -- Update NULL values to 'draft'
  UPDATE quotes SET status = 'draft' WHERE status IS NULL;
  
  -- Make it NOT NULL
  ALTER TABLE quotes ALTER COLUMN status SET NOT NULL;
END $$;

-- Add updated_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- PART 2: CREATE QUOTE_ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_items (
  id BIGSERIAL PRIMARY KEY,
  quote_id BIGINT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount NUMERIC(10,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_quote_items_quote_id 
    FOREIGN KEY (quote_id) 
    REFERENCES quotes(id) 
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- =====================================================
-- PART 3: ADD TRIGGERS
-- =====================================================

-- Trigger for quotes.updated_at
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- Trigger for quote_items.updated_at
CREATE OR REPLACE FUNCTION update_quote_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quote_items_updated_at ON quote_items;
CREATE TRIGGER trigger_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_items_updated_at();

-- =====================================================
-- PART 4: RLS POLICIES FOR QUOTES
-- =====================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own draft quotes" ON quotes;

-- INSERT: Users can create quotes for themselves
CREATE POLICY "Users can insert their own quotes"
ON quotes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT: Users can view their own quotes
CREATE POLICY "Users can view their own quotes"
ON quotes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- UPDATE: Users can only update their own DRAFT quotes
-- Allow status change to check the current status, not the new one
CREATE POLICY "Users can update their own draft quotes"
ON quotes FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PART 5: RLS POLICIES FOR QUOTE_ITEMS
-- =====================================================

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert items for their draft quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can view items for their quotes" ON quote_items;
DROP POLICY IF EXISTS "Users can update items for their draft quotes" ON quote_items;

-- INSERT: Only for draft quotes owned by user
CREATE POLICY "Users can insert items for their draft quotes"
ON quote_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
    AND quotes.status = 'draft'
  )
);

-- SELECT: Only items from user's own quotes
CREATE POLICY "Users can view items for their quotes"
ON quote_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.user_id = auth.uid()
  )
);

-- UPDATE: Only for draft quotes
CREATE POLICY "Users can update items for their draft quotes"
ON quote_items FOR UPDATE TO authenticated
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

-- =====================================================
-- PART 6: RLS POLICIES FOR SERVICE_PRICING_RULES
-- =====================================================

ALTER TABLE service_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view service pricing rules" ON service_pricing_rules;
DROP POLICY IF EXISTS "Only service role can modify pricing rules" ON service_pricing_rules;
DROP POLICY IF EXISTS "Service role can do anything with pricing rules" ON service_pricing_rules;

-- SELECT: Public read access
CREATE POLICY "Anyone can view service pricing rules"
ON service_pricing_rules FOR SELECT
TO anon, authenticated
USING (true);

-- ALL: Only service_role can write
CREATE POLICY "Only service role can modify pricing rules"
ON service_pricing_rules FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 7: RLS POLICIES FOR CATEGORIES
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Only service role can modify categories" ON categories;

CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only service role can modify categories"
ON categories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 8: RLS POLICIES FOR SERVICES
-- =====================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Only service role can modify services" ON services;

CREATE POLICY "Anyone can view services"
ON services FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only service role can modify services"
ON services FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 9: PATENTRENDER TABLE (if exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'patentrender'
  ) THEN
    -- Add column if missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'patentrender' 
      AND column_name = 'professional_fee'
    ) THEN
      ALTER TABLE patentrender ADD COLUMN professional_fee NUMERIC(10,2);
    END IF;
    
    ALTER TABLE patentrender ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Anyone can view patentrender" ON patentrender;
    DROP POLICY IF EXISTS "Only service role can modify patentrender" ON patentrender;
    
    EXECUTE 'CREATE POLICY "Anyone can view patentrender" ON patentrender FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Only service role can modify patentrender" ON patentrender FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check quotes has proper defaults
SELECT 
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes' 
AND column_name IN ('status', 'updated_at');

-- Check quote_items exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'quote_items'
) as quote_items_exists;

-- Check RLS policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('quotes', 'quote_items', 'service_pricing_rules')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database schema and RLS policies updated successfully!' as status;
