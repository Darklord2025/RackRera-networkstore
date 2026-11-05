create table public.shop_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object')
);
alter table public.shop_profiles enable row level security;
revoke all on public.shop_profiles from anon, authenticated;
grant select, insert, update on public.shop_profiles to service_role;
