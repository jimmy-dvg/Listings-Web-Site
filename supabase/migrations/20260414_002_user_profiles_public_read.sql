drop policy if exists "profiles_select_own" on public.user_profiles;

create policy "profiles_select_public"
  on public.user_profiles
  for select
  using (true);
