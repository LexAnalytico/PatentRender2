-- Trademark Services Migration
-- Date: 2025-11-25
-- Description: Add Trademark Search, Filing, Examination Response, Hearings, Opposition, and Renewal services

-- ============================================
-- 0. Ensure Trademark category exists
-- ============================================

-- Insert Trademark category if it doesn't exist (assuming category_id = 2)
INSERT INTO public.categories (id, name, description)
VALUES (2, 'Trademark', 'Trademark search, registration, and protection services')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================
-- 1. Add new services to the services table
-- ============================================

-- Service ID 29: Trademark Search - Expedited
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (29, 2, 'Trademark Search - Expedited', 500.00, 'Trademark search with expedited turnaround (5-7 days)')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 30: Trademark Search - Rush
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (30, 2, 'Trademark Search - Rush', 800.00, 'Trademark search with rush turnaround (1-2 days)')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 31: Trademark Filing - With User Affidavit (Individual/Startup/MSME)
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (31, 2, 'Trademark Filing - With Affidavit', 8500.00, 'Trademark filing with user affidavit for Individual, Startup, or MSME')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 32: Trademark Filing - With User Affidavit (Others)
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (32, 2, 'Trademark Filing - With Affidavit (Others)', 12000.00, 'Trademark filing with user affidavit for Large Entities')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 33: Trademark Filing - Without User Affidavit
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (33, 2, 'Trademark Filing - Without Affidavit', 3000.00, 'Trademark filing without user affidavit (professional fee only)')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 34: Response to Examination Report
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (34, 2, 'Response to Examination Report', 4000.00, 'Expert response to trademark examination report')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 35: Post Examination (TLA) Hearing
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (35, 2, 'Post Examination Hearing', 3000.00, 'Professional representation at post-examination trademark hearing')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 36: Opposition - Notice of Opposition
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (36, 2, 'Opposition - Notice', 2700.00, 'File Notice of Opposition against trademark application')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 37: Opposition - Counter Statement
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (37, 2, 'Opposition - Counter Statement', 2700.00, 'File Counter Statement in trademark opposition')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 38: Opposition Hearing
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (38, 2, 'Opposition Hearing', 4000.00, 'Professional representation at trademark opposition hearing')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 39: Renewal of Registration
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (39, 2, 'Renewal of Registration', 11500.00, 'Trademark registration renewal service')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- ============================================
-- 2. Add pricing rules for Trademark Search services
-- ============================================

-- Trademark Search - Expedited (service_id = 29)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (29, 'individual', 'professional_fee', 'fixed', 500.00, 'trademark_search'),
    (29, 'startup_msme', 'professional_fee', 'fixed', 500.00, 'trademark_search'),
    (29, 'others', 'professional_fee', 'fixed', 500.00, 'trademark_search')
ON CONFLICT DO NOTHING;

-- Trademark Search - Rush (service_id = 30)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (30, 'individual', 'professional_fee', 'fixed', 800.00, 'trademark_search'),
    (30, 'startup_msme', 'professional_fee', 'fixed', 800.00, 'trademark_search'),
    (30, 'others', 'professional_fee', 'fixed', 800.00, 'trademark_search')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Add pricing rules for Trademark Filing services
-- ============================================

-- Trademark Filing - With User Affidavit - Individual/Startup/MSME (service_id = 31)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (31, 'individual', 'professional_fee', 'fixed', 4000.00, 'trademark_filing'),
    (31, 'individual', 'government_fee', 'fixed', 4500.00, 'trademark_filing'),
    (31, 'startup_msme', 'professional_fee', 'fixed', 4000.00, 'trademark_filing'),
    (31, 'startup_msme', 'government_fee', 'fixed', 4500.00, 'trademark_filing')
ON CONFLICT DO NOTHING;

-- Trademark Filing - With User Affidavit - Others (service_id = 32)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (32, 'others', 'professional_fee', 'fixed', 3000.00, 'trademark_filing'),
    (32, 'others', 'government_fee', 'fixed', 9000.00, 'trademark_filing')
ON CONFLICT DO NOTHING;

