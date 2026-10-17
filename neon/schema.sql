-- Wanelle Studio: Neon/PostgreSQL.
-- Não utilizar tabelas do Supabase (auth.users, RLS, PostgREST).
-- Os acessos são mediados pelas rotas /api/wanelle no Vercel.
CREATE TABLE IF NOT EXISTS public.wanelle_app_data (
  section text PRIMARY KEY CHECK (section IN ('ingredients','recipes','settings')),
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.wanelle_orders (
  id text PRIMARY KEY,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wanelle_orders_created_idx ON public.wanelle_orders(created_at DESC);
CREATE TABLE IF NOT EXISTS public.wanelle_login_attempts (
  key_hash text PRIMARY KEY,
  failures integer NOT NULL DEFAULT 0,
  first_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz
);
-- Não há INSERT fictício: receitas, preços, clientes e encomendas começam vazios.

-- Cotações levantadas manualmente, não verificadas diretamente no iFood.
CREATE TABLE IF NOT EXISTS public.wanelle_market_quotes (
  id text PRIMARY KEY,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  received_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wanelle_market_quotes_store_idx ON public.wanelle_market_quotes ((payload->>'store'));

-- Contador antiabuso por identificador pseudônimo e janela de uma hora.
-- Apagar registros antigos por rotina administrativa; sem armazenamento de IP bruto.
CREATE TABLE IF NOT EXISTS public.wanelle_public_limits (
  key_hash text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wanelle_public_limits_updated_idx ON public.wanelle_public_limits(updated_at);
