-- =============================
-- V3 - La Guinguette des Marmouz
-- =============================

create extension if not exists "pgcrypto";

create table if not exists public.dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  status text not null default 'open' check (status in ('open', 'confirmed')),
  created_at timestamptz not null default now()
);

create table if not exists public.candidatures (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references public.dates(id) on delete cascade,
  nom_groupe text not null,
  style_musical text,
  ville text,
  latitude double precision,
  longitude double precision,
  membres integer,
  contact text not null,
  email text not null,
  reseaux text,
  cachet text,
  logement text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'refused')),
  created_at timestamptz not null default now()
);

create index if not exists idx_candidatures_date_id on public.candidatures(date_id);
create index if not exists idx_candidatures_status on public.candidatures(status);
create index if not exists idx_dates_status on public.dates(status);

-- Statistiques admin
create or replace view public.v_admin_stats as
select
  (select count(*) from public.dates where status = 'open') as open_dates,
  (select count(*) from public.dates where status = 'confirmed') as confirmed_dates,
  (select count(*) from public.candidatures where status = 'pending') as pending_candidatures,
  (select count(distinct lower(trim(nom_groupe))) from public.candidatures) as unique_groups;

-- Programmation publique (dates confirmées + groupe accepté)
create or replace view public.v_programmation_publique as
select
  d.id as date_id,
  d.date,
  d.status as date_status,
  c.id as candidature_id,
  c.nom_groupe,
  c.style_musical,
  c.ville,
  c.latitude,
  c.longitude,
  c.membres,
  c.reseaux,
  c.cachet,
  c.logement,
  c.message
from public.dates d
left join public.candidatures c
  on c.date_id = d.id and c.status = 'accepted'
where d.status = 'confirmed'
order by d.date asc;

alter table public.dates enable row level security;
alter table public.candidatures enable row level security;

-- Public read dates open/confirmed
drop policy if exists dates_select_public on public.dates;
create policy dates_select_public
  on public.dates
  for select
  using (true);

-- Public insert candidatures (site artiste)
drop policy if exists candidatures_insert_public on public.candidatures;
create policy candidatures_insert_public
  on public.candidatures
  for insert
  with check (true);

-- Public read candidatures (optionnel pour admin client-side avec anon key)
drop policy if exists candidatures_select_public on public.candidatures;
create policy candidatures_select_public
  on public.candidatures
  for select
  using (true);

-- Public update candidatures (optionnel pour admin client-side avec anon key)
drop policy if exists candidatures_update_public on public.candidatures;
create policy candidatures_update_public
  on public.candidatures
  for update
  using (true)
  with check (true);

-- Public update dates (optionnel pour admin client-side avec anon key)
drop policy if exists dates_update_public on public.dates;
create policy dates_update_public
  on public.dates
  for update
  using (true)
  with check (true);

-- Public insert dates (optionnel pour admin client-side avec anon key)
drop policy if exists dates_insert_public on public.dates;
create policy dates_insert_public
  on public.dates
  for insert
  with check (true);
