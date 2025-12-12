import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { 
  FiClock, 
  FiCalendar, 
  FiEye, 
  FiX, 
  FiSearch, 
  FiFilter,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiMail,
  FiPhone,
  FiDollarSign,
  FiDownload,
  FiAlertCircle
} from 'react-icons/fi'
import { getImageUrl } from '../../utils/imageUrl'

const AvocatAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Débounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Charger les données
  useEffect(() => {
    fetchAppointments()
  }, [debouncedSearchQuery, filterStatus, filterDate])

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)
      if (filterStatus) params.append('status', filterStatus)
      if (filterDate) params.append('date', filterDate)

      const url = `/appointments${params.toString() ? '?' + params.toString() : ''}`
      const response = await api.get(url)
      const appointmentsData = response.data || []
      
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Erreur lors du chargement des rendez-vous')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'warning' },
      validated: { label: 'Validé', variant: 'success' },
      rejected: { label: 'Rejeté', variant: 'error' },
      completed: { label: 'Terminé', variant: 'primary' },
    }
    const config = statusConfig[status] || { label: status, variant: 'neutral' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus && appointment.status !== filterStatus) return false
    if (filterDate && appointment.date !== filterDate) return false
    return true
  })

  // Statistiques
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    validated: appointments.filter(a => a.status === 'validated').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <Layout>
      <div className="section-container py-6 sm:py-8 lg:py-12">
        {/* Header avec statistiques */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Consultation des rendez-vous
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Consultez tous les rendez-vous clients
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 mb-1">{stats.total}</div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Total</div>
            </Card>
            
            <Card className="p-4 sm:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-700 mb-1">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-yellow-600 font-medium">En attente</div>
            </Card>

            <Card className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-1">{stats.validated}</div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">Validés</div>
            </Card>

            <Card className="p-4 sm:p-5 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <FiXCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-700 mb-1">{stats.rejected}</div>
              <div className="text-xs sm:text-sm text-red-600 font-medium">Rejetés</div>
            </Card>

            <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 mb-1">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">Terminés</div>
            </Card>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          {!showFilters && (
            <div className="flex items-center justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(true)}
                icon={FiFilter}
                className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 hover:border-primary-300"
              >
                <span className="flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  <span>Afficher les filtres</span>
                  {(searchQuery || filterStatus || filterDate) && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                      {[searchQuery && 'Recherche', filterStatus && 'Statut', filterDate && 'Date'].filter(Boolean).length}
                    </span>
                  )}
                </span>
              </Button>
            </div>
          )}

          {showFilters && (
            <Card padding="lg" className="bg-gradient-to-br from-white to-neutral-50/50 border-2 border-primary-200 shadow-lg animate-slide-up">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
                    <FiFilter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">Filtres et recherche</h3>
                    <p className="text-xs text-neutral-500">Affinez votre recherche</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(searchQuery || filterStatus || filterDate) && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      {[searchQuery && 'Recherche', filterStatus && 'Statut', filterDate && 'Date'].filter(Boolean).length} filtre(s) actif(s)
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    icon={FiX}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Input
                    type="text"
                    label="Rechercher"
                    placeholder="Nom, email, téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={FiSearch}
                    className="w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-neutral-500" />
                    Statut
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="validated">Validé</option>
                    <option value="rejected">Rejeté</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-neutral-500" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterStatus('')
                      setFilterDate('')
                    }}
                    className="flex-1 sm:flex-initial"
                    icon={FiX}
                  >
                    Réinitialiser tous les filtres
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Vue Liste */}
        <Card padding="lg" className="bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Liste des rendez-vous ({filteredAppointments.length})
            </h3>
          </div>

          {/* Vue Desktop - Tableau */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200 bg-neutral-50/50">
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900 text-sm">Client</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900 text-sm">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900 text-sm">Heure</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900 text-sm">Statut</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900 text-sm">Montant</th>
                  <th className="text-right py-4 px-4 font-semibold text-neutral-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <FiCalendar className="w-12 h-12 text-neutral-300" />
                        <p className="text-neutral-500 font-medium">Aucun rendez-vous trouvé</p>
                        <p className="text-sm text-neutral-400">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment, index) => (
                    <tr 
                      key={appointment.id} 
                      className="border-b border-neutral-100 hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-transparent transition-all duration-200"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {appointment.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 mb-0.5">
                              {appointment.name}
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1">
                              <FiMail className="w-3 h-3" />
                              {appointment.email}
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                              <FiPhone className="w-3 h-3" />
                              {appointment.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-primary-500" />
                          <span className="text-sm text-neutral-700">
                            {new Date(appointment.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-accent-500" />
                          <span className="text-sm font-medium text-neutral-700">{appointment.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(appointment.status)}</td>
                      <td className="py-4 px-4">
                        {appointment.amount ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-semibold text-sm">
                            <FiDollarSign className="w-4 h-4" />
                            {Number(appointment.amount).toLocaleString('fr-FR')} FCFA
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowDetailsModal(true)
                            }}
                            icon={FiEye}
                            className="hover:bg-primary-50 hover:text-primary-600"
                          >
                            <span className="hidden xl:inline">Voir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Vue Mobile - Cards */}
          <div className="lg:hidden space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 font-medium">Aucun rendez-vous trouvé</p>
                <p className="text-sm text-neutral-400 mt-1">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="p-4 hover:shadow-md transition-all border-l-4 border-l-primary-500"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setShowDetailsModal(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {appointment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 mb-1 truncate">{appointment.name}</h4>
                        <div className="text-xs text-neutral-500 flex items-center gap-1 mb-0.5">
                          <FiMail className="w-3 h-3" />
                          <span className="truncate">{appointment.email}</span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1">
                          <FiPhone className="w-3 h-3" />
                          {appointment.phone}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-primary-500" />
                      <span className="text-xs text-neutral-600">
                        {new Date(appointment.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-accent-500" />
                      <span className="text-xs font-medium text-neutral-700">{appointment.time}</span>
                    </div>
                    {appointment.amount && (
                      <div className="col-span-2 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-700">
                          {Number(appointment.amount).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Modal de détails */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-neutral-200">
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Détails du rendez-vous</h2>
                    <p className="text-white/90 text-sm">Informations complètes du rendez-vous</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-5">
                  {/* Informations client */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-white" />
                      </div>
                      Informations client
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <span className="font-semibold text-neutral-700 min-w-[80px]">Nom :</span>
                        <span className="text-neutral-900">{selectedAppointment.name}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <FiMail className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-neutral-700 min-w-[80px]">Email :</span>
                        <span className="text-neutral-900 break-all">{selectedAppointment.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <FiPhone className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-neutral-700 min-w-[80px]">Téléphone :</span>
                        <span className="text-neutral-900">{selectedAppointment.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Détails du rendez-vous */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 p-5 rounded-xl border border-primary-200">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <FiCalendar className="w-4 h-4 text-white" />
                      </div>
                      Détails du rendez-vous
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <FiCalendar className="w-4 h-4 text-primary-500" />
                        <div>
                          <span className="text-xs text-neutral-500 block">Date</span>
                          <span className="font-semibold text-neutral-900">
                            {new Date(selectedAppointment.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <FiClock className="w-4 h-4 text-accent-500" />
                        <div>
                          <span className="text-xs text-neutral-500 block">Heure</span>
                          <span className="font-semibold text-neutral-900">{selectedAppointment.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <div>
                          <span className="text-xs text-neutral-500 block">Statut</span>
                          <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                        </div>
                      </div>
                      {selectedAppointment.amount && (
                        <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                          <FiDollarSign className="w-4 h-4 text-green-500" />
                          <div>
                            <span className="text-xs text-neutral-500 block">Montant</span>
                            <span className="font-bold text-green-700 text-lg">
                              {Number(selectedAppointment.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedAppointment.message && (
                    <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/30 p-5 rounded-xl border border-neutral-200">
                      <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-500 flex items-center justify-center">
                          <FiAlertCircle className="w-4 h-4 text-white" />
                        </div>
                        Message
                      </h3>
                      <div className="bg-white/60 p-4 rounded-lg">
                        <p className="text-neutral-700 leading-relaxed">{selectedAppointment.message}</p>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.payment_proof && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100/30 p-5 rounded-xl border border-green-200">
                      <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                          <FiDownload className="w-4 h-4 text-white" />
                        </div>
                        Preuve de paiement
                      </h3>
                      <div className="bg-white/60 p-4 rounded-lg">
                        <a
                          href={getImageUrl(selectedAppointment.payment_proof)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          <FiDownload className="w-4 h-4" />
                          Télécharger la preuve de paiement
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AvocatAppointments

