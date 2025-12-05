import { Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiFileText, 
  FiUpload, 
  FiMessageSquare, 
  FiStar,
  FiSettings,
  FiUsers,
  FiGlobe,
  FiFile,
  FiBell,
  FiLogOut,
  FiBriefcase,
  FiCalendar
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useAgency } from '../contexts/AgencyContext'
import { getLogoUrl } from '../utils/imageUrl'
import Badge from './ui/Badge'

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

const Sidebar = ({ unreadCount = 0 }) => {
  const { user, logout, loading: authLoading } = useAuth()
  const { agency, loading: agencyLoading } = useAgency()
  const location = useLocation()

  // Afficher un loader pendant le chargement
  if (authLoading || !user) {
    return (
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </aside>
    )
  }

  const isActive = (path) => location.pathname === path
  
  const agencyInitials = getAgencyInitials(agency?.name)

  // Pages où le sidebar doit être fixe
  const fixedPages = ['/admin/users', '/admin/chat', '/admin/news', '/client/chat']
  const isFixed = fixedPages.includes(location.pathname)

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: FiHome },
    { to: '/admin/inscriptions', label: 'Préinscriptions', icon: FiFileText },
    // { to: '/admin/appointments', label: 'Rendez-vous', icon: FiCalendar },
    { to: '/admin/work-permit-applications', label: 'Permis de travail', icon: FiBriefcase },
    { to: '/admin/residence-applications', label: 'Résidence Canada', icon: FiHome },
    { to: '/admin/users', label: 'Utilisateurs', icon: FiUsers },
    { to: '/admin/documents', label: 'Documents', icon: FiUpload },
    { to: '/admin/chat', label: 'Messages', icon: FiBell, badge: unreadCount },
    { to: '/admin/countries', label: 'Pays', icon: FiGlobe },
    { to: '/admin/work-permit-countries', label: 'Pays permis', icon: FiBriefcase },
    { to: '/admin/news', label: 'Actualités', icon: FiMessageSquare },
    { to: '/admin/settings', label: 'Paramètres', icon: FiSettings },
  ]

  const clientLinks = [
    { to: '/client/dashboard', label: 'Tableau de bord', icon: FiHome },
    { to: '/client/inscriptions', label: 'Mes préinscriptions', icon: FiFileText },
    { to: '/client/work-permit-applications', label: 'Permis de travail', icon: FiBriefcase },
    { to: '/client/residence-applications', label: 'Résidence Canada', icon: FiHome },
    { to: '/client/documents', label: 'Mes documents', icon: FiUpload },
    { to: '/client/chat', label: 'Messages', icon: FiBell, badge: unreadCount },
    { to: '/client/review/add', label: 'Laisser un avis', icon: FiStar },
  ]

  const links = user?.role === 'admin' ? adminLinks : clientLinks

  return (
    <aside className={`hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-screen ${
      isFixed ? 'fixed top-0 left-0 z-40' : 'sticky top-0'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} className="flex items-center space-x-3 group">
          <div className="relative">
            {agency?.logo ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 rounded-full overflow-hidden transform group-hover:scale-105 transition-all duration-300 shadow-lg bg-white">
                  <img 
                    src={getLogoUrl(agency.logo)} 
                    alt={agency.name || 'Logo'} 
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <span className="text-white font-bold text-base">
                    {agencyInitials}
                  </span>
                </div>
              </>
            )}
          </div>
          <div>
            <div className="text-base font-bold gradient-text-static">
              {agencyInitials + ' Groupe'}
            </div>
            <div className="text-[10px] text-neutral-500 font-medium">Dashboard</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.to)
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-600 to-accent-600 rounded-r-full"></div>
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'text-primary-600' : 'text-neutral-500 group-hover:text-primary-600'}`} />
              <span className="flex-1">{link.label}</span>
              {link.badge && link.badge > 0 && (
                <Badge variant="error" size="sm">
                  {link.badge > 9 ? '9+' : link.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-neutral-50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-800 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-error-600 hover:bg-error-50 transition-colors duration-200 font-semibold text-sm"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

