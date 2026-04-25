alter table public.couples
add column created_by uuid references auth.users(id) on delete set null;

create policy "creators can read newly created couples"
on public.couples for select
using (created_by = auth.uid());

create policy "authenticated users can create owned couples"
on public.couples for insert
with check (auth.uid() is not null and created_by = auth.uid());
