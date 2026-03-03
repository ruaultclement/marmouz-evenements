## 🚀 Installation complète V3

### Étape 1 : Setup Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un projet
2. Récupère l'URL du projet et la clé anon (dans Settings > API)
3. Ouvre le **SQL Editor** et exécute `supabase/schema_v3.sql` en entier

### Étape 2 : Configurer les variables d'environnement

Crée `.env.local` dans le dossier racine :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

(Tu peux aussi copier `.env.example` et le renommer en `.env.local`)

### Étape 3 : Ajouter une date de test

1. Lance le projet : `npm run dev`
2. Ouvre http://localhost:3000
3. Va dans l'URL : `/admin`
4. Ajoute une date (ex: demain, 2026-03-04)

### Étape 4 : Tester la candidature

1. Reviens à la page d'accueil (/)
2. Clique sur la date que tu viens de créer
3. Remplis le formulaire et envoie

Si ça fonctionne, tu verras le message ✅ au-dessus.

### Dépannage

- **Pas de dates qui s'affichent** → Vérifie que tes variables d'env sont bien configurées
- **Erreur à l'envoi** → Ouvre la console (F12 > Console) pour voir le message exact
- **Erreur CORS** → C'est Supabase qui bloque, vérife les RLS policies sont activées
