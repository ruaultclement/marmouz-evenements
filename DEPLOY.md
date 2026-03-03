# 🚀 Guide de Déploiement - La Guinguette des Marmouz

## Architecture
```
Client → VPS Nginx (port 80/443)
    ↓
Tailscale Tunnel (chiffré)
    ↓
ZimaOS (Nginx Proxy Manager)
    ↓
Docker Container (Node.js Next.js)
```

---

## 📋 Prérequis

### Sur ZimaOS (à la maison)
- Docker & Docker Compose installés
- Tailscale installé et connecté
- Nginx Proxy Manager (NPM) sur port 81

### Sur VPS
- Nginx installé
- Tailscale installé et connecté
- Domaine pointant vers le VPS

---

## 🏠 Déploiement sur ZimaOS

### 1️⃣ **Cloner le repo et configurer**

```bash
cd /opt/apps  # ou ton chemin ZimaOS
git clone https://github.com/ton-username/marmouz-evenements.git
cd marmouz-evenements/marmouz-prog

# Créer le fichier .env avec tes secrets
cp .env.example .env.local
# Remplir les valeurs :
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ADMIN_PASSWORD
```

### 2️⃣ **Lancer le container**

```bash
# Construire et démarrer
docker-compose up -d

# Vérifier que ça tourne
docker-compose logs -f

# Arrêter si besoin
docker-compose down
```

### 3️⃣ **Configurer Nginx Proxy Manager**

1. Ouvrir NPM : `http://zima-local-ip:81`
2. **Aller dans Proxy Hosts**
3. **Ajouter un nouveau Proxy Host :**
   - Domain Name: `marmouz.local` (ou ton domaine interne)
   - Scheme: `http`
   - Forward Hostname: `localhost`
   - Forward Port: `3000`
   - Block Common Exploits: ✅

4. **SSL (optionnel local)**
   - Vous pouvez ignorer si c'est juste local

---

## 🌐 Configuration VPS (Nginx)

### 1️⃣ **Récupérer l'IP Tailscale de ZimaOS**

```bash
# Sur ZimaOS
tailscale ip -4
# Résultat : 100.x.x.x (exemple)
```

### 2️⃣ **Configurer Nginx sur VPS**

Créer `/etc/nginx/sites-available/marmouz`:

```nginx
upstream marmouz {
    server 100.x.x.x:81;  # IP Tailscale ZimaOS avec NPM
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name laguinguettedesmarmouz.fr www.laguinguettedesmarmouz.fr;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name laguinguettedesmarmouz.fr www.laguinguettedesmarmouz.fr;

    # SSL avec Certbot
    ssl_certificate /etc/letsencrypt/live/laguinguettedesmarmouz.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/laguinguettedesmarmouz.fr/privkey.pem;

    # SSL best practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location / {
        proxy_pass http://marmouz;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2️⃣ **Activer le site et tester**

```bash
sudo ln -s /etc/nginx/sites-available/marmouz /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Obtenir SSL avec Certbot
sudo certbot --nginx -d laguinguettedesmarmouz.fr -d www.laguinguettedesmarmouz.fr

# Tester et recharger
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔧 Maintenance

### Mettre à jour l'app

```bash
cd /opt/apps/marmouz-evenements/marmouz-prog

# Récupérer les changements
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f
```

### Voir les logs

```bash
# Tous les logs
docker-compose logs -f

# Logs de la dernière heure
docker-compose logs --since 1h
```

### Redémarrer le container

```bash
docker-compose restart
```

### Shell dans le container (debug)

```bash
docker-compose exec app sh
```

---

## 🧪 Tests

### Vérifier que tout fonctionne

```bash
# Sur ZimaOS
curl http://localhost:3000/

# Via Tailscale (depuis VPS)
curl http://100.x.x.x:3000/

# Via Nginx Proxy Manager (depuis ZimaOS)
curl http://localhost:81/

# Depuis le navigateur
https://laguinguettedesmarmouz.fr
```

---

## 📊 Monitoring

Voir l'état des containers :
```bash
docker ps
docker stats marmouz-app
```

---

## 🆘 Troubleshooting

**Container ne démarre pas :**
```bash
docker-compose logs -f  # Voir l'erreur
docker-compose down
docker-compose up -d --build
```

**Pas de connexion Tailscale :**
```bash
# Sur ZimaOS
tailscale status

# Sur VPS
tailscale ping 100.x.x.x
```

**Erreur Nginx :**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 🚀 C'est prêt !

Ta Guinguette est live : **https://laguinguettedesmarmouz.fr**
