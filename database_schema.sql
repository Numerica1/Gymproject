-- =============================================================
--  Fitness Bhaktapur - Complete Database Schema
--  Run this in your Supabase SQL Editor to set up all tables
-- =============================================================

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- =============================================================
-- 1. CLIENTS (Members)
-- =============================================================
create table if not exists public.clients (
  id              uuid        primary key default gen_random_uuid(),
  full_name       text        not null,
  email           text        not null unique,
  phone           text,
  address         text,
  weight          text,
  height          text,
  special_request text,
  client_code     text        unique,
  member_since    text,
  package_key     text,
  package_name    text,
  package_status  text,
  username        text,
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_clients_email on public.clients (email);
create index if not exists idx_clients_client_code on public.clients (client_code);
create unique index if not exists ux_clients_client_code on public.clients (client_code);

alter table public.clients enable row level security;

drop policy if exists "Clients can view their own profile" on public.clients;
create policy "Clients can view their own profile"
  on public.clients for select using (auth.uid() = id);

drop policy if exists "Clients can update their own profile" on public.clients;
create policy "Clients can update their own profile"
  on public.clients for update using (auth.uid() = id);

drop policy if exists "Clients can insert their own profile" on public.clients;
create policy "Clients can insert their own profile"
  on public.clients for insert with check (auth.uid() = id);

-- =============================================================
-- 2. MEMBERSHIPS (Plans)
-- =============================================================
create table if not exists public.memberships (
  id               uuid          primary key default gen_random_uuid(),
  name             text          not null,
  duration         integer       not null,
  price            numeric(10,2) not null,
  description      text,
  plan_key         text          unique,
  access           text,
  trainer          text,
  sessions_total   integer,
  features         jsonb        not null default '[]'::jsonb,
  upcoming_classes jsonb        not null default '[]'::jsonb,
  highlighted      boolean       not null default false,
  source_payload   jsonb        not null default '{}'::jsonb,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

create index if not exists idx_memberships_name on public.memberships (name);
create index if not exists idx_memberships_plan_key on public.memberships (plan_key);
create unique index if not exists ux_memberships_plan_key on public.memberships (plan_key);

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

alter table public.memberships enable row level security;

drop policy if exists "Anyone can view memberships" on public.memberships;
create policy "Anyone can view memberships"
  on public.memberships for select using (true);

-- =============================================================
-- 3. TRAINERS
-- =============================================================
create table if not exists public.trainers (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  specialization   text,
  experience       integer,
  image_url        text,
  bio              text,
  trainer_key      text        unique,
  category         text,
  clients_label    text,
  source_payload   jsonb       not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_trainers_name on public.trainers (name);
create index if not exists idx_trainers_trainer_key on public.trainers (trainer_key);
create unique index if not exists ux_trainers_trainer_key on public.trainers (trainer_key);

drop trigger if exists trainers_set_updated_at on public.trainers;
create trigger trainers_set_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

alter table public.trainers enable row level security;

drop policy if exists "Anyone can view trainers" on public.trainers;
create policy "Anyone can view trainers"
  on public.trainers for select using (true);

-- =============================================================
-- 4. CLASSES (Programs)
-- =============================================================
create table if not exists public.classes (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  description     text,
  trainer_id      uuid        references public.trainers (id) on delete set null,
  schedule        timestamptz,
  capacity        integer     not null default 20,
  class_key       text        unique,
  trainer_name    text,
  time_label      text,
  capacity_label  text,
  image_url       text,
  duration        text,
  intensity       text,
  target_audience text,
  benefits        jsonb       not null default '[]'::jsonb,
  full_schedule   text,
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_classes_trainer_id on public.classes (trainer_id);
create index if not exists idx_classes_schedule    on public.classes (schedule);
create index if not exists idx_classes_class_key   on public.classes (class_key);
create unique index if not exists ux_classes_class_key on public.classes (class_key);

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

alter table public.classes enable row level security;

drop policy if exists "Anyone can view classes" on public.classes;
create policy "Anyone can view classes"
  on public.classes for select using (true);

-- =============================================================
-- 5. BRANDS (Shop Product Collections)
-- =============================================================
create table if not exists public.brands (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  brand_key       text        unique,
  logo_url        text,
  banner_url      text,
  description     text,
  status          text        not null default 'Active',
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_brands_name on public.brands (name);
create index if not exists idx_brands_brand_key on public.brands (brand_key);
create index if not exists idx_brands_status on public.brands (status);
create unique index if not exists ux_brands_brand_key on public.brands (brand_key);

drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

alter table public.brands enable row level security;

drop policy if exists "Anyone can view brands" on public.brands;
create policy "Anyone can view brands"
  on public.brands for select using (true);

-- =============================================================
-- 6. PRODUCTS (Shop Items)
-- =============================================================
create table if not exists public.products (
  id              uuid          primary key default gen_random_uuid(),
  brand_id        uuid          references public.brands (id) on delete set null,
  brand_key       text,
  brand_name      text,
  name            text          not null,
  description     text,
  price           numeric(10,2) not null,
  stock           integer       not null default 0,
  image_url       text,
  category        text,
  flavor          text,
  size_label      text,
  rating          numeric(3,2)  not null default 0,
  product_key     text          unique,
  status          text          not null default 'Active',
  source_payload  jsonb         not null default '{}'::jsonb,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

alter table public.products add column if not exists brand_id uuid references public.brands (id) on delete set null;
alter table public.products add column if not exists brand_key text;
alter table public.products add column if not exists brand_name text;
alter table public.products add column if not exists flavor text;
alter table public.products add column if not exists size_label text;
alter table public.products add column if not exists rating numeric(3,2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_brand_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_brand_id_fkey
      foreign key (brand_id) references public.brands (id) on delete set null;
  end if;
end $$;

create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_brand_id on public.products (brand_id);
create index if not exists idx_products_brand_key on public.products (brand_key);
create index if not exists idx_products_name     on public.products (name);
create index if not exists idx_products_product_key on public.products (product_key);
create unique index if not exists ux_products_product_key on public.products (product_key);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products"
  on public.products for select using (true);

-- =============================================================
-- 6. ORDERS
-- =============================================================
create table if not exists public.orders (
  id              uuid          primary key default gen_random_uuid(),
  client_id       uuid          not null references public.clients (id) on delete cascade,
  order_number    text          unique,
  customer_name   text,
  items           text,
  total_amount    numeric(10,2) not null,
  payment_label   text,
  status          text          not null default 'pending'
                                  check (status in ('pending', 'processing', 'completed', 'cancelled')),
  email           text,
  pickup_point    text,
  address         text,
  source_payload  jsonb         not null default '{}'::jsonb,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create index if not exists idx_orders_client_id     on public.orders (client_id);
create index if not exists idx_orders_status        on public.orders (status);
create index if not exists idx_orders_order_number  on public.orders (order_number);
create unique index if not exists ux_orders_order_number on public.orders (order_number);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Clients can view their own orders" on public.orders;
create policy "Clients can view their own orders"
  on public.orders for select using (auth.uid() = client_id);

drop policy if exists "Clients can create their own orders" on public.orders;
create policy "Clients can create their own orders"
  on public.orders for insert with check (auth.uid() = client_id);

-- =============================================================
-- 7. ORDER ITEMS
-- =============================================================
create table if not exists public.order_items (
  id          uuid          primary key default gen_random_uuid(),
  order_id    uuid          not null references public.orders   (id) on delete cascade,
  product_id  uuid          not null references public.products (id) on delete restrict,
  quantity    integer       not null check (quantity > 0),
  price       numeric(10,2) not null,
  created_at  timestamptz   not null default now()
);

create index if not exists idx_order_items_order_id   on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

alter table public.order_items enable row level security;

drop policy if exists "Clients can view their own order items" on public.order_items;
create policy "Clients can view their own order items"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.client_id = auth.uid()
  ));

drop policy if exists "Clients can insert their own order items" on public.order_items;
create policy "Clients can insert their own order items"
  on public.order_items for insert
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.client_id = auth.uid()
  ));

-- =============================================================
-- 8. REVIEWS
-- =============================================================
create table if not exists public.reviews (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        not null references public.clients (id) on delete cascade,
  rating          smallint    not null check (rating between 1 and 5),
  comment         text,
  review_key      text        unique,
  customer_name   text,
  product_name    text,
  status          text        not null default 'Approved',
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_reviews_client_id   on public.reviews (client_id);
create index if not exists idx_reviews_rating      on public.reviews (rating);
create index if not exists idx_reviews_review_key  on public.reviews (review_key);
create unique index if not exists ux_reviews_review_key on public.reviews (review_key);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews"
  on public.reviews for select using (true);

drop policy if exists "Clients can create reviews" on public.reviews;
create policy "Clients can create reviews"
  on public.reviews for insert with check (auth.uid() = client_id);

drop policy if exists "Clients can update their own reviews" on public.reviews;
create policy "Clients can update their own reviews"
  on public.reviews for update using (auth.uid() = client_id);

drop policy if exists "Clients can delete their own reviews" on public.reviews;
create policy "Clients can delete their own reviews"
  on public.reviews for delete using (auth.uid() = client_id);

-- =============================================================
-- 9. OFFERS
-- =============================================================
create table if not exists public.offers (
  id                    uuid          primary key default gen_random_uuid(),
  title                 text          not null,
  description           text,
  discount_percentage   numeric(5,2)  not null default 0
                                       check (discount_percentage between 0 and 100),
  start_date            date          not null default current_date,
  end_date              date          not null default (current_date + 365),
  offer_key             text          unique,
  code                  text,
  offer_type            text,
  status                text          not null default 'Active',
  source_payload        jsonb         not null default '{}'::jsonb,
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now()
);

alter table public.offers drop constraint if exists offers_date_check;

create index if not exists idx_offers_start_date on public.offers (start_date);
create index if not exists idx_offers_end_date   on public.offers (end_date);
create index if not exists idx_offers_offer_key  on public.offers (offer_key);
create index if not exists idx_offers_code       on public.offers (code);
create unique index if not exists ux_offers_offer_key on public.offers (offer_key);

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

alter table public.offers enable row level security;

drop policy if exists "Anyone can view offers" on public.offers;
create policy "Anyone can view offers"
  on public.offers for select using (true);

-- =============================================================
-- 10. BLOGS
-- =============================================================
create table if not exists public.blogs (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  content         text        not null,
  image_url       text,
  author_id       uuid        references public.clients (id) on delete set null,
  slug            text        unique,
  author_name     text,
  category        text,
  read_time       text,
  summary         text,
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_blogs_author_id   on public.blogs (author_id);
create index if not exists idx_blogs_created_at on public.blogs (created_at desc);
create index if not exists idx_blogs_slug        on public.blogs (slug);
create unique index if not exists ux_blogs_slug on public.blogs (slug);

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

alter table public.blogs enable row level security;

drop policy if exists "Anyone can view blogs" on public.blogs;
create policy "Anyone can view blogs"
  on public.blogs for select using (true);

drop policy if exists "Authors can manage their own blogs" on public.blogs;
create policy "Authors can manage their own blogs"
  on public.blogs for all using (auth.uid() = author_id);

-- =============================================================
-- 11. CONTACT MESSAGES
-- =============================================================
create table if not exists public.contact_messages (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  phone      text,
  subject    text,
  message    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_email      on public.contact_messages (email);
create index if not exists idx_contact_messages_created_at on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert with check (true);

drop policy if exists "Service role can read contact messages" on public.contact_messages;
create policy "Service role can read contact messages"
  on public.contact_messages for select using (true);

drop policy if exists "Service role can delete contact messages" on public.contact_messages;
create policy "Service role can delete contact messages"
  on public.contact_messages for delete using (true);

-- =============================================================
-- 12. PAYMENTS
-- =============================================================
create table if not exists public.payments (
  id              uuid          primary key default gen_random_uuid(),
  client_id       uuid          not null references public.clients (id) on delete cascade,
  amount          numeric(10,2) not null,
  method          text,
  status          text,
  txn_id          text          unique,
  member          text,
  date            text,
  source_payload  jsonb         not null default '{}'::jsonb,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

create index if not exists idx_payments_client_id on public.payments (client_id);
create index if not exists idx_payments_txn_id    on public.payments (txn_id);
create unique index if not exists ux_payments_txn_id on public.payments (txn_id);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "Clients can view their own payments" on public.payments;
create policy "Clients can view their own payments"
  on public.payments for select using (auth.uid() = client_id);

-- =============================================================
-- 13. ATTENDANCE
-- =============================================================
create table if not exists public.attendance (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        references public.clients (id) on delete set null,
  member          text,
  plan            text,
  status          text,
  time            text,
  date            date        not null default current_date,
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_attendance_client_id on public.attendance (client_id);
create index if not exists idx_attendance_date       on public.attendance (date);

alter table public.attendance enable row level security;

drop policy if exists "Clients can view their own attendance" on public.attendance;
create policy "Clients can view their own attendance"
  on public.attendance for select using (auth.uid() = client_id);

-- =============================================================
-- 14. BOOKINGS
-- =============================================================
create table if not exists public.bookings (
  id              uuid        primary key default gen_random_uuid(),
  client_id       uuid        references public.clients (id) on delete set null,
  booking_id      text        unique,
  member          text,
  service         text,
  trainer         text,
  program         text,
  email           text,
  date            text,
  source_payload  jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_bookings_client_id  on public.bookings (client_id);
create index if not exists idx_bookings_booking_id on public.bookings (booking_id);
create unique index if not exists ux_bookings_booking_id on public.bookings (booking_id);

alter table public.bookings enable row level security;

drop policy if exists "Clients can view their own bookings" on public.bookings;
create policy "Clients can view their own bookings"
  on public.bookings for select using (auth.uid() = client_id);

-- =============================================================
-- 15. GALLERY (Stored as JSONB in gym_data table)
-- =============================================================
-- Gallery images are stored in the gym_data table with key: fitness-bhaktapur-gallery-list
-- This is handled by the existing gym_data table

-- =============================================================
-- 16. LEGACY GYM_DATA TABLE (for backward compatibility)
-- =============================================================
create table if not exists public.gym_data (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_gym_data_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gym_data_touch_updated_at on public.gym_data;
create trigger gym_data_touch_updated_at
before update on public.gym_data
for each row execute function public.touch_gym_data_updated_at();

alter table public.gym_data enable row level security;

drop policy if exists "Public gym data can be read" on public.gym_data;
create policy "Public gym data can be read"
  on public.gym_data for select using (true);

-- =============================================================
-- UTILITY FUNCTIONS
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.stable_uuid(namespace text, value text)
returns uuid language sql immutable as $$
  select (
    substr(md5(namespace || ':' || coalesce(value, '')), 1, 8) || '-' ||
    substr(md5(namespace || ':' || coalesce(value, '')), 9, 4) || '-' ||
    substr(md5(namespace || ':' || coalesce(value, '')), 13, 4) || '-' ||
    substr(md5(namespace || ':' || coalesce(value, '')), 17, 4) || '-' ||
    substr(md5(namespace || ':' || coalesce(value, '')), 21, 12)
  )::uuid;
$$;
