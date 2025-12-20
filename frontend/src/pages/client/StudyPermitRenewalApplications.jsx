import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiCheckCircle, FiClock, FiXCircle, FiFileText, FiCalendar, FiX, FiMapPin, FiFile, FiAlertCircle, FiEye, FiDownload, FiEdit, FiTrash2, FiArrowRight, FiUpload, FiBook, FiGlobe } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const ClientStudyPermitRenewalApplications = () => {
  const [applications, setApplications] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [editingApplication, setEditingApplication] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [formData, setFormData] = useState({
    arrival_date: '',
    institution_name: '',
    expiration_date: '',
    address: '',
    address_number: '',
    country: 'Canada',
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/study-permit-renewal-applications')
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching study permit renewal applications:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post('/study-permit-renewal-applications', formData)
      toast.success('Demande de renouvellement créée avec succès')
      setShowModal(false)
      setFormData({
        arrival_date: '',
        institution_name: '',
        expiration_date: '',
        address: '',
        address_number: '',
        country: 'Canada',
      })
      fetchApplications()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingApplication) return
    try {
      await api.put(`/study-permit-renewal-applications/${editingApplication.id}`, formData)
      toast.success('Demande modifiée avec succès')
      setShowEditModal(false)
      setEditingApplication(null)
      setFormData({
        arrival_date: '',
        institution_name: '',
        expiration_date: '',
        address: '',
        address_number: '',
        country: 'Canada',
      })
      fetchApplications()
      if (showDetailsModal && selectedApplication?.id === editingApplication.id) {
        fetchApplicationDetails(editingApplication.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async (application) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de renouvellement ?')) {
      return
    }
    try {
      await api.delete(`/study-permit-renewal-applications/${application.id}`)
      toast.success('Demande supprimée avec succès')
      fetchApplications()
      if (showDetailsModal && selectedApplication?.id === application.id) {
        setShowDetailsModal(false)
        setSelectedApplication(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (application) => {
    if (application.status !== 'pending') {
      toast.error('Seules les demandes en attente peuvent être modifiées')
      return
    }
    setEditingApplication(application)
    setFormData({
      arrival_date: application.arrival_date || '',
      institution_name: application.institution_name || '',
      expiration_date: application.expiration_date || '',
      address: application.address || '',
      address_number: application.address_number || '',
      country: application.country || 'Canada',
    })
    setShowEditModal(true)
  }

  const fetchApplicationDetails = async (applicationId) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/study-permit-renewal-applications/${applicationId}`)
      setSelectedApplication(response.data)
      setShowDetailsModal(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des détails')
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'En attente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiClock, label: 'En cours' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'Approuvée' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Rejetée' },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="mr-1" />
        {badge.label}
      </span>
    )
  }

  const getDocumentStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approuvé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeté' },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const handleViewDocument = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/view`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: doc.mime_type || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du document')
    }
  }

  const handleDownload = async (doc) => {
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
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
              Demandes de renouvellement CAQ/Permis d'études
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Gérez vos demandes de renouvellement de CAQ ou de permis d'études au Canada
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="lg"
            icon={FiPlus}
            className="w-full sm:w-auto justify-center"
          >
            <span className="hidden sm:inline">Nouvelle demande</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <FiFileText className="mx-auto text-6xl text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg mb-2">Aucune demande de renouvellement</p>
              <p className="text-neutral-500 text-sm">Créez votre première demande de renouvellement</p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiFileText className="text-xl sm:text-2xl text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                            Renouvellement CAQ/Permis d'études - {application.country || 'Canada'}
                          </h3>
                          <div className="flex-shrink-0 sm:ml-4">{getStatusBadge(application.status)}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          {application.submitted_at && (
                            <span className="flex items-center gap-1">
                              <FiFileText className="w-4 h-4" />
                              Soumise le {new Date(application.submitted_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {application.institution_name && (
                            <span className="flex items-center gap-1">
                              <FiBook className="w-4 h-4" />
                              {application.institution_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {application.rejection_reason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FiAlertCircle className="text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Raison du rejet :</p>
                            <p className="text-sm text-red-700 mt-1">{application.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleEdit(application)}
                          variant="secondary"
                          size="sm"
                          icon={FiEdit}
                          title="Modifier"
                          className="w-full sm:w-auto justify-center !p-2 sm:!p-2"
                        />
                        <Button
                          onClick={() => handleDelete(application)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto justify-center !p-2 sm:!p-2"
                          icon={FiTrash2}
                          title="Supprimer"
                        />
                      </>
                    )}
                    <Button
                      onClick={() => fetchApplicationDetails(application.id)}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      <span className="hidden sm:inline">Voir les détails</span>
                      <span className="sm:hidden">Détails</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal de modification */}
        {showEditModal && editingApplication && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false)
              setEditingApplication(null)
            }}
          >
            <Card
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <FiFileText className="text-accent-600" />
                  Modifier la demande de renouvellement
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingApplication(null)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Pays *</label>
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    icon={FiGlobe}
                    placeholder="Canada"
                    required
                  />
                  <p className="form-helper">Par défaut: Canada</p>
                </div>

                <Input
                  type="date"
                  label="Date d'arrivée au Canada"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  icon={FiCalendar}
                />

                <Input
                  type="text"
                  label="Nom de l'établissement"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  icon={FiBook}
                  placeholder="Ex: Université de Montréal"
                />

                <Input
                  type="date"
                  label="Date d'expiration"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  icon={FiCalendar}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Adresse domicile"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    icon={FiMapPin}
                    placeholder="Ex: 123 Rue de la Paix"
                  />
                  <Input
                    type="text"
                    label="Numéro"
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                    placeholder="Ex: Apt 4B"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button type="button" variant="secondary" onClick={() => {
                    setShowEditModal(false)
                    setEditingApplication(null)
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal de création */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <Card
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <FiFileText className="text-accent-600" />
                  Nouvelle demande de renouvellement
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Pays *</label>
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    icon={FiGlobe}
                    placeholder="Canada"
                    required
                  />
                  <p className="form-helper">Par défaut: Canada</p>
                </div>

                <Input
                  type="date"
                  label="Date d'arrivée au Canada"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  icon={FiCalendar}
                />

                <Input
                  type="text"
                  label="Nom de l'établissement"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  icon={FiBook}
                  placeholder="Ex: Université de Montréal"
                />

                <Input
                  type="date"
                  label="Date d'expiration"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  icon={FiCalendar}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Adresse domicile"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    icon={FiMapPin}
                    placeholder="Ex: 123 Rue de la Paix"
                  />
                  <Input
                    type="text"
                    label="Numéro"
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                    placeholder="Ex: Apt 4B"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Créer la demande
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal de détails */}
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
            <Card className="max-w-4xl w-full p-6 animate-scale-in my-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails de la demande de renouvellement</h2>
                  <p className="text-xs text-gray-500 mt-0.5">CAQ/Permis d'études - {selectedApplication.country || 'Canada'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedApplication(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Statut */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-700">Statut</span>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/* Informations générales */}
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedApplication.country && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center mb-2">
                        <FiGlobe className="w-4 h-4 text-blue-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Pays</h3>
                      </div>
                      <p className="text-sm text-gray-700">{selectedApplication.country}</p>
                    </div>
                  )}

                  {selectedApplication.arrival_date && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center mb-2">
                        <FiCalendar className="w-4 h-4 text-purple-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Date d'arrivée au Canada</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedApplication.arrival_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}

                  {selectedApplication.institution_name && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center mb-2">
                        <FiBook className="w-4 h-4 text-green-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Nom de l'établissement</h3>
                      </div>
                      <p className="text-sm text-gray-700">{selectedApplication.institution_name}</p>
                    </div>
                  )}

                  {selectedApplication.expiration_date && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                      <div className="flex items-center mb-2">
                        <FiCalendar className="w-4 h-4 text-orange-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Date d'expiration</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedApplication.expiration_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}

                  {(selectedApplication.address || selectedApplication.address_number) && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 md:col-span-2">
                      <div className="flex items-center mb-2">
                        <FiMapPin className="w-4 h-4 text-indigo-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Adresse domicile</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        {selectedApplication.address_number && `${selectedApplication.address_number} `}
                        {selectedApplication.address}
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="w-4 h-4 text-purple-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Date de création</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedApplication.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedApplication.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-center mb-2">
                      <FiFileText className="w-4 h-4 text-yellow-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Notes de l'administrateur</h3>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.notes}</p>
                  </div>
                )}

                {/* Raison du rejet */}
                {selectedApplication.rejection_reason && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 mb-1">Raison du rejet</p>
                        <p className="text-sm text-red-700">{selectedApplication.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <FiFile className="w-4 h-4 text-gray-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Documents fournis</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedApplication.documents?.length || 0} document(s) disponible(s)
                      </p>
                    </div>
                    <div className="ml-4">
                      <Link to="/client/documents">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={FiArrowRight}
                        >
                          Voir mes documents
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedApplication.documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FiFile className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">{doc.name}</span>
                              {getDocumentStatusBadge(doc.status || 'pending')}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Visualiser"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <FiDownload className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              <span className="font-medium">Date d'upload:</span>{' '}
                              {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            {doc.rejection_reason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-red-800 mb-1">Raison du rejet:</p>
                                    <p className="text-xs text-red-700">{doc.rejection_reason}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FiFile className="mx-auto text-4xl text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 mb-3">Aucun document fourni pour cette demande</p>
                      <Link to="/client/documents">
                        <Button variant="primary" size="sm" icon={FiUpload}>
                          Uploader un document
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedApplication(null)
                  }}
                >
                  Fermer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ClientStudyPermitRenewalApplications

