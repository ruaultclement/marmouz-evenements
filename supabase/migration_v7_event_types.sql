-- V7 - Types d'evenement et regles de publication programmation

alter table public.dates
  add column if not exists event_type text not null default 'concert';

alter table public.dates
  add column if not exists first_part_title text;

alter table public.dates
  add column if not exists show_on_programmation boolean not null default true;

alter table public.dates
  add column if not exists highlight_group boolean not null default true;

alter table public.dates
  add column if not exists programmation_title text;

alter table public.dates
  add column if not exists programmation_details text;

alter table public.dates
  add column if not exists spectacle_license text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dates_event_type_check'
  ) then
    alter table public.dates
      add constraint dates_event_type_check
      check (event_type in ('concert', 'jam_session', 'soiree_thematique', 'autre'));
  end if;
end $$;
