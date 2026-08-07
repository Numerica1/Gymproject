-- =============================================================
--  Fitness Bhaktapur - Shop Buyers Table Migration
--  Run this in your Supabase SQL Editor
-- =============================================================

-- Enable pgcrypto for UUID generation (if not already enabled)
create extension if not exists "pgcrypto";

-- =============================================================
-- SHOP_BUYERS Table
-- Stores data for users who sign in/register via the shop only
-- (i.e., they have no gym membership - package.key === 'none')
-- =============================================================
create table if not exists public.shop_buyers (
  id            uuid        primary key default gen_random_uuid(),
  full_name     text        not null,
  email         text        not null unique,
  phone         text,
  address       text,
  member_since  text,
  source_payload jsonb      not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_shop_buyers_email on public.shop_buyers (email);

drop trigger if exists shop_buyers_set_updated_at on public.shop_buyers;
create trigger shop_buyers_set_updated_at
  before update on public.shop_buyers
  for each row execute function public.set_updated_at();

alter table public.shop_buyers enable row level security;

drop policy if exists "Anyone can insert shop buyers" on public.shop_buyers;
create policy "Anyone can insert shop buyers"
  on public.shop_buyers for insert with check (true);

drop policy if exists "Anyone can update shop buyers" on public.shop_buyers;
create policy "Anyone can update shop buyers"
  on public.shop_buyers for update using (true);

drop policy if exists "Anyone can select shop buyers" on public.shop_buyers;
create policy "Anyone can select shop buyers"
  on public.shop_buyers for select using (true);

drop policy if exists "Anyone can delete shop buyers" on public.shop_buyers;
create policy "Anyone can delete shop buyers"
  on public.shop_buyers for delete using (true);
