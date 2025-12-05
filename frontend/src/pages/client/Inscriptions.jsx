import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiCheckCircle, FiClock, FiXCircle, FiGlobe, FiCalendar, FiFileText, FiArrowRight, FiX, FiUser, FiBook, FiTarget, FiMapPin, FiFile, FiAlertCircle, FiUpload, FiEdit, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const ClientInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([])
  const [countries, setCountries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [editingInscription, setEditingInscription] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [formData, setFormData] = useState({
    country_id: '',
    current_education_level: '',
    current_field: '',
    requested_education_level: '',
    requested_field: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inscriptionsRes, countriesRes] = await Promise.all([
        api.get('/inscriptions'),
        api.get('/countries'),
      ])
      setInscriptions(inscriptionsRes.data)
      setCountries(countriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post('/inscriptions', formData)
      toast.success('Préinscription créée avec succès')
      setShowModal(false)
      setFormData({
        country_id: '',
        current_education_level: '',
        current_field: '',
        requested_education_level: '',
        requested_field: '',
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingInscription) return
    try {
      await api.put(`/inscriptions/${editingInscription.id}`, formData)
      toast.success('Préinscription modifiée avec succès')
      setShowEditModal(false)
      setEditingInscription(null)
      setFormData({
        country_id: '',
        current_education_level: '',
        current_field: '',
        requested_education_level: '',
        requested_field: '',
      })
      fetchData()
      if (showDetailsModal && selectedInscription?.id === editingInscription.id) {
        fetchInscriptionDetails(editingInscription.id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async (inscription) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette préinscription ?')) {
      return
    }
    try {
      await api.delete(`/inscriptions/${inscription.id}`)
      toast.success('Préinscription supprimée avec succès')
      fetchData()
      if (showDetailsModal && selectedInscription?.id === inscription.id) {
        setShowDetailsModal(false)
        setSelectedInscription(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (inscription) => {
    if (inscription.status !== 'pending') {
      toast.error('Seules les préinscriptions en attente peuvent être modifiées')
      return
    }
    setEditingInscription(inscription)
    setFormData({
      country_id: inscription.country_id || '',
      current_education_level: inscription.current_education_level || '',
      current_field: inscription.current_field || '',
      requested_education_level: inscription.requested_education_level || '',
      requested_field: inscription.requested_field || '',
    })
    setShowEditModal(true)
  }

  const educationLevels = [
    { value: 'bac', label: 'Baccalauréat' },
    { value: 'licence_1', label: 'Licence 1' },
    { value: 'licence_2', label: 'Licence 2' },
    { value: 'licence_3', label: 'Licence 3' },
    { value: 'master_1', label: 'Master 1' },
    { value: 'master_2', label: 'Master 2' },
  ]

  const fetchInscriptionDetails = async (inscriptionId) => {
    setLoadingDetails(true)
    try {
      const response = await api.get(`/inscriptions/${inscriptionId}`)
      setSelectedInscription(response.data)
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
      validated: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'Validée' },
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

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Mes préinscriptions 🌍
            </h1>
            <p className="text-xl text-gray-600">
              Gérez toutes vos demandes de préinscription
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <FiPlus className="mr-2" />
            Nouvelle préinscription
          </Button>
        </div>

        {/* Inscriptions List */}
        {inscriptions.length === 0 ? (
          <Card className="p-12 text-center animate-slide-up">
            <FiGlobe className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Aucune préinscription</p>
            <p className="text-gray-500 mb-6">Créez votre première préinscription pour commencer</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FiPlus className="mr-2" />
              Créer une préinscription
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {inscriptions.map((inscription, index) => (
              <Card
                key={inscription.id}
                hover
                className="p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left side */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FiGlobe className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {inscription.country?.name}
                        </h3>
                        {getStatusBadge(inscription.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" />
                          <span>
                            {new Date(inscription.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {inscription.current_education_level && (
                          <div className="flex items-center">
                            <FiFileText className="mr-2" />
                            <span>
                              Niveau actuel: {educationLevels.find(l => l.value === inscription.current_education_level)?.label || inscription.current_education_level}
                              {inscription.current_field && ` - ${inscription.current_field}`}
                            </span>
                          </div>
                        )}
                        {inscription.requested_education_level && (
                          <div className="flex items-center">
                            <FiFileText className="mr-2" />
                            <span>
                              Demande: {educationLevels.find(l => l.value === inscription.requested_education_level)?.label || inscription.requested_education_level}
                              {inscription.requested_field && ` - ${inscription.requested_field}`}
                            </span>
                          </div>
                        )}
                        {inscription.notes && (
                          <div className="flex items-center">
                            <FiFileText className="mr-2" />
                            <span className="truncate max-w-xs">{inscription.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex items-center space-x-2">
                    {inscription.status === 'pending' && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleEdit(inscription)}
                          icon={FiEdit}
                          title="Modifier"
                          className="!p-2"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(inscription)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 !p-2"
                          icon={FiTrash2}
                          title="Supprimer"
                        />
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fetchInscriptionDetails(inscription.id)}
                      disabled={loadingDetails}
                    >
                      Voir les détails
                      <FiArrowRight className="ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {showEditModal && editingInscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <Card className="max-w-3xl w-full p-6 animate-scale-in my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modifier la préinscription</h2>
                <p className="text-xs text-gray-500 mt-0.5">Modifiez les informations ci-dessous</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingInscription(null)
                  setFormData({
                    country_id: '',
                    current_education_level: '',
                    current_field: '',
                    requested_education_level: '',
                    requested_field: '',
                  })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Section Pays */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                    <FiMapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Destination</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Sélectionnez un pays <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country_id}
                    onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                    className="input w-full bg-white text-sm py-2"
                    required
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Situation actuelle */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Votre situation actuelle</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Niveau d'étude actuel
                    </label>
                    <select
                      value={formData.current_education_level}
                      onChange={(e) => setFormData({ ...formData, current_education_level: e.target.value })}
                      className="input w-full bg-white text-sm py-2"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {educationLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Filière actuelle
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Informatique, Commerce, Droit..."
                      value={formData.current_field}
                      onChange={(e) => setFormData({ ...formData, current_field: e.target.value })}
                      className="bg-white text-sm py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section Demande */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                    <FiTarget className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Votre demande</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Niveau d'étude demandé
                    </label>
                    <select
                      value={formData.requested_education_level}
                      onChange={(e) => setFormData({ ...formData, requested_education_level: e.target.value })}
                      className="input w-full bg-white text-sm py-2"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {educationLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Filière demandée
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Informatique, Commerce, Droit..."
                      value={formData.requested_field}
                      onChange={(e) => setFormData({ ...formData, requested_field: e.target.value })}
                      className="bg-white text-sm py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-5 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingInscription(null)
                  setFormData({
                    country_id: '',
                    current_education_level: '',
                    current_field: '',
                    requested_education_level: '',
                    requested_field: '',
                  })
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={!formData.country_id}
              >
                <FiEdit className="mr-2" />
                Enregistrer les modifications
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <Card className="max-w-3xl w-full p-6 animate-scale-in my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nouvelle préinscription</h2>
                <p className="text-xs text-gray-500 mt-0.5">Remplissez les informations ci-dessous</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFormData({
                    country_id: '',
                    current_education_level: '',
                    current_field: '',
                    requested_education_level: '',
                    requested_field: '',
                  })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Section Pays */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                    <FiMapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Destination</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Sélectionnez un pays <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country_id}
                    onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                    className="input w-full bg-white text-sm py-2"
                    required
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Situation actuelle */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Votre situation actuelle</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Niveau d'étude actuel
                    </label>
                    <select
                      value={formData.current_education_level}
                      onChange={(e) => setFormData({ ...formData, current_education_level: e.target.value })}
                      className="input w-full bg-white text-sm py-2"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {educationLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Filière actuelle
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Informatique, Commerce, Droit..."
                      value={formData.current_field}
                      onChange={(e) => setFormData({ ...formData, current_field: e.target.value })}
                      className="bg-white text-sm py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section Demande */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                    <FiTarget className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Votre demande</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Niveau d'étude demandé
                    </label>
                    <select
                      value={formData.requested_education_level}
                      onChange={(e) => setFormData({ ...formData, requested_education_level: e.target.value })}
                      className="input w-full bg-white text-sm py-2"
                    >
                      <option value="">Sélectionner un niveau</option>
                      {educationLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Filière demandée
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Informatique, Commerce, Droit..."
                      value={formData.requested_field}
                      onChange={(e) => setFormData({ ...formData, requested_field: e.target.value })}
                      className="bg-white text-sm py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-5 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false)
                  setFormData({
                    country_id: '',
                    current_education_level: '',
                    current_field: '',
                    requested_education_level: '',
                    requested_field: '',
                  })
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!formData.country_id}
              >
                <FiPlus className="mr-2" />
                Créer la préinscription
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedInscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <Card className="max-w-4xl w-full p-6 animate-scale-in my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails de la préinscription</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedInscription.country?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedInscription(null)
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
                {getStatusBadge(selectedInscription.status)}
              </div>

              {/* Informations générales */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-2">
                    <FiMapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">Pays</h3>
                  </div>
                  <p className="text-sm text-gray-700">{selectedInscription.country?.name || 'Non spécifié'}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center mb-2">
                    <FiCalendar className="w-4 h-4 text-purple-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">Date de création</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedInscription.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Situation actuelle */}
              {(selectedInscription.current_education_level || selectedInscription.current_field) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center mb-3">
                    <FiUser className="w-4 h-4 text-purple-600 mr-2" />
                    <h3 className="text-base font-semibold text-gray-900">Situation actuelle</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedInscription.current_education_level && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Niveau d'étude</p>
                        <p className="text-sm font-medium text-gray-900">
                          {educationLevels.find(l => l.value === selectedInscription.current_education_level)?.label || selectedInscription.current_education_level}
                        </p>
                      </div>
                    )}
                    {selectedInscription.current_field && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Filière</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInscription.current_field}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demande */}
              {(selectedInscription.requested_education_level || selectedInscription.requested_field) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center mb-3">
                    <FiTarget className="w-4 h-4 text-green-600 mr-2" />
                    <h3 className="text-base font-semibold text-gray-900">Demande</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedInscription.requested_education_level && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Niveau d'étude demandé</p>
                        <p className="text-sm font-medium text-gray-900">
                          {educationLevels.find(l => l.value === selectedInscription.requested_education_level)?.label || selectedInscription.requested_education_level}
                        </p>
                      </div>
                    )}
                    {selectedInscription.requested_field && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Filière demandée</p>
                        <p className="text-sm font-medium text-gray-900">{selectedInscription.requested_field}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedInscription.notes && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center mb-2">
                    <FiFileText className="w-4 h-4 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInscription.notes}</p>
                </div>
              )}

              {/* Documents */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <FiFile className="w-4 h-4 text-gray-600 mr-2" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        Documents fournis
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedInscription.documents?.length || 0} document(s) disponible(s)
                    </p>
              {selectedInscription.documents && selectedInscription.documents.length > 0 && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span className="text-gray-600">
                            {selectedInscription.documents.filter(d => d.status === 'pending').length} en attente
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600">
                            {selectedInscription.documents.filter(d => d.status === 'approved').length} approuvé(s)
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-gray-600">
                            {selectedInscription.documents.filter(d => d.status === 'rejected').length} rejeté(s)
                          </span>
                        </span>
                      </div>
                    )}
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
                {selectedInscription.documents && selectedInscription.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInscription.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FiFile className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">{doc.name}</span>
                            {getDocumentStatusBadge(doc.status || 'pending')}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>
                            <span className="font-medium">Type:</span> {getDocumentTypeLabel(doc.type)}
                          </div>
                          <div>
                            <span className="font-medium">Date d'upload:</span>{' '}
                            {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          {doc.validated_at && (
                            <div>
                              <span className="font-medium">Validé le:</span>{' '}
                              {new Date(doc.validated_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          )}
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-red-800 mb-1">
                                  Raison du rejet:
                                </p>
                                <p className="text-xs text-red-700">{doc.rejection_reason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FiFile className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Aucun document fourni pour cette préinscription</p>
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
                  setSelectedInscription(null)
                }}
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default ClientInscriptions


