-- V6 - Piece jointe artiste (PDF/autre) sur candidature

alter table public.candidatures
  add column if not exists document_url text;
