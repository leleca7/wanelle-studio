-- Wanelle Studio • Execute no SQL Editor do Supabase.
-- 1) Em Authentication, crie o usuário da administradora.
-- 2) Substitua o UUID no INSERT final pelo identificador desse usuário.
-- 3) Configure URL e chave publishable/anon em config.js (NUNCA service_role).

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_data (
  key text primary key check (key in ('ingredients','recipes','settings')),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer text not null check (char_length(customer) between 1 and 150),
  phone text not null default '' check (char_length(phone) <= 30),
  "eventDate" date not null,
  occasion text not null default '',
  servings integer not null default 20 check (servings between 1 and 500),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items)='array' and jsonb_array_length(items) <= 20),
  method text not null default 'Retirada',
  neighborhood text not null default '',
  custom boolean not null default false,
  flavor text not null default '',
  filling text not null default '',
  decoration text not null default '',
  notes text not null default '',
  status text not null default 'novo' check (status in ('novo','orcado','confirmado','producao','pronto','entregue')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz,
  source text not null default 'site',
  "salePrice" numeric(12,2),
  "quoteSnapshot" jsonb,
  "deliveryCost" numeric(12,2) not null default 0,
  "fillingLayers" integer not null default 2 check ("fillingLayers" between 1 and 10),
  "sizeCm" numeric(6,1),
  "decorationLevel" text not null default 'simples' check ("decorationLevel" in ('simples','detalhada','artistica')),
  "laborMode" text not null default 'auto' check ("laborMode" in ('auto','manual')),
  "stageMinutes" jsonb not null default '{}'::jsonb,
  "extraMaterialsCost" numeric(12,2) not null default 0,
  "otherOrderCost" numeric(12,2) not null default 0,
  "provisionalApproved" boolean not null default false,
  "actualRecorded" boolean not null default false,
  "actualStageMinutes" jsonb not null default '{}'::jsonb,
  "actualExtraCost" numeric(12,2) not null default 0
);
-- Migração compatível: execute também em projetos onde a tabela orders já existe.
alter table public.orders add column if not exists "fillingLayers" integer not null default 2;
alter table public.orders add column if not exists "sizeCm" numeric(6,1);
alter table public.orders add column if not exists "decorationLevel" text not null default 'simples';
alter table public.orders add column if not exists "laborMode" text not null default 'auto';
alter table public.orders add column if not exists "stageMinutes" jsonb not null default '{}'::jsonb;
alter table public.orders add column if not exists "extraMaterialsCost" numeric(12,2) not null default 0;
alter table public.orders add column if not exists "otherOrderCost" numeric(12,2) not null default 0;
alter table public.orders add column if not exists "provisionalApproved" boolean not null default false;
alter table public.orders add column if not exists "actualRecorded" boolean not null default false;
alter table public.orders add column if not exists "actualStageMinutes" jsonb not null default '{}'::jsonb;
alter table public.orders add column if not exists "actualExtraCost" numeric(12,2) not null default 0;

create index if not exists idx_wanelle_orders_status_date on public.orders(status,"eventDate");
create index if not exists idx_wanelle_orders_created on public.orders("createdAt" desc);

alter table public.admin_users enable row level security;
alter table public.app_data enable row level security;
alter table public.orders enable row level security;

-- A pessoa autenticada pode conferir se faz parte da lista de administradoras.
drop policy if exists "admin_see_own_membership" on public.admin_users;
create policy "admin_see_own_membership" on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Administradoras autenticadas gerenciam receitas, custos e pedidos.
drop policy if exists "admins_manage_app_data" on public.app_data;
create policy "admins_manage_app_data" on public.app_data for all to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

drop policy if exists "admins_manage_orders" on public.orders;
create policy "admins_manage_orders" on public.orders for all to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

-- Visitantes podem apenas CADASTRAR um pedido novo, nunca consultar dados de clientes,
-- custos, receitas ou orçamentos. Adicione captcha/rate-limit antes de campanha pública.
drop policy if exists "visitors_submit_new_request" on public.orders;
create policy "visitors_submit_new_request" on public.orders for insert to anon
with check (
  status='novo' and "salePrice" is null and "quoteSnapshot" is null
  and "deliveryCost"=0
  and "provisionalApproved"=false and "actualRecorded"=false
  and "extraMaterialsCost"=0 and "otherOrderCost"=0 and "actualExtraCost"=0
  and "laborMode"='auto' and "stageMinutes"='{}'::jsonb and "actualStageMinutes"='{}'::jsonb
  and char_length(customer) between 1 and 150
  and char_length(notes)<=4000
  and "eventDate">=current_date
  and source is not null
);

-- APÓS cadastrar a administradora em Supabase Authentication:
-- insert into public.admin_users (user_id) values ('COLE-AQUI-O-UUID-DO-USUARIO');

-- Privilégios da API REST. As políticas acima continuam restringindo cada operação.
grant usage on schema public to anon, authenticated;
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.app_data to authenticated;
grant select on public.admin_users to authenticated;