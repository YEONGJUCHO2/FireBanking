create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.couple_role as enum ('admin', 'lite');

create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.couple_role not null,
  joined_at timestamptz not null default now(),
  unique (couple_id, user_id)
);

create table public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.monthly_cashflow_snapshots (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  month date not null,
  total_income numeric(14, 0) not null,
  investable_net_worth numeric(14, 0) not null,
  primary_residence_net_worth numeric(14, 0) not null,
  other_net_worth numeric(14, 0) not null,
  total_net_worth_for_display numeric(14, 0) not null,
  fire_calculation_net_worth numeric(14, 0) not null,
  fixed_expense numeric(14, 0) not null,
  variable_expense numeric(14, 0) not null,
  regular_investment numeric(14, 0) not null,
  remaining_cash numeric(14, 0) not null,
  monthly_asset_growth_capacity numeric(14, 0) not null,
  annual_fire_expense numeric(14, 0) not null,
  fire_target_asset numeric(14, 0) not null,
  projected_fire_date date,
  created_at timestamptz not null default now(),
  unique (couple_id, month)
);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.monthly_cashflow_snapshots enable row level security;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = target_couple_id
    and couple_members.user_id = auth.uid()
  );
$$;

create or replace function public.is_couple_admin(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = target_couple_id
    and couple_members.user_id = auth.uid()
    and couple_members.role = 'admin'
  );
$$;

create policy "profiles are readable by self"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are insertable by self"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles are updatable by self"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "members can read own couples"
on public.couples for select
using (public.is_couple_member(id));

create policy "authenticated users can create couples"
on public.couples for insert
with check (auth.uid() is not null);

create policy "members can read memberships"
on public.couple_members for select
using (public.is_couple_member(couple_id));

create policy "authenticated users can create own admin membership"
on public.couple_members for insert
with check (auth.uid() = user_id and role = 'admin');

create policy "admins can read couple invites"
on public.couple_invites for select
using (public.is_couple_admin(couple_id));

create policy "admins can insert couple invites"
on public.couple_invites for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update couple invites"
on public.couple_invites for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "members can read monthly snapshots"
on public.monthly_cashflow_snapshots for select
using (public.is_couple_member(couple_id));

create policy "admins can insert monthly snapshots"
on public.monthly_cashflow_snapshots for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update monthly snapshots"
on public.monthly_cashflow_snapshots for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));
