import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgency } from '../contexts/AgencyContext'
import { getLogoUrl } from '../utils/imageUrl'
import { 
  FiUser, 
  FiLogOut, 
  FiHome, 
  FiMessageSquare, 
  FiSettings, 
  FiMenu, 
  FiX, 
  FiChevronDown, 
  FiBell,
  FiSearch,
  FiStar 
} from 'react-icons/fi'
import Button from './ui/Button'
import Badge from './ui/Badge'
import api from '../services/api'

// Fonction pour extraire les initiales du nom de l'agence
const getAgencyInitials = (name) => {
  if (!name) return 'TFKS'
  
  // Si le nom contient déjà une abréviation en majuscules au début (ex: "TFKS Touba Fall...")
  const words = name.trim().split(/\s+/)
  const firstWord = words[0]
  
  // Si le premier mot est en majuscules et fait 2-5 caractères, c'est probablement une abréviation
  if (firstWord === firstWord.toUpperCase() && firstWord.length >= 2 && firstWord.length <= 5 && /^[A-Z]+$/.test(firstWord)) {
    return firstWord
  }
  
  // Sinon, extraire la première lettre de chaque mot
  return words
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4) // Limiter à 4 caractères max
}

const Navbar = ({ variant = 'full', unreadCount: externalUnreadCount = null }) => {
  const { user, logout } = useAuth()
  const { agency, loading: agencyLoading } = useAgency()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const userMenuRef = useRef(null)
  const isCompact = variant === 'compact'
  
  const agencyInitials = getAgencyInitials(agency?.name)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  useEffect(() => {
    // Si unreadCount est passé en prop, l'utiliser
    if (externalUnreadCount !== null) {
      setUnreadCount(externalUnreadCount)
      return
    }

    // Sinon, récupérer le nombre de messages non lus
    const fetchUnreadCount = async () => {
      if (!user) return
      
      try {
        const response = await api.get('/messages/unread/count')
        setUnreadCount(response.data.count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    if (user) {
      // Charger immédiatement
      fetchUnreadCount()
      
      // Mettre à jour toutes les 30 secondes
      const interval = setInterval(fetchUnreadCount, 30000)
      
      return () => clearInterval(interval)
    } else {
      setUnreadCount(0)
    }
  }, [user, externalUnreadCount])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path
  const isHomePage = location.pathname === '/'

  const navLinks = [
    { to: '/', label: 'Accueil', icon: FiHome },
    { to: '/reviews', label: 'Avis', icon: null },
  ]

  return (
    <nav className={`sticky top-0 z-50 glass-strong border-b border-neutral-200/80 shadow-sm backdrop-blur-xl w-full ${isCompact ? 'bg-white' : ''}`}>
      <div className={`w-full ${isCompact ? 'px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6 lg:px-8'}`}>
        <div className={`flex justify-between items-center ${isCompact ? 'h-14' : 'h-16 lg:h-20'}`}>
          {/* Logo - Masqué en mode compact (déjà dans le Sidebar) */}
          {!isCompact && (
            <Link 
              to="/" 
              className="flex items-center group transition-all duration-300"
            >
              <div className="relative flex-shrink-0">
                {agency?.logo ? (
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden transform group-hover:scale-105 transition-all duration-300 shadow-lg bg-white">
                    <img 
                      src={getLogoUrl(agency.logo)} 
                      alt={agency.name || 'Logo'} 
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
<<<<<<< HEAD
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg">
                      <span className="text-white font-bold text-base sm:text-lg lg:text-xl">
                        TFKS 
                      </span>
                    </div>
                  </>
=======
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg">
                    <span className="text-white font-bold text-base sm:text-lg lg:text-xl">
                      SBC 
                    </span>
                  </div>
>>>>>>> 3a0395d1eb49ba2910224bbb5ceb189e441e3817
                )}
              </div>
              {/* Nom de l'agence - affiché sur toutes les pages */}
              <div className="hidden sm:block ml-3">
                <div className="text-base lg:text-lg font-bold gradient-text-static">
                  {agencyLoading ? (
                    <span className="inline-block w-32 h-5 bg-neutral-200 rounded animate-pulse"></span>
                  ) : (
                    'TFKS'
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Titre de la page en mode compact */}
          {isCompact && (
            <div className="flex items-center space-x-4 flex-1">
              <h1 className="text-lg lg:text-xl font-bold text-neutral-900">
                {location.pathname === '/admin/dashboard' && 'Tableau de bord'}
                {location.pathname === '/admin/inscriptions' && 'Préinscriptions'}
                {location.pathname === '/admin/users' && 'Utilisateurs'}
                {location.pathname === '/admin/chat' && 'Messages'}
                {location.pathname === '/admin/countries' && 'Gestion des pays'}
                {location.pathname === '/admin/news' && 'Actualités'}
                {location.pathname === '/admin/reviews' && 'Modération des avis'}
                {location.pathname === '/admin/settings' && 'Paramètres'}
                {location.pathname === '/client/dashboard' && 'Tableau de bord'}
                {location.pathname === '/client/inscriptions' && 'Mes préinscriptions'}
                {location.pathname === '/client/documents' && 'Mes documents'}
                {location.pathname === '/client/chat' && 'Messages'}
                {location.pathname.startsWith('/client/review') && 'Laisser un avis'}
              </h1>
              
              {/* Liens Accueil et Avis pour l'admin et les clients en mode compact */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 ml-auto">
                  <Link
                    to="/"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive('/')
                        ? 'text-primary-700 bg-primary-50/80'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <FiHome className="w-4 h-4" />
                      <span>Accueil</span>
                    </div>
                  </Link>
                  <Link
                    to="/reviews"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive('/reviews')
                        ? 'text-primary-700 bg-primary-50/80'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <FiStar className="w-4 h-4" />
                      <span>Avis</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Desktop Navigation - Masqué en mode compact (navigation dans le Sidebar) */}
          {!isCompact && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      active
                        ? 'text-primary-700 bg-primary-50/80'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }`}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-primary-50 rounded-xl"></div>
                    )}
                    <div className="relative flex items-center space-x-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{link.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Notification Bell - Toujours visible */}
                <Link
                  to={user.role === 'admin' ? '/admin/chat' : '/client/chat'}
                  className="relative p-2.5 rounded-xl hover:bg-neutral-100 transition-all duration-200 group"
                  title="Messages"
                >
                  <FiBell className="w-5 h-5 text-neutral-700 group-hover:text-primary-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Menu utilisateur - Masqué en mode compact (déjà dans le Sidebar) */}
                {!isCompact && (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-neutral-100 transition-all duration-200 group"
                    >
                      <div className="relative">
                        <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-800 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900">{user.name}</span>
                      <FiChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 py-2 animate-slide-down z-50 backdrop-blur-xl">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        {user.role === 'admin' ? (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group"
                            >
                              <FiSettings className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Tableau de bord</span>
                            </Link>
                            <Link
                              to="/admin/chat"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group relative"
                            >
                              <FiMessageSquare className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Messages</span>
                              {unreadCount > 0 && (
                                <Badge variant="error" size="sm" className="ml-auto">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                              )}
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/client/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group"
                            >
                              <FiUser className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Mon espace</span>
                            </Link>
                            <Link
                              to="/client/chat"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group relative"
                            >
                              <FiBell className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Messages</span>
                              {unreadCount > 0 && (
                                <Badge variant="error" size="sm" className="ml-auto">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                              )}
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-neutral-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-error-50 hover:to-transparent transition-all duration-200 text-error-600 group"
                      >
                        <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold">Déconnexion</span>
                      </button>
                    </div>
                  )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn btn-ghost btn-md">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary btn-md">
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors duration-200"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6 text-neutral-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-neutral-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-slide-down bg-white/95 backdrop-blur-xl">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-semibold">{link.label}</span>
                  </Link>
                )
              })}
              
              {user ? (
                <>
                  <div className="border-t border-neutral-200 my-2"></div>
                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <FiSettings className="w-5 h-5" />
                        <span className="font-semibold">Tableau de bord</span>
                      </Link>
                      <Link
                        to="/admin/chat"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors relative"
                      >
                        <FiBell className="w-5 h-5" />
                        <span className="font-semibold">Messages</span>
                        {unreadCount > 0 && (
                          <Badge variant="error" size="sm" className="ml-auto">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/client/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <FiUser className="w-5 h-5" />
                        <span className="font-semibold">Mon espace</span>
                      </Link>
                      <Link
                        to="/client/chat"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors relative"
                      >
                        <FiBell className="w-5 h-5" />
                        <span className="font-semibold">Messages</span>
                        {unreadCount > 0 && (
                          <Badge variant="error" size="sm" className="ml-auto">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-error-50 text-error-600 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-semibold">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-neutral-200 my-2"></div>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-neutral-100 text-center font-semibold transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
