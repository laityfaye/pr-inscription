import axios from 'axios'

// Utiliser le sous-domaine backend pour les requêtes API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.sbcgroupe.ca/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important pour les cookies cross-origin (si utilisés avec Sanctum)
})

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Ne pas définir Content-Type si c'est un FormData (axios le fera automatiquement)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      const currentPath = window.location.pathname
      
      // Liste des routes publiques qui ne nécessitent pas d'authentification
      const publicRoutes = ['/', '/login', '/register', '/reviews', '/news', '/appointment']
      const isPublicRoute = publicRoutes.includes(currentPath)
      
      // Liste des endpoints qui peuvent être accessibles publiquement (même si le backend retourne 401)
      // avec leurs valeurs par défaut
      const publicEndpoints = {
        '/countries': [],
        '/work-permit-countries': [],
        '/news': [],
        '/reviews': [],
        '/settings/rentree_text': { value: null },
        '/settings/agency_default_description': { value: null },
        '/stats': { clients_count: 0 }
      }
      const requestUrl = error.config?.url || ''
      const matchingEndpoint = Object.keys(publicEndpoints).find(endpoint => requestUrl.includes(endpoint))
      
      // Si c'est une route publique ET un endpoint public, retourner une réponse mockée
      // au lieu de rejeter la promesse (évite l'erreur dans la console)
      if (isPublicRoute && matchingEndpoint && !token) {
        // Retourner une réponse mockée avec la valeur par défaut appropriée
        return Promise.resolve({
          data: publicEndpoints[matchingEndpoint],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        })
      }
      
      // Ne rediriger que si :
      // 1. L'utilisateur avait un token (était authentifié) ET
      // 2. Il n'est pas sur une route publique
      // Cela évite de rediriger les utilisateurs non connectés qui accèdent à des pages publiques
      if (token && !isPublicRoute) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else if (token) {
        // Si l'utilisateur avait un token mais est sur une route publique,
        // on supprime juste le token sans rediriger
        localStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

export default api


