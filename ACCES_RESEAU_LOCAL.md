# 🌐 Accès à la Plateforme depuis d'Autres Appareils

## 📱 Accès sur le Réseau Local

Vous pouvez accéder à votre application depuis n'importe quel appareil connecté au même réseau Wi-Fi que votre ordinateur.

## 🚀 Configuration

### 1. Configuration Frontend (Déjà faite ✅)

Le fichier `frontend/vite.config.js` a été configuré avec `host: '0.0.0.0'` pour permettre l'accès depuis d'autres appareils.

### 2. Trouver votre Adresse IP Locale

Pour accéder depuis un autre appareil, vous devez connaître l'adresse IP de votre ordinateur :

**Windows :**
```bash
ipconfig
```
Cherchez la section "Carte réseau sans fil Wi-Fi" ou "Adaptateur Ethernet" et notez l'adresse "IPv4", par exemple : `192.168.1.100` ou `10.31.117.128`

**Linux/Mac :**
```bash
ifconfig
# ou
ip addr show
```

### 3. Démarrer le Frontend

Le frontend doit être démarré avec la configuration mise à jour :

```bash
cd frontend
npm run dev
```

Vous verrez quelque chose comme :
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

### 4. Accéder depuis un Autre Appareil

Depuis n'importe quel appareil connecté au même Wi-Fi :

1. Ouvrez un navigateur (Chrome, Safari, Firefox, etc.)
2. Entrez l'adresse **Network** affichée par Vite :
   ```
   http://192.168.1.100:3000
   ```
   (Remplacez `192.168.1.100` par votre adresse IP réelle)

## 📋 Checklist

- [ ] Frontend démarré avec `npm run dev`
- [ ] Backend Laravel en cours d'exécution (`php artisan serve`)
- [ ] Les deux appareils sont sur le même réseau Wi-Fi
- [ ] Vous avez l'adresse IP de votre ordinateur
- [ ] Vous accédez à `http://VOTRE_IP:3000` depuis l'autre appareil

## ⚠️ Points Importants

1. **Même réseau Wi-Fi** : Les deux appareils doivent être sur le même réseau local
2. **Firewall** : Windows peut bloquer le port 3000. Si l'accès ne fonctionne pas :
   - Ouvrez le Pare-feu Windows
   - Autorisez le port 3000 ou Node.js/Vite
3. **Adresse IP** : L'adresse IP locale peut changer si vous vous reconnectez au Wi-Fi
4. **Accès local uniquement** : Cette configuration permet uniquement l'accès depuis le réseau local. Pour un accès depuis Internet, vous devrez configurer un serveur de production avec un domaine et SSL/HTTPS

## 🔒 Sécurité

- **Réseau local** : Relativement sûr si vous êtes sur un réseau privé de confiance
- **Production** : Pour la production, utilisez un hébergement sécurisé avec SSL/HTTPS et authentification appropriée

## 🐛 Résolution de Problèmes

### L'autre appareil ne peut pas se connecter

1. Vérifiez que les deux appareils sont sur le même Wi-Fi
2. Vérifiez que le firewall Windows n'bloque pas le port 3000
3. Vérifiez que vous utilisez l'adresse IP correcte (pas `localhost`)
4. Vérifiez que le serveur Vite affiche bien "Network: http://..."

### Erreur "Connection refused"

- Vérifiez que le frontend est bien démarré avec `npm run dev`
- Vérifiez que le port 3000 n'est pas déjà utilisé par un autre processus

### L'application se charge mais les API ne fonctionnent pas

- Vérifiez que le backend Laravel est en cours d'exécution sur `http://localhost:8000`
- Vérifiez que le proxy Vite est correctement configuré dans `vite.config.js`
- Vérifiez les erreurs dans la console du navigateur (F12)


