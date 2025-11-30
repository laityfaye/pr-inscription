import { useEffect, useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiXCircle, FiClock, FiFile, FiDownload, FiEye, FiX, FiSearch, FiFilter, FiX as FiXIcon, FiBell, FiAlertCircle, FiArrowRight, FiUpload } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AdminInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([])
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [inscriptionDetails, setInscriptionDetails] = useState(null)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [countries, setCountries] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Définir fetchCountries d'abord
  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries')
      setCountries(response.data || [])
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }


  // Définir fetchInscriptions avec useCallback
  const fetchInscriptions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      
      if (filterStatus) params.append('status', filterStatus)
      if (filterCountry) params.append('country_id', filterCountry)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)

      const url = `/inscriptions${params.toString() ? '?' + params.toString() : ''}`
      const response = await api.get(url)
      setInscriptions(response.data)
    } catch (error) {
      console.error('Error fetching inscriptions:', error)
      toast.error('Erreur lors du chargement des préinscriptions')
    }
  }, [filterStatus, filterCountry, dateFrom, dateTo, debouncedSearchQuery])

  // Charger les données au montage initial
  useEffect(() => {
    fetchCountries()
  }, [])

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Recharger quand les filtres changent
  useEffect(() => {
    fetchInscriptions()
  }, [fetchInscriptions])

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterStatus('')
    setFilterCountry('')
    setDateFrom('')
    setDateTo('')
    setShowFilters(false)
  }

  const hasActiveFilters = filterStatus || filterCountry || dateFrom || dateTo || searchQuery

  const fetchInscriptionDetails = async (inscriptionId) => {
    try {
      const response = await api.get(`/inscriptions/${inscriptionId}`)
      console.log('Inscription details:', response.data)
      console.log('Documents:', response.data.documents)
      setInscriptionDetails(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error fetching inscription details:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des détails')
    }
  }

  const handleViewDocument = async (doc) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
    
    // Créer un blob URL pour la prévisualisation
    try {
      const response = await api.get(`/documents/${doc.id}/view`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: doc.mime_type || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Error loading preview:', error)
      toast.error('Impossible de charger la prévisualisation')
      setShowPreviewModal(false)
    }
  }

  const handleDownloadDocument = async (doc) => {
    try {
      console.log('Downloading document:', doc)
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      })
      console.log('Download response:', response)
      // Créer le blob avec le type MIME correct
      const blob = new Blob([response.data], { 
        type: doc.mime_type || response.headers['content-type'] || 'application/octet-stream' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // S'assurer que le nom a la bonne extension
      let fileName = doc.name
      if (!fileName.includes('.')) {
        // Si pas d'extension, essayer de la déduire du type MIME
        const mimeToExt = {
          'application/pdf': 'pdf',
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        }
        const ext = mimeToExt[doc.mime_type] || mimeToExt[response.headers['content-type']] || ''
        if (ext) fileName += '.' + ext
      }
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Document téléchargé')
    } catch (error) {
      console.error('Error downloading document:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || error.response?.statusText || 'Erreur lors du téléchargement'
      toast.error(errorMessage)
    }
  }

  // Nettoyer l'URL du blob quand le modal se ferme
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith('image/')
  }

  const isPdf = (mimeType) => {
    return mimeType && mimeType === 'application/pdf'
  }

  const handleUpdateStatus = async () => {
    if (!selectedInscription || !status) return

    try {
      await api.patch(`/inscriptions/${selectedInscription.id}/status`, {
        status,
        notes,
      })
      toast.success('Statut mis à jour')
      setSelectedInscription(null)
      setStatus('')
      setNotes('')
      setShowEditModal(false)
      fetchInscriptions()
      if (showDetailsModal && inscriptionDetails) {
        fetchInscriptionDetails(inscriptionDetails.id)
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleNotifyClient = async (inscription) => {
    try {
      await api.post(`/inscriptions/${inscription.id}/notify-client`)
      toast.success('Client notifié avec succès')
      fetchInscriptions()
      if (showDetailsModal && inscriptionDetails && inscriptionDetails.id === inscription.id) {
        fetchInscriptionDetails(inscription.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la notification')
    }
  }

  const handleApproveDocument = async (document) => {
    try {
      await api.post(`/documents/${document.id}/approve`)
      toast.success('Document approuvé')
      if (inscriptionDetails) {
        fetchInscriptionDetails(inscriptionDetails.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation')
    }
  }

  const handleRejectDocument = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      toast.error('Veuillez fournir une raison de rejet (minimum 10 caractères)')
      return
    }

    try {
      await api.post(`/documents/${selectedDocument.id}/reject`, {
        rejection_reason: rejectionReason,
      })
      toast.success('Document rejeté')
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedDocument(null)
      if (inscriptionDetails) {
        fetchInscriptionDetails(inscriptionDetails.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet')
    }
  }

  const openRejectModal = (document) => {
    setSelectedDocument(document)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const getDocumentStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'En attente',
        icon: FiClock,
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approuvé',
        icon: FiCheckCircle,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rejeté',
        icon: FiXCircle,
      },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getDocumentTypeLabel = (type) => {
    const types = {
      identity: 'Pièce d\'identité',
      passport: 'Passeport',
      transcript: 'Relevé de notes',
      diploma: 'Diplôme',
      other: 'Autre',
    }
    return types[type] || type
  }

  const openEditModal = (inscription) => {
    setSelectedInscription(inscription)
    setStatus(inscription.status)
    setNotes(inscription.notes || '')
    setShowEditModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { variant: 'warning', icon: FiClock, label: 'En attente' },
      in_progress: { variant: 'primary', icon: FiClock, label: 'En cours' },
      validated: { variant: 'success', icon: FiCheckCircle, label: 'Validée' },
      rejected: { variant: 'error', icon: FiXCircle, label: 'Rejetée' },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <Badge variant={badge.variant} icon={Icon}>
        {badge.label}
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
    <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                Gestion des préinscriptions
              </h1>
              <p className="text-neutral-600">
                Gérez et suivez toutes les préinscriptions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  icon={FiXIcon}
                >
                  Réinitialiser
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={FiFilter}
              >
                Filtres
                {hasActiveFilters && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {[filterStatus, filterCountry, dateFrom, dateTo, searchQuery].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <Card className="mb-6 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou email du client..."
                className="input pl-12"
              />
            </div>
          </div>

          {/* Panel de filtres */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-neutral-200">
              <div className="form-group">
                <label className="form-label">
                  Statut
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="validated">Validée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Pays
                </label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="input"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
          </Card>

          {/* Résumé des résultats */}
          {hasActiveFilters && inscriptions.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="primary" size="md">
                {inscriptions.length} préinscription(s) trouvée(s)
              </Badge>
            </div>
          )}

          {/* Tableau */}
          <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                <tr>
                    <th className="table-header-cell">
                    Client
                  </th>
                    <th className="table-header-cell">
                    Pays
                  </th>
                    <th className="table-header-cell">
                    Statut
                  </th>
                    <th className="table-header-cell">
                      Documents
                    </th>
                    <th className="table-header-cell">
                    Date
                  </th>
                    <th className="table-header-cell">
                    Actions
                  </th>
                </tr>
              </thead>
                <tbody className="divide-y divide-neutral-200">
                  {inscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <FiFile className="w-16 h-16 text-neutral-300 mb-4" />
                          <p className="text-lg font-semibold text-neutral-900 mb-2">
                            Aucune préinscription trouvée
                          </p>
                          <p className="text-sm text-neutral-500 max-w-md">
                            {hasActiveFilters 
                              ? 'Essayez de modifier vos filtres de recherche pour trouver d\'autres résultats' 
                              : 'Aucune préinscription n\'a été créée pour le moment'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inscriptions.map((inscription) => (
                      <tr key={inscription.id} className="table-row">
                        <td className="table-body-cell">
                          <div className="text-sm font-semibold text-neutral-900">
                        {inscription.user?.name}
                      </div>
                          <div className="text-xs text-neutral-500 mt-0.5">{inscription.user?.email}</div>
                    </td>
                        <td className="table-body-cell">
                          <span className="text-sm font-medium text-neutral-900">
                      {inscription.country?.name}
                          </span>
                    </td>
                        <td className="table-body-cell">
                      {getStatusBadge(inscription.status)}
                    </td>
                        <td className="table-body-cell">
                          <div className="flex items-center gap-2">
                            <FiFile className="w-4 h-4 text-neutral-400" />
                            <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutral-900">
                                {inscription.documents?.length || 0} document(s)
                            </span>
                              {inscription.documents?.some(doc => doc.status === 'pending') && (
                                <span className="text-xs text-yellow-600 font-medium">
                                  {inscription.documents.filter(doc => doc.status === 'pending').length} en attente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-body-cell text-neutral-600">
                          {new Date(inscription.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                    </td>
                        <td className="table-body-cell">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => fetchInscriptionDetails(inscription.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                              title="Voir les détails et documents"
                            >
                              <FiEye className="w-4 h-4" />
                              Voir
                            </button>
                      <button
                              onClick={() => openEditModal(inscription)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                      >
                        Modifier
                      </button>
                          </div>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
          </Card>

          {/* Modal Détails avec Documents */}
          {showDetailsModal && inscriptionDetails && (
            <div className="modal-overlay" onClick={() => {
              setShowDetailsModal(false)
              setInscriptionDetails(null)
            }}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
                        Détails de la préinscription
                      </h2>
                      <p className="text-sm text-neutral-500">Informations complètes et documents</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setInscriptionDetails(null)
                      }}
                      className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                      aria-label="Fermer"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Informations de la préinscription */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-transparent border-primary-100">
                      <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">Client</h3>
                      <p className="text-lg font-bold text-neutral-900 mb-1">{inscriptionDetails.user?.name}</p>
                      <p className="text-sm text-neutral-600">{inscriptionDetails.user?.email}</p>
                    </Card>
                    <Card padding="lg" className="bg-gradient-to-br from-accent-50 to-transparent border-accent-100">
                      <h3 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">Pays</h3>
                      <p className="text-lg font-bold text-neutral-900">{inscriptionDetails.country?.name}</p>
                    </Card>
                    <Card padding="lg" className="bg-neutral-50 border-neutral-200">
                      <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Statut</h3>
                      <div className="mt-1">{getStatusBadge(inscriptionDetails.status)}</div>
                    </Card>
                    <Card padding="lg" className="bg-neutral-50 border-neutral-200">
                      <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Date de création</h3>
                      <p className="text-lg font-semibold text-neutral-900 mt-1">
                        {new Date(inscriptionDetails.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </Card>
                    {inscriptionDetails.client_notified_at && (
                      <Card padding="lg" className="bg-green-50 border-green-200">
                        <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Client notifié</h3>
                        <p className="text-sm font-semibold text-green-900 mt-1">
                          {new Date(inscriptionDetails.client_notified_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </Card>
                    )}
                    {inscriptionDetails.notes && (
                      <div className="col-span-1 md:col-span-2">
                        <Card padding="lg" className="bg-amber-50/50 border-amber-200">
                          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Notes</h3>
                          <p className="text-sm text-neutral-900 leading-relaxed">{inscriptionDetails.notes}</p>
                        </Card>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="border-t border-neutral-200 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
                          <FiFile className="w-5 h-5 text-primary-600" />
                          Documents fournis
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-neutral-500">
                          {inscriptionDetails.documents?.length || 0} document(s) disponible(s)
                        </p>
                          {inscriptionDetails.documents && inscriptionDetails.documents.length > 0 && (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                <span className="text-neutral-600">
                                  {inscriptionDetails.documents.filter(d => d.status === 'pending').length} en attente
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-neutral-600">
                                  {inscriptionDetails.documents.filter(d => d.status === 'approved').length} approuvé(s)
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span className="text-neutral-600">
                                  {inscriptionDetails.documents.filter(d => d.status === 'rejected').length} rejeté(s)
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link to="/admin/documents">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={FiArrowRight}
                          >
                            Voir tous les documents
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {inscriptionDetails.documents && inscriptionDetails.documents.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {inscriptionDetails.documents.map((document) => (
                          <Card
                            key={document.id}
                            hover
                            className="p-4"
                          >
                            <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <FiFile className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-neutral-900 truncate">{document.name}</p>
                                      {getDocumentStatusBadge(document.status || 'pending')}
                                    </div>
                                    <p className="text-sm text-neutral-500">
                                      {getDocumentTypeLabel(document.type)} •{' '}
                                    {document.size
                                      ? (document.size / 1024).toFixed(2) + ' KB'
                                      : 'Taille inconnue'}
                                  </p>
                                    {document.validated_at && (
                                      <p className="text-xs text-neutral-400 mt-1">
                                        Validé le:{' '}
                                        {new Date(document.validated_at).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                        {document.validator && ` par ${document.validator.name}`}
                                      </p>
                                    )}
                                </div>
                              </div>
                                <div className="flex items-center gap-2">
                              <Button
                                variant="primary"
                                    size="sm"
                                    onClick={() => handleViewDocument(document)}
                                    icon={FiEye}
                                  >
                                    Visualiser
                                  </Button>
                                  <Button
                                    variant="secondary"
                                size="sm"
                                onClick={() => handleDownloadDocument(document)}
                                icon={FiDownload}
                              >
                                Télécharger
                              </Button>
                                </div>
                              </div>
                              {document.status === 'rejected' && document.rejection_reason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-red-800 mb-1">
                                        Raison du rejet:
                                      </p>
                                      <p className="text-sm text-red-700">{document.rejection_reason}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {document.status === 'pending' && (
                                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveDocument(document)}
                                    className="bg-green-600 hover:bg-green-700"
                                    icon={FiCheckCircle}
                                  >
                                    Approuver
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openRejectModal(document)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    icon={FiXCircle}
                                  >
                                    Rejeter
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center">
                        <FiFile className="mx-auto mb-4 w-16 h-16 text-neutral-300" />
                        <p className="text-lg font-semibold text-neutral-900 mb-1">Aucun document</p>
                        <p className="text-sm text-neutral-500">Aucun document fourni pour cette préinscription</p>
                      </Card>
                    )}
        </div>

                  <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDetailsModal(false)
                        setInscriptionDetails(null)
                      }}
                    >
                      Fermer
                    </Button>
                    {inscriptionDetails.status === 'validated' && !inscriptionDetails.client_notified_at && (
                      <Button
                        variant="success"
                        onClick={() => handleNotifyClient(inscriptionDetails)}
                        icon={FiBell}
                      >
                        Notifier le client
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => {
                        setShowDetailsModal(false)
                        openEditModal(inscriptionDetails)
                      }}
                    >
                      Modifier le statut
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Modifier Statut */}
          {showEditModal && selectedInscription && (
            <div className="modal-overlay" onClick={() => {
              setSelectedInscription(null)
              setStatus('')
              setNotes('')
              setShowEditModal(false)
            }}>
              <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Modifier le statut</h2>
                  <p className="text-sm text-neutral-500 mb-6">Mettez à jour le statut de la préinscription</p>
                  
                  <div className="form-group mb-6">
                    <label className="form-label">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                      className="input"
                >
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="validated">Validée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>
                  
                  <div className="form-group mb-6">
                    <label className="form-label">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                      className="input resize-none"
                      placeholder="Ajouter des notes optionnelles..."
                />
                    <p className="form-helper">
                      Ces notes seront visibles par le client
                    </p>
              </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                  onClick={() => {
                    setSelectedInscription(null)
                    setStatus('')
                    setNotes('')
                        setShowEditModal(false)
                  }}
                >
                  Annuler
                    </Button>
                    <Button
                      variant="primary"
                  onClick={handleUpdateStatus}
                      disabled={!status}
                >
                  Enregistrer
                    </Button>
                  </div>
              </div>
            </div>
          </div>
        )}

          {/* Modal Rejeter Document */}
          {showRejectModal && selectedDocument && (
            <div className="modal-overlay" onClick={() => {
              setShowRejectModal(false)
              setRejectionReason('')
              setSelectedDocument(null)
            }}>
              <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Rejeter le document</h2>
                  <p className="text-sm text-neutral-500 mb-4">
                    Document: <span className="font-semibold">{selectedDocument.name}</span>
                  </p>
                  <div className="form-group mb-6">
                    <label className="form-label">
                      Raison du rejet <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce document est rejeté (minimum 10 caractères)..."
                      className="input resize-none min-h-[120px]"
                      rows={5}
                    />
                    <p className="form-helper">
                      {rejectionReason.length}/10 caractères minimum
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowRejectModal(false)
                        setRejectionReason('')
                        setSelectedDocument(null)
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleRejectDocument}
                      disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Modal de prévisualisation */}
        {showPreviewModal && previewDocument && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{previewDocument.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getDocumentTypeLabel(previewDocument.type)} •{' '}
                    {previewDocument.size
                      ? (previewDocument.size / 1024 / 1024).toFixed(2) + ' MB'
                      : 'Taille inconnue'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadDocument(previewDocument)}
                    icon={FiDownload}
                  >
                    Télécharger
                  </Button>
                  <button
                    onClick={() => {
                      if (previewUrl) {
                        window.URL.revokeObjectURL(previewUrl)
                        setPreviewUrl(null)
                      }
                      setShowPreviewModal(false)
                      setPreviewDocument(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Fermer"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenu de prévisualisation */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {!previewUrl ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : isImage(previewDocument.mime_type) ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <img
                      src={previewUrl}
                      alt={previewDocument.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const errorDiv = e.target.nextSibling
                        if (errorDiv) errorDiv.style.display = 'flex'
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center min-h-[400px] text-gray-500">
                      <FiFile className="w-16 h-16 mb-4" />
                      <p>Impossible de charger l'image</p>
                    </div>
                  </div>
                ) : isPdf(previewDocument.mime_type) ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <iframe
                      src={previewUrl}
                      className="w-full h-[70vh] border-0 rounded-lg shadow-lg"
                      title={previewDocument.name}
                      onError={() => {
                        toast.error('Impossible de charger le PDF')
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                    <FiFile className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold mb-2">Aperçu non disponible</p>
                    <p className="text-sm mb-4">
                      Ce type de fichier ({previewDocument.mime_type || 'inconnu'}) ne peut pas être prévisualisé
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => handleDownloadDocument(previewDocument)}
                      icon={FiDownload}
                    >
                      Télécharger pour visualiser
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminInscriptions



