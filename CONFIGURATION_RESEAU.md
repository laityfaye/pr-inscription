# Configuration pour accès réseau (VLAN)

## Problème
Les images ne s'affichent pas lorsqu'on accède via `http://10.31.117.128:3000` depuis d'autres appareils sur le réseau VLAN.

## Solution

### 1. Démarrer le backend sur toutes les interfaces
Le backend doit écouter sur `0.0.0.0` et pas seulement `localhost` :

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

Cela permet au backend d'être accessible via `http://10.31.117.128:8000` depuis d'autres appareils.

### 2. Vérifier le lien symbolique du storage
Assurez-vous que le lien symbolique existe :

```bash
cd backend
php artisan storage:link
```

Cela crée un lien de `public/storage` vers `storage/app/public` pour que les fichiers soient accessibles via HTTP.

### 3. Vérifier les permissions
Sur Linux/Mac, assurez-vous que les permissions sont correctes :

```bash
chmod -R 755 backend/storage
chmod -R 755 backend/public/storage
```

### 4. Configuration automatique
Le code détecte automatiquement l'IP depuis l'URL :
- Accès via `http://10.31.117.128:3000` → Images via `http://10.31.117.128:8000/storage/...`
- Accès via `http://localhost:3000` → Images via `http://localhost:8000/storage/...`

### 5. Test
1. Démarrez le backend : `php artisan serve --host=0.0.0.0 --port=8000`
2. Démarrez le frontend : `npm run dev` (déjà configuré avec `host: '0.0.0.0'`)
3. Accédez depuis un autre appareil : `http://10.31.117.128:3000`
4. Les images devraient s'afficher via `http://10.31.117.128:8000/storage/...`

### 6. Vérification du firewall
Assurez-vous que le port 8000 n'est pas bloqué par le firewall Windows :

```powershell
# Vérifier les règles de firewall
netsh advfirewall firewall show rule name=all | findstr 8000

# Si nécessaire, ajouter une règle (en tant qu'administrateur)
netsh advfirewall firewall add rule name="Laravel Backend" dir=in action=allow protocol=TCP localport=8000
```

### 7. Debug
Si les images ne s'affichent toujours pas :

1. **Vérifier dans la console du navigateur** (F12) :
   - Ouvrez l'onglet "Network"
   - Rechargez la page
   - Cherchez les requêtes d'images (filtrez par "Img")
   - Vérifiez l'URL complète et le statut de la requête

2. **Tester directement l'URL de l'image** :
   - Exemple : `http://10.31.117.128:8000/storage/news/image.jpg`
   - Si ça ne fonctionne pas, le problème vient du backend
   - Si ça fonctionne, le problème vient du frontend

3. **Vérifier les logs Laravel** :
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

### 8. Configuration alternative (variable d'environnement)
Si la détection automatique ne fonctionne pas, créez `frontend/.env` :

```env
VITE_BACKEND_URL=http://10.31.117.128:8000
```

Puis redémarrez le serveur de développement frontend.

### 9. Debug dans la console
Ouvrez la console du navigateur (F12) et regardez les messages de debug qui affichent :
- Le chemin de l'image
- L'URL de base détectée
- L'URL complète générée

Cela vous permettra de vérifier que les URLs sont correctement construites.

### 10. Script de démarrage
Utilisez le script `backend/start-server.bat` pour démarrer le serveur correctement :

```bash
cd backend
start-server.bat
```

Ou manuellement :
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

**IMPORTANT** : Le backend DOIT être démarré avec `--host=0.0.0.0` pour être accessible depuis d'autres appareils sur le réseau.

