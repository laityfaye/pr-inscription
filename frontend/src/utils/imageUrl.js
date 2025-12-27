/**
 * Utilitaire pour construire les URLs d'images
 * Utilise l'URL de base de l'API depuis les variables d'environnement
 * Utilise la même logique que l'API pour garantir la cohérence
 */

// Récupérer l'URL de base du backend (même logique que dans api.js)
const getBackendBaseUrl = () => {
  // Priorité 1: Variable d'environnement explicite pour le backend
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }
  
  // Priorité 2: Extraire l'URL de base depuis VITE_API_URL si disponible
  // (ex: https://tfksbackend.innosft.com/api -> https://tfksbackend.innosft.com)
  // C'est la même logique que dans api.js qui utilise VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL
    return apiUrl.replace('/api', '').replace(/\/$/, '')
  }
  
  // Priorité 3: Détecter automatiquement depuis l'URL actuelle (en production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    
    // Si c'est localhost ou 127.0.0.1, utiliser localhost:8000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    
    // En production, si on est sur innosft.com, utiliser le sous-domaine backend
    if (hostname === 'tfksservice.innosft.com' || hostname === 'tfksbackend.innosft.com' || hostname.includes('innosft.com')) {
      return 'https://tfksbackend.innosft.com'
    }
  }
  
  // Priorité 4: Utiliser la valeur par défaut de l'API (même que dans api.js)
  // api.js utilise: import.meta.env.VITE_API_URL || 'https://tfksbackend.innosft.com/api'
  const defaultApiUrl = 'https://tfksbackend.innosft.com/api'
  return defaultApiUrl.replace('/api', '').replace(/\/$/, '')
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
  
  // En production, utiliser la même base URL que l'API pour garantir la cohérence
  // Cela garantit que les images utilisent le même backend que les requêtes API
  const baseUrl = getBackendBaseUrl()
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const imageUrl = `${cleanBaseUrl}/api/storage/${path}`
  
  // Debug en production pour diagnostiquer les problèmes
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    console.debug('[ImageUrl] Production', {
      path,
      baseUrl,
      imageUrl,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      currentHostname: window.location.hostname,
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

