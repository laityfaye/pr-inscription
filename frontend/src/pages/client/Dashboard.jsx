import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { FiFileText, FiMessageSquare, FiUpload, FiCheckCircle, FiClock, FiXCircle, FiStar, FiArrowRight, FiBriefcase, FiHome, FiBook } from 'react-icons/fi'

const ClientDashboard = () => {
  const { user } = useAuth()
  const [inscriptions, setInscriptions] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, validated: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/inscriptions')
      const data = response.data
      setInscriptions(data)
      setStats({
        total: data.length,
        pending: data.filter((i) => i.status === 'pending').length,
        validated: data.filter((i) => i.status === 'validated').length,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <FiCheckCircle className="text-green-500" />
      case 'rejected':
        return <FiXCircle className="text-red-500" />
      case 'in_progress':
        return <FiClock className="text-yellow-500" />
      default:
        return <FiClock className="text-gray-500" />
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      validated: 'Validée',
      rejected: 'Rejetée',
    }
    return labels[status] || status
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-10 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bienvenue, {user?.name} ! 👋
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Gérez vos préinscriptions et suivez votre progression
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <Card hover className="p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total préinscriptions</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FiFileText className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
          </Card>
          <Card hover className="p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">En attente</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FiClock className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
          </Card>
          <Card hover className="p-4 sm:p-6 animate-slide-up sm:col-span-2 md:col-span-1" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Validées</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.validated}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FiCheckCircle className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <Link to="/client/inscriptions">
            <Card hover className="p-4 sm:p-6 lg:p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <FiFileText className="text-2xl sm:text-3xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-900">Mes préinscriptions</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Gérer vos préinscriptions</p>
              <div className="flex items-center text-primary-600 font-medium text-sm sm:text-base">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/work-permit-applications">
            <Card hover className="p-8 animate-slide-up" style={{ animationDelay: '0.45s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiBriefcase className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Demandes de visa</h3>
              <p className="text-gray-600 mb-4">Gérer vos demandes de visa</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/residence-applications">
            <Card hover className="p-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiHome className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Résidence Canada</h3>
              <p className="text-gray-600 mb-4">Demande de résidence</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/study-permit-renewal-applications">
            <Card hover className="p-8 animate-slide-up" style={{ animationDelay: '0.55s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiBook className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">CAQ/Permis d'études</h3>
              <p className="text-gray-600 mb-4">Renouvellement</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/documents">
            <Card hover className="p-8 animate-slide-up" style={{ animationDelay: '0.55s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiUpload className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Mes documents</h3>
              <p className="text-gray-600 mb-4">Uploader vos documents</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/chat">
            <Card hover className="p-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiMessageSquare className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Messages</h3>
              <p className="text-gray-600 mb-4">Contacter l'administrateur</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Accéder</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
          <Link to="/client/review/add">
            <Card hover className="p-8 animate-slide-up bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200" style={{ animationDelay: '0.65s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiStar className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Laisser un avis</h3>
              <p className="text-gray-600 mb-4">Partagez votre expérience</p>
              <div className="flex items-center text-primary-600 font-medium">
                <span>Ajouter</span>
                <FiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Add Review Button if validated and notified */}
        {inscriptions.some((i) => i.status === 'validated' && i.client_notified_at) && (
          <Card className="p-6 mb-10 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">🎉 Félicitations !</h3>
                <p className="text-green-800">Votre préinscription a été validée. Partagez votre expérience avec la communauté !</p>
              </div>
              <Link
                to="/client/review/add"
                className="btn btn-primary bg-green-600 hover:bg-green-700 whitespace-nowrap"
              >
                <FiStar className="mr-2" />
                Ajouter un avis
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Inscriptions */}
        <Card className="overflow-hidden animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mes préinscriptions récentes</h2>
          </div>
          <div className="p-4 sm:p-6">
            {inscriptions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FiFileText className="mx-auto text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Aucune préinscription pour le moment</p>
                <Link to="/client/inscriptions" className="text-sm sm:text-base text-primary-600 font-semibold hover:text-primary-700">
                  Créer une préinscription →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {inscriptions.slice(0, 5).map((inscription) => (
                  <div
                    key={inscription.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        {getStatusIcon(inscription.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{inscription.country?.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {getStatusLabel(inscription.status)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium flex-shrink-0">
                      {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default ClientDashboard

