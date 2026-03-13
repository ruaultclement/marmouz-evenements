-- V9 - Analytics programmation pour intégration WordPress

create table if not exists public.programmation_analytics (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_url text,
  payload jsonb not null default '{}'::jsonb,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_programmation_analytics_created_at
  on public.programmation_analytics(created_at desc);

create index if not exists idx_programmation_analytics_event_name
  on public.programmation_analytics(event_name);

alter table public.programmation_analytics enable row level security;

drop policy if exists programmation_analytics_insert_public on public.programmation_analytics;
create policy programmation_analytics_insert_public
  on public.programmation_analytics
  for insert
  with check (true);

drop policy if exists programmation_analytics_select_public on public.programmation_analytics;
create policy programmation_analytics_select_public
  on public.programmation_analytics
  for select
  using (true);
