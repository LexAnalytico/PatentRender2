-- Copyright Services Migration
-- Date: 2025-11-24
-- Description: Add Copyright Filing, Response to Discrepancy Letter, and NOC Response services with work type variations

-- ============================================
-- 0. Ensure Copyright category exists
-- ============================================

-- Insert Copyright category if it doesn't exist
INSERT INTO public.categories (id, name, description)
VALUES (5, 'Copyright', 'Copyright registration and protection services')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================
-- 1. Add new services to the services table
-- ============================================

-- Service ID 16: Copyright Filing - Literary Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (16, 5, 'Copyright Filing - Literary Work', 7500.00, 'Professional copyright registration for literary works including books, articles, and written content')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 17: Copyright Filing - Dramatic Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (17, 5, 'Copyright Filing - Dramatic Work', 7500.00, 'Copyright registration for dramatic works including plays, scripts, and theatrical performances')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 18: Copyright Filing - Musical Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (18, 5, 'Copyright Filing - Musical Work', 7500.00, 'Copyright registration for musical compositions, lyrics, and sound recordings')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 19: Copyright Filing - Artistic Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (19, 5, 'Copyright Filing - Artistic Work', 7500.00, 'Copyright protection for artistic works including paintings, sculptures, and visual art')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 20: Copyright Filing - Cinematograph Film
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (20, 5, 'Copyright Filing - Cinematograph Film', 12000.00, 'Copyright registration for films, videos, and audiovisual works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 21: Copyright Filing - Sound Recording
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (21, 5, 'Copyright Filing - Sound Recording', 9000.00, 'Copyright registration for sound recordings, audio tracks, and music albums')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 22: Response to Discrepancy Letter - Literary Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (22, 5, 'Response to Discrepancy - Literary', 3000.00, 'Expert response to copyright discrepancy letters for literary works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 23: Response to Discrepancy Letter - Dramatic Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (23, 5, 'Response to Discrepancy - Dramatic', 3000.00, 'Expert response to copyright discrepancy letters for dramatic works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 24: Response to Discrepancy Letter - Musical Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (24, 5, 'Response to Discrepancy - Musical', 3000.00, 'Expert response to copyright discrepancy letters for musical works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 25: Response to Discrepancy Letter - Artistic Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (25, 5, 'Response to Discrepancy - Artistic', 3000.00, 'Expert response to copyright discrepancy letters for artistic works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 26: Response to Discrepancy Letter - Cinematograph Film
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (26, 5, 'Response to Discrepancy - Film', 3000.00, 'Expert response to copyright discrepancy letters for cinematograph films')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 27: Response to Discrepancy Letter - Sound Recording
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (27, 5, 'Response to Discrepancy - Sound', 3000.00, 'Expert response to copyright discrepancy letters for sound recordings')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- Service ID 28: NOC Response - Artistic Work
INSERT INTO public.services (id, category_id, name, base_price, description)
VALUES (28, 5, 'NOC Response - Artistic Work', 10000.00, 'No Objection Certificate response for artistic copyright works')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- ============================================
-- 2. Add pricing rules for Copyright Filing services
-- ============================================

-- Copyright Filing - Literary Work (service_id = 16)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (16, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (16, 'individual', 'government_fee', 'fixed', 500.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- Copyright Filing - Dramatic Work (service_id = 17)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (17, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (17, 'individual', 'government_fee', 'fixed', 500.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- Copyright Filing - Musical Work (service_id = 18)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (18, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (18, 'individual', 'government_fee', 'fixed', 500.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- Copyright Filing - Artistic Work (service_id = 19)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (19, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (19, 'individual', 'government_fee', 'fixed', 500.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- Copyright Filing - Cinematograph Film (service_id = 20)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (20, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (20, 'individual', 'government_fee', 'fixed', 5000.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- Copyright Filing - Sound Recording (service_id = 21)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (21, 'individual', 'professional_fee', 'fixed', 7000.00, 'copyright_filing'),
    (21, 'individual', 'government_fee', 'fixed', 2000.00, 'copyright_filing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Add pricing rules for Response to Discrepancy Letter services
-- ============================================

-- Response to Discrepancy - Literary Work (service_id = 22)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (22, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- Response to Discrepancy - Dramatic Work (service_id = 23)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (23, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- Response to Discrepancy - Musical Work (service_id = 24)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (24, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- Response to Discrepancy - Artistic Work (service_id = 25)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (25, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- Response to Discrepancy - Cinematograph Film (service_id = 26)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (26, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- Response to Discrepancy - Sound Recording (service_id = 27)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (27, 'individual', 'base_fee', 'fixed', 3000.00, 'copyright_discrepancy_response')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Add pricing rules for NOC Response service
-- ============================================

-- NOC Response - Artistic Work (service_id = 28)
INSERT INTO public.service_pricing_rules (service_id, application_type, key, unit, amount, form_type)
VALUES 
    (28, 'individual', 'base_fee', 'fixed', 10000.00, 'copyright_noc_response')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Update constraints to allow new copyright service types
-- ============================================

-- Update orders table constraint to include copyright service types
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
        'copyright_noc_response'::text
    ]))
);

-- Update payments table constraint to include copyright service types
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
        'copyright_noc_response'::text
    ]))
);

-- ============================================
-- 6. Reset sequence if needed (optional)
-- ============================================

-- Ensure the sequence is at least at 29 for future inserts
SELECT setval('public.services_id_seq', GREATEST(29, (SELECT MAX(id) FROM public.services)));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify services were added/updated
SELECT id, category_id, name, base_price, description 
FROM public.services 
WHERE category_id = 5 
ORDER BY id;

-- Verify pricing rules for all copyright services
SELECT service_id, application_type, key, unit, amount, form_type
FROM public.service_pricing_rules
WHERE service_id BETWEEN 16 AND 28
ORDER BY service_id, application_type, key;

-- Count copyright services added
SELECT 
    'Copyright Filing' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 16 AND 21
UNION ALL
SELECT 
    'Discrepancy Response' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id BETWEEN 22 AND 27
UNION ALL
SELECT 
    'NOC Response' as service_type,
    COUNT(*) as count
FROM public.services 
WHERE id = 28;

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================

/*
SERVICES ADDED:

COPYRIGHT FILING (6 services):
1. Copyright Filing - Literary Work (id=16): ₹7,500 (₹7,000 prof + ₹500 govt)
2. Copyright Filing - Dramatic Work (id=17): ₹7,500 (₹7,000 prof + ₹500 govt)
3. Copyright Filing - Musical Work (id=18): ₹7,500 (₹7,000 prof + ₹500 govt)
4. Copyright Filing - Artistic Work (id=19): ₹7,500 (₹7,000 prof + ₹500 govt)
5. Copyright Filing - Cinematograph Film (id=20): ₹12,000 (₹7,000 prof + ₹5,000 govt)
6. Copyright Filing - Sound Recording (id=21): ₹9,000 (₹7,000 prof + ₹2,000 govt)

RESPONSE TO DISCREPANCY LETTER (6 services):
7. Response to Discrepancy - Literary (id=22): ₹3,000 (fixed)
8. Response to Discrepancy - Dramatic (id=23): ₹3,000 (fixed)
9. Response to Discrepancy - Musical (id=24): ₹3,000 (fixed)
10. Response to Discrepancy - Artistic (id=25): ₹3,000 (fixed)
11. Response to Discrepancy - Film (id=26): ₹3,000 (fixed)
12. Response to Discrepancy - Sound (id=27): ₹3,000 (fixed)

NOC RESPONSE (1 service):
13. NOC Response - Artistic Work (id=28): ₹10,000 (fixed)

TOTAL: 13 copyright services added

CONSTRAINTS UPDATED:
- orders.type constraint - added copyright service types
- payments.type constraint - added copyright service types
*/
