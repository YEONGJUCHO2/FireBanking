create type public.asset_account_category as enum ('general', 'pension_savings', 'irp', 'other');
create type public.liability_purpose as enum ('residence', 'investment', 'lifestyle_credit', 'other');
create type public.instrument_market as enum ('KR');

create table public.asset_instruments (
  id uuid primary key default gen_random_uuid(),
  market public.instrument_market not null,
  symbol text not null,
  display_name text not null,
  instrument_type text not null check (instrument_type in ('stock', 'etf')),
  currency text not null default 'KRW',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market, symbol)
);

create table public.asset_holdings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  instrument_id uuid not null references public.asset_instruments(id),
  quantity numeric(20, 6) not null check (quantity > 0),
  account_category public.asset_account_category not null default 'general',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_liabilities (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  purpose public.liability_purpose not null,
  balance_amount numeric(14, 0) not null check (balance_amount >= 0),
  monthly_interest_amount numeric(14, 0) not null default 0 check (monthly_interest_amount >= 0),
  monthly_principal_amount numeric(14, 0) not null default 0 check (monthly_principal_amount >= 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.asset_instruments(id) on delete cascade,
  valuation_date date not null,
  close_price numeric(14, 4) not null check (close_price >= 0),
  provider text not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (instrument_id, valuation_date, provider)
);

create table public.monthly_asset_snapshots (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  snapshot_month date not null,
  snapshot_date date not null,
  valuation_date date,
  cash_asset_amount numeric(14, 0) not null default 0,
  domestic_holding_valuation_amount numeric(14, 0) not null default 0,
  us_listed_manual_valuation_amount numeric(14, 0) not null default 0,
  other_investment_amount numeric(14, 0) not null default 0,
  investment_asset_amount numeric(14, 0) not null default 0,
  real_estate_asset_amount numeric(14, 0) not null default 0,
  other_asset_amount numeric(14, 0) not null default 0,
  total_asset_amount numeric(14, 0) not null default 0,
  total_liability_amount numeric(14, 0) not null default 0,
  displayed_net_worth numeric(14, 0) not null,
  fire_calculation_net_worth numeric(14, 0) not null,
  monthly_debt_interest_amount numeric(14, 0) not null default 0,
  monthly_debt_principal_amount numeric(14, 0) not null default 0,
  created_at timestamptz not null default now(),
  unique (couple_id, snapshot_month)
);

create index asset_holdings_couple_id_idx on public.asset_holdings(couple_id);
create index asset_holdings_instrument_id_idx on public.asset_holdings(instrument_id);
create index asset_liabilities_couple_id_idx on public.asset_liabilities(couple_id);
create index asset_price_snapshots_instrument_date_idx
on public.asset_price_snapshots(instrument_id, valuation_date desc);
create index monthly_asset_snapshots_couple_month_idx
on public.monthly_asset_snapshots(couple_id, snapshot_month desc);

alter table public.asset_instruments enable row level security;
alter table public.asset_holdings enable row level security;
alter table public.asset_liabilities enable row level security;
alter table public.asset_price_snapshots enable row level security;
alter table public.monthly_asset_snapshots enable row level security;

create policy "members can read asset instruments"
on public.asset_instruments for select
using (true);

create policy "members can read asset holdings"
on public.asset_holdings for select
using (public.is_couple_member(couple_id));

create policy "admins can insert asset holdings"
on public.asset_holdings for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update asset holdings"
on public.asset_holdings for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "admins can delete asset holdings"
on public.asset_holdings for delete
using (public.is_couple_admin(couple_id));

create policy "members can read asset liabilities"
on public.asset_liabilities for select
using (public.is_couple_member(couple_id));

create policy "admins can insert asset liabilities"
on public.asset_liabilities for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update asset liabilities"
on public.asset_liabilities for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "admins can delete asset liabilities"
on public.asset_liabilities for delete
using (public.is_couple_admin(couple_id));

create policy "members can read asset price snapshots"
on public.asset_price_snapshots for select
using (true);

create policy "members can read monthly asset snapshots"
on public.monthly_asset_snapshots for select
using (public.is_couple_member(couple_id));
