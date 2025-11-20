/**
 * Utilitaire pour construire les URLs d'images
 * Utilise l'URL de base de l'API depuis les variables d'environnement
 */

// Récupérer l'URL de base du backend
const getBackendBaseUrl = () => {
  // Priorité 1: Variable d'environnement explicite
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }
  
  // Priorité 2: Détecter automatiquement depuis l'URL actuelle
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Si c'est localhost ou 127.0.0.1, utiliser localhost:8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }
  
  // Sinon, utiliser l'IP/hostname actuel avec le port 8000
  // Cela fonctionne pour les accès réseau (ex: 10.31.117.128:3000 -> 10.31.117.128:8000)
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
  
  // En production, utiliser l'URL directe du backend
  const baseUrl = getBackendBaseUrl()
  const cleanBaseUrl = baseUrl.replace('/api', '').replace(/\/$/, '')
  const imageUrl = `${cleanBaseUrl}/storage/${path}`
  
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

