-- Migration: add assignment/forwarding columns to orders
-- Created: 2025-10-03
-- Description: Adds assigned_to and responsible columns to support forwarding orders between admins.
-- Assumptions: existing table name is public.orders
-- Safe to run multiple times with IF NOT EXISTS checks where possible.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS assigned_to text NULL,
  ADD COLUMN IF NOT EXISTS responsible text NULL;

-- Optional: if you maintain a separate users table with emails, you may later
-- convert assigned_to to a foreign key referencing users(id) instead of storing email.
-- For now we store admin email to simplify filtering.

-- Index to speed up filtering by assigned_to (esp. for admin2/admin3 views)
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON public.orders(assigned_to);

-- (Optional) Derived trigger to keep responsible in sync with assigned_to if you prefer automatic copy
-- Uncomment if you want auto-maintenance.
-- CREATE OR REPLACE FUNCTION public.orders_set_responsible_from_assigned()
-- RETURNS trigger AS $$
-- BEGIN
--   IF NEW.assigned_to IS NOT NULL AND (NEW.responsible IS NULL OR NEW.responsible <> NEW.assigned_to) THEN
--     NEW.responsible := NEW.assigned_to;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- DROP TRIGGER IF EXISTS trg_orders_set_responsible ON public.orders;
-- CREATE TRIGGER trg_orders_set_responsible
--   BEFORE INSERT OR UPDATE OF assigned_to ON public.orders
--   FOR EACH ROW
--   EXECUTE FUNCTION public.orders_set_responsible_from_assigned();

-- RLS policy suggestions (DO NOT RUN blindly if you already have policies):
-- 1. Allow admin1 full select/update: (auth.jwt() ->> 'email') = 'admin1@example.com'
-- 2. Allow other admins select where assigned_to = their email OR they are admin1
-- 3. Allow update of assigned_to only by admin1
-- Example:
-- create policy "orders_select_assigned_admins" on public.orders for select using (
--   (auth.jwt() ->> 'email') = 'admin1@example.com' OR assigned_to = (auth.jwt() ->> 'email')
-- );
-- create policy "orders_update_assignment_admin1" on public.orders for update using (
--   (auth.jwt() ->> 'email') = 'admin1@example.com'
-- ) with check ((auth.jwt() ->> 'email') = 'admin1@example.com');
