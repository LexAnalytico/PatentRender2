-- =====================================================
-- COMPLETE DATABASE SCHEMA SETUP
-- Creates missing tables and prepares for RLS policies
-- Run this BEFORE fix-rls-policies.sql
-- =====================================================

-- =====================================================
-- 1. CREATE QUOTE_ITEMS TABLE (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_items (
  id BIGSERIAL PRIMARY KEY,
  quote_id BIGINT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('fixed', 'per_class', 'per_item')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount NUMERIC(10,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to quotes table
  CONSTRAINT fk_quote_items_quote_id 
    FOREIGN KEY (quote_id) 
    REFERENCES quotes(id) 
    ON DELETE CASCADE,
    
  -- Ensure valid pricing keys
  CONSTRAINT check_quote_items_key 
    CHECK (key IN (
      'option1',
      'nice_classes',
      'goods_services',
      'prior_use_yes',
      'professional_fee',
      'turnaround_standard',
      'turnaround_expediated',
      'turnaround_rush',
      'turnaround_fast',
      'turnaround_urgent'
    ))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_key ON quote_items(key);

-- =====================================================
-- 2. ADD TRIGGER FOR UPDATED_AT ON QUOTE_ITEMS
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_quote_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_quote_items_updated_at ON quote_items;

CREATE TRIGGER trigger_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_items_updated_at();

-- =====================================================
-- 3. ENSURE QUOTES TABLE HAS PROPER STRUCTURE
-- =====================================================

-- Verify quotes table exists (should already exist based on your SQL file)
-- Add any missing columns if needed

DO $$ 
BEGIN
  -- Add application_type if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'application_type'
  ) THEN
    ALTER TABLE quotes ADD COLUMN application_type TEXT NOT NULL DEFAULT 'individual';
  END IF;
  
  -- Add status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'status'
  ) THEN
    ALTER TABLE quotes ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
  END IF;
  
  -- Add updated_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add CHECK constraint for application_type if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quotes_application_type_check'
  ) THEN
    ALTER TABLE quotes
    ADD CONSTRAINT quotes_application_type_check
    CHECK (application_type IN ('individual', 'startup_msme', 'others'));
  END IF;
END $$;

-- Add CHECK constraint for status if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quotes_status_check'
  ) THEN
    ALTER TABLE quotes
    ADD CONSTRAINT quotes_status_check
    CHECK (status IN ('draft', 'finalized', 'expired', 'cancelled'));
  END IF;
END $$;

-- =====================================================
-- 4. ADD TRIGGER FOR UPDATED_AT ON QUOTES
-- =====================================================

-- Create or replace the trigger function for quotes
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;

CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- =====================================================
-- 5. ENSURE SERVICE_PRICING_RULES TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS service_pricing_rules (
  id BIGSERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL,
  application_type TEXT NOT NULL,
  key TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('fixed', 'per_class', 'per_item')),
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to services table
  CONSTRAINT fk_service_pricing_rules_service_id 
    FOREIGN KEY (service_id) 
    REFERENCES services(id) 
    ON DELETE CASCADE,
    
  -- Composite unique constraint
  CONSTRAINT unique_service_pricing_rule 
    UNIQUE (service_id, application_type, key),
    
  -- Check constraints
  CONSTRAINT check_application_type 
    CHECK (application_type IN ('individual', 'startup_msme', 'others')),
    
  CONSTRAINT check_pricing_key 
    CHECK (key IN (
      'option1',
      'nice_classes',
      'goods_services',
      'prior_use_yes',
      'professional_fee',
      'turnaround_standard',
      'turnaround_expediated',
      'turnaround_rush',
      'turnaround_fast',
      'turnaround_urgent'
    ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_pricing_rules_service_id ON service_pricing_rules(service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_rules_app_type ON service_pricing_rules(application_type);

-- =====================================================
-- 6. ENSURE CATEGORIES AND SERVICES TABLES EXIST
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_services_category_id 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('quotes', 'quote_items', 'service_pricing_rules', 'categories', 'services')
ORDER BY table_name;

-- Verify quote_items structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quote_items'
ORDER BY ordinal_position;

-- Verify constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('quotes', 'quote_items', 'service_pricing_rules')
ORDER BY tc.table_name, tc.constraint_type;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script FIRST before fix-rls-policies.sql
-- 2. This creates quote_items table and ensures all FK relationships
-- 3. Adds triggers for updated_at timestamps
-- 4. Safe to run multiple times (uses CREATE IF NOT EXISTS)
-- =====================================================
