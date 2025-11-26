-- Design Services Migration
-- Date: 2025-11-21
-- Description: Add Design Filing, Response to FER, Hearing, and Cancellation services with pricing rules

-- ============================================
-- 1. Add new services to the services table
-- ============================================

-- Service ID 13: Design Filing (replaces/updates existing Design Registration id=10)
-- Service ID 14: Response to FER (new)
-- Service ID 15: Hearing (new)
-- Service ID 16: Cancellation (new)

-- Update existing Design Registration (id=10) to Design Filing
UPDATE public.services 
SET 
    name = 'Design Filing',
    base_price = 11000.00,
    description = 'Complete design registration filing to protect your unique product designs and visual elements'
WHERE id = 10;

-- Insert Response to FER
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (13, 4, 'Response to FER', 5000.00, 'Expert responses to First Examination Reports for design applications')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Insert Hearing
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (14, 4, 'Hearing', 5000.00, 'Professional representation at design application hearings')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Insert Cancellation
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (15, 4, 'Cancellation', 16500.00, 'Strategic design cancellation proceedings to challenge or defend registrations')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- ============================================
-- 2. Add pricing rules for Design Filing (service_id = 10)
-- ============================================

-- Design Filing - Individual
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (10, 'individual', 'professional_fee', 'fixed', 10000.00, 'design_filing'),
    (10, 'individual', 'government_fee', 'fixed', 1000.00, 'design_filing')
ON CONFLICT DO NOTHING;

-- Design Filing - Startup/MSME
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (10, 'startup_msme', 'professional_fee', 'fixed', 10000.00, 'design_filing'),
    (10, 'startup_msme', 'government_fee', 'fixed', 2000.00, 'design_filing')
ON CONFLICT DO NOTHING;

-- Design Filing - Large Entity/Others
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (10, 'others', 'professional_fee', 'fixed', 10000.00, 'design_filing'),
    (10, 'others', 'government_fee', 'fixed', 4000.00, 'design_filing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Add pricing rules for Response to FER (service_id = 13)
-- ============================================

-- Response to FER - Single Service (fixed price, no applicant type variation)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (13, 'individual', 'base_fee', 'fixed', 5000.00, 'design_fer_response')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Add pricing rules for Hearing (service_id = 14)
-- ============================================

-- Hearing - Single Service (fixed price, no applicant type variation)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (14, 'individual', 'base_fee', 'fixed', 5000.00, 'design_hearing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Add pricing rules for Cancellation (service_id = 15)
-- ============================================

-- Cancellation - Individual
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (15, 'individual', 'professional_fee', 'fixed', 15000.00, 'design_cancellation'),
    (15, 'individual', 'government_fee', 'fixed', 1500.00, 'design_cancellation')
ON CONFLICT DO NOTHING;

-- Cancellation - Startup/MSME
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (15, 'startup_msme', 'professional_fee', 'fixed', 15000.00, 'design_cancellation'),
    (15, 'startup_msme', 'government_fee', 'fixed', 3000.00, 'design_cancellation')
ON CONFLICT DO NOTHING;

-- Cancellation - Large Entity/Others
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (15, 'others', 'professional_fee', 'fixed', 15000.00, 'design_cancellation'),
    (15, 'others', 'government_fee', 'fixed', 6000.00, 'design_cancellation')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. Update constraints to allow new design service types
-- ============================================

-- Update orders table constraint to include new design service types
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_type_check CHECK (
    (type IS NULL) OR (type = ANY (ARRAY[
        'patentability_search'::text,
        'drafting'::text,
        'provisional_filing'::text,
        'complete_non_provisional_filing'::text,
        'pct_filing'::text,
        'ps_cs'::text,
        'fer_response'::text,
        'trademark'::text,
        'copyrights'::text,
        'design'::text,
        'design_filing'::text,
        'design_fer_response'::text,
        'design_hearing'::text,
        'design_cancellation'::text
    ]))
);

-- Update payments table constraint to include new design service types
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_type_check CHECK (
    (type IS NULL) OR (type = ANY (ARRAY[
        'patentability_search'::text,
        'drafting'::text,
        'provisional_filing'::text,
        'complete_non_provisional_filing'::text,
        'pct_filing'::text,
        'ps_cs'::text,
        'fer_response'::text,
        'trademark'::text,
        'copyrights'::text,
        'design'::text,
        'design_filing'::text,
        'design_fer_response'::text,
        'design_hearing'::text,
        'design_cancellation'::text
    ]))
);

-- ============================================
-- 7. Reset sequence if needed (optional)
-- ============================================

-- Ensure the sequence is at least at 16 for future inserts
SELECT setval('public.services_id_seq', GREATEST(16, (SELECT MAX(id) FROM public.services)));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify services were added/updated
SELECT id, category_id, name, base_price, description 
FROM public.services 
WHERE category_id = 4 
ORDER BY id;

-- Verify pricing rules for Design Filing (id=10)
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id = 10
ORDER BY application_type, key;

-- Verify pricing rules for Response to FER (id=13)
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id = 13;

-- Verify pricing rules for Hearing (id=14)
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id = 14;

-- Verify pricing rules for Cancellation (id=15)
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id = 15
ORDER BY application_type, key;

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================

/*
SERVICES ADDED/UPDATED:
1. Design Filing (id=10) - Updated from "Design Registration"
   - Individual: ₹11,000 (₹10,000 professional + ₹1,000 govt)
   - Startup/MSME: ₹12,000 (₹10,000 professional + ₹2,000 govt)
   - Large Entity: ₹14,000 (₹10,000 professional + ₹4,000 govt)

2. Response to FER (id=13) - NEW
   - Single Service: ₹5,000 (fixed)

3. Hearing (id=14) - NEW
   - Single Service: ₹5,000 (fixed)

4. Cancellation (id=15) - NEW
   - Individual: ₹16,500 (₹15,000 professional + ₹1,500 govt)
   - Startup/MSME: ₹18,000 (₹15,000 professional + ₹3,000 govt)
   - Large Entity: ₹21,000 (₹15,000 professional + ₹6,000 govt)

CONSTRAINTS UPDATED:
- orders.type constraint - added design service types
- payments.type constraint - added design service types
*/
