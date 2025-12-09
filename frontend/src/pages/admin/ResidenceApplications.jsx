import { useEffect, useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiXCircle, FiClock, FiFile, FiDownload, FiEye, FiX, FiSearch, FiFilter, FiX as FiXIcon, FiHome, FiUser, FiBell, FiAlertCircle, FiArrowRight, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AdminResidenceApplications = () => {
  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [applicationDetails, setApplicationDetails] = useState(null)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)

      const url = `/residence-applications${params.toString() ? '?' + params.toString() : ''}`
      const response = await api.get(url)
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching residence applications:', error)
      toast.error('Erreur lors du chargement des demandes')
    }
  }, [filterStatus, dateFrom, dateTo, debouncedSearchQuery])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterStatus('')
    setDateFrom('')
    setDateTo('')
    setShowFilters(false)
  }

  const hasActiveFilters = filterStatus || dateFrom || dateTo || searchQuery

  const fetchApplicationDetails = async (applicationId) => {
    try {
      const response = await api.get(`/residence-applications/${applicationId}`)
      setApplicationDetails(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des détails')
    }
  }

  const handleViewDocument = async (doc) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
    try {
      const response = await api.get(`/documents/${doc.id}/view`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: doc.mime_type || response.headers['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      toast.error('Impossible de charger la prévisualisation')
      setShowPreviewModal(false)
    }
  }

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
      const blob = new Blob([response.data], { 
        type: doc.mime_type || response.headers['content-type'] || 'application/octet-stream' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      let fileName = doc.name
      if (!fileName.includes('.')) {
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
      const errorMessage = error.response?.data?.message || error.response?.statusText || 'Erreur lors du téléchargement'
      toast.error(errorMessage)
    }
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const isImage = (mimeType) => mimeType && mimeType.startsWith('image/')
  const isPdf = (mimeType) => mimeType === 'application/pdf'

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !status) return

    try {
      await api.patch(`/residence-applications/${selectedApplication.id}/status`, {
        status,
        notes,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
      })
      toast.success('Statut mis à jour')
      setSelectedApplication(null)
      setStatus('')
      setNotes('')
      setRejectionReason('')
      setShowEditModal(false)
      fetchApplications()
      if (showDetailsModal && applicationDetails) {
        fetchApplicationDetails(applicationDetails.id)
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleNotifyClient = async (application) => {
    try {
      await api.post(`/residence-applications/${application.id}/notify-client`)
      toast.success('Client notifié avec succès')
      fetchApplications()
      if (showDetailsModal && applicationDetails && applicationDetails.id === application.id) {
        fetchApplicationDetails(application.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la notification')
    }
  }

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return

    try {
      await api.delete(`/residence-applications/${applicationToDelete.id}`)
      toast.success('Demande de résidence supprimée avec succès')
      setShowDeleteModal(false)
      setApplicationToDelete(null)
      fetchApplications()
      if (showDetailsModal && applicationDetails && applicationDetails.id === applicationToDelete.id) {
        setShowDetailsModal(false)
        setApplicationDetails(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const openDeleteModal = (application) => {
    setApplicationToDelete(application)
    setShowDeleteModal(true)
  }

  const handleApproveDocument = async (document) => {
    try {
      await api.post(`/documents/${document.id}/approve`)
      toast.success('Document approuvé')
      if (applicationDetails) {
        fetchApplicationDetails(applicationDetails.id)
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
      if (applicationDetails) {
        fetchApplicationDetails(applicationDetails.id)
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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente', icon: FiClock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approuvé', icon: FiCheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeté', icon: FiXCircle },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const openEditModal = (application) => {
    setSelectedApplication(application)
    setStatus(application.status)
    setNotes(application.notes || '')
    setRejectionReason(application.rejection_reason || '')
    setShowEditModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { variant: 'warning', icon: FiClock, label: 'En attente' },
      in_progress: { variant: 'primary', icon: FiClock, label: 'En cours' },
      approved: { variant: 'success', icon: FiCheckCircle, label: 'Approuvée' },
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
              Demandes de résidence au Canada
            </h1>
            <p className="text-neutral-600">
              Gérez toutes les demandes de résidence permanente au Canada
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} icon={FiXIcon}>
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
                  {[filterStatus, dateFrom, dateTo, searchQuery].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

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

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input">
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="approved">Approuvée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin</label>
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

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <FiHome className="mx-auto text-6xl text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg">Aucune demande de résidence</p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiHome className="text-xl sm:text-2xl text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                            {application.user?.name || 'Client inconnu'}
                          </h3>
                          <div className="flex-shrink-0 sm:ml-4">
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 truncate mb-2">{application.user?.email}</p>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500">
                          <span>{new Date(application.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => fetchApplicationDetails(application.id)}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      <FiEye className="mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Voir les détails</span>
                      <span className="sm:hidden">Détails</span>
                    </Button>
                    <Button
                      onClick={() => openEditModal(application)}
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => openDeleteModal(application)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto justify-center"
                    >
                      <FiTrash2 className="mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Supprimer</span>
                      <span className="sm:hidden">Suppr.</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal Détails avec Documents */}
        {showDetailsModal && applicationDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => {
            setShowDetailsModal(false)
            setApplicationDetails(null)
          }}>
            <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-start mb-4 sm:mb-6 gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">
                      Détails de la demande
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500">Informations complètes et documents</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setApplicationDetails(null)
                    }}
                    className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                    aria-label="Fermer"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Informations de la demande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-transparent border-primary-100">
                    <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">Client</h3>
                    <p className="text-lg font-bold text-neutral-900 mb-1">{applicationDetails.user?.name}</p>
                    <p className="text-sm text-neutral-600">{applicationDetails.user?.email}</p>
                  </Card>
                  <Card padding="lg" className="bg-gradient-to-br from-accent-50 to-transparent border-accent-100">
                    <h3 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">Pays</h3>
                    <p className="text-lg font-bold text-neutral-900">Canada</p>
                  </Card>
                  <Card padding="lg" className="bg-neutral-50 border-neutral-200">
                    <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Statut</h3>
                    <div className="mt-1">{getStatusBadge(applicationDetails.status)}</div>
                  </Card>
                  <Card padding="lg" className="bg-neutral-50 border-neutral-200">
                    <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Date de création</h3>
                    <p className="text-lg font-semibold text-neutral-900 mt-1">
                      {new Date(applicationDetails.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </Card>
                  {applicationDetails.client_notified_at && (
                    <Card padding="lg" className="bg-green-50 border-green-200">
                      <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Client notifié</h3>
                      <p className="text-sm font-semibold text-green-900 mt-1">
                        {new Date(applicationDetails.client_notified_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </Card>
                  )}
                  {(applicationDetails.current_residence_country || applicationDetails.residence_type_requested || applicationDetails.family_members_count || applicationDetails.employment_status || applicationDetails.financial_situation) && (
                    <div className="col-span-1 md:col-span-2">
                      <Card padding="lg" className="bg-purple-50/50 border-purple-200">
                        <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3">Informations supplémentaires</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {applicationDetails.current_residence_country && (
                            <div>
                              <p className="text-xs text-neutral-600 mb-1">Pays de résidence actuel</p>
                              <p className="text-sm font-semibold text-neutral-900">{applicationDetails.current_residence_country}</p>
                            </div>
                          )}
                          {applicationDetails.residence_type_requested && (
                            <div>
                              <p className="text-xs text-neutral-600 mb-1">Type de résidence demandé</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {applicationDetails.residence_type_requested === 'permanent' ? 'Résidence permanente' : 'Résidence temporaire'}
                              </p>
                            </div>
                          )}
                          {applicationDetails.family_members_count !== undefined && applicationDetails.family_members_count !== null && (
                            <div>
                              <p className="text-xs text-neutral-600 mb-1">Nombre de membres de la famille</p>
                              <p className="text-sm font-semibold text-neutral-900">{applicationDetails.family_members_count}</p>
                            </div>
                          )}
                          {applicationDetails.employment_status && (
                            <div>
                              <p className="text-xs text-neutral-600 mb-1">Statut d'emploi</p>
                              <p className="text-sm font-semibold text-neutral-900">{applicationDetails.employment_status}</p>
                            </div>
                          )}
                          {applicationDetails.financial_situation && (
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-xs text-neutral-600 mb-1">Situation financière</p>
                              <p className="text-sm font-semibold text-neutral-900">{applicationDetails.financial_situation}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                  {applicationDetails.notes && (
                    <div className="col-span-1 md:col-span-2">
                      <Card padding="lg" className="bg-amber-50/50 border-amber-200">
                        <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Notes</h3>
                        <p className="text-sm text-neutral-900 leading-relaxed">{applicationDetails.notes}</p>
                      </Card>
                    </div>
                  )}
                  {applicationDetails.rejection_reason && (
                    <div className="col-span-1 md:col-span-2">
                      <Card padding="lg" className="bg-red-50 border-red-200">
                        <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Raison du rejet</h3>
                        <p className="text-sm text-red-700 leading-relaxed">{applicationDetails.rejection_reason}</p>
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
                          {applicationDetails.documents?.length || 0} document(s) disponible(s)
                        </p>
                        {applicationDetails.documents && applicationDetails.documents.length > 0 && (
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span className="text-neutral-600">
                                {applicationDetails.documents.filter(d => d.status === 'pending').length} en attente
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-neutral-600">
                                {applicationDetails.documents.filter(d => d.status === 'approved').length} approuvé(s)
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="text-neutral-600">
                                {applicationDetails.documents.filter(d => d.status === 'rejected').length} rejeté(s)
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
                  {applicationDetails.documents && applicationDetails.documents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {applicationDetails.documents.map((document) => (
                        <Card
                          key={document.id}
                          hover
                          className="p-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center flex-shrink-0 shadow-md">
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
                      <p className="text-sm text-neutral-500">Aucun document fourni pour cette demande</p>
                    </Card>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-neutral-200">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setApplicationDetails(null)
                    }}
                  >
                    Fermer
                  </Button>
                  {applicationDetails.status === 'approved' && !applicationDetails.client_notified_at && (
                    <Button
                      variant="success"
                      onClick={() => handleNotifyClient(applicationDetails)}
                      icon={FiBell}
                    >
                      Notifier le client
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailsModal(false)
                      openEditModal(applicationDetails)
                    }}
                  >
                    Modifier le statut
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDetailsModal(false)
                      openDeleteModal(applicationDetails)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 className="mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && applicationToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="max-w-md w-full p-8 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Supprimer la demande</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer la demande de résidence du client <span className="font-semibold">{applicationToDelete.user?.name || 'inconnu'}</span> ?
              </p>
              {applicationToDelete.documents && applicationToDelete.documents.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Attention : Cette demande contient {applicationToDelete.documents.length} document{applicationToDelete.documents.length > 1 ? 's' : ''}.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Tous les documents associés seront également supprimés.
                  </p>
                </div>
              )}
              <p className="text-sm text-red-600 mb-6">
                ⚠️ Cette action est irréversible. La demande et tous ses documents seront définitivement supprimés.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setApplicationToDelete(null)
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeleteApplication}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <FiTrash2 className="mr-2" />
                  Supprimer
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal d'édition */}
        {showEditModal && selectedApplication && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false)
              setSelectedApplication(null)
            }}
          >
            <Card
              className="max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Modifier le statut</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedApplication(null)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateStatus(); }} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Statut *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Sélectionnez un statut</option>
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="approved">Approuvée</option>
                    <option value="rejected">Rejetée</option>
                  </select>
                </div>

                {status === 'rejected' && (
                  <div className="form-group">
                    <label className="form-label">Raison du rejet *</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="4"
                      className="input resize-none"
                      placeholder="Expliquez la raison du rejet (minimum 10 caractères)"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="input resize-none"
                    placeholder="Notes internes..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedApplication(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal de rejet de document */}
        {showRejectModal && selectedDocument && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowRejectModal(false)
              setSelectedDocument(null)
            }}
          >
            <Card
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Rejeter le document</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedDocument(null)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleRejectDocument(); }} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Raison du rejet *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    className="input resize-none"
                    placeholder="Expliquez la raison du rejet (minimum 10 caractères)"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedDocument(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="error">
                    Rejeter
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal de prévisualisation */}
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

export default AdminResidenceApplications

