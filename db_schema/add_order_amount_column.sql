-- Migration: add amount column to orders table if it does not exist
-- Safe for repeated execution in Postgres (uses DO block with conditional check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN amount numeric;
  END IF;
END$$;

-- Optional: backfill existing orders with proportional amounts (commented out)
-- UPDATE public.orders o
-- SET amount = p.total_amount / NULLIF(cnt.cnt,0)
-- FROM payments p
-- JOIN (
--   SELECT payment_id, COUNT(*) AS cnt FROM orders GROUP BY payment_id
-- ) cnt ON cnt.payment_id = o.payment_id
-- WHERE o.amount IS NULL AND p.id = o.payment_id AND p.total_amount IS NOT NULL;
