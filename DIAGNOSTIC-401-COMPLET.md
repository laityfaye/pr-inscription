# Diagnostic complet des erreurs 401

## Problèmes identifiés et corrigés

### ✅ Correction 1 : Route `/api/work-permit-countries` déplacée

La route était dans le groupe protégé `auth:sanctum` alors qu'elle devrait être publique. **Corrigé dans `backend/routes/api.php`**.

### ⚠️ Problème 2 : Middleware `EnsureFrontendRequestsAreStateful`

Ce middleware est appliqué à TOUTES les routes API et peut bloquer les requêtes si le domaine n'est pas reconnu comme stateful.

## Solutions à appliquer sur le serveur

### 1. Vérifier que les routes sont correctes

```bash
cd /home/deploy/pr-inscription/backend
# Vérifier que work-permit-countries est bien publique
grep -A 2 "work-permit-countries" routes/api.php
```

Vous devriez voir que `/work-permit-countries` est AVANT le groupe `auth:sanctum`.

### 2. Vérifier la configuration Sanctum

```bash
cd /home/deploy/pr-inscription/backend
php artisan tinker
>>> config('sanctum.stateful')
```

**Vous devriez voir** : `preinscription.sbcgroupe.ca` dans la liste.

Si ce n'est pas le cas, vérifiez le `.env` :

```bash
grep SANCTUM_STATEFUL_DOMAINS .env
```

Doit contenir : `SANCTUM_STATEFUL_DOMAINS=preinscription.sbcgroupe.ca,backend.sbcgroupe.ca,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000`

### 3. Vérifier les logs Laravel

```bash
tail -100 /home/deploy/pr-inscription/backend/storage/logs/laravel.log
```

Cherchez les erreurs liées à :
- Sanctum
- Authentication
- Middleware

### 4. Tester directement l'API

```bash
# Test de la route publique work-permit-countries
curl -v https://backend.sbcgroupe.ca/api/work-permit-countries

# Test de la route login
curl -v -X POST https://backend.sbcgroupe.ca/api/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://preinscription.sbcgroupe.ca" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 5. Vérifier la configuration CORS

```bash
cd /home/deploy/pr-inscription/backend
php artisan tinker
>>> config('cors.allowed_origins')
```

Doit contenir `https://preinscription.sbcgroupe.ca`.

## Solution alternative : Désactiver temporairement le middleware

Si le problème persiste, vous pouvez temporairement retirer le middleware `EnsureFrontendRequestsAreStateful` pour tester :

```bash
cd /home/deploy/pr-inscription/backend
nano bootstrap/app.php
```

Commentez la ligne :
```php
// $middleware->api(prepend: [
//     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
// ]);
```

Puis :
```bash
php artisan config:clear
php artisan cache:clear
```

**⚠️ Note** : Ceci est temporaire pour le diagnostic. Le middleware est nécessaire pour l'authentification stateful.

## Vérification finale

1. ✅ Route `/api/work-permit-countries` est publique
2. ✅ `SANCTUM_STATEFUL_DOMAINS` contient `preinscription.sbcgroupe.ca`
3. ✅ CORS autorise `https://preinscription.sbcgroupe.ca`
4. ✅ Cache Laravel vidé
5. ✅ Frontend rebuilder avec `withCredentials: true`

## Commandes rapides

```bash
# 1. Vérifier les routes
cd /home/deploy/pr-inscription/backend
grep -n "work-permit-countries" routes/api.php

# 2. Vérifier Sanctum
php artisan tinker
>>> config('sanctum.stateful')

# 3. Vérifier CORS
>>> config('cors.allowed_origins')

# 4. Vider le cache
php artisan config:clear && php artisan cache:clear

# 5. Vérifier les logs
tail -50 storage/logs/laravel.log
```

