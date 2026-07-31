-- =============================================================
-- SOFT-DELETE MIGRATION
-- Run this entire script in your Supabase SQL Editor.
-- It is fully idempotent (safe to run multiple times).
-- =============================================================

-- clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_by  TEXT;
CREATE INDEX IF NOT EXISTS idx_clients_is_deleted    ON public.clients    (is_deleted);

-- trainers
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_trainers_is_deleted   ON public.trainers   (is_deleted);

-- memberships
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_memberships_is_deleted ON public.memberships (is_deleted);

-- programs  (already in schema, but kept idempotent)
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS deleted_by  TEXT;
CREATE INDEX IF NOT EXISTS idx_programs_is_deleted   ON public.programs   (is_deleted);

-- blogs
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS is_deleted    BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS deleted_by    TEXT;
CREATE INDEX IF NOT EXISTS idx_blogs_is_deleted      ON public.blogs      (is_deleted);

-- reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS deleted_by  TEXT;
CREATE INDEX IF NOT EXISTS idx_reviews_is_deleted    ON public.reviews    (is_deleted);

-- offers
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS deleted_by   TEXT;
CREATE INDEX IF NOT EXISTS idx_offers_is_deleted     ON public.offers     (is_deleted);

-- brands
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS deleted_by   TEXT;
CREATE INDEX IF NOT EXISTS idx_brands_is_deleted     ON public.brands     (is_deleted);

-- products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_products_is_deleted   ON public.products   (is_deleted);

-- shop_categories
ALTER TABLE public.shop_categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.shop_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.shop_categories ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_shop_categories_is_deleted ON public.shop_categories (is_deleted);

-- orders
ALTER TABLE public.orders ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone          TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted     BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_by     TEXT;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
CREATE INDEX IF NOT EXISTS idx_orders_is_deleted ON public.orders (is_deleted);

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


-- =============================================================
-- VERIFY: Run this SELECT to confirm all columns were added.
-- =============================================================
-- SELECT table_name, column_name, data_type, column_default
-- FROM   information_schema.columns
-- WHERE  table_schema = 'public'
--   AND  column_name  = 'is_deleted'
-- ORDER  BY table_name;
