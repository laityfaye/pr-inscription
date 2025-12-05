# Résumé du déploiement - Backend sous-domaine

## ✅ Changements effectués

1. **Frontend** : Mis à jour pour utiliser `https://backend.sbcgroupe.ca/api`
2. **Configuration nginx backend** : Créée (`nginx-backend-subdomain.conf`)
3. **Configuration nginx frontend** : Simplifiée (optionnel, `nginx-frontend-only.conf`)

## 📋 Étapes de déploiement sur le serveur

### 1. Obtenir les certificats SSL pour backend.sbcgroupe.ca

```bash
sudo certbot certonly --nginx -d backend.sbcgroupe.ca
```

### 2. Créer et activer la configuration nginx backend

```bash
# Créer le fichier
sudo nano /etc/nginx/sites-available/backend.sbcgroupe.ca
# Copier le contenu de nginx-backend-subdomain.conf

# Activer
sudo ln -s /etc/nginx/sites-available/backend.sbcgroupe.ca /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Mettre à jour le .env du backend

```bash
cd /home/deploy/pr-inscription/backend
nano .env
```

Ajoutez/modifiez :
```env
FRONTEND_URL=https://preinscription.sbcgroupe.ca
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,preinscription.sbcgroupe.ca
APP_URL=https://backend.sbcgroupe.ca
```

Puis :
```bash
php artisan config:clear
php artisan cache:clear
```

### 4. Rebuilder le frontend

```bash
cd /home/deploy/pr-inscription/frontend
npm run build
```

### 5. (Optionnel) Simplifier la config frontend

Si vous voulez supprimer la section `/api` de la config frontend :

```bash
sudo nano /etc/nginx/sites-available/preinscription
# Supprimez les lignes 73-124 (section API)
# Ou remplacez tout par le contenu de nginx-frontend-only.conf
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Vérification

1. **Frontend** : `https://preinscription.sbcgroupe.ca/` → Devrait fonctionner
2. **Backend API** : `https://backend.sbcgroupe.ca/api/countries` → Devrait retourner des données
3. **Frontend → Backend** : Le frontend devrait pouvoir appeler l'API

## 🔍 Tests

```bash
# Test backend
curl -I https://backend.sbcgroupe.ca/api/countries

# Vérifier les ports
sudo ss -tlnp | grep nginx

# Logs si problème
sudo tail -50 /var/log/nginx/backend-error.log
sudo tail -50 /home/deploy/pr-inscription/backend/storage/logs/laravel.log
```

## 📁 Fichiers créés

- `nginx-backend-subdomain.conf` - Configuration nginx pour backend.sbcgroupe.ca
- `nginx-frontend-only.conf` - Configuration simplifiée frontend (optionnel)
- `CONFIGURATION-BACKEND-SUBDOMAIN.md` - Guide détaillé
- `CONFIGURATION-BACKEND-ENV.md` - Configuration .env
- `DEPLOIEMENT-BACKEND-SUBDOMAIN.md` - Guide de déploiement

## 🎯 Avantages de cette approche

- ✅ Configuration plus simple (pas de rewrite complexe)
- ✅ Séparation claire frontend/backend
- ✅ Plus facile à maintenir
- ✅ Meilleure sécurité (isolation)
- ✅ Possibilité de scaler séparément

