drop policy if exists "authenticated users can create couples"
on public.couples;

drop policy if exists "authenticated users can create own admin membership"
on public.couple_members;

drop policy if exists "creators can create own admin membership"
on public.couple_members;

create policy "creators can create own admin membership"
on public.couple_members for insert
with check (
  auth.uid() = user_id
  and role = 'admin'
  and exists (
    select 1
    from public.couples
    where public.couples.id = couple_members.couple_id
    and public.couples.created_by = auth.uid()
  )
);
