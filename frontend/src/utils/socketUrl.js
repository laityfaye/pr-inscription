/**
 * Utilitaire pour obtenir l'URL du serveur Socket.io
 * Utilise la même logique que getBackendBaseUrl pour la cohérence
 */

// Récupérer l'URL de base du backend pour Socket.io
export const getSocketUrl = () => {
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

