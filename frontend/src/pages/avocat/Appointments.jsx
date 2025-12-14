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
  FiAlertCircle,
  FiSettings,
  FiTrash2,
  FiSave,
  FiEdit,
  FiRefreshCw
} from 'react-icons/fi'
import { getImageUrl } from '../../utils/imageUrl'

const AvocatAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUnavailableDaysModal, setShowUnavailableDaysModal] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' ou 'calendar'
  const [calendarWeek, setCalendarWeek] = useState(0) // 0 = semaine en cours
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // États pour les jours indisponibles
  const [unavailableDays, setUnavailableDays] = useState([])
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = semaine en cours, 1 = semaine prochaine
  
  // États pour les prix des créneaux
  const [slotPrices, setSlotPrices] = useState({})
  const [editingPrice, setEditingPrice] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [newCurrency, setNewCurrency] = useState('FCFA')
  const [customCurrency, setCustomCurrency] = useState('')
  
  // États pour le report de rendez-vous
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleWeek, setRescheduleWeek] = useState(0) // 0 = semaine en cours
  
  // Créneaux horaires disponibles
  const availableHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '15:00', '16:00', '17:00', '18:00'
  ]

  // Débounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Générer les jours de la semaine pour le calendrier (du lundi au dimanche)
  const getCalendarWeekDays = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const currentDayOfWeek = today.getDay()
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const mondayOfCurrentWeek = new Date(today)
    mondayOfCurrentWeek.setDate(today.getDate() + daysToMonday)
    
    const startOfWeek = new Date(mondayOfCurrentWeek)
    startOfWeek.setDate(mondayOfCurrentWeek.getDate() + (calendarWeek * 7))
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
      const dayNumber = date.getDate()
      const month = date.toLocaleDateString('fr-FR', { month: 'short' })
      const dateString = date.toISOString().split('T')[0]
      const todayString = today.toISOString().split('T')[0]
      const isUnavailable = unavailableDays.includes(dateString)
      const isPast = date < today
      
      days.push({
        date: date,
        dateString: dateString,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNumber: dayNumber,
        month: month,
        isToday: dateString === todayString,
        isUnavailable: isUnavailable,
        isPast: isPast,
      })
    }
    
    return days
  }

  // Fonction pour afficher la plage de dates de la semaine
  const getWeekRange = () => {
    const days = getCalendarWeekDays()
    if (days.length === 0) return ''
    
    const firstDay = days[0].date
    const lastDay = days[days.length - 1].date
    
    const formatDate = (date) => {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      })
    }
    
    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`
  }

  // Obtenir les rendez-vous pour un jour et une heure spécifiques
  const getAppointmentForSlot = (dateString, time) => {
    const appointment = appointments.find(apt => {
      const aptDate = apt.date ? apt.date.split('T')[0] : apt.date
      const normalizedDateString = dateString.split('T')[0]
      const aptTime = apt.time ? apt.time.substring(0, 5) : apt.time
      const normalizedTime = time.substring(0, 5)
      
      return aptDate === normalizedDateString && aptTime === normalizedTime
    })
    
    return appointment
  }

  // Charger les données
  useEffect(() => {
    fetchAppointments()
    fetchUnavailableDays()
    fetchSlotPrices()
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
      console.error('Error response:', error.response)
      if (error.response?.status === 403) {
        toast.error('Accès refusé. Vérifiez que vous êtes bien connecté en tant qu\'avocat.')
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du chargement des rendez-vous')
      }
    }
  }

  const fetchUnavailableDays = async () => {
    try {
      const response = await api.get('/appointments/unavailable-days')
      setUnavailableDays(response.data || [])
    } catch (error) {
      console.error('Error fetching unavailable days:', error)
    }
  }

  const fetchSlotPrices = async () => {
    try {
      const response = await api.get('/appointments/slot-prices')
      const prices = response.data || {}
      
      const normalizedPrices = {}
      if (prices && typeof prices === 'object') {
        Object.keys(prices).forEach(time => {
          const value = prices[time]
          
          // Gérer le nouveau format (objet avec price et currency) et l'ancien format (juste un nombre)
          if (typeof value === 'object' && value !== null) {
            const priceVal = value.price
            const currencyVal = value.currency || 'FCFA'
            if (priceVal !== null && priceVal !== undefined && priceVal !== '') {
              const numValue = typeof priceVal === 'number' ? priceVal : parseFloat(priceVal)
              if (!isNaN(numValue) && numValue > 0) {
                normalizedPrices[time] = {
                  price: numValue,
                  currency: currencyVal
                }
              }
            }
          } else if (value !== null && value !== undefined && value !== '') {
            // Ancien format : juste un nombre
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            if (!isNaN(numValue) && numValue > 0) {
              normalizedPrices[time] = {
                price: numValue,
                currency: 'FCFA'
              }
            }
          }
        })
      }
      
      setSlotPrices(normalizedPrices)
      return normalizedPrices
    } catch (error) {
      console.error('Error fetching slot prices:', error)
      toast.error('Erreur lors du chargement des prix')
      return {}
    }
  }

  const handleValidate = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/validate`)
      toast.success('Rendez-vous validé avec succès')
      fetchAppointments()
      setShowDetailsModal(false)
    } catch (error) {
      console.error('Error validating appointment:', error)
      toast.error('Erreur lors de la validation')
    }
  }

  const handleReject = async (appointmentId, reason) => {
    try {
      await api.post(`/appointments/${appointmentId}/reject`, { reason })
      toast.success('Rendez-vous rejeté')
      fetchAppointments()
      setShowDetailsModal(false)
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      toast.error('Erreur lors du rejet')
    }
  }

  const handleReschedule = async (appointmentId, newDate, newTime) => {
    try {
      await api.post(`/appointments/${appointmentId}/reschedule`, {
        date: newDate,
        time: newTime
      })
      toast.success('Rendez-vous reporté avec succès')
      fetchAppointments()
      setShowRescheduleModal(false)
      setShowDetailsModal(false)
      setRescheduleDate('')
      setRescheduleTime('')
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du report du rendez-vous')
    }
  }

  const handleAddUnavailableDay = async (dateString) => {
    if (!dateString) {
      toast.error('Veuillez sélectionner une date')
      return
    }

    // Vérifier si le jour est déjà indisponible
    if (unavailableDays.includes(dateString)) {
      toast.error('Ce jour est déjà marqué comme indisponible')
      return
    }

    try {
      await api.post('/appointments/unavailable-days', { date: dateString })
      toast.success('Jour ajouté aux jours indisponibles')
      fetchUnavailableDays()
      fetchAppointments()
    } catch (error) {
      console.error('Error adding unavailable day:', error)
      toast.error('Erreur lors de l\'ajout du jour')
    }
  }

  // Générer les jours de la semaine (7 jours)
  const getWeekDays = (weekOffset = null) => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const week = weekOffset !== null ? weekOffset : currentWeek
    const startDay = week * 7 // 0 pour semaine en cours, 7 pour semaine prochaine
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + startDay + i)
      date.setHours(0, 0, 0, 0)
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
      const dayNumber = date.getDate()
      const month = date.toLocaleDateString('fr-FR', { month: 'short' })
      const dateString = date.toISOString().split('T')[0]
      const todayString = today.toISOString().split('T')[0]
      const isUnavailable = unavailableDays.includes(dateString)
      const isPast = date < today
      
      days.push({
        date: date,
        dateString: dateString,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNumber: dayNumber,
        month: month,
        isToday: dateString === todayString,
        isUnavailable: isUnavailable,
        isPast: isPast,
      })
    }
    
    return days
  }

  const handleRemoveUnavailableDay = async (date) => {
    try {
      await api.delete(`/appointments/unavailable-days/${date}`)
      toast.success('Jour retiré des jours indisponibles')
      fetchUnavailableDays()
      fetchAppointments()
    } catch (error) {
      console.error('Error removing unavailable day:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleUpdateSlotPrice = async (time, price, currency, customCurrencyValue = '') => {
    const priceValue = parseFloat(price)
    
    if (!price || isNaN(priceValue) || priceValue < 0) {
      toast.error('Veuillez entrer un prix valide')
      return
    }

    // Utiliser la devise personnalisée si "Autre" est sélectionné
    const finalCurrency = currency === 'Autre' 
      ? (customCurrencyValue.trim() || 'FCFA')
      : (currency || 'FCFA')

    if (!finalCurrency || finalCurrency.trim() === '') {
      toast.error('Veuillez sélectionner ou entrer une devise')
      return
    }

    try {
      const response = await api.post('/appointments/slot-prices', { 
        time, 
        price: priceValue,
        currency: finalCurrency.trim()
      })
      
      let prices = {}
      if (response.data && response.data.all_prices) {
        prices = response.data.all_prices
      } else {
        // Attendre un peu pour s'assurer que les données sont sauvegardées
        await new Promise(resolve => setTimeout(resolve, 300))
        const pricesResponse = await api.get('/appointments/slot-prices')
        prices = pricesResponse.data || {}
      }
      
      const normalizedPrices = {}
      if (prices && typeof prices === 'object') {
        Object.keys(prices).forEach(key => {
          const value = prices[key]
          if (typeof value === 'object' && value !== null) {
            const priceVal = value.price
            const currencyVal = value.currency || 'FCFA'
            if (priceVal !== null && priceVal !== undefined && priceVal !== '') {
              const numValue = typeof priceVal === 'number' ? priceVal : parseFloat(priceVal)
              if (!isNaN(numValue) && numValue > 0) {
                normalizedPrices[key] = {
                  price: numValue,
                  currency: currencyVal
                }
              }
            }
          } else if (value !== null && value !== undefined && value !== '') {
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            if (!isNaN(numValue) && numValue > 0) {
              normalizedPrices[key] = {
                price: numValue,
                currency: 'FCFA'
              }
            }
          }
        })
      }
      
      setSlotPrices(normalizedPrices)
      toast.success('Prix mis à jour avec succès')
      setEditingPrice(null)
      setNewPrice('')
      setNewCurrency('FCFA')
      setCustomCurrency('')
    } catch (error) {
      console.error('Error updating slot price:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du prix'
      toast.error(errorMessage)
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Gestion des rendez-vous
              </h1>
              <p className="text-sm sm:text-base text-neutral-600">
                Gérez les rendez-vous, les jours indisponibles et les prix des créneaux
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowUnavailableDaysModal(true)}
                icon={FiCalendar}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Jours indisponibles</span>
                <span className="sm:hidden">Jours</span>
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await fetchSlotPrices()
                  setShowPriceModal(true)
                }}
                icon={FiDollarSign}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Prix des créneaux</span>
                <span className="sm:hidden">Prix</span>
              </Button>
            </div>
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

        {/* Sélecteur de vue */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex gap-1 p-1 bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border-2 border-neutral-200 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                viewMode === 'table'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                  : 'bg-transparent text-neutral-600 hover:bg-white/50 hover:text-neutral-900'
              }`}
            >
              <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Calendrier</span>
            </button>
          </div>
        </div>

        {/* Vue Calendrier */}
        {viewMode === 'calendar' && (
          <Card padding="lg" className="bg-white shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  Calendrier hebdomadaire
                </h3>
                <p className="text-sm text-neutral-500">
                  {getWeekRange()}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Cliquez sur un créneau pour voir les détails du rendez-vous
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCalendarWeek(calendarWeek - 1)}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">← Semaine précédente</span>
                  <span className="sm:hidden">← Préc.</span>
                </Button>
                <Button
                  variant={calendarWeek === 0 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCalendarWeek(0)}
                  className="flex-1 sm:flex-none"
                >
                  Cette semaine
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCalendarWeek(calendarWeek + 1)}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Semaine suivante →</span>
                  <span className="sm:hidden">Suiv. →</span>
                </Button>
              </div>
            </div>

            {/* Message pour mobile */}
            <div className="lg:hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Faites défiler horizontalement pour voir tous les jours</span>
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[800px] px-4 sm:px-0">
                {/* En-tête avec les jours */}
                <div className="grid grid-cols-8 gap-1 sm:gap-2 mb-2">
                  <div className="font-semibold text-neutral-700 text-xs sm:text-sm p-2 flex items-center justify-center bg-neutral-100 rounded-lg border border-neutral-200">
                    <span>Heure</span>
                  </div>
                  {getCalendarWeekDays().map((day) => {
                    // Calculer les statistiques pour ce jour
                    const dayAppointments = appointments.filter(apt => {
                      const aptDate = apt.date ? apt.date.split('T')[0] : apt.date
                      return aptDate === day.dateString
                    })
                    const validated = dayAppointments.filter(a => a.status === 'validated').length
                    const pending = dayAppointments.filter(a => a.status === 'pending').length
                    const totalSlots = availableHours.length
                    const bookedSlots = dayAppointments.filter(a => a.status === 'validated' || a.status === 'pending').length
                    const available = (day.isUnavailable || day.isPast) ? 0 : totalSlots - bookedSlots
                    
                    return (
                      <div
                        key={day.dateString}
                        className={`text-center p-1.5 sm:p-2 rounded-lg border-2 ${
                          day.isPast
                            ? 'bg-neutral-100 border-neutral-300 opacity-60'
                            : day.isToday
                            ? 'bg-primary-50 border-primary-300'
                            : day.isUnavailable
                            ? 'bg-red-50 border-red-300'
                            : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className={`text-[9px] sm:text-xs mb-0.5 sm:mb-1 ${day.isPast ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {day.dayName.substring(0, 3).toUpperCase()}
                        </div>
                        <div className={`text-base sm:text-lg font-bold ${
                          day.isPast ? 'text-neutral-400' :
                          day.isToday ? 'text-primary-700' : 
                          day.isUnavailable ? 'text-red-700' : 
                          'text-neutral-900'
                        }`}>
                          {day.dayNumber}
                        </div>
                        <div className={`text-[9px] sm:text-xs mb-1 sm:mb-2 ${day.isPast ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {day.month}
                        </div>
                        
                        {day.isPast ? (
                          <div className="text-[8px] sm:text-[9px] text-neutral-500 font-semibold mt-1 px-0.5 sm:px-1 py-0.5 bg-neutral-200 rounded">
                            Passé
                          </div>
                        ) : day.isUnavailable ? (
                          <div className="text-[8px] sm:text-[9px] text-red-600 font-semibold mt-1 px-0.5 sm:px-1 py-0.5 bg-red-100 rounded">
                            Indispo.
                          </div>
                        ) : (
                          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2">
                            {validated > 0 && (
                              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold text-green-700 bg-green-100 rounded px-0.5 sm:px-1 py-0.5">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                                <span className="hidden sm:inline">{validated} validé{validated > 1 ? 's' : ''}</span>
                                <span className="sm:hidden">{validated}V</span>
                              </div>
                            )}
                            {pending > 0 && (
                              <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold text-yellow-700 bg-yellow-100 rounded px-0.5 sm:px-1 py-0.5">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500"></span>
                                <span className="hidden sm:inline">{pending} attente</span>
                                <span className="sm:hidden">{pending}A</span>
                              </div>
                            )}
                            <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold text-blue-700 bg-blue-100 rounded px-0.5 sm:px-1 py-0.5">
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-blue-500"></span>
                              <span className="hidden sm:inline">{available}/{totalSlots} dispo.</span>
                              <span className="sm:hidden">{available}/{totalSlots}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Créneaux horaires */}
                <div className="space-y-1 sm:space-y-2">
                  {availableHours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 gap-1 sm:gap-2">
                      <div className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border-2 border-neutral-200 shadow-sm">
                        <span className="font-bold text-neutral-800 text-xs sm:text-base">{hour}</span>
                      </div>
                      {getCalendarWeekDays().map((day) => {
                        const appointment = getAppointmentForSlot(day.dateString, hour)
                        const isUnavailable = day.isUnavailable || day.isPast
                        
                        return (
                          <button
                            key={`${day.dateString}-${hour}`}
                            onClick={() => {
                              if (appointment && !day.isPast) {
                                setSelectedAppointment(appointment)
                                setShowDetailsModal(true)
                              }
                            }}
                            disabled={isUnavailable}
                            className={`p-1.5 sm:p-3 rounded-lg border-2 transition-all duration-200 min-h-[60px] sm:min-h-[80px] flex flex-col items-center justify-center ${
                              isUnavailable
                                ? 'bg-neutral-100 border-neutral-300 cursor-not-allowed opacity-60'
                                : appointment
                                ? appointment.status === 'validated'
                                  ? 'bg-green-50 border-green-400 hover:bg-green-100 hover:shadow-md cursor-pointer'
                                  : appointment.status === 'pending'
                                  ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100 hover:shadow-md cursor-pointer'
                                  : appointment.status === 'rejected'
                                  ? 'bg-red-50 border-red-400 hover:bg-red-100 hover:shadow-md cursor-pointer'
                                  : 'bg-neutral-50 border-neutral-300 hover:bg-neutral-100 cursor-pointer'
                                : 'bg-white border-neutral-300 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm cursor-pointer'
                            }`}
                          >
                            {isUnavailable ? (
                              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <FiX className="w-3 h-3 sm:w-5 sm:h-5 text-neutral-500 mb-0.5 sm:mb-1" />
                                <span className="text-[9px] sm:text-xs font-semibold text-neutral-600">
                                  <span className="hidden sm:inline">{day.isPast ? 'Passé' : 'Indisponible'}</span>
                                  <span className="sm:hidden">-</span>
                                </span>
                              </div>
                            ) : appointment ? (
                              <div className="flex flex-col items-center w-full gap-0.5 sm:gap-1">
                                <div className={`w-3 h-3 sm:w-5 sm:h-5 rounded-full mb-0.5 sm:mb-1 shadow-md ${
                                  appointment.status === 'validated'
                                    ? 'bg-green-500 ring-1 sm:ring-2 ring-green-300'
                                    : appointment.status === 'pending'
                                    ? 'bg-yellow-500 ring-1 sm:ring-2 ring-yellow-300'
                                    : 'bg-red-500 ring-1 sm:ring-2 ring-red-300'
                                }`}></div>
                                <span className="text-[9px] sm:text-xs font-bold text-neutral-900 truncate w-full text-center">
                                  {appointment.name.split(' ')[0]}
                                </span>
                                <span className={`text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                                  appointment.status === 'validated'
                                    ? 'bg-green-200 text-green-800'
                                    : appointment.status === 'pending'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  <span className="hidden sm:inline">
                                    {appointment.status === 'validated' ? 'Validé' : 
                                     appointment.status === 'pending' ? 'En attente' : 
                                     'Rejeté'}
                                  </span>
                                  <span className="sm:hidden">
                                    {appointment.status === 'validated' ? 'V' : 
                                     appointment.status === 'pending' ? 'A' : 
                                     'R'}
                                  </span>
                                </span>
                                {appointment.amount && (
                                  <span className="text-[8px] sm:text-[10px] text-neutral-600 font-medium mt-0.5 sm:mt-1 hidden sm:block">
                                    {Number(appointment.amount).toLocaleString('fr-FR')} FCFA
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-dashed border-neutral-400 mb-0.5 sm:mb-1"></div>
                                <span className="text-[9px] sm:text-xs font-semibold text-neutral-500">
                                  <span className="hidden sm:inline">Disponible</span>
                                  <span className="sm:hidden">✓</span>
                                </span>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="font-semibold text-neutral-700">Légende :</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
                  <span>Validé</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500"></div>
                  <span>En attente</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
                  <span>Rejeté</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-neutral-200 bg-white"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-neutral-200 bg-neutral-100 opacity-60"></div>
                  <span>Jour passé</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-red-300 bg-red-50"></div>
                  <span>Indisponible</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Vue Liste */}
        {viewMode === 'table' && (
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
        )}

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

              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'validated') && (
                <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedAppointment.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => handleValidate(selectedAppointment.id)}
                          icon={FiCheckCircle}
                          className="flex-1"
                        >
                          Valider le rendez-vous
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            const reason = prompt('Raison du rejet (optionnel) :')
                            if (reason !== null) {
                              handleReject(selectedAppointment.id, reason)
                            }
                          }}
                          icon={FiXCircle}
                          className="flex-1"
                        >
                          Rejeter
                        </Button>
                      </>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowRescheduleModal(true)
                      }}
                      icon={FiRefreshCw}
                      className="flex-1"
                    >
                      Reporter le rendez-vous
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Modal jours indisponibles */}
        {showUnavailableDaysModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-neutral-200">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Jours indisponibles</h2>
                    <p className="text-white/90 text-sm">Gérez les jours où les rendez-vous ne sont pas disponibles</p>
                  </div>
                  <button
                    onClick={() => setShowUnavailableDaysModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  {/* Navigation entre les semaines */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentWeek(0)}
                      className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                        currentWeek === 0
                          ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                      }`}
                    >
                      Semaine en cours
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentWeek(1)}
                      className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                        currentWeek === 1
                          ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                      }`}
                    >
                      Semaine prochaine
                    </button>
                  </div>

                  {/* Calendrier visuel */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 mb-3">
                      {currentWeek === 0 ? 'Semaine en cours' : 'Semaine prochaine'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                      {getWeekDays().map((day, index) => (
                        <button
                          key={day.dateString}
                          type="button"
                          onClick={() => {
                            if (day.isUnavailable) {
                              handleRemoveUnavailableDay(day.dateString)
                            } else {
                              handleAddUnavailableDay(day.dateString)
                            }
                          }}
                          className={`group relative p-2.5 sm:p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                            day.isUnavailable
                              ? 'border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl scale-105'
                              : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg text-gray-700 hover:scale-105 active:scale-95'
                          } ${day.isToday && !day.isUnavailable ? 'ring-2 ring-primary-300 ring-offset-1 sm:ring-offset-2' : ''}`}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          {day.isUnavailable && (
                            <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                              <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                            </div>
                          )}
                          <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 ${
                            day.isUnavailable ? 'text-white/90' : 'text-gray-500'
                          }`}>
                            {day.dayName.substring(0, 3).toUpperCase()}
                          </div>
                          <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-0.5 ${
                            day.isUnavailable ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {day.dayNumber}
                          </div>
                          <div className={`text-[10px] sm:text-xs font-medium mb-0.5 ${
                            day.isUnavailable ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {day.month}
                          </div>
                          {day.isToday && !day.isUnavailable && (
                            <div className="text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 sm:mt-1 px-0.5 sm:px-1 md:px-1.5 py-0.5 rounded-full whitespace-nowrap w-full text-center leading-tight bg-primary-100 text-primary-700">
                              <span className="hidden md:inline">Aujourd'hui</span>
                              <span className="md:hidden">Auj.</span>
                            </div>
                          )}
                          {day.isUnavailable && (
                            <div className="text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 sm:mt-1 px-0.5 sm:px-1 md:px-1.5 py-0.5 rounded-full whitespace-nowrap w-full text-center leading-tight bg-white/20 text-white">
                              Indisponible
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">
                      Cliquez sur un jour pour l'ajouter ou le retirer des jours indisponibles
                    </p>
                  </div>

                  {/* Liste des jours indisponibles */}
                  {unavailableDays.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Tous les jours indisponibles ({unavailableDays.length})
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {unavailableDays
                          .sort()
                          .map((day) => {
                            const dateStr = typeof day === 'string' ? day : day.date || day
                            return (
                              <div
                                key={dateStr}
                                className="flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-lg"
                              >
                                <span className="text-sm font-medium text-red-900">
                                  {new Date(dateStr).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUnavailableDay(dateStr)}
                                  icon={FiTrash2}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                  Supprimer
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal prix des créneaux */}
        {showPriceModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-neutral-200">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Prix des créneaux horaires</h2>
                    <p className="text-white/90 text-sm">Définissez les prix pour chaque créneau horaire</p>
                  </div>
                  <button
                    onClick={() => setShowPriceModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-3">
                  {availableHours.map((hour) => (
                    <div
                      key={hour}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-br from-neutral-50 to-white p-4 sm:p-5 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-sm">
                          <FiClock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-lg text-neutral-900">{hour}</span>
                          <p className="text-xs text-neutral-500">Créneau horaire</p>
                        </div>
                      </div>
                    {editingPrice === hour ? (
                      <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1 sm:flex-initial">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              placeholder="Prix"
                              className="input w-full sm:w-40"
                              min="0"
                              step="100"
                              autoFocus
                            />
                          </div>
                          <div className="flex-1 sm:flex-initial">
                            <select
                              value={newCurrency}
                              onChange={(e) => setNewCurrency(e.target.value)}
                              className="input w-full sm:w-32"
                            >
                              <option value="FCFA">FCFA</option>
                              <option value="EUR">EUR</option>
                              <option value="USD">USD</option>
                              <option value="CAD">CAD</option>
                              <option value="XOF">XOF</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                        </div>
                        {newCurrency === 'Autre' && (
                          <div className="flex-1">
                            <input
                              type="text"
                              value={customCurrency}
                              onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                              placeholder="Entrez la devise (ex: GBP, JPY, etc.)"
                              className="input w-full"
                              maxLength={10}
                              autoFocus
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateSlotPrice(hour, newPrice, newCurrency, customCurrency)}
                              icon={FiSave}
                              className="flex-1 sm:flex-initial"
                            >
                              Enregistrer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPrice(null)
                                setNewPrice('')
                                setNewCurrency('FCFA')
                                setCustomCurrency('')
                              }}
                              className="flex-1 sm:flex-initial"
                            >
                              Annuler
                            </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
                          <FiDollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-neutral-900 font-bold text-lg">
                            {slotPrices[hour] !== undefined && slotPrices[hour] !== null && 
                             (typeof slotPrices[hour] === 'object' ? slotPrices[hour].price > 0 : slotPrices[hour] > 0)
                              ? `${Number(typeof slotPrices[hour] === 'object' ? slotPrices[hour].price : slotPrices[hour]).toLocaleString('fr-FR')} ${typeof slotPrices[hour] === 'object' ? (slotPrices[hour].currency || 'FCFA') : 'FCFA'}` 
                              : <span className="text-neutral-400">Non défini</span>}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentSlot = slotPrices[hour]
                            const currentPrice = typeof currentSlot === 'object' ? currentSlot?.price : currentSlot
                            const currentCurrency = typeof currentSlot === 'object' ? (currentSlot?.currency || 'FCFA') : 'FCFA'
                            const isCustomCurrency = !['FCFA', 'EUR', 'USD', 'CAD', 'XOF'].includes(currentCurrency)
                            setEditingPrice(hour)
                            setNewPrice(currentPrice ? String(currentPrice) : '')
                            setNewCurrency(isCustomCurrency ? 'Autre' : currentCurrency)
                            setCustomCurrency(isCustomCurrency ? currentCurrency : '')
                          }}
                          icon={FiEdit}
                          className="w-full sm:w-auto hover:bg-primary-50 hover:text-primary-600"
                        >
                          Modifier
                        </Button>
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de report de rendez-vous */}
        {showRescheduleModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-neutral-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Reporter le rendez-vous</h2>
                    <p className="text-white/90 text-sm">Sélectionnez une nouvelle date et heure pour ce rendez-vous</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setRescheduleDate('')
                      setRescheduleTime('')
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  {/* Informations du rendez-vous actuel */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FiCalendar className="w-4 h-4 text-white" />
                      </div>
                      Rendez-vous actuel
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <FiCalendar className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-xs text-neutral-500 block">Date actuelle</span>
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
                        <FiClock className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-xs text-neutral-500 block">Heure actuelle</span>
                          <span className="font-semibold text-neutral-900">{selectedAppointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sélection de la nouvelle date */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 p-5 rounded-xl border border-primary-200">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <FiCalendar className="w-4 h-4 text-white" />
                      </div>
                      Nouvelle date et heure
                    </h3>
                    
                    {/* Navigation entre les semaines */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setRescheduleWeek(0)}
                        className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                          rescheduleWeek === 0
                            ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                            : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                        }`}
                      >
                        Semaine en cours
                      </button>
                      <button
                        type="button"
                        onClick={() => setRescheduleWeek(1)}
                        className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                          rescheduleWeek === 1
                            ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                            : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                        }`}
                      >
                        Semaine prochaine
                      </button>
                    </div>

                    {/* Calendrier visuel */}
                    <div className="mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                        {getWeekDays(rescheduleWeek).map((day, index) => {
                          const isSelected = rescheduleDate === day.dateString
                          const isPast = day.isPast
                          const isUnavailable = day.isUnavailable
                          const isDisabled = isPast || isUnavailable
                          
                          return (
                            <button
                              key={day.dateString}
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  setRescheduleDate(day.dateString)
                                }
                              }}
                              disabled={isDisabled}
                              className={`group relative p-2.5 sm:p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                                isDisabled
                                  ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-105'
                                  : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg text-gray-700 hover:scale-105 active:scale-95'
                              }`}
                            >
                              <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 ${
                                isSelected ? 'text-white/90' : 'text-gray-500'
                              }`}>
                                {day.dayName.substring(0, 3).toUpperCase()}
                              </div>
                              <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-0.5 ${
                                isSelected ? 'text-white' : 'text-neutral-900'
                              }`}>
                                {day.dayNumber}
                              </div>
                              <div className={`text-[10px] sm:text-xs font-medium mb-0.5 ${
                                isSelected ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {day.month}
                              </div>
                              {isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <FiCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-600" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Sélection de l'heure */}
                    {rescheduleDate && (
                      <div className="mt-4">
                        <label className="form-label flex items-center gap-2 mb-3">
                          <FiClock className="w-4 h-4 text-primary-500" />
                          Sélectionnez une heure
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {availableHours.map((hour) => {
                            // Vérifier si le créneau est déjà réservé
                            const isBooked = appointments.some(apt => {
                              const aptDate = apt.date ? apt.date.split('T')[0] : apt.date
                              return aptDate === rescheduleDate && 
                                     apt.time === hour && 
                                     apt.id !== selectedAppointment.id &&
                                     (apt.status === 'pending' || apt.status === 'validated')
                            })
                            const isSelected = rescheduleTime === hour
                            
                            return (
                              <button
                                key={hour}
                                type="button"
                                onClick={() => {
                                  if (!isBooked) {
                                    setRescheduleTime(hour)
                                  }
                                }}
                                disabled={isBooked}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 font-semibold ${
                                  isBooked
                                    ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                                    : isSelected
                                    ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                                    : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700 hover:scale-105'
                                }`}
                              >
                                {hour}
                                {isBooked && (
                                  <div className="text-xs mt-1 text-neutral-500">Réservé</div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (rescheduleDate && rescheduleTime) {
                        handleReschedule(selectedAppointment.id, rescheduleDate, rescheduleTime)
                      } else {
                        toast.error('Veuillez sélectionner une date et une heure')
                      }
                    }}
                    icon={FiRefreshCw}
                    className="flex-1"
                    disabled={!rescheduleDate || !rescheduleTime}
                  >
                    Confirmer le report
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setRescheduleDate('')
                      setRescheduleTime('')
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
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

