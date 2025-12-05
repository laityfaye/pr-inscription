# Guide de déploiement - Backend sous-domaine

## Résumé des changements

1. ✅ Frontend mis à jour pour utiliser `https://backend.sbcgroupe.ca/api`
2. ✅ Configuration nginx créée pour `backend.sbcgroupe.ca`
3. ✅ DNS déjà configuré (`backend.sbcgroupe.ca` → `72.61.3.184`)

## Étapes de déploiement sur le serveur

### Étape 1 : Obtenir les certificats SSL

```bash
sudo certbot certonly --nginx -d backend.sbcgroupe.ca
```

### Étape 2 : Créer la configuration nginx pour le backend

```bash
sudo nano /etc/nginx/sites-available/backend.sbcgroupe.ca
```

**Copiez le contenu de `nginx-backend-subdomain.conf`** (depuis votre machine locale ou créez-le directement).

### Étape 3 : Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/backend.sbcgroupe.ca /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### Étape 4 : Vérifier

```bash
# Vérifier les ports
sudo ss -tlnp | grep nginx

# Tester l'API
curl -I https://backend.sbcgroupe.ca/api/countries
```

### Étape 5 : Rebuilder le frontend

```bash
cd /home/deploy/pr-inscription/frontend
npm run build
```

### Étape 6 : (Optionnel) Simplifier la config frontend

Si vous voulez supprimer la section `/api` de la config frontend (puisque vous utilisez maintenant un sous-domaine séparé) :

```bash
sudo nano /etc/nginx/sites-available/preinscription
```

Supprimez les lignes 73-124 (section API) et remplacez par le contenu de `nginx-frontend-only.conf` ou gardez juste la partie frontend.

## Configuration du frontend

Le frontend utilise maintenant :
- **Production** : `https://backend.sbcgroupe.ca/api` (automatique)
- **Développement** : Le proxy Vite continue de fonctionner avec `/api`

## Vérification finale

1. ✅ `https://preinscription.sbcgroupe.ca/` → Frontend fonctionne
2. ✅ `https://backend.sbcgroupe.ca/api/countries` → API fonctionne
3. ✅ Le frontend peut appeler l'API via le sous-domaine

## Avantages

- ✅ Configuration plus simple
- ✅ Pas de rewrite complexe
- ✅ Séparation claire frontend/backend
- ✅ Plus facile à maintenir et déboguer

