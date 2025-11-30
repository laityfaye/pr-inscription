import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUpload, FiDownload, FiTrash2, FiFile, FiFileText, FiImage, FiPaperclip, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiEye, FiX, FiBriefcase, FiHome } from 'react-icons/fi'

const ClientDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [workPermitApplications, setWorkPermitApplications] = useState([])
  const [residenceApplications, setResidenceApplications] = useState([])
  const [activeTab, setActiveTab] = useState('all') // all, inscription, work_permit, residence
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [type, setType] = useState('')
  const [customName, setCustomName] = useState('')
  const [documentCategory, setDocumentCategory] = useState('') // inscription, work_permit, residence
  const [selectedInscriptionId, setSelectedInscriptionId] = useState('')
  const [selectedWorkPermitId, setSelectedWorkPermitId] = useState('')
  const [selectedResidenceId, setSelectedResidenceId] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB en bytes

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [documentsRes, inscriptionsRes, workPermitRes, residenceRes] = await Promise.all([
        api.get('/documents'),
        api.get('/inscriptions').catch(() => ({ data: [] })),
        api.get('/work-permit-applications').catch(() => ({ data: [] })),
        api.get('/residence-applications').catch(() => ({ data: [] })),
      ])
      setDocuments(documentsRes.data)
      setInscriptions(inscriptionsRes.data)
      setWorkPermitApplications(workPermitRes.data)
      setResidenceApplications(residenceRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchDocuments = fetchData

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`Le fichier est trop volumineux. Taille maximale: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`)
        e.target.value = ''
        return
      }
      setFile(selectedFile)
      // Pré-remplir le nom avec le nom du fichier sans extension
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      setCustomName(fileNameWithoutExt)
    }
  }

  const handleUpload = async () => {
    if (!file || !type) {
      toast.error('Veuillez sélectionner un fichier et un type')
      return
    }

    if (documentCategory && !selectedInscriptionId && !selectedWorkPermitId && !selectedResidenceId) {
      toast.error('Veuillez sélectionner une demande')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (customName.trim()) {
      formData.append('name', customName.trim())
    }
    if (documentCategory === 'inscription' && selectedInscriptionId) {
      formData.append('inscription_id', selectedInscriptionId)
    }
    if (documentCategory === 'work_permit' && selectedWorkPermitId) {
      formData.append('work_permit_application_id', selectedWorkPermitId)
    }
    if (documentCategory === 'residence' && selectedResidenceId) {
      formData.append('residence_application_id', selectedResidenceId)
    }

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploadé avec succès')
      setShowModal(false)
      setFile(null)
      setType('')
      setCustomName('')
      setDocumentCategory('')
      setSelectedInscriptionId('')
      setSelectedWorkPermitId('')
      setSelectedResidenceId('')
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (doc) => {
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

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      })
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
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement')
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

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document supprimé')
      fetchDocuments()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const documentTypes = [
    { value: 'identity', label: 'Pièce d\'identité' },
    { value: 'passport', label: 'Passeport' },
    { value: 'transcript', label: 'Relevé de notes' },
    { value: 'diploma', label: 'Diplôme' },
    { value: 'other', label: 'Autre' },
  ]

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

  const getDocumentIcon = (type) => {
    if (type === 'image' || type.includes('image')) return FiImage
    return FiFileText
  }

  const getFilteredDocuments = () => {
    if (activeTab === 'all') return documents
    if (activeTab === 'inscription') {
      return documents.filter(doc => doc.inscription_id !== null)
    }
    if (activeTab === 'work_permit') {
      return documents.filter(doc => doc.work_permit_application_id !== null)
    }
    if (activeTab === 'residence') {
      return documents.filter(doc => doc.residence_application_id !== null)
    }
    return documents
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'En attente de validation',
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
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Mes documents 📄
            </h1>
            <p className="text-xl text-gray-600">
              Gérez tous vos documents en un seul endroit
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <FiUpload className="mr-2" />
            Uploader un document
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous les documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('inscription')}
            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'inscription'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Préinscriptions ({documents.filter(d => d.inscription_id).length})
          </button>
          <button
            onClick={() => setActiveTab('work_permit')}
            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'work_permit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Permis de travail ({documents.filter(d => d.work_permit_application_id).length})
          </button>
          <button
            onClick={() => setActiveTab('residence')}
            className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'residence'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Résidence Canada ({documents.filter(d => d.residence_application_id).length})
          </button>
        </div>

        {/* Documents Grid */}
        {getFilteredDocuments().length === 0 ? (
          <Card className="p-12 text-center animate-slide-up">
            <FiFile className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Aucun document</p>
            <p className="text-gray-500 mb-6">Commencez par uploader votre premier document</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FiUpload className="mr-2" />
              Uploader un document
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredDocuments().map((doc, index) => {
              const DocIcon = getDocumentIcon(doc.type)
              return (
                <Card
                  key={doc.id}
                  hover
                  className="p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                      <DocIcon className="text-2xl text-white" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {doc.inscription_id && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        <FiFileText className="mr-1" />
                        Préinscription
                      </div>
                    )}
                    {doc.work_permit_application_id && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                        <FiBriefcase className="mr-1" />
                        Permis de travail
                      </div>
                    )}
                    {doc.residence_application_id && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        <FiHome className="mr-1" />
                        Résidence Canada
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPaperclip className="mr-2" />
                      <span className="font-medium">{getDocumentTypeLabel(doc.type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(doc.status || 'pending')}
                    </div>
                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800 mb-1">
                              Raison du rejet:
                            </p>
                            <p className="text-sm text-red-700">{doc.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {doc.validated_at && (
                      <p className="text-xs text-gray-500">
                        Validé le:{' '}
                        {new Date(doc.validated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleView(doc)}
                      className="flex-1"
                    >
                      <FiEye className="mr-2" />
                      Visualiser
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <FiDownload className="mr-2" />
                    </Button>
                    {doc.status === 'rejected' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setType(doc.type)
                          setFile(null)
                          setCustomName('')
                          setShowModal(true)
                        }}
                        className="flex-1"
                      >
                        <FiUpload className="mr-2" />
                        Réuploader
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-md w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploader un document</h2>
            
            {/* Message informatif */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Informations importantes
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Taille maximale: <strong>10 MB</strong></li>
                    <li>Un nom clair et descriptif facilite le traitement de votre document</li>
                    <li>Évitez les caractères spéciaux dans le nom</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie de demande <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <select
                  value={documentCategory}
                  onChange={(e) => {
                    setDocumentCategory(e.target.value)
                    setSelectedInscriptionId('')
                    setSelectedWorkPermitId('')
                    setSelectedResidenceId('')
                  }}
                  className="input w-full"
                >
                  <option value="">Document général</option>
                  <option value="inscription">Préinscription</option>
                  <option value="work_permit">Permis de travail</option>
                  <option value="residence">Résidence Canada</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez la catégorie pour lier ce document à une demande spécifique
                </p>
              </div>

              {documentCategory === 'inscription' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Préinscription <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedInscriptionId}
                    onChange={(e) => setSelectedInscriptionId(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionnez une préinscription</option>
                    {inscriptions.map((inscription) => (
                      <option key={inscription.id} value={inscription.id}>
                        {inscription.country?.name || 'Préinscription'} - {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {documentCategory === 'work_permit' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Demande de permis de travail <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedWorkPermitId}
                    onChange={(e) => setSelectedWorkPermitId(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionnez une demande</option>
                    {workPermitApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.country?.name || 'Permis de travail'} - {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {documentCategory === 'residence' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Demande de résidence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedResidenceId}
                    onChange={(e) => setSelectedResidenceId(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionnez une demande</option>
                    {residenceApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        Résidence Canada - {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de document <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Sélectionner un type</option>
                  {documentTypes.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fichier <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FiUpload className="text-4xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">
                      {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                    </span>
                    {file && (
                      <span className="text-xs text-gray-500">
                        Taille: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </label>
                </div>
                {file && file.size > MAX_FILE_SIZE && (
                  <p className="text-xs text-red-600 mt-1">
                    Le fichier dépasse la taille maximale de {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du document
                  <span className="text-gray-500 font-normal ml-1">(optionnel)</span>
                </label>
                <Input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={file ? file.name.replace(/\.[^/.]+$/, '') : 'Nom du document'}
                  className="w-full"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customName.length}/255 caractères. Si vide, le nom du fichier sera utilisé.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Astuce: Utilisez un nom descriptif (ex: "Passeport_Jean_Dupont_2024")
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false)
                  setFile(null)
                  setType('')
                  setCustomName('')
                  setDocumentCategory('')
                  setSelectedInscriptionId('')
                  setSelectedWorkPermitId('')
                  setSelectedResidenceId('')
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || !type || loading || (file && file.size > MAX_FILE_SIZE) || (documentCategory && !selectedInscriptionId && !selectedWorkPermitId && !selectedResidenceId)}
                loading={loading}
              >
                {loading ? 'Upload...' : 'Uploader'}
              </Button>
            </div>
          </Card>
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
                  onClick={() => handleDownload(previewDocument)}
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
                    onClick={() => handleDownload(previewDocument)}
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
    </Layout>
  )
}

export default ClientDocuments