-- Trademark Filing - Without User Affidavit (service_id = 33)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (33, 'individual', 'professional_fee', 'fixed', 3000.00, 'trademark_filing'),
    (33, 'startup_msme', 'professional_fee', 'fixed', 3000.00, 'trademark_filing'),
    (33, 'others', 'professional_fee', 'fixed', 3000.00, 'trademark_filing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Add pricing rules for Response to Examination Report
-- ============================================

-- Response to Examination Report (service_id = 34)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (34, 'individual', 'professional_fee', 'fixed', 4000.00, 'trademark_examination_response'),
    (34, 'startup_msme', 'professional_fee', 'fixed', 4000.00, 'trademark_examination_response'),
    (34, 'others', 'professional_fee', 'fixed', 4000.00, 'trademark_examination_response')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Add pricing rules for Post Examination Hearing
-- ============================================

-- Post Examination Hearing (service_id = 35)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (35, 'individual', 'professional_fee', 'fixed', 3000.00, 'trademark_hearing'),
    (35, 'startup_msme', 'professional_fee', 'fixed', 3000.00, 'trademark_hearing'),
    (35, 'others', 'professional_fee', 'fixed', 3000.00, 'trademark_hearing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. Add pricing rules for Opposition services
-- ============================================

-- Opposition - Notice (service_id = 36)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (36, 'individual', 'government_fee', 'fixed', 2700.00, 'trademark_opposition'),
    (36, 'startup_msme', 'government_fee', 'fixed', 2700.00, 'trademark_opposition'),
    (36, 'others', 'government_fee', 'fixed', 2700.00, 'trademark_opposition')
ON CONFLICT DO NOTHING;

-- Opposition - Counter Statement (service_id = 37)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (37, 'individual', 'government_fee', 'fixed', 2700.00, 'trademark_opposition'),
    (37, 'startup_msme', 'government_fee', 'fixed', 2700.00, 'trademark_opposition'),
    (37, 'others', 'government_fee', 'fixed', 2700.00, 'trademark_opposition')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. Add pricing rules for Opposition Hearing
-- ============================================

-- Opposition Hearing (service_id = 38)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (38, 'individual', 'professional_fee', 'fixed', 4000.00, 'trademark_opposition_hearing'),
    (38, 'startup_msme', 'professional_fee', 'fixed', 4000.00, 'trademark_opposition_hearing'),
    (38, 'others', 'professional_fee', 'fixed', 4000.00, 'trademark_opposition_hearing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. Add pricing rules for Renewal of Registration
-- ============================================

-- Renewal of Registration (service_id = 39)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (39, 'individual', 'professional_fee', 'fixed', 1500.00, 'trademark_renewal'),
    (39, 'individual', 'government_fee', 'fixed', 10000.00, 'trademark_renewal'),
    (39, 'startup_msme', 'professional_fee', 'fixed', 1500.00, 'trademark_renewal'),
    (39, 'startup_msme', 'government_fee', 'fixed', 10000.00, 'trademark_renewal'),
    (39, 'others', 'professional_fee', 'fixed', 1500.00, 'trademark_renewal'),
    (39, 'others', 'government_fee', 'fixed', 10000.00, 'trademark_renewal')
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. Update constraints to allow trademark service types
-- ============================================

-- Update orders table constraint to include trademark service types
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
        'design_cancellation'::text,
        'copyright_filing'::text,
        'copyright_discrepancy_response'::text,
        'copyright_noc_response'::text,
        'trademark_search'::text,
        'trademark_filing'::text,
        'trademark_examination_response'::text,
        'trademark_hearing'::text,
        'trademark_opposition'::text,
        'trademark_opposition_hearing'::text,
        'trademark_renewal'::text
    ]))
);

-- Update payments table constraint to include trademark service types
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
        'design_cancellation'::text,
        'copyright_filing'::text,
        'copyright_discrepancy_response'::text,
        'copyright_noc_response'::text,
        'trademark_search'::text,
        'trademark_filing'::text,
        'trademark_examination_response'::text,
        'trademark_hearing'::text,
        'trademark_opposition'::text,
        'trademark_opposition_hearing'::text,
        'trademark_renewal'::text
    ]))
);

-- ============================================
-- 10. Reset sequence if needed (optional)
-- ============================================

-- Ensure the sequence is at least at 40 for future inserts
SELECT setval('public.services_id_seq', GREATEST(40, (SELECT MAX(id) FROM public.services)));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify services were added/updated
SELECT id, category_id, name, base_price, description 
FROM public.services 
WHERE category_id = 2 
ORDER BY id;

-- Verify pricing rules for all trademark services
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id BETWEEN 29 AND 39
ORDER BY service_id, application_type, key;

-- Count trademark services added
SELECT 
    'Trademark Search' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 29 AND 30
UNION ALL
SELECT 
    'Trademark Filing' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 31 AND 33
UNION ALL
SELECT 
    'Examination & Hearings' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 34 AND 35
UNION ALL
SELECT 
    'Opposition Services' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 36 AND 38
UNION ALL
SELECT 
    'Renewal' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id = 39;

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================

/*
SERVICES ADDED:

TRADEMARK SEARCH (2 services):
1. Trademark Search - Expedited (id=29): ₹500 (5-7 days)
2. Trademark Search - Rush (id=30): ₹800 (1-2 days)

TRADEMARK FILING (3 services):
3. Trademark Filing - With Affidavit - Individual/Startup/MSME (id=31): ₹8,500 (₹4,000 prof + ₹4,500 govt)
4. Trademark Filing - With Affidavit - Others (id=32): ₹12,000 (₹3,000 prof + ₹9,000 govt)
5. Trademark Filing - Without Affidavit (id=33): ₹3,000 (professional fee only)

EXAMINATION & HEARINGS (2 services):
6. Response to Examination Report (id=34): ₹4,000 (professional fee)
7. Post Examination Hearing (id=35): ₹3,000 (professional fee)

OPPOSITION SERVICES (3 services):
8. Opposition - Notice (id=36): ₹2,700 (government fee)
9. Opposition - Counter Statement (id=37): ₹2,700 (government fee)
10. Opposition Hearing (id=38): ₹4,000 (professional fee)

RENEWAL (1 service):
11. Renewal of Registration (id=39): ₹11,500 (₹1,500 prof + ₹10,000 govt)

TOTAL: 11 trademark services added

CONSTRAINTS UPDATED:
- orders.type constraint - added trademark service types
- payments.type constraint - added trademark service types

NOTE: Opposition affidavit services (Support of Opposition, Support of Application, Reply Affidavit)
are marked as "Customizable price" in the schema and should be quoted separately.
*/
