import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AgencyContext = createContext(null)

export const useAgency = () => {
  const context = useContext(AgencyContext)
  if (!context) {
    throw new Error('useAgency must be used within AgencyProvider')
  }
  return context
}

export const AgencyProvider = ({ children }) => {
  // Valeur par défaut immédiate pour éviter le délai d'affichage
  const defaultAgency = {
    name: 'TFKS Touba Fall Khidma Services',
    logo: null,
    description: 'Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.'
  }

  // Charger depuis le cache localStorage si disponible
  const getCachedAgency = () => {
    try {
      const cached = localStorage.getItem('agency_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        // Vérifier si le cache n'est pas trop vieux (24 heures)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data
        }
      }
    } catch (error) {
      console.error('Error reading agency cache:', error)
    }
    return null
  }

  const [agency, setAgency] = useState(getCachedAgency() || defaultAgency)
  const [loading, setLoading] = useState(false) // Commencer à false car on a déjà une valeur par défaut

  const fetchAgency = async () => {
    try {
      const response = await api.get('/agency')
      const agencyData = response.data
      setAgency(agencyData)
      
      // Mettre en cache
      try {
        localStorage.setItem('agency_cache', JSON.stringify({
          data: agencyData,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error caching agency data:', error)
      }
    } catch (error) {
      console.error('Error fetching agency settings:', error)
      // Garder les valeurs par défaut en cas d'erreur seulement si on n'a pas de cache
      setAgency(prev => prev || defaultAgency)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Charger depuis l'API en arrière-plan (le cache est déjà chargé dans useState)
    fetchAgency()
    
    // Écouter les événements de mise à jour des paramètres
    const handleAgencyUpdate = () => {
      fetchAgency()
    }
    
    window.addEventListener('agencySettingsUpdated', handleAgencyUpdate)
    
    return () => {
      window.removeEventListener('agencySettingsUpdated', handleAgencyUpdate)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AgencyContext.Provider value={{ agency, loading, fetchAgency }}>
      {children}
    </AgencyContext.Provider>
  )
}





