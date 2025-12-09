# Résumé des Mises à Jour des URLs

## URLs de Production

- **Backend** : `https://tfksbackend.innosft.com`
- **Frontend** : `https://tfksservice.innosft.com`
- **Domaine** : `innosft.com`

---

## Fichiers Modifiés

### Backend

#### 1. `backend/config/cors.php`
- ✅ Mis à jour `allowed_origins` avec les nouvelles URLs
- Anciennes URLs : `sbcgroupe.ca`
- Nouvelles URLs : `tfksservice.innosft.com`, `tfksbackend.innosft.com`

#### 2. `backend/app/Http/Middleware/ForceCorsHeaders.php`
- ✅ Mis à jour les origines autorisées dans le middleware CORS
- Inclut maintenant : `tfksservice.innosft.com`, `tfksbackend.innosft.com`

#### 3. `backend/app/Http/Controllers/Controller.php`
- ✅ Mis à jour la méthode `getCorsHeaders()` avec les nouvelles URLs

#### 4. `backend/bootstrap/app.php`
- ✅ Mis à jour la fonction `getCorsHeaders` dans le handler d'exceptions

#### 5. `backend/config/sanctum.php`
- ✅ Ajouté les nouveaux domaines stateful : `tfksservice.innosft.com`, `tfksbackend.innosft.com`

### Frontend

#### 6. `frontend/src/services/api.js`
- ✅ Mis à jour l'URL par défaut de l'API
- Ancienne : `https://backend.sbcgroupe.ca/api`
- Nouvelle : `https://tfksbackend.innosft.com/api`

#### 7. `frontend/src/utils/imageUrl.js`
- ✅ Mis à jour la détection automatique du backend pour les images
- Détecte maintenant : `tfksservice.innosft.com`, `tfksbackend.innosft.com`, `innosft.com`
- Retourne : `https://tfksbackend.innosft.com`

#### 8. `frontend/src/utils/socketUrl.js`
- ✅ Mis à jour la détection automatique du backend pour Socket.io
- Détecte maintenant : `tfksservice.innosft.com`, `tfksbackend.innosft.com`, `innosft.com`
- Retourne : `https://tfksbackend.innosft.com`

---

## Configuration des Variables d'Environnement

### Backend (.env)

```env
APP_URL=https://tfksbackend.innosft.com
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,tfksservice.innosft.com,tfksbackend.innosft.com
```

### Frontend (.env.production)

```env
VITE_API_URL=https://tfksbackend.innosft.com/api
VITE_BACKEND_URL=https://tfksbackend.innosft.com
```

---

## URLs Conservées pour le Développement

Les URLs de développement local sont conservées dans tous les fichiers :
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8000`
- `http://127.0.0.1:8000`

---

## Vérification

Après le déploiement, vérifiez que :

1. ✅ Les requêtes CORS fonctionnent entre le frontend et le backend
2. ✅ Les images se chargent correctement depuis le backend
3. ✅ L'authentification Sanctum fonctionne
4. ✅ Les requêtes API sont bien routées vers `https://tfksbackend.innosft.com/api`

---

## Commandes de Vérification

### Backend
```bash
# Vérifier la configuration CORS
php artisan config:cache
php artisan route:cache

# Tester les routes API
curl -H "Origin: https://tfksservice.innosft.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://tfksbackend.innosft.com/api/countries
```

### Frontend
```bash
# Vérifier que les variables d'environnement sont correctes
npm run build

# Vérifier dans le navigateur (Console)
console.log(import.meta.env.VITE_API_URL)
```

---

## Notes Importantes

1. **Cache Laravel** : Après modification des fichiers de configuration, exécutez :
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

2. **Build Frontend** : Après modification des variables d'environnement, reconstruisez :
   ```bash
   npm run build
   ```

3. **SSL** : Assurez-vous que les certificats SSL sont configurés pour les deux sous-domaines.

4. **DNS** : Vérifiez que les enregistrements DNS pointent correctement vers le serveur.

---

## Prochaines Étapes

1. Déployer les modifications sur le serveur
2. Vérifier que les certificats SSL sont valides
3. Tester les requêtes CORS
4. Vérifier le chargement des images
5. Tester l'authentification

