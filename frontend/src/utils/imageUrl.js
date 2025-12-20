/**
 * Utilitaire pour construire les URLs d'images
 * Utilise l'URL de base de l'API depuis les variables d'environnement
 */

// Récupérer l'URL de base du backend
const getBackendBaseUrl = () => {
  // Priorité 1: Variable d'environnement explicite pour le backend
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }
  
  // Priorité 2: Extraire l'URL de base depuis VITE_API_URL si disponible
  // (ex: https://tfksbackend.innosft.com/api -> https://tfksbackend.innosft.com)
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL
    return apiUrl.replace('/api', '').replace(/\/$/, '')
  }
  
  // Priorité 3: Détecter automatiquement depuis l'URL actuelle
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Si c'est localhost ou 127.0.0.1, utiliser localhost:8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }
  
  // En production, si on est sur innosft.com, utiliser le sous-domaine backend
  if (hostname === 'tfksservice.innosft.com' || hostname === 'tfksbackend.innosft.com' || hostname === 'innosft.com') {
    return 'https://tfksbackend.innosft.com'
  }
  
  // Sinon, utiliser l'IP/hostname actuel avec le port 8000 (pour développement réseau local)
  return `${protocol}//${hostname}:8000`
}

/**
 * Construit l'URL complète d'une image stockée
 * @param {string} path - Le chemin de l'image (ex: "news/image.jpg")
 * @returns {string|null} - L'URL complète de l'image ou null
 */
export const getImageUrl = (path) => {
  if (!path) return null
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // En développement, utiliser le proxy Vite pour /api/storage
  // Cela fonctionne même si le backend n'est accessible que via localhost
  if (import.meta.env.DEV) {
    // Utiliser /api/storage pour passer par le proxy Vite
    return `/api/storage/${path}`
  }
  
  // En production, utiliser l'URL via l'API (plus sécurisé et ne nécessite pas de lien symbolique)
  const baseUrl = getBackendBaseUrl()
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  // Utiliser /api/storage pour passer par le StorageController
  const imageUrl = `${cleanBaseUrl}/api/storage/${path}`
  
  // Debug en mode développement
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    console.debug('[ImageUrl]', {
      path,
      imageUrl: `/api/storage/${path}`,
      currentHostname: window.location.hostname,
      mode: 'dev (via proxy)',
    })
  }
  
  return imageUrl
}

/**
 * Construit l'URL complète pour le logo
 * @param {string} logoPath - Le chemin du logo
 * @returns {string|null} - L'URL complète du logo ou null
 */
export const getLogoUrl = (logoPath) => {
  return getImageUrl(logoPath)
}

