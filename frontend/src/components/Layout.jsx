import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useState, useEffect } from 'react'
import api from '../services/api'

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // Détecter automatiquement si on doit afficher le Sidebar
  const isAdminPage = location.pathname.startsWith('/admin')
  const isClientPage = location.pathname.startsWith('/client')
  const shouldShowSidebar = showSidebar || (user && (isAdminPage || isClientPage))

  useEffect(() => {
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
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    } else {
      setUnreadCount(0)
    }
  }, [user])

  if (shouldShowSidebar) {
    // Pages où le sidebar est fixe
    const fixedPages = ['/admin/users', '/admin/chat', '/admin/news', '/client/chat']
    const isFixed = fixedPages.includes(location.pathname)
    
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        {/* Sidebar - visible sur desktop, masqué sur mobile */}
        {user && <Sidebar unreadCount={unreadCount} />}
        
        {/* Contenu principal */}
        <div className={`flex-1 flex flex-col min-w-0 ${isFixed ? 'lg:ml-64' : 'lg:ml-0'}`}>
          {/* Navbar simplifiée pour les pages avec Sidebar */}
          <Navbar variant="compact" unreadCount={unreadCount} />
          
          {/* Contenu de la page */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Layout standard pour les pages publiques
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 flex flex-col">
      <Navbar variant="full" unreadCount={unreadCount} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

