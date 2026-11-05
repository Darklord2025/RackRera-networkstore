-- RackVira owns this Auth project and equipment data.
create table public.shop_addresses (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 data jsonb not null check(jsonb_typeof(data)='object'),created_at timestamptz not null default now()
);
create index on public.shop_addresses(user_id);
create table public.shop_products (
 id text primary key,name_fa text not null,name_en text not null,
 unit_toman bigint check(unit_toman between 0 and 100000000000),stock integer not null default 0 check(stock>=0),
 active boolean not null default false,verified_at timestamptz,data jsonb not null default '{}'
);
-- Deliberately no seeded example SKUs/prices: the public design profiles are not verified products.
create table public.shop_favorites (
 user_id uuid not null references auth.users(id) on delete cascade,product_id text not null references public.shop_products(id),
 created_at timestamptz not null default now(),primary key(user_id,product_id)
);
create table public.shop_orders (
 id uuid primary key default gen_random_uuid(),number bigint generated always as identity(start with 10001) unique,
 user_id uuid not null references auth.users(id) on delete cascade,status text not null default 'requested'
 check(status in('requested','quoted','awaiting_payment','paid','packing','shipped','delivered','cancelled','returned')),
 description text not null check(length(description) between 10 and 4000),quantity integer not null check(quantity between 1 and 99),
 address jsonb,total_toman bigint check(total_toman between 0 and 100000000000),tracking text,created_at timestamptz not null default now()
);
create index on public.shop_orders(user_id,created_at desc);
alter table public.shop_addresses enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_favorites enable row level security;
alter table public.shop_orders enable row level security;
revoke all on public.shop_addresses,public.shop_products,public.shop_favorites,public.shop_orders from anon,authenticated;
grant all on public.shop_addresses,public.shop_products,public.shop_favorites,public.shop_orders to service_role;
grant usage,select on sequence public.shop_orders_number_seq to service_role;
