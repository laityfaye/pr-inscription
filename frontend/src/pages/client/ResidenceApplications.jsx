import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiCheckCircle, FiClock, FiXCircle, FiHome, FiCalendar, FiFileText, FiX, FiUser, FiMapPin, FiFile, FiAlertCircle, FiUpload, FiEye, FiDownload, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const ClientResidenceApplications = () => {
  const [applications, setApplications] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [editingApplication, setEditingApplication] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [formData, setFormData] = useState({
    current_residence_country: '',
    residence_type: '',
    family_members: [],
    employment_status: '',
    financial_situation: '',
  })
  const [newFamilyMember, setNewFamilyMember] = useState({ name: '', relationship: '', age: '' })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/residence-applications')
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching residence applications:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post('/residence-applications', {
        ...formData,
        family_members: formData.family_members.length > 0 ? formData.family_members : null,
      })
      toast.success('Demande de résidence créée avec succès')
      setShowModal(false)
      setFormData({
        current_residence_country: '',
        residence_type: '',
        family_members: [],
        employment_status: '',
        financial_situation: '',
      })
      fetchApplications()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingApplication) return
    try {
      await api.put(`/residence-applications/${editingApplication.id}`, {
        ...formData,
        family_members: formData.family_members.length > 0 ? formData.family_members : null,
      })
      toast.success('Demande modifiée avec succès')
      setShowEditModal(false)
      setEditingApplication(null)
      setFormData({
        current_residence_country: '',
        residence_type: '',
        family_members: [],
        employment_status: '',
        financial_situation: '',
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de résidence ?')) {
      return
    }
    try {
      await api.delete(`/residence-applications/${application.id}`)
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
      current_residence_country: application.current_residence_country || '',
      residence_type: application.residence_type || '',
      family_members: application.family_members || [],
      employment_status: application.employment_status || '',
      financial_situation: application.financial_situation || '',
    })
    setShowEditModal(true)
  }

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relationship) {
      setFormData({
        ...formData,
        family_members: [...formData.family_members, { ...newFamilyMember, age: newFamilyMember.age || null }],
      })
      setNewFamilyMember({ name: '', relationship: '', age: '' })
    }
  }

  const removeFamilyMember = (index) => {
    setFormData({
      ...formData,
      family_members: formData.family_members.filter((_, i) => i !== index),
    })
  }

  const fetchApplicationDetails = async (applicationId) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/residence-applications/${applicationId}`)
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
              Demandes de résidence au Canada
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Gérez vos demandes de résidence permanente au Canada
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
              <FiHome className="mx-auto text-6xl text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg mb-2">Aucune demande de résidence</p>
              <p className="text-neutral-500 text-sm">Créez votre première demande de résidence au Canada</p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiHome className="text-xl sm:text-2xl text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                            Demande de résidence au Canada
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
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
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
                  <FiHome className="text-primary-600" />
                  Modifier la demande de résidence
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
                <Input
                  type="text"
                  label="Pays de résidence actuel"
                  value={formData.current_residence_country}
                  onChange={(e) => setFormData({ ...formData, current_residence_country: e.target.value })}
                  icon={FiMapPin}
                  placeholder="Ex: Sénégal"
                />

                <div className="form-group">
                  <label className="form-label">Type de résidence souhaité</label>
                  <select
                    value={formData.residence_type}
                    onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                    className="input"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="permanent">Résidence permanente</option>
                    <option value="temporary">Résidence temporaire</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Membres de la famille (optionnel)</label>
                  <div className="space-y-2 mb-2">
                    {formData.family_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                        <span className="flex-1 text-sm">
                          {member.name} - {member.relationship} {member.age && `(${member.age} ans)`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="text"
                      placeholder="Nom"
                      value={newFamilyMember.name}
                      onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Relation"
                      value={newFamilyMember.relationship}
                      onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Âge"
                        value={newFamilyMember.age}
                        onChange={(e) => setNewFamilyMember({ ...newFamilyMember, age: e.target.value })}
                      />
                      <Button type="button" onClick={addFamilyMember} variant="secondary" size="sm">
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statut d'emploi</label>
                  <textarea
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    rows="3"
                    placeholder="Décrivez votre situation professionnelle actuelle..."
                    className="input resize-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Situation financière</label>
                  <textarea
                    value={formData.financial_situation}
                    onChange={(e) => setFormData({ ...formData, financial_situation: e.target.value })}
                    rows="3"
                    placeholder="Décrivez votre situation financière..."
                    className="input resize-none"
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
                  <FiHome className="text-primary-600" />
                  Nouvelle demande de résidence au Canada
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-6">
                <Input
                  type="text"
                  label="Pays de résidence actuel"
                  value={formData.current_residence_country}
                  onChange={(e) => setFormData({ ...formData, current_residence_country: e.target.value })}
                  icon={FiMapPin}
                  placeholder="Ex: Sénégal"
                />

                <div className="form-group">
                  <label className="form-label">Type de résidence souhaité</label>
                  <select
                    value={formData.residence_type}
                    onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                    className="input"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="permanent">Résidence permanente</option>
                    <option value="temporary">Résidence temporaire</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Membres de la famille (optionnel)</label>
                  <div className="space-y-2 mb-2">
                    {formData.family_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                        <span className="flex-1 text-sm">
                          {member.name} - {member.relationship} {member.age && `(${member.age} ans)`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="text"
                      placeholder="Nom"
                      value={newFamilyMember.name}
                      onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Relation"
                      value={newFamilyMember.relationship}
                      onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Âge"
                        value={newFamilyMember.age}
                        onChange={(e) => setNewFamilyMember({ ...newFamilyMember, age: e.target.value })}
                      />
                      <Button type="button" onClick={addFamilyMember} variant="secondary" size="sm">
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statut d'emploi</label>
                  <textarea
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    rows="3"
                    placeholder="Décrivez votre situation professionnelle actuelle..."
                    className="input resize-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Situation financière</label>
                  <textarea
                    value={formData.financial_situation}
                    onChange={(e) => setFormData({ ...formData, financial_situation: e.target.value })}
                    rows="3"
                    placeholder="Décrivez votre situation financière..."
                    className="input resize-none"
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
                  <h2 className="text-xl font-bold text-gray-900">Détails de la demande de résidence</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Résidence au Canada</p>
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
                  {selectedApplication.current_residence_country && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center mb-2">
                        <FiMapPin className="w-4 h-4 text-blue-600 mr-2" />
                        <h3 className="text-sm font-semibold text-gray-900">Pays de résidence actuel</h3>
                      </div>
                      <p className="text-sm text-gray-700">{selectedApplication.current_residence_country}</p>
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

                {/* Type de résidence */}
                {selectedApplication.residence_type && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center mb-3">
                      <FiHome className="w-4 h-4 text-green-600 mr-2" />
                      <h3 className="text-base font-semibold text-gray-900">Type de résidence</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedApplication.residence_type === 'permanent' ? 'Résidence permanente' : 'Résidence temporaire'}
                    </p>
                  </div>
                )}

                {/* Membres de la famille */}
                {selectedApplication.family_members && selectedApplication.family_members.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center mb-3">
                      <FiUser className="w-4 h-4 text-purple-600 mr-2" />
                      <h3 className="text-base font-semibold text-gray-900">Membres de la famille</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedApplication.family_members.map((member, index) => (
                        <div key={index} className="text-sm text-gray-700 p-2 bg-white rounded border border-purple-100">
                          {member.name} - {member.relationship} {member.age && `(${member.age} ans)`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statut d'emploi */}
                {selectedApplication.employment_status && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-center mb-2">
                      <FiFileText className="w-4 h-4 text-yellow-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Statut d'emploi</h3>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.employment_status}</p>
                  </div>
                )}

                {/* Situation financière */}
                {selectedApplication.financial_situation && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-center mb-2">
                      <FiFileText className="w-4 h-4 text-yellow-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Situation financière</h3>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.financial_situation}</p>
                  </div>
                )}

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

export default ClientResidenceApplications

