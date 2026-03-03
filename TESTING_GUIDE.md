# Guide d'utilisation des données de test

## 📊 Générer les données de test

### Étapes:

1. **Accéder au dashboard admin**
   - Allez à `/admin/login`
   - Entrez votre mot de passe admin (variable `ADMIN_PASSWORD`)
   - Cliquez sur "Connexion"

2. **Générer les données**
   - Sur le dashboard (`/admin`), cliquez sur le bouton "🌱 Générer données test"
   - Entrez à nouveau votre mot de passe admin
   - Cliquez "Créer les données"
   - ✅ 12 dates (4 avril - 31 octobre) seront créées
   - ✅ 12 groupes confirmés seront ajoutés avec photos, vidéos et bio

### Distribution des dates:
- **Avril**: 1 date (4 avril)
- **Mai**: 1 date
- **Juin**: 2 dates
- **Juillet**: 3 dates (pic estival)
- **Août**: 2 dates
- **Septembre**: 2 dates
- **Octobre**: 1 date (31 octobre)

---

## 🎨 Images de test

Les images utilisent **via.placeholder.com** qui génère automatiquement des images placeholder avec le nom du groupe en texte.

```
Format: https://via.placeholder.com/800x600?text=NOM+DU+GROUPE
```

**Avantages:**
- ✅ Chargement instantané sans fichiers à créer
- ✅ Texte personnalisé par groupe
- ✅ Résolution: 800x600 (parfait pour testing)
- ✅ Plus réaliste qu'un simple placeholder gris

**Pour remplacer par vos images:**
1. Uploadez vos images sur un CDN (imgbb.com, Supabase Storage, etc.)
2. Copiez l'URL publique
3. Modifiez la `photo_url` dans le formulaire d'édition du groupe (`/admin/groupes`)

---

## 🎬 Vidéos de test

Les vidéos utilisent des **YouTube embeds** (gratis, sans authentification requise).

```
Format: https://www.youtube.com/embed/VIDEO_ID
```

**Vidéos incluses:**
- `dQw4w9WgXcQ` - Rick Roll (ou une autre vidéo publique)
- `jNQXAC9IVRw` - YouTube sample video
- `ZbZSe6N_BXs` - YouTube sample video

**Pour remplacer par vos vidéos:**
1. Trouvez l'ID YouTube de votre vidéo (la partie après `v=` dans l'URL)
2. Utilisez ce format: `https://www.youtube.com/embed/VOTRE_ID`
3. Modifiez la `video_url` dans le formulaire d'édition du groupe

**Alternative**: Si vous préférez héberger des vidéos custom, uploadez-les sur Supabase Storage et utilisez l'URL publique directement.

---

## 📋 Groupes de test inclus

| Groupe | Style | Départ | Photo | Vidéo | Bio |
|--------|-------|--------|-------|-------|-----|
| Les Grooves du Mardi | Jazz Fusion | Paris | ✓ | ✓ | ✓ |
| Électro Seine | Électronique | Lyon | ✓ | ✓ | ✓ |
| Bretons Soul | Soul/Blues | Rennes | ✓ | ✓ | ✓ |
| Synth Route | Synthpop | Nantes | ✓ | ✓ | ✓ |
| Folk Rance | Musique Trad | Saint-Malo | ✓ | ✓ | ✓ |
| Reggae Liberation | Reggae/Ska | Bordeaux | ✓ | ✓ | ✓ |
| Punk Mammouth | Punk/Garage | Angers | ✓ | ✓ | ✓ |
| Ambient Ocean | Ambient | Quimper | ✓ | ✓ | ✓ |
| Fiddle Groove | Musique Celtique | Vannes | ✓ | ✓ | ✓ |
| Trip Hop Breizh | Trip Hop | Lorient | ✓ | ✓ | ✓ |
| Chanson Nouvelle | Chanson FR | Brest | ✓ | ✓ | ✓ |
| Metal Occult | Metal/Hardcore | Dinan | ✓ | ✓ | ✓ |

**Tous les groupes**:
- ✓ Statut "acceptés" (confirmés)
- ✓ Dates assignées correctement
- ✓ Photos, vidéos et biographies
- ✓ Informations de contact complètes

---

## 🧪 Tester l'application

### Flow public:
1. Allez à `/` (homepage)
2. Voyez les 12 dates ouvertes
3. Proposez un groupe (allez jusqu'au formulaire)
4. Attendez que l'admin l'accepte (à `/admin/date/[id]`)
5. Voyez le groupe confirmé sur `/programmation`

### Flow admin:
1. Connectez-vous à `/admin/login`
2. Voyez le dashboard avec stats
3. Voyez les dates et candidatures
4. Allez à `/admin/groupes` pour éditer les groupes confirmés
5. Modifiez photo/vidéo/bio
6. Voyez les changements sur `/programmation` après rechargement

---

## ⚙️ Configuration requise

**Variables d'environnement** (dans `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé
ADMIN_PASSWORD=votre_mot_de_passe
```

**Base de données**:
- ✅ Tables `dates` et `candidatures` doivent exister
- ✅ Politique RLS doit permettre les inserts/updates

---

## 🎯 Prochaines étapes

Pour aller plus loin:

1. **Images HD**: Remplacez par des vraies photos de groupes
2. **Vidéos custom**: Créez des vidéos de Marmouz ou groupes réels
3. **Données réelles**: Supprimez les données test et remplissez avec des vraies dates
4. **Emails**: Intégrez l'envoi de confirmations email (`/lib/mail.ts`)
5. **Supabase Storage**: Uploadez les images directement au lieu d'utiliser des URLs externes

---

## 🐛 Dépannage

**"Mot de passe incorrect"**:
- Vérifiez que `ADMIN_PASSWORD` est défini dans `.env.local`
- Assurez-vous que le mot de passe est correct

**Images ne chargent pas**:
- Vérifiez la connexion internet (placeholder.com doit être accessible)
- Utilisez directement les URLs via.placeholder.com dans le navigateur pour tester

**Vidéos ne jouent pas**:
- Les URLs YouTube public doivent être accessibles
- Essayez la vidéo directement: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- Si elle ne joue pas, c'est un problème YouTube, pas votre code

---

**Créé le**: Janvier 2025
**Version**: V4 (avec seed automatisé)
**Statut**: Production-ready pour testing
