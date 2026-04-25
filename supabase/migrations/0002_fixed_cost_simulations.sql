create table public.fixed_cost_simulations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fixed_cost_simulations enable row level security;

create policy "users can read own fixed cost simulation"
on public.fixed_cost_simulations for select
using (auth.uid() = user_id);

create policy "users can insert own fixed cost simulation"
on public.fixed_cost_simulations for insert
with check (auth.uid() = user_id);

create policy "users can update own fixed cost simulation"
on public.fixed_cost_simulations for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
