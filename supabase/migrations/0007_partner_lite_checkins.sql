create table public.partner_lite_checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  income_amount numeric(14, 0) not null check (income_amount >= 0),
  expense_amount numeric(14, 0) not null check (expense_amount >= 0),
  savings_amount numeric(14, 0) not null check (savings_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, user_id, month)
);

create index partner_lite_checkins_couple_month_idx
on public.partner_lite_checkins(couple_id, month desc);

alter table public.partner_lite_checkins enable row level security;

create policy "members can read partner lite checkins"
on public.partner_lite_checkins for select
using (public.is_couple_member(couple_id));

create policy "lite members can insert own checkins"
on public.partner_lite_checkins for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = partner_lite_checkins.couple_id
    and couple_members.user_id = auth.uid()
    and couple_members.role = 'lite'
  )
);

create policy "lite members can update own checkins"
on public.partner_lite_checkins for update
using (auth.uid() = user_id and public.is_couple_member(couple_id))
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = partner_lite_checkins.couple_id
    and couple_members.user_id = auth.uid()
    and couple_members.role = 'lite'
  )
);
