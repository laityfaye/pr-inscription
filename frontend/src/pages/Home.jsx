import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import TestimonialCarousel from '../components/TestimonialCarousel'
import PartnersCarousel3D from '../components/PartnersCarousel3D'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'
import { useAgency } from '../contexts/AgencyContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiStar, 
  FiArrowRight, 
  FiCheckCircle, 
  FiShield, 
  FiClock, 
  FiUsers, 
  FiAward, 
  FiFileText, 
  FiMessageCircle, 
  FiHelpCircle, 
  FiX, 
  FiInfo,
  FiTrendingUp,
  FiZap,
  FiTarget,
  FiHeart,
  FiBriefcase,
  FiHome,
  FiCalendar,
  FiEye,
  FiDollarSign
} from 'react-icons/fi'
import ReactPlayer from 'react-player'
import toast from 'react-hot-toast'

// Composant Counter pour animer les chiffres
const Counter = ({ target, duration = 2000, visible, resetKey }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const animationRef = useRef(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    // Réinitialiser quand resetKey change
    setCount(0)
    isAnimatingRef.current = false
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [resetKey])

  useEffect(() => {
    if (!visible) {
      setCount(0)
      isAnimatingRef.current = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    // Éviter de lancer plusieurs animations en même temps
    if (isAnimatingRef.current) {
      return
    }

    isAnimatingRef.current = true

    // Extraire le nombre de la chaîne (gérer les formats comme "95%", "15+", etc.)
    const extractNumber = (str) => {
      const match = str.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }

    const targetNum = extractNumber(target)
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (targetNum - startValue) * easeOut)

      countRef.current = currentValue
      setCount(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Afficher la valeur finale avec le suffixe
        setCount(targetNum)
        isAnimatingRef.current = false
        animationRef.current = null
      }
    }

    const timeoutId = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      isAnimatingRef.current = false
    }
  }, [visible, target, duration, resetKey])

  // Formater avec le suffixe
  const formatValue = () => {
    if (target.includes('%')) {
      return `${count}%`
    } else if (target.includes('+')) {
      return `${count}+`
    }
    return count.toString()
  }

  return <span>{formatValue()}</span>
}

const Home = () => {
  // Utiliser directement le contexte Agency qui a déjà un système de cache
  // Le contexte charge immédiatement depuis le cache localStorage, donc pas de délai
  // Les données de l'agence sont toujours disponibles (cache ou valeurs par défaut)
  const { agency } = useAgency()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [countries, setCountries] = useState([])
  const [workPermitCountries, setWorkPermitCountries] = useState([])
  const [news, setNews] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loadingCountry, setLoadingCountry] = useState(false)
  const [loading, setLoading] = useState(false) // Ne plus bloquer l'affichage initial
  const [rentreeText, setRentreeText] = useState('Rentrée 2025 - 2026 - Inscriptions ouvertes')
  const [defaultDescription, setDefaultDescription] = useState('Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.')
  const [clientsCount, setClientsCount] = useState(0)
  const [selectedWorkPermitCountry, setSelectedWorkPermitCountry] = useState(null)
  const [showWorkPermitDetails, setShowWorkPermitDetails] = useState(false)
  const [loadingWorkPermitDetails, setLoadingWorkPermitDetails] = useState(false)
<<<<<<< HEAD
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Images de groupes d'étudiants pour le carrousel
  const studentImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ]

  // Carrousel automatique des images
  useEffect(() => {
    if (studentImages.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % studentImages.length
        return nextIndex
      })
    }, 5000) // Change d'image toutes les 5 secondes

    return () => clearInterval(interval)
  }, [studentImages.length])
=======
  const [countersVisible, setCountersVisible] = useState(false)
  const [counterKey, setCounterKey] = useState(0) // Clé pour forcer la réinitialisation du compteur
  const statsSectionRef = useRef(null)
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817

  // Fonction helper pour gérer les clics sur les boutons de demande
  // Redirige vers /register si l'utilisateur n'est pas connecté, sinon vers la route normale
  const handleApplicationClick = useCallback((e, route) => {
    e.preventDefault()
    e.stopPropagation()
    
    const token = localStorage.getItem('token')
    const isAuthenticated = user || token
    
    if (!isAuthenticated) {
      // Rediriger vers l'inscription si l'utilisateur n'est pas connecté
      navigate('/register')
    } else {
      // Sinon, naviguer vers la route normale
      navigate(route)
    }
  }, [user, navigate])

  // Fonction helper pour gérer les clics sur les boutons de préinscription
  // Redirige vers /register si l'utilisateur n'est pas connecté, sinon vers l'espace client
  const handlePreinscriptionClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const token = localStorage.getItem('token')
    const isAuthenticated = user || token
    
    if (!isAuthenticated) {
      // Rediriger vers l'inscription si l'utilisateur n'est pas connecté
      navigate('/register')
    } else {
      // Rediriger vers l'espace client pour les utilisateurs connectés
      navigate('/client/inscriptions')
    }
  }, [user, navigate])

  // Charger uniquement les données non-critiques (ne bloque pas l'affichage de la section Hero)
  const fetchNonCriticalData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fonction helper pour gérer silencieusement les erreurs (endpoints qui peuvent échouer)
      const safeGet = (url, defaultValue) => {
        return api.get(url).catch((error) => {
          // Ignorer silencieusement les erreurs et retourner la valeur par défaut
          return { data: defaultValue }
        })
      }
      
      // Toujours charger les données publiques (pays, actualités, avis, paramètres, stats)
      // même lorsque l'utilisateur n'est pas connecté
      const promises = [
        safeGet('/countries', []),
        safeGet('/work-permit-countries', []),
        safeGet('/news', []),
        safeGet('/reviews', []),
        safeGet('/settings/rentree_text', { value: null }),
        safeGet('/settings/agency_default_description', { value: null }),
        safeGet('/stats', { clients_count: 0 })
      ]

      const [countriesRes, workPermitCountriesRes, newsRes, reviewsRes, rentreeTextRes, defaultDescRes, statsRes] = await Promise.all(promises)
      
      // Mettre à jour les états
      setCountries(countriesRes.data)
      setWorkPermitCountries(workPermitCountriesRes.data || [])

      // Mettre à jour les autres données publiques
      setNews((newsRes.data || []).slice(0, 3))
      setReviews(reviewsRes.data || [])
      
      // Mettre à jour le texte de rentrée
      if (rentreeTextRes.data?.value) {
        setRentreeText(rentreeTextRes.data.value)
      }
      
      // Mettre à jour la description par défaut
      if (defaultDescRes.data?.value) {
        setDefaultDescription(defaultDescRes.data.value)
      }
      
      // Mettre à jour le nombre de clients
      if (statsRes.data?.clients_count !== undefined) {
        setClientsCount(statsRes.data.clients_count)
      }
    } catch (error) {
      console.error('Error fetching non-critical data:', error)
    } finally {
      setLoading(false)
    }
  }, [user]) // Dépend de user pour savoir si on doit faire les requêtes

  useEffect(() => {
    // Charger les données non-critiques en arrière-plan (ne bloque pas l'affichage)
    fetchNonCriticalData()
    
    // Écouter les événements de focus pour recharger les données non-critiques
    const handleFocus = () => {
      // Vérifier si les paramètres ont été mis à jour
      const lastUpdate = localStorage.getItem('agency_updated')
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate)
        const now = Date.now()
        // Si la mise à jour a eu lieu il y a moins de 5 minutes, recharger
        if (now - updateTime < 5 * 60 * 1000) {
          console.log('Détection de mise à jour des paramètres, rechargement des données...')
          fetchNonCriticalData()
          // Supprimer le signal après rechargement
          localStorage.removeItem('agency_updated')
        }
      }
    }
    
    // Écouter l'événement personnalisé de mise à jour
    const handleAgencyUpdate = () => {
      // Le contexte Agency gère déjà la mise à jour, on recharge juste les autres données
      fetchNonCriticalData()
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('agencySettingsUpdated', handleAgencyUpdate)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('agencySettingsUpdated', handleAgencyUpdate)
    }
  }, [fetchNonCriticalData]) // Recharger les données quand fetchNonCriticalData change (donc quand user change)

  // Observer pour déclencher l'animation du compteur quand la section est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersVisible) {
            setCountersVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current)
    }

    return () => {
      if (statsSectionRef.current) {
        observer.unobserve(statsSectionRef.current)
      }
    }
  }, [countersVisible])

  // Fonction pour déclencher le décompte au survol
  const handleStatsHover = () => {
    // Réinitialiser et relancer le compteur à chaque survol
    setCountersVisible(false)
    setCounterKey(prev => prev + 1)
    // Relancer après un court délai pour permettre la réinitialisation
    setTimeout(() => {
      setCountersVisible(true)
    }, 50)
  }


  const handleCountryClick = async (countryId) => {
    setLoadingCountry(true)
    try {
      const response = await api.get(`/countries/${countryId}`)
      setSelectedCountry(response.data)
    } catch (error) {
      console.error('Error fetching country details:', error)
    } finally {
      setLoadingCountry(false)
    }
  }

  const handleWorkPermitDetailsClick = async (countryId) => {
    setLoadingWorkPermitDetails(true)
    setShowWorkPermitDetails(true)
    try {
      const response = await api.get(`/work-permit-countries/${countryId}`)
      setSelectedWorkPermitCountry(response.data)
    } catch (error) {
      console.error('Error fetching work permit country details:', error)
      toast.error('Erreur lors du chargement des détails')
      setShowWorkPermitDetails(false)
    } finally {
      setLoadingWorkPermitDetails(false)
    }
  }

  const closeModal = () => {
    setSelectedCountry(null)
  }

  return (
    <Layout>
{/* Hero Section - Design Premium Exceptionnel - Responsive */}
<section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden isolate">
  {/* Image par défaut - TOUJOURS visible en arrière-plan - Optimisée mobile */}
  <div className="absolute inset-0 z-0">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 sm:scale-105 transition-transform duration-[30000ms] ease-out"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80')`,
        filter: 'brightness(0.85) saturate(1.1)',
      }}
    />
  </div>

<<<<<<< HEAD
  {/* Carrousel d'images avec transitions cinématiques */}
  {studentImages.length > 0 && (
    <div className="absolute inset-0 z-[1]">
      {studentImages.map((image, index) => {
        const isActive = index === currentImageIndex;
        const isNext = index === (currentImageIndex + 1) % studentImages.length;
        
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out ${
              isActive ? 'opacity-100 scale-100 z-10' : isNext ? 'opacity-0 scale-105 z-[9]' : 'opacity-0 scale-110 z-0'
            }`}
            style={{ 
              pointerEvents: 'none',
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image})`,
                filter: 'brightness(0.9) saturate(1.15) contrast(1.05)',
                transform: isActive ? 'scale(1)' : 'scale(1.1)',
                transition: 'transform 30s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
=======
        {/* Lawyer Card - Bottom Left (Desktop) / Below Buttons (Mobile) */}
        {agency?.lawyer_card_enabled && (agency?.lawyer_first_name || agency?.lawyer_last_name) && (
          <>
            {/* Desktop: Absolute position bottom left */}
            <div className="hidden md:block absolute bottom-8 left-8 z-20 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/20 max-w-[220px]">
                <div className="flex flex-col items-center text-center space-y-2">
                  {/* Circular Image */}
                  {agency?.lawyer_image && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl">
                        <img 
                          src={getImageUrl(agency.lawyer_image)} 
                          alt={`${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() || 'Avocat'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {/* Lawyer Info */}
                  <div className="w-full">
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">
                      {agency.lawyer_first_name || ''} {agency.lawyer_last_name || ''}
                    </h3>
                    {agency.lawyer_title && (
                      <p className="text-xs text-gray-600 mb-2 px-1 line-clamp-2">{agency.lawyer_title}</p>
                    )}
                    {/* Appointment Button */}
                    <Link to="/appointment" className="block w-full">
                      <button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold py-2 px-3 rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1.5 text-xs">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">Prendre rendez-vous</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="section-container relative z-10 text-center animate-fade-in w-full px-4 pt-0 sm:pt-0 md:pt-0">
          {/* Badge */}
          <div className="inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-xl rounded-full mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm font-semibold border border-white/20 shadow-lg animate-slide-down">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-success-400 rounded-full mr-2 sm:mr-3 animate-pulse shadow-lg shadow-success-400/50"></span>
            <span className="text-[11px] sm:text-sm">{rentreeText}</span>
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
          </div>
        );
      })}
    </div>
  )}

  {/* Grille géométrique animée - Responsive */}
  <div 
    className="absolute inset-0 z-[1] opacity-[0.15] pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(59, 130, 246, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59, 130, 246, 0.12) 1px, transparent 1px)
      `,
      backgroundSize: 'clamp(40px, 8vw, 80px) clamp(40px, 8vw, 80px)',
    }}
  />

  {/* Overlay multi-couches premium - Plus opaque sur mobile */}
  <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/95 sm:from-white/92 via-blue-50/80 sm:via-blue-50/75 to-white/95 sm:to-white/92" />
  <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-100/60 sm:from-blue-100/50 via-transparent to-purple-100/40 sm:to-purple-100/30" />
  <div className="absolute inset-0 z-10 bg-gradient-to-bl from-transparent via-transparent to-blue-50/50 sm:to-blue-50/40" />
  <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(59,130,246,0.15)_100%)] sm:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(59,130,246,0.12)_100%)]" />
  <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(139,92,246,0.1)_0%,transparent_100%)] sm:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_100%)]" />

  {/* Particules flottantes animées - Réduites sur mobile */}
  <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full blur-3xl opacity-20 hidden sm:block"
        style={{
          width: `clamp(100px, ${15 + i * 5}vw, ${200 + i * 100}px)`,
          height: `clamp(100px, ${15 + i * 5}vw, ${200 + i * 100}px)`,
          background: `linear-gradient(135deg, rgba(59, 130, 246, ${0.3 - i * 0.05}), rgba(139, 92, 246, ${0.2 - i * 0.03}))`,
          top: `${10 + i * 15}%`,
          left: `${5 + i * 12}%`,
          animation: `float ${15 + i * 3}s ease-in-out infinite`,
          animationDelay: `${i * 2}s`,
        }}
      />
    ))}
  </div>

  {/* Contenu principal */}
  <div className="section-container relative z-20 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Badge Premium avec animation - Responsive */}
      <div className="flex justify-center mb-6 sm:mb-8 lg:mb-14 animate-fade-in">
        <div className="group relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 lg:py-3.5 bg-white/95 backdrop-blur-2xl border border-blue-300/50 rounded-full shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-700 hover:scale-105 max-w-[90vw]">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />
          
          {/* Indicateur animé */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <span className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }} />
            <span className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-30" />
            <span className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
          
          <span className="text-xs sm:text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 uppercase truncate">
            {rentreeText}
          </span>
          
          <FiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 group-hover:translate-x-1.5 transition-transform duration-300 flex-shrink-0" />
        </div>
      </div>

<<<<<<< HEAD
      {/* Titre principal - Optimisé mobile */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-10 animate-slide-up">
        <h1 className="relative px-2">
          {/* Ligne décorative supérieure animée */}
          <div className="absolute -top-6 sm:-top-8 lg:-top-10 left-1/2 -translate-x-1/2 w-20 sm:w-24 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-fade-in" style={{ animationDelay: '0.1s' }} />
          
          {/* Sous-titre élégant */}
          <span 
            className="block text-xs sm:text-sm md:text-base lg:text-lg font-light tracking-[0.2em] sm:tracking-[0.3em] text-blue-700/80 uppercase mb-4 sm:mb-6 lg:mb-10 animate-slide-up" 
            style={{ animationDelay: '0.15s' }}
          >
            Votre avenir commence ici
          </span>
          
          {/* Titre principal - Partie 1 */}
          <span 
            className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-2 sm:mb-3 leading-[0.92] tracking-tighter animate-slide-up text-slate-900 drop-shadow-2xl" 
            style={{ animationDelay: '0.2s' }}
          >
            Gérez vos
          </span>
          
          {/* Voyages d'Étude - avec gradient animé premium */}
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[11rem] font-black leading-[0.88] tracking-tighter mb-4 sm:mb-6 lg:mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <span 
              className="inline-block relative"
              style={{ 
                background: 'linear-gradient(135deg,rgb(18, 64, 216) 0%,rgb(17, 84, 228) 25%,rgb(22, 103, 232) 50%,rgb(37, 120, 221) 75%, #8B5CF6 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient 10s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(37, 99, 235, 0.25))',
              }}
=======
          {/* CTA Buttons */}
          {!loading && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up px-2" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={handlePreinscriptionClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 
                         px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base
                         bg-white text-primary-700 hover:bg-neutral-50 
                         shadow-2xl hover:shadow-glow-lg transform hover:scale-105 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         whitespace-nowrap border-0"
            >
              Préinscription maintenant
              <FiArrowRight className="w-4 h-4" />
            </button>
            <Link to="/reviews" className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 
                           px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base
                           bg-transparent text-white border-2 border-white/40 
                           hover:bg-white/20 hover:border-white/60 
                           backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent
                           whitespace-nowrap"
              >
                Voir les témoignages
              </button>
            </Link>
            <a 
              href="https://assurancevisiteurs.ca/collaborations/sbc-voyage/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
            >
              Voyages d'Étude
              {/* Effet de brillance */}
              <span 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"
                style={{ animationDuration: '3s' }}
              />
            </span>
          </span>
          
          {/* Nom de l'agence */}
          <span 
            className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-light text-slate-800 leading-tight mt-4 sm:mt-6 lg:mt-8 animate-slide-up px-2" 
            style={{ animationDelay: '0.4s' }}
          >
            <span className="inline-block bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent break-words">
              {agency?.name || 'TFKS Touba Fall Khidma Services'}
            </span>
          </span>
          
          {/* Ligne décorative inférieure */}
          <div 
            className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 left-1/2 -translate-x-1/2 w-24 sm:w-32 lg:w-40 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-fade-in" 
            style={{ animationDelay: '0.5s' }}
          />
        </h1>
      </div>

      {/* Description premium - Responsive */}
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-700 mb-6 sm:mb-8 lg:mb-12 max-w-5xl mx-auto leading-relaxed text-center font-light tracking-wide animate-slide-up px-4" style={{ animationDelay: '0.5s' }}>
        {agency?.description || defaultDescription}
      </p>

      {/* Sous-titre optionnel - Responsive */}
      {agency?.hero_subtitle && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 sm:mb-12 lg:mb-20 animate-slide-up px-4" style={{ animationDelay: '0.6s' }}>
          <div className="w-8 sm:w-12 lg:w-16 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl text-center leading-relaxed font-light italic">
            {agency.hero_subtitle}
          </p>
          <div className="w-8 sm:w-12 lg:w-16 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        </div>
      )}

      {/* Call-to-Action Premium - Responsive */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center mb-12 sm:mb-16 lg:mb-28 animate-slide-up px-4" style={{ animationDelay: '0.7s' }}>
          <Link to="/register" className="w-full sm:w-auto group max-w-sm sm:max-w-none">
            <button className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 font-bold rounded-xl sm:rounded-2xl transition-all duration-500 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transform hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:scale-[1.02] sm:hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-blue-500/50">
              <span className="relative z-10">Commencer maintenant</span>
              <FiArrowRight className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
              
              {/* Effet shimmer premium */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-700" />
            </button>
          </Link>
          
          <Link to="/reviews" className="w-full sm:w-auto group max-w-sm sm:max-w-none">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 font-semibold rounded-xl sm:rounded-2xl transition-all duration-500 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl bg-white/90 backdrop-blur-2xl text-blue-700 border-2 border-blue-300/60 hover:bg-white hover:border-blue-400/80 shadow-xl hover:shadow-2xl shadow-blue-500/15 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-400/40">
              <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              <span className="whitespace-nowrap">Voir les témoignages</span>
            </button>
          </Link>
        </div>
      )}

      {/* Cartes de fonctionnalités premium - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-12 sm:mb-16 lg:mb-24 animate-slide-up px-2 sm:px-0" style={{ animationDelay: '0.8s' }}>
        {[
          { icon: FiGlobe, title: 'Destinations multiples', description: `Explorez ${countries.length || '15+'} pays pour vos études`, color: 'from-blue-500 to-blue-600' },
          { icon: FiFileText, title: 'Gestion simplifiée', description: 'Suivez vos dossiers en temps réel', color: 'from-purple-500 to-purple-600' },
          { icon: FiShield, title: 'Accompagnement', description: 'Support expert à chaque étape', color: 'from-blue-500 to-indigo-600' },
          { icon: FiTrendingUp, title: 'Taux de réussite', description: '95% de réussite dans nos accompagnements', color: 'from-green-500 to-emerald-600' }
        ].map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="group relative p-5 sm:p-6 lg:p-8 xl:p-10 bg-white/95 backdrop-blur-2xl border border-blue-200/60 rounded-2xl sm:rounded-3xl hover:border-blue-300/80 transition-all duration-700 hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              {/* Background glow animé */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700 rounded-2xl sm:rounded-3xl`} />
              
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Contenu */}
              <div className="relative z-10">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Accent décoratif */}
              <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-bl ${feature.color} opacity-0 group-hover:opacity-10 rounded-bl-2xl sm:rounded-bl-3xl transition-opacity duration-700`} />
            </div>
          );
        })}
      </div>

<<<<<<< HEAD
      {/* Statistiques premium - Responsive */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 sm:w-4/5 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        
        <div 
          className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-20 pt-10 sm:pt-12 lg:pt-16 xl:pt-20 animate-slide-up px-4" 
          style={{ animationDelay: '0.9s' }}
        >
          {[
            { value: clientsCount > 0 ? `${clientsCount}+` : '500+', label: 'Étudiants accompagnés', icon: FiUsers, gradient: 'from-blue-600 to-blue-700' },
            { value: countries.length || '15+', label: 'Pays disponibles', icon: FiGlobe, gradient: 'from-purple-600 to-purple-700' },
            { value: reviews.length > 0 ? `${reviews.length}+` : '50+', label: 'Avis clients', icon: FiStar, gradient: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="text-center group cursor-default flex-1 min-w-[120px] sm:min-w-[140px]"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2.5} />
=======
          {/* Lawyer Card - Mobile: Below buttons */}
          {agency?.lawyer_card_enabled && (agency?.lawyer_first_name || agency?.lawyer_last_name) && (
            <div className="md:hidden mt-4 sm:mt-6 w-full max-w-[280px] mx-auto animate-slide-up px-2" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/20">
                <div className="flex flex-col items-center text-center space-y-2">
                  {/* Circular Image */}
                  {agency?.lawyer_image && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xl">
                        <img 
                          src={getImageUrl(agency.lawyer_image)} 
                          alt={`${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() || 'Avocat'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {/* Lawyer Info */}
                  <div className="w-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                      {agency.lawyer_first_name || ''} {agency.lawyer_last_name || ''}
                    </h3>
                    {agency.lawyer_title && (
                      <p className="text-xs text-gray-600 mb-2 px-1 line-clamp-2">{agency.lawyer_title}</p>
                    )}
                    {/* Appointment Button */}
                    <Link to="/appointment" className="block w-full">
                      <button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold py-2 px-3 rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1.5 text-xs">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">Prendre rendez-vous</span>
                      </button>
                    </Link>
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
                  </div>
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient} mb-2 sm:mb-3 drop-shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 font-semibold tracking-wide uppercase leading-tight">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

  {/* Indicateur de scroll premium */}
  <div className="hidden lg:flex absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '1s' }}>
    <span className="text-xs font-bold text-blue-700/80 uppercase tracking-widest">Découvrir</span>
    <div className="relative w-8 h-14 border-2 border-blue-400/60 rounded-full flex items-start justify-center p-2.5 backdrop-blur-xl bg-white/60 hover:border-blue-500/80 hover:bg-white/80 transition-all duration-500 group cursor-pointer">
      <div className="w-2 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-bounce shadow-lg shadow-blue-500/40" style={{ animationDuration: '1.5s' }} />
      <div className="absolute inset-0 rounded-full bg-blue-400/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
    </div>
  </div>
</section>

      {/* Why Choose Us - Enhanced */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-20">
            <Badge variant="primary" size="lg" className="mb-6">
              Pourquoi nous choisir
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Excellence & Confiance
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Nous vous accompagnons à chaque étape de votre projet d'études à l'étranger avec expertise et dévouement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: FiShield, 
                title: 'Sécurisé & Fiable', 
                desc: 'Agence certifiée et reconnue pour la qualité de ses services',
                gradient: 'from-primary-500 to-primary-600',
                delay: '0.1s'
              },
              { 
                icon: FiClock, 
                title: 'Accompagnement', 
                desc: 'Suivi personnalisé tout au long de votre parcours',
                gradient: 'from-accent-500 to-accent-600',
                delay: '0.2s'
              },
              { 
                icon: FiAward, 
                title: 'Expertise', 
                desc: 'Des années d\'expérience dans le domaine des études à l\'étranger',
                gradient: 'from-accent-500 to-accent-600',
                delay: '0.3s'
              },
              { 
                icon: FiUsers, 
                title: 'Communauté', 
                desc: 'Rejoignez une communauté d\'étudiants satisfaits et épanouis',
                gradient: 'from-primary-500 to-primary-600',
                delay: '0.4s'
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  interactive
                  className="p-8 text-center animate-slide-up group" 
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`relative inline-block mb-6`}>
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-4xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Enhanced */}
      <section className="py-24 bg-white relative overflow-hidden">

        <div className="section-container relative z-10">
          <div className="text-center mb-20">
            <Badge variant="accent" size="lg" className="mb-6">
              Comment ça marche
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Un processus simple en 4 étapes
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              De l'inscription à la validation, nous vous guidons à chaque étape
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-primary-200 transform -translate-y-1/2" style={{ top: '25%' }}></div>

            {[
              { step: '1', title: 'Inscription', desc: 'Créez votre compte et remplissez votre profil en quelques minutes', icon: FiFileText, gradient: 'from-primary-500 to-primary-600', badgeGradient: 'from-primary-500 to-primary-600' },
              { step: '2', title: 'Préinscription', desc: 'Sélectionnez votre pays de destination et complétez votre dossier', icon: FiGlobe, gradient: 'from-accent-500 to-accent-600', badgeGradient: 'from-accent-500 to-accent-600' },
              { step: '3', title: 'Documents', desc: 'Uploadez vos documents nécessaires de manière sécurisée', icon: FiFileText, gradient: 'from-accent-500 to-accent-600', badgeGradient: 'from-accent-500 to-accent-600' },
              { step: '4', title: 'Validation', desc: 'Notre équipe valide votre dossier et vous accompagne jusqu\'au bout', icon: FiCheckCircle, gradient: 'from-primary-500 to-primary-600', badgeGradient: 'from-primary-500 to-primary-600' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="relative animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <Card interactive className="p-8 text-center relative overflow-visible">
                    {/* Step Badge */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br ${item.badgeGradient} text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xl z-10`}>
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="relative inline-block mb-6">
                      <div className={`relative w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-4xl text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-600 leading-relaxed text-sm">{item.desc}</p>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section - Enhanced */}
      <section 
        ref={statsSectionRef}
        onMouseEnter={handleStatsHover}
        className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden"
      >
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <Badge 
              variant="neutral" 
              size="lg" 
              className="mb-6 bg-white/20 text-white border-white/30 cursor-pointer transition-all duration-300 hover:bg-white/30 hover:scale-105"
              onMouseEnter={handleStatsHover}
            >
              Nos réalisations
            </Badge>
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 cursor-pointer transition-all duration-300 hover:scale-105"
              onMouseEnter={handleStatsHover}
            >
              Des chiffres qui parlent
            </h2>
            <p 
              className="text-xl text-primary-100 max-w-2xl mx-auto cursor-pointer"
              onMouseEnter={handleStatsHover}
            >
              Une communauté qui grandit chaque jour grâce à votre confiance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FiUsers, number: clientsCount > 0 ? `${clientsCount}+` : '0+', label: 'Étudiants accompagnés' },
              { icon: FiGlobe, number: countries.length ? `${countries.length}+` : '15+', label: 'Pays disponibles' },
              { icon: FiTrendingUp, number: '95%', label: 'Taux de réussite' },
              { icon: FiStar, number: reviews.length > 0 ? `${reviews.length}+` : '50+', label: 'Avis clients' },
            ].map((stat, index) => {
              const Icon = stat.icon
              
              return (
                <div
                  key={index} 
                  className="group p-8 text-center bg-white/15 backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-2xl animate-slide-up hover:bg-white/20 hover:border-white/60 transition-all duration-300" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-white/50 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-white/40">
                    <Icon className="text-4xl text-white transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110" />
                  </div>
                  <div className="text-5xl lg:text-6xl font-bold mb-3 text-white min-h-[4rem] flex items-center justify-center">
                    <Counter key={counterKey} target={stat.number} visible={countersVisible} duration={2000} resetKey={counterKey} />
                  </div>
                  <div className="text-white text-lg font-semibold">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Countries Section - Enhanced */}
      {countries.length > 0 && (
        <section className="py-24 bg-white">
          <div className="section-container">
            <div className="text-center mb-20">
              <Badge variant="success" size="lg" className="mb-6">
                Destinations
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Pays disponibles
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Découvrez les destinations qui vous attendent et réalisez vos rêves
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {countries.map((country, index) => (
                <div
                  key={country.id}
                  onClick={() => handleCountryClick(country.id)}
                  className="p-6 bg-white rounded-2xl shadow-soft border border-neutral-200 hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-slide-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative mb-5 inline-block">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FiGlobe className="text-3xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {country.name}
                  </h3>
                  {country.subtitle && (
                    <p className="text-sm font-medium text-primary-600 mb-3">
                      {country.subtitle}
                    </p>
                  )}
                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {country.description || 'Découvrez les opportunités d\'études dans ce pays'}
                  </p>
                  <div className="flex items-center text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Voir les conditions</span>
                    <FiArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Work Permit Section */}
      {workPermitCountries.length > 0 && (
        <section className="py-24 bg-white">
          <div className="section-container">
            <div className="text-center mb-20">
              <Badge variant="primary" size="lg" className="mb-6">
                Demandes de visa
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Obtenez votre visa
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Explorez les opportunités de visa visiteur ou permis de travail à l'étranger et démarrez votre carrière internationale
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workPermitCountries.map((country, index) => (
                <Card
                  key={country.id}
                  interactive
                  className="p-6 h-full animate-slide-up group flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative mb-5 inline-block">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FiBriefcase className="text-3xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {country.name}
                  </h3>
                  {country.subtitle && (
                    <p className="text-sm font-medium text-primary-600 mb-3">
                      {country.subtitle}
                    </p>
                  )}
                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {country.description || 'Découvrez les opportunités de travail dans ce pays'}
                  </p>
                  {country.processing_time && (
                    <p className="text-xs text-neutral-500 mb-3 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Délai: {country.processing_time}
                    </p>
                  )}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWorkPermitDetailsClick(country.id)
                      }}
                      className="flex-1 hover:bg-primary-50 hover:text-primary-600"
                      icon={FiEye}
                    >
                      Voir détail
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex-1"
                      icon={FiArrowRight}
                      iconPosition="right"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApplicationClick(e, '/client/work-permit-applications')
                      }}
                    >
                      Faire une demande
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="primary" 
                size="lg" 
                icon={FiArrowRight} 
                iconPosition="right"
                onClick={(e) => handleApplicationClick(e, '/client/work-permit-applications')}
              >
                Voir toutes les opportunités
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Study Permit Renewal Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="section-container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-20">
            <Badge variant="primary" size="lg" className="mb-4 sm:mb-6">
              Renouvellement
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 mb-4 sm:mb-6 px-2">
              Renouvellement CAQ ou Permis d'études
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
              Renouvelez votre CAQ ou votre permis d'études au Canada en toute simplicité
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card interactive className="p-4 sm:p-6 md:p-8 lg:p-12 animate-slide-up">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-accent-500 to-accent-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <FiFileText className="text-3xl sm:text-4xl md:text-5xl text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left w-full">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4">
                    Renouvelez votre CAQ ou Permis d'études
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6 leading-relaxed">
                    Vous êtes déjà au Canada et votre CAQ ou permis d'études arrive à expiration ? 
                    Notre équipe vous accompagne dans le processus de renouvellement pour continuer vos études en toute sérénité.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Processus simplifié</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Renouvellement rapide et efficace</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Accompagnement expert</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Notre équipe connaît les procédures</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Suivi personnalisé</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Un conseiller dédié à votre dossier</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Délais respectés</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Soumission dans les temps</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    icon={FiArrowRight} 
                    iconPosition="right" 
                    fullWidth 
                    className="md:w-auto text-sm sm:text-base"
                    onClick={(e) => handleApplicationClick(e, '/client/study-permit-renewal-applications')}
                  >
                    Faire une demande de renouvellement
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Residence Application Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="section-container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-20">
            <Badge variant="accent" size="lg" className="mb-4 sm:mb-6">
              Résidence permanente
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 mb-4 sm:mb-6 px-2">
              Résidence permanente au Canada
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
              Réalisez votre rêve d'immigration au Canada avec notre accompagnement expert
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card interactive className="p-4 sm:p-6 md:p-8 lg:p-12 animate-slide-up">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-500 to-primary-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <FiHome className="text-3xl sm:text-4xl md:text-5xl text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left w-full">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4">
                    Obtenez votre résidence permanente au Canada
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6 leading-relaxed">
                    Le Canada offre de nombreuses opportunités pour ceux qui souhaitent s'y installer de manière permanente. 
                    Notre équipe vous accompagne dans toutes les démarches nécessaires pour obtenir votre résidence permanente.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Accompagnement complet</p>
                        <p className="text-xs sm:text-sm text-neutral-600">De la préparation du dossier à l'obtention</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Expertise reconnue</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Des années d'expérience dans l'immigration</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Suivi personnalisé</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Un conseiller dédié à votre dossier</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-neutral-900">Taux de réussite élevé</p>
                        <p className="text-xs sm:text-sm text-neutral-600">Maximisez vos chances de succès</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    icon={FiArrowRight} 
                    iconPosition="right" 
                    fullWidth 
                    className="md:w-auto text-sm sm:text-base"
                    onClick={(e) => handleApplicationClick(e, '/client/residence-applications')}
                  >
                    Faire une demande de résidence
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Agency Info - Enhanced */}
      {agency && (
        <section id="about-us" className="py-24 bg-white">
          <div className="section-container">
            <div className="text-center mb-20 animate-fade-in">
              <Badge variant="primary" size="lg" className="mb-6">
                À propos de nous
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Votre partenaire de confiance
              </h2>
              <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                {agency.description || 'Voyager pour étudier est une étape majeure qui demande une organisation parfaite. Notre agence de voyage TFKS est là pour transformer cette étape excitante en une expérience simple et sécurisée.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: FiMail, label: 'Email', value: agency.email, link: `mailto:${agency.email}`, gradient: 'from-primary-500 to-primary-600' },
                { icon: FiPhone, label: 'Téléphone', value: agency.phone, link: `tel:${agency.phone}`, gradient: 'from-accent-500 to-accent-600' },
                ...(agency.whatsapp ? [{ icon: FiMessageCircle, label: 'WhatsApp', value: agency.whatsapp, link: `https://wa.me/${agency.whatsapp.replace(/\D/g, '')}`, gradient: 'from-success-500 to-success-600', external: true }] : []),
                { icon: FiMapPin, label: 'Adresse', value: agency.address, gradient: 'from-primary-500 to-primary-600' },
              ].map((contact, index) => {
                const Icon = contact.icon
                return contact.link ? (
                  <a 
                    key={index} 
                    href={contact.link} 
                    target={contact.external ? '_blank' : undefined} 
                    rel={contact.external ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    <Card interactive className="p-6 text-center group" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className={`relative inline-block mb-5`}>
                        <div className={`relative w-16 h-16 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="text-3xl text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-neutral-900">{contact.label}</h3>
                      <p className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
                        {contact.value}
                      </p>
                    </Card>
                  </a>
                ) : (
                  <div key={index}>
                    <Card interactive className="p-6 text-center group" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className={`relative inline-block mb-5`}>
                        <div className={`relative w-16 h-16 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="text-3xl text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-neutral-900">{contact.label}</h3>
                      <p className="text-neutral-600 text-sm">{contact.value}</p>
                    </Card>
                  </div>
                )
              })}
            </div>

            {agency.registration_number && (
              <div className="text-center">
                <Card className="inline-block p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-200">
                  <p className="text-sm text-neutral-600 mb-2 font-medium">Numéro d'enregistrement</p>
                  <p className="text-2xl font-bold text-primary-700">{agency.registration_number}</p>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* News Section - Enhanced */}
      {news.length > 0 && (
        <section className="py-24 bg-white">
          <div className="section-container">
            <div className="text-center mb-20">
              <Badge variant="accent" size="lg" className="mb-6">
                Actualités
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Dernières actualités
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Restez informé de nos dernières nouvelles et opportunités
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {news.map((item, index) => (
                <Link
                  key={item.id}
                  to="/news"
                  className="block"
                >
                  <Card
                    interactive
                    className="overflow-hidden animate-slide-up group h-full flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.image && (
                      <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    )}
                    {item.video_url && (
                      <div className="relative h-48 sm:h-56 flex-shrink-0">
                        <ReactPlayer
                          url={item.video_url}
                          width="100%"
                          height="100%"
                          controls
                          className="absolute inset-0"
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-600 line-clamp-3 leading-relaxed mb-3 sm:mb-4 flex-grow">
                        {item.content}
                      </p>
                      <div className="flex items-center text-primary-600 text-xs sm:text-sm font-semibold group-hover:translate-x-1 transition-transform mt-auto">
                        <span>Lire la suite</span>
                        <FiArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section - Enhanced with Premium Carousel */}
      {reviews.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden">
          <div className="section-container">
            <div className="text-center mb-8">
              <Badge variant="warning" size="lg" className="mb-4">
                Témoignages
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
                Avis de nos clients
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Découvrez les expériences authentiques de nos étudiants
              </p>
            </div>

            {/* Carrousel d'avis premium - Variante horizontale */}
            <TestimonialCarousel reviews={reviews} variant="horizontal" />

            <div className="text-center mt-12">
              <Link to="/reviews">
                <Button variant="secondary" size="lg" icon={FiArrowRight} iconPosition="right">
                  Voir tous les avis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="section-container">
          <div className="text-center mb-20">
            <Badge variant="primary" size="lg" className="mb-6">
              Questions fréquentes
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Tout ce que vous devez savoir
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Des réponses claires à vos questions les plus courantes
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: 'Quels documents sont nécessaires pour la préinscription ?',
                answer: 'Les documents requis varient selon le pays. Généralement, vous aurez besoin de votre diplôme, relevés de notes, passeport, photos d\'identité et parfois des tests de langue. Notre équipe vous guidera précisément selon votre destination.',
              },
              {
                question: 'Combien de temps prend le processus de préinscription ?',
                answer: 'Le processus peut prendre de 2 à 6 mois selon le pays et la période de l\'année. Nous vous accompagnons à chaque étape pour accélérer le processus et vous tenir informé de l\'avancement de votre dossier.',
              },
              {
                question: 'Quels sont les frais de service ?',
                answer: 'Nos frais varient selon le pays de destination et les services demandés. Nous proposons des tarifs transparents et compétitifs. Contactez-nous pour un devis personnalisé adapté à votre situation.',
              },
              {
                question: 'Puis-je modifier ma préinscription après soumission ?',
                answer: 'Oui, vous pouvez modifier certaines informations avant la validation finale. Notre équipe vous guidera dans les modifications possibles et vous aidera à mettre à jour votre dossier si nécessaire.',
              },
              {
                question: 'Quelle est la garantie de réussite ?',
                answer: 'Bien que nous ne puissions garantir à 100% l\'acceptation, notre taux de réussite de 95% témoigne de notre expertise. Nous travaillons avec vous pour maximiser vos chances de succès.',
              },
            ].map((faq, index) => (
              <Card 
                key={index} 
                interactive
                className="p-6 animate-slide-up group" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <FiHelpCircle className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-3 group-hover:text-primary-700 transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">

        <div className="section-container text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Badge variant="neutral" size="lg" className="mb-8 bg-white/20 text-white border-white/30">
              Commencez votre aventure
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Prêt à réaliser votre rêve ?
            </h2>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed">
              Rejoignez des centaines d'étudiants qui ont réalisé leur rêve d'études à l'étranger avec nous. 
              Votre aventure commence ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button 
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 
                             px-8 py-4 text-base
                             bg-white text-primary-700 hover:bg-neutral-50 
                             shadow-2xl hover:shadow-glow-lg transform hover:scale-105 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                             whitespace-nowrap border-0"
                >
                  Commencer maintenant
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/reviews">
                <button 
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 
                             px-8 py-4 text-base
                             bg-transparent text-white border-2 border-white/40 
                             hover:bg-white/20 hover:border-white/60 
                             backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent
                             whitespace-nowrap"
                >
                  Lire les témoignages
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Country Eligibility Modal - Enhanced */}
      {selectedCountry && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            padding="none"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg"></div>
                    <div className="relative w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <FiGlobe className="text-3xl text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{selectedCountry.name}</h2>
                    <p className="text-primary-100 text-sm">Conditions d'éligibilité</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                  aria-label="Fermer"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Description */}
              {selectedCountry.description && (
                <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <FiInfo className="text-primary-600" />
                    À propos
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">{selectedCountry.description}</p>
                </Card>
              )}

              {/* Eligibility Conditions */}
              {selectedCountry.eligibility_conditions ? (
                <Card padding="lg" className="bg-gradient-to-br from-blue-50 to-primary-50 border-blue-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <FiCheckCircle className="text-primary-600 w-6 h-6" />
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Conditions d'éligibilité
                    </h3>
                  </div>
                  <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {selectedCountry.eligibility_conditions}
                  </div>
                </Card>
              ) : (
                <Card padding="lg" className="bg-warning-50 border-warning-200">
                  <div className="flex items-start space-x-3">
                    <FiInfo className="text-warning-600 w-6 h-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-warning-800 font-medium mb-1">
                        Informations non disponibles
                      </p>
                      <p className="text-warning-700 text-sm">
                        Les conditions d'éligibilité pour ce pays ne sont pas encore disponibles.
                        Contactez-nous pour plus d'informations.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
                <Button variant="secondary" onClick={closeModal} className="sm:order-2">
                  Fermer
                </Button>
                <Button 
                  variant="primary" 
                  fullWidth 
                  className="sm:order-1 sm:w-auto" 
                  icon={FiArrowRight} 
                  iconPosition="right"
                  onClick={handlePreinscriptionClick}
                >
                  Faire une préinscription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Détails Permis de Travail */}
      {showWorkPermitDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-neutral-200">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Détails du permis de travail</h2>
                  <p className="text-white/90 text-sm">Informations complètes sur les opportunités de travail</p>
                </div>
                <button
                  onClick={() => {
                    setShowWorkPermitDetails(false)
                    setSelectedWorkPermitCountry(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              {loadingWorkPermitDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : selectedWorkPermitCountry ? (
                <div className="space-y-6">
                  {/* En-tête avec nom et sous-titre */}
                  <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-xl border border-primary-200">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-800 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FiBriefcase className="text-3xl text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                          {selectedWorkPermitCountry.name}
                        </h3>
                        {selectedWorkPermitCountry.subtitle && (
                          <p className="text-lg font-medium text-primary-600 mb-3">
                            {selectedWorkPermitCountry.subtitle}
                          </p>
                        )}
                        {selectedWorkPermitCountry.description && (
                          <p className="text-neutral-700 leading-relaxed">
                            {selectedWorkPermitCountry.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Délai de traitement */}
                  {selectedWorkPermitCountry.processing_time && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-5 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                          <FiClock className="w-4 h-4 text-white" />
                        </div>
                        Délai de traitement
                      </h4>
                      <p className="text-neutral-700 pl-10">{selectedWorkPermitCountry.processing_time}</p>
                    </div>
                  )}

                  {/* Coûts */}
                  {selectedWorkPermitCountry.costs && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100/30 p-5 rounded-xl border border-green-200">
                      <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                          <FiDollarSign className="w-4 h-4 text-white" />
                        </div>
                        Coûts
                      </h4>
                      <p className="text-neutral-700 pl-10 whitespace-pre-line">{selectedWorkPermitCountry.costs}</p>
                    </div>
                  )}

                  {/* Conditions d'éligibilité */}
                  {selectedWorkPermitCountry.eligibility_conditions && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 p-5 rounded-xl border border-purple-200">
                      <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                        Conditions d'éligibilité
                      </h4>
                      <div className="pl-10">
                        <ul className="space-y-2 text-neutral-700">
                          {selectedWorkPermitCountry.eligibility_conditions.split('\n').filter(line => line.trim()).map((condition, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <FiCheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span>{condition.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Documents requis */}
                  {selectedWorkPermitCountry.required_documents && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 p-5 rounded-xl border border-orange-200">
                      <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                          <FiFileText className="w-4 h-4 text-white" />
                        </div>
                        Documents requis
                      </h4>
                      <div className="pl-10">
                        <ul className="space-y-2 text-neutral-700">
                          {selectedWorkPermitCountry.required_documents.split('\n').filter(line => line.trim()).map((doc, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <FiFileText className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span>{doc.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Processus de demande */}
                  {selectedWorkPermitCountry.application_process && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 p-5 rounded-xl border border-indigo-200">
                      <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                          <FiInfo className="w-4 h-4 text-white" />
                        </div>
                        Processus de demande
                      </h4>
                      <div className="pl-10">
                        <ol className="space-y-3 text-neutral-700">
                          {selectedWorkPermitCountry.application_process.split('\n').filter(line => line.trim()).map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="pt-0.5">{step.trim()}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiInfo className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Aucune information disponible</p>
                </div>
              )}
            </div>
            
            {selectedWorkPermitCountry && (
              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowWorkPermitDetails(false)
                      setSelectedWorkPermitCountry(null)
                    }}
                    className="sm:order-2"
                  >
                    Fermer
                  </Button>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    className="sm:order-1 flex-1 sm:w-auto" 
                    icon={FiArrowRight} 
                    iconPosition="right"
                    onClick={(e) => {
                      setShowWorkPermitDetails(false)
                      setSelectedWorkPermitCountry(null)
                      handleApplicationClick(e, '/client/work-permit-applications')
                    }}
                  >
                    Faire une demande
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

<<<<<<< HEAD
=======
      {/* Partners Section */}
      <section className="py-24 bg-white relative overflow-hidden">

        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" className="mb-6">
              Nos partenaires
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Institutions partenaires
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Nous collaborons avec des établissements d'enseignement de renom au Canada pour vous offrir les meilleures opportunités
            </p>
          </div>

          <PartnersCarousel3D 
            partners={[
              {
                name: 'Collège Ellis',
                image: '/images/partners/college-ellis.png',
                alt: 'Logo Collège Ellis'
              },
              {
                name: 'COLLÈGE de l\'île',
                image: '/images/partners/college-de-lile.png',
                alt: 'Logo COLLÈGE de l\'île'
              },
              {
                name: 'COLLÈGE SUPÉRIEUR DE MONTRÉAL',
                image: '/images/partners/college-superieur-montreal.png',
                alt: 'Logo COLLÈGE SUPÉRIEUR DE MONTRÉAL'
              },
              {
                name: 'Collège CDI',
                image: '/images/partners/college-cdi.png',
                alt: 'Logo Collège CDI'
              },
              {
                name: 'CESTAR COLLÈGE',
                image: '/images/partners/cestar-college.png',
                alt: 'Logo CESTAR COLLÈGE, Campus Longueuil'
              },
              {
                name: 'Collège National',
                image: '/images/partners/college-national.png',
                alt: 'Logo Collège National'
              }
            ]}
          />
        </div>
      </section>
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
    </Layout>
  )
}

export default Home
