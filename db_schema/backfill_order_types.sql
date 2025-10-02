-- Migration: Backfill null order.type values using heuristics
-- 1. From existing non-null payment.type (join via payment_id)
UPDATE orders o
SET type = p.type
FROM payments p
WHERE o.payment_id = p.id
  AND o.type IS NULL
  AND p.type IS NOT NULL;

-- 2. From service name mapping (adjust mapping as needed)
WITH svc_map AS (
  SELECT s.id AS service_id,
         LOWER(s.name) AS svc_name
  FROM services s
)
UPDATE orders o
SET type = CASE
  WHEN m.svc_name = 'patentability search' THEN 'patentability_search'
  WHEN m.svc_name = 'drafting' THEN 'drafting'
  WHEN m.svc_name IN ('provisional filing','provisional patent filing') THEN 'provisional_filing'
  WHEN m.svc_name IN ('patent application filing','complete non provisional filing') THEN 'complete_non_provisional_filing'
  WHEN m.svc_name = 'pct filing' THEN 'pct_filing'
  WHEN m.svc_name = 'ps cs' THEN 'ps_cs'
  WHEN m.svc_name = 'first examination response' THEN 'fer_response'
  ELSE o.type
END
FROM svc_map m
WHERE o.service_id = m.service_id
  AND o.type IS NULL;

-- 3. Optional: Any remaining nulls copy a representative type from same payment (if all orders under a payment should share type)
UPDATE orders o
SET type = sub.any_type
FROM (
  SELECT payment_id, MAX(type) AS any_type
  FROM orders
  WHERE type IS NOT NULL
  GROUP BY payment_id
) sub
WHERE o.payment_id = sub.payment_id
  AND o.type IS NULL;

-- 4. Inspect remaining nulls
SELECT id, payment_id, service_id, type FROM orders WHERE type IS NULL LIMIT 100;

-- (Run steps iteratively in a transaction in production)