-- Extensions
create extension if not exists pgcrypto;

-- Keep profile data mirrored from auth users
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null unique,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User-owned listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_created_at_idx on public.listings(created_at desc);

-- One listing can have many photos
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null unique,
  created_at timestamptz not null default now(),
  sort_order integer not null default 0
);

create index if not exists listing_photos_listing_id_idx on public.listing_photos(listing_id);
create index if not exists listing_photos_owner_id_idx on public.listing_photos(owner_id);

-- Optional helper for storage policy checks
create or replace function public.is_listing_owner(listing_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    where l.id = listing_uuid
      and l.user_id = auth.uid()
  );
$$;

-- RLS enablement
alter table public.user_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;

-- user_profiles policies
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
  on public.user_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- listings policies: everyone can read, owners can manage own rows
drop policy if exists "listings_select_all" on public.listings;
create policy "listings_select_all"
  on public.listings
  for select
  using (true);

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
  on public.listings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
  on public.listings
  for delete
  using (auth.uid() = user_id);

-- listing_photos metadata policies
drop policy if exists "listing_photos_select_all" on public.listing_photos;
create policy "listing_photos_select_all"
  on public.listing_photos
  for select
  using (true);

drop policy if exists "listing_photos_insert_owner" on public.listing_photos;
create policy "listing_photos_insert_owner"
  on public.listing_photos
  for insert
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.user_id = auth.uid()
    )
  );

drop policy if exists "listing_photos_update_owner" on public.listing_photos;
create policy "listing_photos_update_owner"
  on public.listing_photos
  for update
  using (auth.uid() = owner_id)
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.user_id = auth.uid()
    )
  );

drop policy if exists "listing_photos_delete_owner" on public.listing_photos;
create policy "listing_photos_delete_owner"
  on public.listing_photos
  for delete
  using (auth.uid() = owner_id);

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Storage object policies: everyone can read photos, only listing owner can write/delete
drop policy if exists "listing_photos_bucket_public_read" on storage.objects;
create policy "listing_photos_bucket_public_read"
  on storage.objects
  for select
  using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_bucket_owner_insert" on storage.objects;
create policy "listing_photos_bucket_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and public.is_listing_owner((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "listing_photos_bucket_owner_update" on storage.objects;
create policy "listing_photos_bucket_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and public.is_listing_owner((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'listing-photos'
    and public.is_listing_owner((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "listing_photos_bucket_owner_delete" on storage.objects;
create policy "listing_photos_bucket_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and public.is_listing_owner((storage.foldername(name))[1]::uuid)
  );
