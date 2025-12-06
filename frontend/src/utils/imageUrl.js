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
  
  // En production, utiliser le sous-domaine backend
  if (hostname === 'sbcgroupe.ca' || hostname === 'www.sbcgroupe.ca') {
    return 'https://backend.sbcgroupe.ca'
  }
  
  // Pour les autres cas (développement réseau), utiliser l'IP avec le port 8000
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
  if (import.meta.env.DEV) {
    return `/api/storage/${path}`
  }
  
  // En production, utiliser directement le sous-domaine backend
  const hostname = window.location.hostname
  
  if (hostname === 'sbcgroupe.ca' || hostname === 'www.sbcgroupe.ca') {
    // Utiliser directement le sous-domaine backend pour le storage
    return `https://backend.sbcgroupe.ca/storage/${path}`
  }
  
  // Pour les autres cas (développement réseau), utiliser getBackendBaseUrl
  const baseUrl = getBackendBaseUrl()
  const cleanBaseUrl = baseUrl.replace('/api', '').replace(/\/$/, '')
  return `${cleanBaseUrl}/storage/${path}`
}

/**
 * Construit l'URL complète pour le logo
 * @param {string} logoPath - Le chemin du logo
 * @returns {string|null} - L'URL complète du logo ou null
 */
export const getLogoUrl = (logoPath) => {
  return getImageUrl(logoPath)
}

