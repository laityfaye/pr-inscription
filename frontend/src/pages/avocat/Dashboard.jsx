import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import api from '../../services/api'
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiUsers } from 'react-icons/fi'

const AvocatDashboard = () => {
  const [stats, setStats] = useState({
    appointments: 0,
    pendingAppointments: 0,
    validatedAppointments: 0,
    rejectedAppointments: 0,
    completedAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const appointmentsRes = await api.get('/appointments').catch(() => ({ data: [] }))
      const appointments = appointmentsRes.data || []
      
      setStats({
        appointments: appointments.length,
        pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
        validatedAppointments: appointments.filter((a) => a.status === 'validated').length,
        rejectedAppointments: appointments.filter((a) => a.status === 'rejected').length,
        completedAppointments: appointments.filter((a) => a.status === 'completed').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Rendez-vous',
      value: stats.appointments,
      icon: FiCalendar,
      color: 'primary',
      link: '/avocat/appointments',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Rendez-vous en attente',
      value: stats.pendingAppointments,
      icon: FiClock,
      color: 'warning',
      link: '/avocat/appointments?status=pending',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Rendez-vous validés',
      value: stats.validatedAppointments,
      icon: FiCheckCircle,
      color: 'success',
      link: '/avocat/appointments?status=validated',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Rendez-vous terminés',
      value: stats.completedAppointments,
      icon: FiTrendingUp,
      color: 'success',
      link: '/avocat/appointments?status=completed',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  const quickActions = [
    {
      title: 'Gérer les rendez-vous',
      description: 'Voir et consulter tous les rendez-vous',
      link: '/avocat/appointments',
      icon: FiCalendar,
      color: 'indigo',
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
              Vue d'ensemble des rendez-vous
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
                      <svg className="w-3 h-3 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/25`}>
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
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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

export default AvocatDashboard

