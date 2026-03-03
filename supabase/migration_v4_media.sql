-- V4 - Ajout champs médias pour groupes confirmés

alter table public.candidatures add column if not exists photo_url text;
alter table public.candidatures add column if not exists video_url text;
alter table public.candidatures add column if not exists bio text;
alter table public.candidatures add column if not exists updated_at timestamptz default now();
