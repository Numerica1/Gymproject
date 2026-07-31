-- =============================================================
-- ORDERS TABLE FIX MIGRATION
-- Run this in your Supabase SQL Editor to fix Order creation issues
-- =============================================================

-- 1. Make client_id optional (orders can be placed by guests or clients)
ALTER TABLE public.orders ALTER COLUMN client_id DROP NOT NULL;

-- 2. Add missing columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone          TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted     BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_by     TEXT;

-- 3. Drop restrictive check constraint on status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 4. Create index for is_deleted
CREATE INDEX IF NOT EXISTS idx_orders_is_deleted ON public.orders (is_deleted);

-- 5. Update RLS policies on orders table so guests and clients can create/view orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Clients can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON public.orders;

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete orders" ON public.orders FOR DELETE USING (true);
