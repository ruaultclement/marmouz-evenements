-- V8 - Parametres globaux site (texte candidature)

create table if not exists public.site_settings (
  key text primary key,
  value_text text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_select_public on public.site_settings;
create policy site_settings_select_public
  on public.site_settings
  for select
  using (true);

drop policy if exists site_settings_insert_public on public.site_settings;
create policy site_settings_insert_public
  on public.site_settings
  for insert
  with check (true);

drop policy if exists site_settings_update_public on public.site_settings;
create policy site_settings_update_public
  on public.site_settings
  for update
  using (true)
  with check (true);

insert into public.site_settings (key, value_text)
values (
  'candidature_guidelines',
  'Nous sommes une guinguette conviviale: les concerts s''inscrivent dans une offre globale gratuite pour notre clientele. Nous cherchons des propositions de qualite avec un budget realiste et adapte au lieu.'
)
on conflict (key) do nothing;
