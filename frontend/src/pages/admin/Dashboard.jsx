import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import api from '../../services/api'
import { FiUsers, FiFileText, FiMessageSquare, FiStar, FiArrowRight, FiClock, FiCheckCircle, FiGlobe, FiUpload, FiBriefcase, FiHome, FiSettings, FiBell } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    inscriptions: 0,
    pending: 0,
    reviews: 0,
    workPermitApplications: 0,
    residenceApplications: 0,
    documents: 0,
    pendingDocuments: 0,
  })
  const [chartData, setChartData] = useState({
    countriesCount: 0,
    newsCount: 0,
    workPermitCountriesCount: 0,
    inscriptionsByCountry: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [usersRes, inscriptionsRes, reviewsRes, workPermitRes, residenceRes, documentsRes, countriesRes, newsRes, workPermitCountriesRes] = await Promise.all([
        api.get('/users'),
        api.get('/inscriptions'),
        api.get('/reviews/all'),
        api.get('/work-permit-applications').catch(() => ({ data: [] })),
        api.get('/residence-applications').catch(() => ({ data: [] })),
        api.get('/documents').catch(() => ({ data: [] })),
        api.get('/countries/all?all=true').catch(() => ({ data: [] })),
        api.get('/news?all=true').catch(() => ({ data: [] })),
        api.get('/work-permit-countries').catch(() => ({ data: [] })),
      ])
      const inscriptions = inscriptionsRes.data || []
      const documents = documentsRes.data || []
      const reviews = reviewsRes.data || []
      const countries = countriesRes.data || []
      const news = newsRes.data || []
      const workPermitCountries = workPermitCountriesRes.data || []
      
      // Calculer les préinscriptions par pays avec le nombre de clients uniques
      const countryStats = {}
      inscriptions.forEach((inscription) => {
        const countryId = inscription.country?.id || inscription.country_id
        const countryName = inscription.country?.name || 'Pays inconnu'
        
        if (countryId) {
          if (!countryStats[countryId]) {
            countryStats[countryId] = {
              name: countryName,
              totalInscriptions: 0,
              uniqueClients: new Set(),
            }
          }
          
          countryStats[countryId].totalInscriptions++
          if (inscription.user_id) {
            countryStats[countryId].uniqueClients.add(inscription.user_id)
          }
        }
      })
      
      // Convertir en tableau et trier par nombre de clients (décroissant)
      const inscriptionsByCountry = Object.values(countryStats)
        .map((stat) => ({
          name: stat.name,
          clients: stat.uniqueClients.size,
          inscriptions: stat.totalInscriptions,
        }))
        .sort((a, b) => b.clients - a.clients)
        .slice(0, 10) // Garder les 10 pays les plus demandés
      
      setStats({
        users: usersRes.data.length,
        inscriptions: inscriptions.length,
        pending: inscriptions.filter((i) => i.status === 'pending').length,
        reviews: reviews.length,
        workPermitApplications: workPermitRes.data?.length || 0,
        residenceApplications: residenceRes.data?.length || 0,
        documents: documents.length,
        pendingDocuments: documents.filter((d) => d.status === 'pending').length,
      })
      
      setChartData({
        countriesCount: countries.length,
        newsCount: news.length,
        workPermitCountriesCount: workPermitCountries.length,
        inscriptionsByCountry,
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
      title: 'Permis de travail',
      value: stats.workPermitApplications,
      icon: FiBriefcase,
      color: 'primary',
      link: '/admin/work-permit-applications',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Résidence Canada',
      value: stats.residenceApplications,
      icon: FiHome,
      color: 'success',
      link: '/admin/residence-applications',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: FiUpload,
      color: 'accent',
      link: '/admin/documents',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Documents en attente',
      value: stats.pendingDocuments,
      icon: FiClock,
      color: 'warning',
      link: '/admin/documents?status=pending',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Avis',
      value: stats.reviews,
      icon: FiStar,
      color: 'success',
      link: '/admin/reviews',
      gradient: 'from-amber-500 to-amber-600',
    },
  ]

  const quickActions = [
    {
      title: 'Gérer les pays',
      description: 'Configurer les pays disponibles sur la page d\'accueil',
      link: '/admin/countries',
      icon: FiGlobe,
      color: 'success',
    },
    {
      title: 'Pays permis de travail',
      description: 'Configurer les pays pour permis de travail',
      link: '/admin/work-permit-countries',
      icon: FiGlobe,
      color: 'indigo',
    },
    {
      title: 'Gérer les actualités',
      description: 'Créer et modifier les actualités',
      link: '/admin/news',
      icon: FiMessageSquare,
      color: 'warning',
    },
    {
      title: 'Gérer les avis',
      description: 'Modérer les avis des clients',
      link: '/admin/reviews',
      icon: FiStar,
      color: 'amber',
    },
  ]
  
  const chartColors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    indigo: '#6366f1',
  }
  
  const barChartData = [
    { name: 'Pays', value: chartData.countriesCount, color: chartColors.success },
    { name: 'Pays permis', value: chartData.workPermitCountriesCount, color: chartColors.indigo },
    { name: 'Actualités', value: chartData.newsCount, color: chartColors.warning },
    { name: 'Avis', value: stats.reviews, color: chartColors.primary },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 lg:mb-12">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Link
                  key={index}
                  to={stat.link}
                  className="group"
                >
                  <Card hover className="p-3 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-${stat.color}-500/25 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {stat.link && (
                        <FiArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-600 mb-0.5">{stat.title}</p>
                      <p className="text-xl lg:text-2xl font-bold text-neutral-900">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="group"
                  >
                    <Card interactive className="p-6 h-full animate-slide-up" style={{ animationDelay: `${(index + 4) * 50}ms` }}>
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                        action.color === 'primary' ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/25' :
                        action.color === 'accent' ? 'bg-gradient-to-br from-accent-500 to-accent-600 shadow-accent-500/25' :
                        action.color === 'success' ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-500/25' :
                        action.color === 'warning' ? 'bg-gradient-to-br from-warning-500 to-warning-600 shadow-warning-500/25' :
                        action.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25' :
                        action.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' :
                        action.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25' :
                        action.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/25' :
                        action.color === 'pink' ? 'bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-500/25' :
                        action.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25' :
                        action.color === 'gray' ? 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/25' :
                        'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/25'
                      }`}>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Préinscriptions par pays */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Pays les plus demandés</h3>
              {chartData.inscriptionsByCountry.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData.inscriptionsByCountry}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'clients') return [`${value} client${value > 1 ? 's' : ''}`, 'Clients']
                        if (name === 'inscriptions') return [`${value} préinscription${value > 1 ? 's' : ''}`, 'Préinscriptions']
                        return value
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'clients') return 'Nombre de clients'
                        if (value === 'inscriptions') return 'Nombre de préinscriptions'
                        return value
                      }}
                    />
                    <Bar dataKey="clients" fill={chartColors.primary} radius={[0, 8, 8, 0]} name="clients" />
                    <Bar dataKey="inscriptions" fill={chartColors.success} radius={[0, 8, 8, 0]} name="inscriptions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-neutral-500">
                  <p>Aucune préinscription disponible</p>
                </div>
              )}
            </Card>

            {/* Bar Chart for Countries, News, Reviews */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Vue d'ensemble</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={chartColors.primary} radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
