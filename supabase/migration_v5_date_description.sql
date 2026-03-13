-- V5 - Description optionnelle pour les dates ouvertes

alter table public.dates add column if not exists description text;
