import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import api from '../../services/api'
import { FiUsers, FiFileText, FiMessageSquare, FiStar, FiArrowRight, FiClock, FiCheckCircle, FiGlobe } from 'react-icons/fi'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    inscriptions: 0,
    pending: 0,
    reviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [usersRes, inscriptionsRes, reviewsRes] = await Promise.all([
        api.get('/users'),
        api.get('/inscriptions'),
        api.get('/reviews?all=true'),
      ])
      const inscriptions = inscriptionsRes.data
      setStats({
        users: usersRes.data.length,
        inscriptions: inscriptions.length,
        pending: inscriptions.filter((i) => i.status === 'pending').length,
        reviews: reviewsRes.data.length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Clients',
      value: stats.users,
      icon: FiUsers,
      color: 'primary',
      link: '/admin/users',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Préinscriptions',
      value: stats.inscriptions,
      icon: FiFileText,
      color: 'accent',
      link: '/admin/inscriptions',
      gradient: 'from-accent-500 to-accent-600',
    },
    {
      title: 'En attente',
      value: stats.pending,
      icon: FiClock,
      color: 'warning',
      link: '/admin/inscriptions?status=pending',
      gradient: 'from-warning-500 to-warning-600',
    },
    {
      title: 'Avis',
      value: stats.reviews,
      icon: FiStar,
      color: 'success',
      link: '/admin/reviews',
      gradient: 'from-success-500 to-success-600',
    },
  ]

  const quickActions = [
    {
      title: 'Gérer les clients',
      description: 'Voir et gérer tous les clients inscrits',
      link: '/admin/users',
      icon: FiUsers,
      color: 'primary',
    },
    {
      title: 'Gérer les préinscriptions',
      description: 'Valider ou rejeter les préinscriptions',
      link: '/admin/inscriptions',
      icon: FiFileText,
      color: 'accent',
    },
    {
      title: 'Gérer les pays',
      description: 'Configurer les pays disponibles sur la page d\'accueil',
      link: '/admin/countries',
      icon: FiGlobe,
      color: 'success',
    },
    {
      title: 'Gérer les actualités',
      description: 'Créer et modifier les actualités',
      link: '/admin/news',
      icon: FiMessageSquare,
      color: 'warning',
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-neutral-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              Tableau de bord
            </h1>
            <p className="text-lg text-neutral-600">
              Vue d'ensemble de votre plateforme
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 lg:mb-12">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Link
                  key={index}
                  to={stat.link}
                  className="group"
                >
                  <Card hover className="p-6 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-${stat.color}-500/25 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {stat.link && (
                        <FiArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-1">{stat.title}</p>
                      <p className="text-3xl lg:text-4xl font-bold text-neutral-900">
                        {stat.value}
                      </p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="group"
                  >
                    <Card interactive className="p-6 h-full animate-slide-up" style={{ animationDelay: `${(index + 4) * 50}ms` }}>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 flex items-center justify-center mb-4 shadow-lg shadow-${action.color}-500/25 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                        <span>Accéder</span>
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
