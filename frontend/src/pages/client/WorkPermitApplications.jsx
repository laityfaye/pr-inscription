import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiCheckCircle, FiClock, FiXCircle, FiBriefcase, FiCalendar, FiFileText, FiX, FiGlobe, FiFile, FiAlertCircle, FiEye, FiDownload, FiEdit, FiTrash2, FiArrowRight, FiUpload, FiUser, FiPhone, FiMapPin, FiBook, FiMessageCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const ClientWorkPermitApplications = () => {
  const [applications, setApplications] = useState([])
  const [countries, setCountries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [editingApplication, setEditingApplication] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [formData, setFormData] = useState({
    work_permit_country_id: '',
    age: '',
    profession: '',
    experience_years: '',
    current_employer: '',
    phone_number: '',
    address: '',
    education_level: '',
    language_skills: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [applicationsRes, countriesRes] = await Promise.all([
        api.get('/work-permit-applications'),
        api.get('/work-permit-countries'),
      ])
      setApplications(applicationsRes.data)
      setCountries(countriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.work_permit_country_id) {
      toast.error('Veuillez sélectionner un pays')
      return
    }

    try {
      await api.post('/work-permit-applications', formData)
      toast.success('Demande de permis de travail créée avec succès')
      setShowModal(false)
      setFormData({
        work_permit_country_id: '',
        age: '',
        profession: '',
        experience_years: '',
        current_employer: '',
        phone_number: '',
        address: '',
        education_level: '',
        language_skills: '',
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingApplication) return
    try {
      await api.put(`/work-permit-applications/${editingApplication.id}`, formData)
      toast.success('Demande modifiée avec succès')
      setShowEditModal(false)
      setEditingApplication(null)
      setFormData({
        work_permit_country_id: '',
        age: '',
        profession: '',
        experience_years: '',
        current_employer: '',
        phone_number: '',
        address: '',
        education_level: '',
        language_skills: '',
      })
      fetchData()
      if (showDetailsModal && selectedApplication?.id === editingApplication.id) {
        fetchApplicationDetails(editingApplication.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async (application) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de permis de travail ?')) {
      return
    }
    try {
      await api.delete(`/work-permit-applications/${application.id}`)
      toast.success('Demande supprimée avec succès')
      fetchData()
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
      work_permit_country_id: application.work_permit_country_id || '',
      age: application.age || '',
      profession: application.profession || '',
      experience_years: application.experience_years || '',
      current_employer: application.current_employer || '',
      phone_number: application.phone_number || '',
      address: application.address || '',
      education_level: application.education_level || '',
      language_skills: application.language_skills || '',
    })
    setShowEditModal(true)
  }

  const fetchApplicationDetails = async (applicationId) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/work-permit-applications/${applicationId}`)
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
              Demandes de permis de travail
            </h1>
            <p className="text-neutral-600">
              Gérez vos demandes de permis de travail
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="lg"
            icon={FiPlus}
            disabled={countries.length === 0}
          >
            Nouvelle demande
          </Button>
        </div>

        {countries.length === 0 && (
          <Card className="p-6 mb-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Aucun pays disponible</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Aucun pays n'est actuellement configuré pour les demandes de permis de travail. Contactez l'administrateur.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <FiBriefcase className="mx-auto text-6xl text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg mb-2">Aucune demande de permis de travail</p>
              <p className="text-neutral-500 text-sm">Créez votre première demande de permis de travail</p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <FiBriefcase className="text-2xl text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">
                          Permis de travail - {application.country?.name || 'Pays inconnu'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
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
                  <div className="flex items-center gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleEdit(application)}
                          variant="secondary"
                          size="sm"
                          icon={FiEdit}
                          title="Modifier"
                          className="!p-2"
                        />
                        <Button
                          onClick={() => handleDelete(application)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 !p-2"
                          icon={FiTrash2}
                          title="Supprimer"
                        />
                      </>
                    )}
                    <Button
                      onClick={() => fetchApplicationDetails(application.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Voir les détails
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
                  <FiBriefcase className="text-primary-600" />
                  Modifier la demande de permis de travail
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
                  <select
                    value={formData.work_permit_country_id}
                    onChange={(e) => setFormData({ ...formData, work_permit_country_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Sélectionnez un pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} {country.subtitle && `- ${country.subtitle}`}
                      </option>
                    ))}
                  </select>
                  <p className="form-helper">
                    Sélectionnez le pays pour lequel vous souhaitez demander un permis de travail
                  </p>
                </div>

                {formData.work_permit_country_id && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    {(() => {
                      const selectedCountry = countries.find(c => c.id === parseInt(formData.work_permit_country_id))
                      if (!selectedCountry) return null
                      return (
                        <div className="space-y-3">
                          {selectedCountry.description && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Description</p>
                              <p className="text-sm text-neutral-600">{selectedCountry.description}</p>
                            </div>
                          )}
                          {selectedCountry.eligibility_conditions && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Conditions d'éligibilité</p>
                              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{selectedCountry.eligibility_conditions}</p>
                            </div>
                          )}
                          {selectedCountry.required_documents && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Documents requis</p>
                              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{selectedCountry.required_documents}</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Informations personnelles */}
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <FiUser className="text-primary-600" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Âge</label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Ex: 28"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Profession</label>
                      <Input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ex: Ingénieur, Médecin, Enseignant..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Années d'expérience</label>
                      <Input
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        placeholder="Ex: 5"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employeur actuel</label>
                      <Input
                        type="text"
                        value={formData.current_employer}
                        onChange={(e) => setFormData({ ...formData, current_employer: e.target.value })}
                        placeholder="Ex: Nom de l'entreprise"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Numéro de téléphone</label>
                      <Input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Ex: +212 6XX XXX XXX"
                        icon={FiPhone}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Niveau d'éducation</label>
                      <select
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        className="input"
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="bac">Baccalauréat</option>
                        <option value="licence">Licence</option>
                        <option value="master">Master</option>
                        <option value="doctorat">Doctorat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      placeholder="Votre adresse complète..."
                      className="input resize-none"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compétences linguistiques</label>
                    <textarea
                      value={formData.language_skills}
                      onChange={(e) => setFormData({ ...formData, language_skills: e.target.value })}
                      rows="3"
                      placeholder="Ex: Français (courant), Anglais (intermédiaire), Arabe (natif)..."
                      className="input resize-none"
                    />
                    <p className="form-helper">
                      Indiquez vos compétences linguistiques et niveaux
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button type="button" variant="secondary" onClick={() => {
                    setShowEditModal(false)
                    setEditingApplication(null)
                    setFormData({
                      work_permit_country_id: '',
                      age: '',
                      profession: '',
                      experience_years: '',
                      current_employer: '',
                      phone_number: '',
                      address: '',
                      education_level: '',
                      language_skills: '',
                    })
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
                  <FiBriefcase className="text-primary-600" />
                  Nouvelle demande de permis de travail
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
                  <select
                    value={formData.work_permit_country_id}
                    onChange={(e) => setFormData({ ...formData, work_permit_country_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Sélectionnez un pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} {country.subtitle && `- ${country.subtitle}`}
                      </option>
                    ))}
                  </select>
                  <p className="form-helper">
                    Sélectionnez le pays pour lequel vous souhaitez demander un permis de travail
                  </p>
                </div>

                {formData.work_permit_country_id && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    {(() => {
                      const selectedCountry = countries.find(c => c.id === parseInt(formData.work_permit_country_id))
                      if (!selectedCountry) return null
                      return (
                        <div className="space-y-3">
                          {selectedCountry.description && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Description</p>
                              <p className="text-sm text-neutral-600">{selectedCountry.description}</p>
                            </div>
                          )}
                          {selectedCountry.eligibility_conditions && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Conditions d'éligibilité</p>
                              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{selectedCountry.eligibility_conditions}</p>
                            </div>
                          )}
                          {selectedCountry.required_documents && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">Documents requis</p>
                              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{selectedCountry.required_documents}</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Informations personnelles */}
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <FiUser className="text-primary-600" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Âge</label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Ex: 28"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Profession</label>
                      <Input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ex: Ingénieur, Médecin, Enseignant..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Années d'expérience</label>
                      <Input
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        placeholder="Ex: 5"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Employeur actuel</label>
                      <Input
                        type="text"
                        value={formData.current_employer}
                        onChange={(e) => setFormData({ ...formData, current_employer: e.target.value })}
                        placeholder="Ex: Nom de l'entreprise"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Numéro de téléphone</label>
                      <Input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Ex: +212 6XX XXX XXX"
                        icon={FiPhone}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Niveau d'éducation</label>
                      <select
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        className="input"
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="bac">Baccalauréat</option>
                        <option value="licence">Licence</option>
                        <option value="master">Master</option>
                        <option value="doctorat">Doctorat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      placeholder="Votre adresse complète..."
                      className="input resize-none"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compétences linguistiques</label>
                    <textarea
                      value={formData.language_skills}
                      onChange={(e) => setFormData({ ...formData, language_skills: e.target.value })}
                      rows="3"
                      placeholder="Ex: Français (courant), Anglais (intermédiaire), Arabe (natif)..."
                      className="input resize-none"
                    />
                    <p className="form-helper">
                      Indiquez vos compétences linguistiques et niveaux
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button type="button" variant="secondary" onClick={() => {
                    setShowModal(false)
                    setFormData({
                      work_permit_country_id: '',
                      age: '',
                      profession: '',
                      experience_years: '',
                      current_employer: '',
                      phone_number: '',
                      address: '',
                      education_level: '',
                      language_skills: '',
                    })
                  }}>
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
                  <h2 className="text-xl font-bold text-gray-900">Détails de la demande de permis de travail</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedApplication.country?.name || 'Permis de travail'}</p>
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
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center mb-2">
                      <FiGlobe className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">Pays</h3>
                    </div>
                    <p className="text-sm text-gray-700">{selectedApplication.country?.name || 'Non spécifié'}</p>
                    {selectedApplication.country?.subtitle && (
                      <p className="text-xs text-gray-600 mt-1">{selectedApplication.country.subtitle}</p>
                    )}
                  </div>

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

                {/* Informations personnelles */}
                {(selectedApplication.age || selectedApplication.profession || selectedApplication.experience_years || selectedApplication.current_employer || selectedApplication.phone_number || selectedApplication.address || selectedApplication.education_level || selectedApplication.language_skills) && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center mb-3">
                      <FiUser className="w-4 h-4 text-purple-600 mr-2" />
                      <h3 className="text-base font-semibold text-gray-900">Informations personnelles</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedApplication.age && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Âge</p>
                          <p className="text-sm text-gray-700">{selectedApplication.age} ans</p>
                        </div>
                      )}
                      {selectedApplication.profession && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Profession</p>
                          <p className="text-sm text-gray-700">{selectedApplication.profession}</p>
                        </div>
                      )}
                      {selectedApplication.experience_years && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Années d'expérience</p>
                          <p className="text-sm text-gray-700">{selectedApplication.experience_years} ans</p>
                        </div>
                      )}
                      {selectedApplication.current_employer && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Employeur actuel</p>
                          <p className="text-sm text-gray-700">{selectedApplication.current_employer}</p>
                        </div>
                      )}
                      {selectedApplication.phone_number && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Numéro de téléphone</p>
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <FiPhone className="w-3 h-3" />
                            {selectedApplication.phone_number}
                          </p>
                        </div>
                      )}
                      {selectedApplication.education_level && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 font-medium">Niveau d'éducation</p>
                          <p className="text-sm text-gray-700">{selectedApplication.education_level}</p>
                        </div>
                      )}
                    </div>
                    {selectedApplication.address && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Adresse</p>
                        <p className="text-sm text-gray-700 flex items-start gap-1">
                          <FiMapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {selectedApplication.address}
                        </p>
                      </div>
                    )}
                    {selectedApplication.language_skills && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Compétences linguistiques</p>
                        <p className="text-sm text-gray-700 flex items-start gap-1">
                          <FiMessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {selectedApplication.language_skills}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Informations sur le pays */}
                {selectedApplication.country && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center mb-3">
                      <FiBriefcase className="w-4 h-4 text-green-600 mr-2" />
                      <h3 className="text-base font-semibold text-gray-900">Informations sur le pays</h3>
                    </div>
                    {selectedApplication.country.description && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Description</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.country.description}</p>
                      </div>
                    )}
                    {selectedApplication.country.eligibility_conditions && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Conditions d'éligibilité</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.country.eligibility_conditions}</p>
                      </div>
                    )}
                    {selectedApplication.country.required_documents && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1 font-medium">Documents requis</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.country.required_documents}</p>
                      </div>
                    )}
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

export default ClientWorkPermitApplications

