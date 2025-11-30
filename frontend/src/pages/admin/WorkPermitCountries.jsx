import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiBriefcase, FiSave, FiX } from 'react-icons/fi'

const AdminWorkPermitCountries = () => {
  const [countries, setCountries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    code: '',
    description: '',
    eligibility_conditions: '',
    required_documents: '',
    application_process: '',
    processing_time: '',
    costs: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await api.get('/work-permit-countries/all?all=true')
      setCountries(response.data)
    } catch (error) {
      console.error('Error fetching work permit countries:', error)
      toast.error('Erreur lors du chargement des pays')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.name.trim()) {
      toast.error('Le nom du pays est requis')
      setLoading(false)
      return
    }

    try {
      let response
      if (editingCountry) {
        const data = {
          ...formData,
          name: formData.name.trim(),
          subtitle: formData.subtitle?.trim() || null,
          code: formData.code?.trim() || null,
          description: formData.description?.trim() || null,
          eligibility_conditions: formData.eligibility_conditions?.trim() || null,
          required_documents: formData.required_documents?.trim() || null,
          application_process: formData.application_process?.trim() || null,
          processing_time: formData.processing_time?.trim() || null,
          costs: formData.costs?.trim() || null,
          is_active: formData.is_active,
        }
        data._method = 'PUT'
        response = await api.post(`/work-permit-countries/${editingCountry.id}`, data)
        toast.success('Pays modifié avec succès')
      } else {
        const data = {
          name: formData.name.trim(),
          subtitle: formData.subtitle?.trim() || null,
          code: formData.code?.trim() || null,
          description: formData.description?.trim() || null,
          eligibility_conditions: formData.eligibility_conditions?.trim() || null,
          required_documents: formData.required_documents?.trim() || null,
          application_process: formData.application_process?.trim() || null,
          processing_time: formData.processing_time?.trim() || null,
          costs: formData.costs?.trim() || null,
          is_active: formData.is_active,
        }
        response = await api.post('/work-permit-countries', data)
        toast.success('Pays créé avec succès')
      }

      setShowModal(false)
      resetForm()
      fetchCountries()
    } catch (error) {
      console.error('Error saving work permit country:', error)
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`)
        })
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pays ?')) {
      return
    }

    try {
      await api.delete(`/work-permit-countries/${id}`)
      toast.success('Pays supprimé avec succès')
      fetchCountries()
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const handleEdit = (country) => {
    setEditingCountry(country)
    setFormData({
      name: country.name || '',
      subtitle: country.subtitle || '',
      code: country.code || '',
      description: country.description || '',
      eligibility_conditions: country.eligibility_conditions || '',
      required_documents: country.required_documents || '',
      application_process: country.application_process || '',
      processing_time: country.processing_time || '',
      costs: country.costs || '',
      is_active: country.is_active !== undefined ? country.is_active : true,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      code: '',
      description: '',
      eligibility_conditions: '',
      required_documents: '',
      application_process: '',
      processing_time: '',
      costs: '',
      is_active: true,
    })
    setEditingCountry(null)
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
              Pays de permis de travail
            </h1>
            <p className="text-neutral-600">
              Configurez les pays disponibles pour les demandes de permis de travail
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            variant="primary"
            size="lg"
            icon={FiPlus}
          >
            Nouveau pays
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiBriefcase className="mx-auto text-6xl text-neutral-300 mb-4" />
              <p className="text-neutral-600 text-lg">Aucun pays configuré</p>
              <p className="text-neutral-500 text-sm mt-2">
                Cliquez sur "Nouveau pays" pour commencer
              </p>
            </div>
          ) : (
            countries.map((country) => (
              <Card
                key={country.id}
                interactive
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FiBriefcase className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        {country.name}
                      </h3>
                      {country.subtitle && (
                        <p className="text-sm text-neutral-600 mt-1">
                          {country.subtitle}
                        </p>
                      )}
                      {country.code && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Code: {country.code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    country.is_active
                      ? 'bg-success-100 text-success-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {country.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                {country.description && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {country.description}
                  </p>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-200">
                  <button
                    onClick={() => handleEdit(country)}
                    className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(country.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowModal(false)
              resetForm()
            }}
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <FiBriefcase className="text-primary-600" />
                  {editingCountry ? 'Modifier le pays' : 'Nouveau pays'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    type="text"
                    label="Nom du pays *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    icon={FiBriefcase}
                    placeholder="Ex: Canada"
                    required
                  />

                  <Input
                    type="text"
                    label="Code (optionnel)"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().slice(0, 3) })}
                    placeholder="Ex: CAN"
                    maxLength={3}
                  />
                </div>

                <Input
                  type="text"
                  label="Sous-titre"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Opportunités de travail exceptionnelles"
                />

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    placeholder="Description générale du pays et des opportunités de travail..."
                    className="input resize-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Conditions d'éligibilité</label>
                  <textarea
                    value={formData.eligibility_conditions}
                    onChange={(e) => setFormData({ ...formData, eligibility_conditions: e.target.value })}
                    rows="6"
                    placeholder="Liste des conditions d'éligibilité pour obtenir un permis de travail..."
                    className="input resize-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Documents requis</label>
                  <textarea
                    value={formData.required_documents}
                    onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
                    rows="4"
                    placeholder="Liste des documents nécessaires pour la demande..."
                    className="input resize-none"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Processus de demande</label>
                  <textarea
                    value={formData.application_process}
                    onChange={(e) => setFormData({ ...formData, application_process: e.target.value })}
                    rows="4"
                    placeholder="Description du processus de demande..."
                    className="input resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Délai de traitement</label>
                    <textarea
                      value={formData.processing_time}
                      onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                      rows="3"
                      placeholder="Ex: 4-6 semaines"
                      className="input resize-none"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Coûts</label>
                    <textarea
                      value={formData.costs}
                      onChange={(e) => setFormData({ ...formData, costs: e.target.value })}
                      rows="3"
                      placeholder="Ex: 150-300 CAD"
                      className="input resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-neutral-700 cursor-pointer">
                    Rendre ce pays disponible pour les demandes
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={FiSave}
                    loading={loading}
                  >
                    {editingCountry ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminWorkPermitCountries

