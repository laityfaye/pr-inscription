import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import TestimonialCarousel from '../components/TestimonialCarousel'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'
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
  FiHeart
} from 'react-icons/fi'
import ReactPlayer from 'react-player'

const Home = () => {
  const [agency, setAgency] = useState(null)
  const [countries, setCountries] = useState([])
  const [news, setNews] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loadingCountry, setLoadingCountry] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rentreeText, setRentreeText] = useState('Rentrée 2025 - 2026 - Inscriptions ouvertes')
  const [defaultDescription, setDefaultDescription] = useState('Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l\'étranger.')
  const [clientsCount, setClientsCount] = useState(0)

  useEffect(() => {
    fetchData()
    
    // Écouter les événements de focus pour recharger les données
    const handleFocus = () => {
      // Vérifier si les paramètres ont été mis à jour
      const lastUpdate = localStorage.getItem('agency_updated')
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate)
        const now = Date.now()
        // Si la mise à jour a eu lieu il y a moins de 5 minutes, recharger
        if (now - updateTime < 5 * 60 * 1000) {
          console.log('Détection de mise à jour des paramètres, rechargement des données...')
          fetchData()
          // Supprimer le signal après rechargement
          localStorage.removeItem('agency_updated')
        }
      } else {
        fetchData()
      }
    }
    
    // Écouter l'événement personnalisé de mise à jour
    const handleAgencyUpdate = (event) => {
      console.log('Événement de mise à jour reçu:', event.detail)
      if (event.detail) {
        setAgency(event.detail)
        setLoading(false) // S'assurer que le loading est désactivé
      } else {
        fetchData()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('agencySettingsUpdated', handleAgencyUpdate)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('agencySettingsUpdated', handleAgencyUpdate)
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Ajouter un timestamp pour éviter le cache
      const timestamp = new Date().getTime()
      const [agencyRes, countriesRes, newsRes, reviewsRes, rentreeTextRes, defaultDescRes, statsRes] = await Promise.all([
        api.get(`/agency?nocache=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        }),
        api.get('/countries'),
        api.get('/news'),
        api.get('/reviews'),
        api.get('/settings/rentree_text').catch(() => ({ data: { value: null } })),
        api.get('/settings/agency_default_description').catch(() => ({ data: { value: null } })),
        api.get('/stats').catch(() => ({ data: { clients_count: 0 } })),
      ])
      
      // Log pour debug
      console.log('Données de l\'agence chargées:', agencyRes.data)
      
      // Mettre à jour les états en une seule fois pour éviter les re-renders multiples
      setAgency(agencyRes.data)
      setCountries(countriesRes.data)
      setNews(newsRes.data.slice(0, 3))
      // Ne pas limiter les avis pour le carrousel, il gère lui-même l'affichage
      setReviews(reviewsRes.data)
      
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
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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

  const closeModal = () => {
    setSelectedCountry(null)
  }

  return (
    <Layout>
      {/* Hero Section - Modern & Premium */}
      <section className="relative overflow-hidden text-white py-20 sm:py-32 min-h-[85vh] flex items-center">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/85 to-accent-900/90"></div>
          {/* Animated Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse-slow"></div>
        </div>

        <div className="section-container relative z-10 text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center justify-center px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full mb-8 text-sm font-semibold border border-white/20 shadow-lg animate-slide-down">
            <span className="w-2.5 h-2.5 bg-success-400 rounded-full mr-3 animate-pulse shadow-lg shadow-success-400/50"></span>
            <span>{rentreeText}</span>
          </div>

          {/* Main Heading - Masqué pendant le chargement */}
          {!loading && (
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance animate-slide-up leading-tight">
              <span className="block mb-2">{agency?.name || 'TFKS Touba Fall Khidma Services'}</span>
              {agency?.name && agency?.name !== 'TFKS Touba Fall Khidma Services' && (
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-primary-100">
                  Touba Fall Khidma Services
                </span>
              )}
            </h1>
          )}

          {/* Subtitle - Toujours affiché avec le texte par défaut pendant le chargement */}
          <p className="text-xl sm:text-2xl md:text-3xl mb-4 text-primary-100 font-light max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: loading ? '0s' : '0.1s' }}>
            {loading ? defaultDescription : (agency?.description || defaultDescription)}
          </p>
          {!loading && (
            <>
              {agency?.hero_subtitle ? (
                <p className="text-lg sm:text-xl mb-12 text-primary-200 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {agency.hero_subtitle}
                </p>
              ) : (
                <p className="text-lg sm:text-xl mb-12 text-primary-200 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  Transformez votre rêve d'études à l'étranger en réalité avec notre accompagnement expert
                </p>
              )}
            </>
          )}
          {loading && (
            <div className="flex justify-center items-center space-x-2 mb-12">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}

          {/* CTA Buttons */}
          {!loading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register">
              <button 
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 
                           px-8 py-4 text-base
                           bg-white text-primary-700 hover:bg-neutral-50 
                           shadow-2xl hover:shadow-glow-lg transform hover:scale-105 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                           whitespace-nowrap border-0"
              >
                Préinscription maintenant
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
                Voir les témoignages
              </button>
            </Link>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
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
                gradient: 'from-success-500 to-success-600',
                delay: '0.3s'
              },
              { 
                icon: FiUsers, 
                title: 'Communauté', 
                desc: 'Rejoignez une communauté d\'étudiants satisfaits et épanouis',
                gradient: 'from-primary-500 to-accent-600',
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
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
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
              { step: '1', title: 'Inscription', desc: 'Créez votre compte et remplissez votre profil en quelques minutes', icon: FiFileText, gradient: 'from-primary-500 to-accent-600', badgeGradient: 'from-primary-500 to-primary-600' },
              { step: '2', title: 'Préinscription', desc: 'Sélectionnez votre pays de destination et complétez votre dossier', icon: FiGlobe, gradient: 'from-accent-500 to-primary-600', badgeGradient: 'from-accent-500 to-accent-600' },
              { step: '3', title: 'Documents', desc: 'Uploadez vos documents nécessaires de manière sécurisée', icon: FiFileText, gradient: 'from-success-500 to-success-600', badgeGradient: 'from-success-500 to-success-600' },
              { step: '4', title: 'Validation', desc: 'Notre équipe valide votre dossier et vous accompagne jusqu\'au bout', icon: FiCheckCircle, gradient: 'from-primary-500 to-accent-600', badgeGradient: 'from-primary-500 to-primary-600' },
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
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
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
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
        </div>

        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <Badge variant="neutral" size="lg" className="mb-6 bg-white/20 text-white border-white/30">
              Nos réalisations
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Des chiffres qui parlent
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Une communauté qui grandit chaque jour grâce à votre confiance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FiUsers, number: clientsCount > 0 ? `${clientsCount}+` : '0+', label: 'Étudiants accompagnés' },
              { icon: FiGlobe, number: countries.length || '15+', label: 'Pays disponibles' },
              { icon: FiTrendingUp, number: '95%', label: 'Taux de réussite' },
              { icon: FiStar, number: reviews.length > 0 ? `${reviews.length}+` : '50+', label: 'Avis clients' },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index} 
                  className="p-8 text-center bg-white/15 backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-2xl animate-slide-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-white/50 shadow-lg">
                    <Icon className="text-4xl text-white" />
                  </div>
                  <div className="text-5xl lg:text-6xl font-bold mb-3 text-white">
                    {stat.number}
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
        <section className="py-24 bg-gradient-to-b from-white via-neutral-50 to-white">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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

      {/* Agency Info - Enhanced */}
      {agency && (
        <section className="py-24 bg-white">
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
                { icon: FiMapPin, label: 'Adresse', value: agency.address, gradient: 'from-primary-500 to-accent-600' },
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
                        <div className={`absolute inset-0 bg-gradient-to-br ${contact.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
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
                        <div className={`absolute inset-0 bg-gradient-to-br ${contact.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
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
        <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
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
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
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
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse-slow"></div>
        </div>

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
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white p-8 rounded-t-3xl z-10">
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
                <Link to="/register" className="sm:order-1">
                  <Button variant="primary" fullWidth className="sm:w-auto" icon={FiArrowRight} iconPosition="right">
                    Faire une préinscription
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default Home
