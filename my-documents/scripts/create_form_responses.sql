-- Create table to store per-user form responses for orders
-- Run this in your Supabase SQL editor or psql

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id bigint references public.orders(id) on delete cascade,
  form_type text not null,
  data jsonb not null default '{}',
  fields_filled_count integer not null default 0,
  fields_total integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure one row per (user, order, form_type)
create unique index if not exists form_responses_user_order_type_uidx
  on public.form_responses (user_id, order_id, form_type);

-- Helpful GIN index for querying data keys (optional)
create index if not exists form_responses_data_gin on public.form_responses using gin (data);

-- Row Level Security
alter table public.form_responses enable row level security;

-- Note: Postgres (incl. Supabase) doesn't support IF NOT EXISTS on CREATE POLICY
-- Make these idempotent by dropping first, then creating.
drop policy if exists "form_responses_select_own" on public.form_responses;
create policy "form_responses_select_own"
  on public.form_responses for select
  using (auth.uid() = user_id);

drop policy if exists "form_responses_insert_own" on public.form_responses;
create policy "form_responses_insert_own"
  on public.form_responses for insert
  with check (auth.uid() = user_id);

drop policy if exists "form_responses_update_own" on public.form_responses;
create policy "form_responses_update_own"
  on public.form_responses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.form_responses
for each row execute procedure public.set_updated_at();
