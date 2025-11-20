# Guide pour voir les changements de design

## Étapes pour appliquer les changements

### 1. Redémarrer le serveur de développement

**Windows PowerShell :**
```powershell
# Arrêter le serveur actuel (Ctrl+C dans le terminal où il tourne)
# Puis relancer :
cd frontend
npm run dev
```

### 2. Vider le cache du navigateur

**Chrome/Edge :**
- Appuyez sur `Ctrl + Shift + Delete`
- Sélectionnez "Images et fichiers en cache"
- Période : "Toutes les périodes"
- Cliquez sur "Effacer les données"

**Ou plus rapide :**
- Appuyez sur `Ctrl + Shift + R` pour un rechargement forcé
- Ou `F12` → Onglet "Network" → Cochez "Disable cache"

### 3. Vérifier que les nouveaux styles sont chargés

1. Ouvrez la console du navigateur (`F12`)
2. Allez sur l'onglet "Network"
3. Rechargez la page (`Ctrl + Shift + R`)
4. Vérifiez que `index.css` est bien chargé (taille ~50-100KB)

## Changements visibles attendus

### Navbar
- ✅ Fond glass avec blur (transparent/blanc)
- ✅ Logo avec effet hover et glow
- ✅ Menu utilisateur avec avatar gradient
- ✅ Badges de notification animés

### Dashboard Admin
- ✅ Cards avec gradients et ombres douces
- ✅ Sidebar à gauche (sur desktop)
- ✅ Animations d'apparition
- ✅ Icônes colorées avec gradients

### Page Inscriptions
- ✅ Tableau avec nouveau style
- ✅ Cards modernes pour les filtres
- ✅ Badges colorés pour les statuts
- ✅ Modals avec backdrop blur

### Styles globaux
- ✅ Scrollbar personnalisée
- ✅ Nouvelle palette de couleurs (neutral au lieu de gray)
- ✅ Typographie Inter améliorée
- ✅ Espacements et bordures arrondies

## Si vous ne voyez toujours pas les changements

1. **Vérifier que le fichier tailwind.config.js est bien chargé**
   - Ouvrez `frontend/tailwind.config.js`
   - Vérifiez qu'il contient les nouvelles couleurs `neutral`, `primary`, etc.

2. **Vérifier que index.css est importé**
   - Ouvrez `frontend/src/main.jsx`
   - Vérifiez la ligne : `import './index.css'`

3. **Forcer la recompilation Vite**
   ```powershell
   cd frontend
   rm -r node_modules/.vite  # Supprimer le cache Vite (si possible)
   npm run dev
   ```

4. **Vérifier dans la console du navigateur**
   - Ouvrez la console (`F12`)
   - Cherchez des erreurs liées à CSS/Tailwind
   - Vérifiez que les classes `neutral-*`, `card`, `btn-primary` existent

## Pages modifiées

- ✅ `frontend/src/components/Navbar.jsx`
- ✅ `frontend/src/components/Sidebar.jsx` (nouveau)
- ✅ `frontend/src/components/ui/Button.jsx`
- ✅ `frontend/src/components/ui/Card.jsx`
- ✅ `frontend/src/components/ui/Badge.jsx` (nouveau)
- ✅ `frontend/src/components/ui/Input.jsx`
- ✅ `frontend/src/pages/admin/Dashboard.jsx`
- ✅ `frontend/src/pages/admin/Inscriptions.jsx`
- ✅ `frontend/tailwind.config.js`
- ✅ `frontend/src/index.css`



