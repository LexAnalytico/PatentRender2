-- Backfill `type` values between payments and orders
-- Run this after you've added the columns above. Use the Supabase SQL editor or psql with the service-role key.

BEGIN;

-- If orders already contain `type`, copy to payments where missing
UPDATE payments p
SET type = o.type
FROM orders o
WHERE o.payment_id = p.id
  AND p.type IS NULL
  AND o.type IS NOT NULL;

-- If payments contain `type`, copy to orders where missing
UPDATE orders o
SET type = p.type
FROM payments p
WHERE o.payment_id = p.id
  AND o.type IS NULL
  AND p.type IS NOT NULL;

COMMIT;

-- Verify results:
-- SELECT count(*) FROM payments WHERE type IS NULL;
-- SELECT count(*) FROM orders WHERE type IS NULL;

-- If you need more complex mapping (e.g. from quotes or other fields), extend these queries accordingly.
