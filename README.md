# Marmouz Prog 🎪

Application de programmation pour La Guinguette des Marmouz.

Fonctionnalités incluses :
- liste publique des dates ouvertes
- formulaire candidature (fiche groupe stylée)
- dashboard admin premium avec stats
- vue admin des candidatures + validation/refus
- carte des groupes
- page programmation publique

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir : http://localhost:3000

## Variables d'environnement

Dans `.env.local`, renseigner :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `MAIL_USER`
- `MAIL_PASS`

## SQL Supabase (V3)

Le script complet est dans [supabase/schema_v3.sql](supabase/schema_v3.sql).

Étapes :
1. Ouvrir Supabase → SQL Editor
2. Coller le contenu de `schema_v3.sql`
3. Exécuter le script

Le script crée :
- tables `dates` et `candidatures` (avec champs ville + latitude/longitude)
- indexes
- vues `v_admin_stats` et `v_programmation_publique`
- policies RLS de base pour ce MVP

## Schéma Supabase minimal

### Table `dates`
- `id` uuid primary key
- `date` date
- `status` text (`open` ou `confirmed`)

### Table `candidatures`
- `id` uuid primary key
- `date_id` uuid
- `nom_groupe` text
- `email` text
- `contact` text
- `cachet` text
- `logement` text
- `message` text
- `status` text (`pending`, `accepted`, `refused`)

## Routes

- `/` : dates ouvertes
- `/date/[id]` : candidature artiste
- `/admin` : gestion des dates
- `/admin/date/[id]` : candidatures de la date
- `/programmation` : page programmation publique
