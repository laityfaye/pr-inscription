# Configuration des URLs d'images pour accès multi-appareils

## Problème
Les images (logo, actualités) ne s'affichent pas lorsqu'on accède à la plateforme depuis un autre appareil car les URLs utilisent `localhost:8000` en dur.

## Solution implémentée

### 1. Utilitaire d'URLs d'images
Un utilitaire a été créé (`frontend/src/utils/imageUrl.js`) qui détecte automatiquement l'URL du backend :
- **En développement** : Détecte automatiquement l'IP/hostname de l'appareil
- **Avec variable d'environnement** : Utilise `VITE_BACKEND_URL` si définie
- **En production** : Utilise la même origine que le frontend

### 2. Configuration

#### Option 1 : Détection automatique (recommandé)
Le système détecte automatiquement l'IP de la machine hôte. Aucune configuration nécessaire.

#### Option 2 : Variable d'environnement
Créez un fichier `.env` dans le dossier `frontend/` :

```env
# URL du backend (remplacez par l'IP de votre machine)
VITE_BACKEND_URL=http://192.168.1.100:8000
```

Pour trouver votre IP :
- **Windows** : `ipconfig` (cherchez "Adresse IPv4")
- **Linux/Mac** : `ifconfig` ou `ip addr`

### 3. Configuration CORS
Le fichier `backend/config/cors.php` a été mis à jour pour accepter toutes les origines en développement.

### 4. Fichiers modifiés
- ✅ `frontend/src/utils/imageUrl.js` - Nouvel utilitaire
- ✅ `frontend/src/utils/socketUrl.js` - Utilitaire pour Socket.io
- ✅ `frontend/src/components/Navbar.jsx` - Utilise `getLogoUrl()`
- ✅ `frontend/src/components/Sidebar.jsx` - Utilise `getLogoUrl()`
- ✅ `frontend/src/pages/Home.jsx` - Utilise `getImageUrl()`
- ✅ `frontend/src/pages/News.jsx` - Utilise `getImageUrl()`
- ✅ `frontend/src/pages/admin/News.jsx` - Utilise `getImageUrl()`
- ✅ `frontend/src/pages/admin/Settings.jsx` - Utilise `getLogoUrl()`
- ✅ `frontend/src/pages/client/Chat.jsx` - Utilise `getSocketUrl()`
- ✅ `frontend/src/pages/admin/Chat.jsx` - Utilise `getSocketUrl()`
- ✅ `backend/config/cors.php` - CORS mis à jour

## Test
1. Démarrez le backend : `php artisan serve --host=0.0.0.0 --port=8000`
2. Démarrez le frontend : `npm run dev`
3. Accédez depuis un autre appareil en utilisant l'IP de votre machine : `http://VOTRE_IP:3000`
4. Les images devraient maintenant s'afficher correctement

## Notes
- Le backend doit être accessible depuis le réseau local (utilisez `--host=0.0.0.0`)
- Assurez-vous que le port 8000 n'est pas bloqué par le firewall
- En production, configurez `VITE_BACKEND_URL` avec l'URL de votre serveur

