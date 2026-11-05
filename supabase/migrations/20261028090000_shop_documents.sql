-- Issued by the trusted billing workflow only; customers cannot create or mark documents paid.
alter table public.shop_orders add constraint shop_order_owner_unique unique(id,user_id);
create table public.shop_documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 order_id uuid not null,
 kind text not null check(kind in ('proforma','official')),
 document jsonb not null check(coalesce(jsonb_typeof(document->'invoice')='object' and jsonb_typeof(document->'retail')='object' and jsonb_typeof(document->'invoice'->'buyer')='object',false)),
 created_at timestamptz not null default now(),
 foreign key(order_id,user_id) references public.shop_orders(id,user_id) on delete cascade,
 check(kind<>'official' or (coalesce(document->'invoice'->>'status','')='Paid' and length(coalesce(document->'invoice'->>'officialNumber',''))>0)),
 check(coalesce(document->'invoice'->'buyer'->>'kind' in ('personal','company'),false)),
 check(document->'invoice'->'buyer'->>'kind' is distinct from 'company' or
   (length(coalesce(document->'invoice'->'buyer'->>'name',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'company',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'nationalId',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'economicCode',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'registrationNumber',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'postalCode',''))>0 and length(coalesce(document->'invoice'->'buyer'->>'address',''))>0))
);
create index on public.shop_documents(user_id,created_at desc);
alter table public.shop_documents enable row level security;
revoke all on public.shop_documents from anon,authenticated;
grant all on public.shop_documents to service_role;
