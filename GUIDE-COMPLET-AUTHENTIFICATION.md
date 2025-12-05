# Guide complet - Authentification avec Sanctum et sous-domaines

## Problème actuel

Erreurs 401 (Unauthorized) lors des appels API depuis le frontend vers le backend.

## Architecture

- **Frontend** : `https://preinscription.sbcgroupe.ca`
- **Backend** : `https://backend.sbcgroupe.ca`
- **Authentification** : Laravel Sanctum (tokens Bearer + cookies optionnels)

## Solution : Configuration complète

### 1. Configuration backend (.env)

```bash
cd /home/deploy/pr-inscription/backend
nano .env
```

**Variables à ajouter/modifier :**

```env
# URL de l'application backend
APP_URL=https://backend.sbcgroupe.ca

# URL du frontend
FRONTEND_URL=https://preinscription.sbcgroupe.ca

# Domaines stateful pour Sanctum (nécessaire même avec tokens Bearer)
SANCTUM_STATEFUL_DOMAINS=preinscription.sbcgroupe.ca,backend.sbcgroupe.ca,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000

# Configuration des sessions (pour les cookies si utilisés)
SESSION_DOMAIN=.sbcgroupe.ca
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

### 2. Vider le cache Laravel

```bash
cd /home/deploy/pr-inscription/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 3. Redémarrer PHP-FPM

```bash
sudo systemctl restart php8.2-fpm
```

### 4. Rebuilder le frontend (si nécessaire)

Le frontend a été mis à jour pour inclure `withCredentials: true`.

```bash
cd /home/deploy/pr-inscription/frontend
npm run build
```

## Vérification

### Test 1 : Vérifier la configuration Sanctum

```bash
cd /home/deploy/pr-inscription/backend
php artisan tinker
>>> config('sanctum.stateful')
```

Vous devriez voir `preinscription.sbcgroupe.ca` dans la liste.

### Test 2 : Tester l'authentification

1. Ouvrez `https://preinscription.sbcgroupe.ca/login`
2. Essayez de vous connecter
3. Vérifiez dans les DevTools :
   - **Network** : Les requêtes incluent le header `Authorization: Bearer {token}`
   - **Application > Cookies** : Les cookies sont créés (si utilisés)

### Test 3 : Vérifier les logs

```bash
tail -50 /home/deploy/pr-inscription/backend/storage/logs/laravel.log
```

## Dépannage

### Si les erreurs 401 persistent

1. **Vérifier que le token est stocké** :
   - Ouvrez la console du navigateur
   - `localStorage.getItem('token')` devrait retourner un token

2. **Vérifier que le token est envoyé** :
   - DevTools > Network > Sélectionnez une requête API
   - Vérifiez l'onglet Headers > Request Headers
   - `Authorization: Bearer {token}` doit être présent

3. **Vérifier les routes** :
   - Certaines routes sont publiques (pas besoin d'auth)
   - D'autres nécessitent `auth:sanctum`

4. **Vérifier la configuration CORS** :
   - Les headers CORS doivent permettre `Authorization`
   - `supports_credentials` doit être `true`

### Routes publiques vs protégées

**Routes publiques** (pas besoin d'auth) :
- `/api/countries`
- `/api/work-permit-countries`
- `/api/news`
- `/api/reviews`
- `/api/settings`
- `/api/stats`
- `/api/register`
- `/api/login`

**Routes protégées** (nécessitent `auth:sanctum`) :
- `/api/me`
- `/api/logout`
- `/api/inscriptions/*`
- `/api/documents/*`
- `/api/messages/*`
- Etc.

## Notes importantes

1. **Tokens Bearer** : Le frontend utilise principalement des tokens Bearer stockés dans localStorage
2. **Cookies** : Sanctum peut aussi utiliser des cookies pour l'authentification stateful
3. **CORS** : La configuration CORS doit permettre les credentials (`supports_credentials: true`)
4. **Sous-domaines** : `SESSION_DOMAIN=.sbcgroupe.ca` permet aux cookies de fonctionner entre sous-domaines

## Commandes rapides

```bash
# Mettre à jour .env
cd /home/deploy/pr-inscription/backend && nano .env

# Vider le cache
php artisan config:clear && php artisan cache:clear

# Redémarrer PHP-FPM
sudo systemctl restart php8.2-fpm

# Vérifier les logs
tail -50 storage/logs/laravel.log
```

