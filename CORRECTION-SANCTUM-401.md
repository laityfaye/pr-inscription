# Correction des erreurs 401 (Unauthorized) - Sanctum

## Problème

Les erreurs 401 indiquent que Sanctum ne reconnaît pas le domaine frontend comme "stateful", ce qui empêche l'authentification de fonctionner.

## Solution : Configuration Sanctum pour sous-domaines

### Option 1 : Utiliser des tokens Bearer (Recommandé pour sous-domaines différents)

C'est la solution la plus simple quand le frontend et le backend sont sur des sous-domaines différents.

### Option 2 : Configurer les cookies pour le domaine parent

Si vous voulez utiliser les cookies (stateful), configurez-les pour le domaine parent `.sbcgroupe.ca`.

## Configuration à appliquer sur le serveur

### 1. Mettre à jour le fichier .env du backend

```bash
cd /home/deploy/pr-inscription/backend
nano .env
```

**Ajoutez/modifiez ces variables :**

```env
# URL de l'application backend
APP_URL=https://backend.sbcgroupe.ca

# URL du frontend (pour Sanctum)
FRONTEND_URL=https://preinscription.sbcgroupe.ca

# Domaines stateful pour Sanctum (avec le domaine parent pour les cookies)
SANCTUM_STATEFUL_DOMAINS=preinscription.sbcgroupe.ca,backend.sbcgroupe.ca,localhost,localhost:3000,127.0.0.1,127.0.0.1:8000

# Configuration des sessions pour le domaine parent
SESSION_DOMAIN=.sbcgroupe.ca
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

### 2. Vérifier la configuration Sanctum

Le fichier `config/sanctum.php` devrait utiliser la variable d'environnement. Vérifiez qu'il contient :

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000')),
```

### 3. Vider le cache

```bash
cd /home/deploy/pr-inscription/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 4. Redémarrer PHP-FPM (si nécessaire)

```bash
sudo systemctl restart php8.2-fpm
```

## Vérification

1. **Test de connexion** : Essayez de vous connecter depuis le frontend
2. **Vérifier les cookies** : Dans les DevTools du navigateur, vérifiez que les cookies sont créés
3. **Vérifier les headers** : Les requêtes API devraient inclure les cookies d'authentification

## Si ça ne fonctionne toujours pas

### Alternative : Utiliser uniquement les tokens Bearer

Si les cookies ne fonctionnent pas entre les sous-domaines, vous pouvez utiliser uniquement les tokens Bearer :

1. Le frontend envoie le token dans le header `Authorization: Bearer {token}`
2. Pas besoin de cookies stateful
3. Plus simple pour les sous-domaines différents

Le code frontend devrait déjà gérer cela (voir `frontend/src/services/api.js`).

## Debug

Pour vérifier ce qui se passe :

```bash
# Logs Laravel
tail -50 /home/deploy/pr-inscription/backend/storage/logs/laravel.log

# Vérifier la configuration chargée
php artisan tinker
>>> config('sanctum.stateful')
```

