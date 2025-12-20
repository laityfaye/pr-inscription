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
  const [studyPermitRenewalApplications, setStudyPermitRenewalApplications] = useState([])
  const [activeTab, setActiveTab] = useState('all') // all, inscription, work_permit, residence, study_permit_renewal
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [type, setType] = useState('')
  const [customName, setCustomName] = useState('')
  const [documentCategory, setDocumentCategory] = useState('') // inscription, work_permit, residence, study_permit_renewal
  const [selectedInscriptionId, setSelectedInscriptionId] = useState('')
  const [selectedWorkPermitId, setSelectedWorkPermitId] = useState('')
  const [selectedResidenceId, setSelectedResidenceId] = useState('')
  const [selectedStudyPermitRenewalId, setSelectedStudyPermitRenewalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadStep, setUploadStep] = useState(1) // 1: Catégorie, 2: Type, 3: Fichier, 4: Nom
  const [wantToRename, setWantToRename] = useState(null) // null: pas encore demandé, true: oui, false: non
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB en bytes

  useEffect(() => {
    fetchData()
  }, [])

  // Fonction pour déterminer les catégories disponibles
  const getAvailableCategories = () => {
    const categories = []
    if (inscriptions.length > 0) categories.push({ value: 'inscription', label: 'Préinscription', count: inscriptions.length })
    if (workPermitApplications.length > 0) categories.push({ value: 'work_permit', label: 'Demande de visa', count: workPermitApplications.length })
    if (residenceApplications.length > 0) categories.push({ value: 'residence', label: 'Résidence Canada', count: residenceApplications.length })
    if (studyPermitRenewalApplications.length > 0) categories.push({ value: 'study_permit_renewal', label: 'CAQ/Permis d\'études', count: studyPermitRenewalApplications.length })
    return categories
  }

  // Fonction pour obtenir les demandes d'une catégorie
  const getCategoryApplications = (category) => {
    switch (category) {
      case 'inscription':
        return inscriptions
      case 'work_permit':
        return workPermitApplications
      case 'residence':
        return residenceApplications
      case 'study_permit_renewal':
        return studyPermitRenewalApplications
      default:
        return []
    }
  }

  // Effet pour la sélection automatique au chargement du modal
  useEffect(() => {
    if (showModal && uploadStep === 1 && !documentCategory) {
      const categories = []
      if (inscriptions.length > 0) categories.push({ value: 'inscription', count: inscriptions.length })
      if (workPermitApplications.length > 0) categories.push({ value: 'work_permit', count: workPermitApplications.length })
      if (residenceApplications.length > 0) categories.push({ value: 'residence', count: residenceApplications.length })
      if (studyPermitRenewalApplications.length > 0) categories.push({ value: 'study_permit_renewal', count: studyPermitRenewalApplications.length })
      
      // Si une seule catégorie disponible, la sélectionner automatiquement
      if (categories.length === 1) {
        const category = categories[0].value
        setDocumentCategory(category)
        
        // Si cette catégorie n'a qu'une seule demande, la sélectionner automatiquement
        let applications = []
        switch (category) {
          case 'inscription':
            applications = inscriptions
            break
          case 'work_permit':
            applications = workPermitApplications
            break
          case 'residence':
            applications = residenceApplications
            break
          case 'study_permit_renewal':
            applications = studyPermitRenewalApplications
            break
        }
        
        if (applications.length === 1) {
          const app = applications[0]
          switch (category) {
            case 'inscription':
              setSelectedInscriptionId(app.id.toString())
              break
            case 'work_permit':
              setSelectedWorkPermitId(app.id.toString())
              break
            case 'residence':
              setSelectedResidenceId(app.id.toString())
              break
            case 'study_permit_renewal':
              setSelectedStudyPermitRenewalId(app.id.toString())
              break
          }
        }
      }
    }
  }, [showModal, uploadStep, documentCategory, inscriptions, workPermitApplications, residenceApplications, studyPermitRenewalApplications])

  // Effet pour sélectionner automatiquement la demande si une seule disponible dans la catégorie
  useEffect(() => {
    if (documentCategory && uploadStep === 1) {
      let applications = []
      switch (documentCategory) {
        case 'inscription':
          applications = inscriptions
          if (applications.length === 1 && !selectedInscriptionId) {
            setSelectedInscriptionId(applications[0].id.toString())
          }
          break
        case 'work_permit':
          applications = workPermitApplications
          if (applications.length === 1 && !selectedWorkPermitId) {
            setSelectedWorkPermitId(applications[0].id.toString())
          }
          break
        case 'residence':
          applications = residenceApplications
          if (applications.length === 1 && !selectedResidenceId) {
            setSelectedResidenceId(applications[0].id.toString())
          }
          break
        case 'study_permit_renewal':
          applications = studyPermitRenewalApplications
          if (applications.length === 1 && !selectedStudyPermitRenewalId) {
            setSelectedStudyPermitRenewalId(applications[0].id.toString())
          }
          break
      }
    }
  }, [documentCategory, uploadStep, inscriptions, workPermitApplications, residenceApplications, studyPermitRenewalApplications, selectedInscriptionId, selectedWorkPermitId, selectedResidenceId, selectedStudyPermitRenewalId])

  const fetchData = async () => {
    try {
      const [documentsRes, inscriptionsRes, workPermitRes, residenceRes, studyPermitRenewalRes] = await Promise.all([
        api.get('/documents'),
        api.get('/inscriptions').catch(() => ({ data: [] })),
        api.get('/work-permit-applications').catch(() => ({ data: [] })),
        api.get('/residence-applications').catch(() => ({ data: [] })),
        api.get('/study-permit-renewal-applications').catch(() => ({ data: [] })),
      ])
      setDocuments(documentsRes.data)
      setInscriptions(inscriptionsRes.data)
      setWorkPermitApplications(workPermitRes.data)
      setResidenceApplications(residenceRes.data)
      setStudyPermitRenewalApplications(studyPermitRenewalRes.data)
      
      // Debug: vérifier les documents de visa
      const visaDocs = documentsRes.data.filter(d => d.work_permit_application_id !== null && d.work_permit_application_id !== undefined)
      if (visaDocs.length > 0) {
        console.log('Documents de visa trouvés:', visaDocs.length, visaDocs)
      } else {
        console.log('Aucun document de visa trouvé. Total documents:', documentsRes.data.length)
        console.log('Exemple de document:', documentsRes.data[0])
      }
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

    if (!documentCategory) {
      toast.error('Veuillez sélectionner une catégorie de demande')
      return
    }

    // Validation finale avant upload - s'assurer qu'une demande est sélectionnée
    let selectedApplicationId = null
    if (documentCategory === 'inscription') {
      if (!selectedInscriptionId) {
        toast.error('Veuillez sélectionner une préinscription')
        setUploadStep(1)
        return
      }
      selectedApplicationId = selectedInscriptionId
    } else if (documentCategory === 'work_permit') {
      if (!selectedWorkPermitId) {
        toast.error('Veuillez sélectionner une demande de visa')
        setUploadStep(1)
        return
      }
      selectedApplicationId = selectedWorkPermitId
    } else if (documentCategory === 'residence') {
      if (!selectedResidenceId) {
        toast.error('Veuillez sélectionner une demande de résidence')
        setUploadStep(1)
        return
      }
      selectedApplicationId = selectedResidenceId
    } else if (documentCategory === 'study_permit_renewal') {
      if (!selectedStudyPermitRenewalId) {
        toast.error('Veuillez sélectionner une demande de renouvellement CAQ/Permis d\'études')
        setUploadStep(1)
        return
      }
      selectedApplicationId = selectedStudyPermitRenewalId
    }

    if (!selectedApplicationId) {
      toast.error('Veuillez sélectionner une catégorie et une demande')
      setUploadStep(1)
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (customName.trim()) {
      formData.append('name', customName.trim())
    }
    
    // Toujours envoyer l'ID de la demande correspondante pour référencer le dossier
    if (documentCategory === 'inscription' && selectedInscriptionId) {
      formData.append('inscription_id', selectedInscriptionId)
    }
    if (documentCategory === 'work_permit' && selectedWorkPermitId) {
      formData.append('work_permit_application_id', selectedWorkPermitId)
    }
    if (documentCategory === 'residence' && selectedResidenceId) {
      formData.append('residence_application_id', selectedResidenceId)
    }
    if (documentCategory === 'study_permit_renewal' && selectedStudyPermitRenewalId) {
      formData.append('study_permit_renewal_application_id', selectedStudyPermitRenewalId)
    }

    try {
      await api.post('/documents', formData)
      toast.success('Document uploadé avec succès')
      setShowModal(false)
      setFile(null)
      setType('')
      setCustomName('')
      setDocumentCategory('')
      setSelectedInscriptionId('')
      setSelectedWorkPermitId('')
      setSelectedResidenceId('')
      setSelectedStudyPermitRenewalId('')
      setUploadStep(1)
      setWantToRename(null)
      fetchDocuments()
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Response data:', error.response?.data)
      
      if (error.response?.data?.errors) {
        // Afficher toutes les erreurs de validation
        const validationErrors = error.response.data.errors
        Object.values(validationErrors).flat().forEach(err => {
          toast.error(err)
        })
      } else {
        // Afficher le message d'erreur du backend (peut être dans 'message' ou 'error')
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'upload'
        toast.error(errorMessage)
      }
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
      return documents.filter(doc => doc.inscription_id !== null && doc.inscription_id !== undefined)
    }
    if (activeTab === 'work_permit') {
      return documents.filter(doc => doc.work_permit_application_id !== null && doc.work_permit_application_id !== undefined)
    }
    if (activeTab === 'residence') {
      return documents.filter(doc => doc.residence_application_id !== null && doc.residence_application_id !== undefined)
    }
    if (activeTab === 'study_permit_renewal') {
      return documents.filter(doc => doc.study_permit_renewal_application_id !== null && doc.study_permit_renewal_application_id !== undefined)
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 animate-fade-in gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
              Mes documents 📄
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Gérez tous vos documents en un seul endroit
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto justify-center"
          >
            <FiUpload className="mr-2 w-4 h-4" />
            <span className="hidden sm:inline">Uploader un document</span>
            <span className="sm:hidden">Uploader</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('inscription')}
            className={`px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'inscription'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Préinscr. ({documents.filter(d => d.inscription_id).length})
          </button>
          <button
            onClick={() => setActiveTab('work_permit')}
            className={`px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'work_permit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Visa ({documents.filter(d => d.work_permit_application_id !== null && d.work_permit_application_id !== undefined).length})
          </button>
          <button
            onClick={() => setActiveTab('residence')}
            className={`px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'residence'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Résidence ({documents.filter(d => d.residence_application_id).length})
          </button>
          <button
            onClick={() => setActiveTab('study_permit_renewal')}
            className={`px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'study_permit_renewal'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            CAQ/Permis ({documents.filter(d => d.study_permit_renewal_application_id).length})
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getFilteredDocuments().map((doc, index) => {
              const DocIcon = getDocumentIcon(doc.type)
              return (
                <Card
                  key={doc.id}
                  hover
                  className="p-4 sm:p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <DocIcon className="text-xl sm:text-2xl text-white" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 truncate" title={doc.name}>
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
                        Demande de visa
                      </div>
                    )}
                    {doc.residence_application_id && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        <FiHome className="mr-1" />
                        Résidence Canada
                      </div>
                    )}
                    {doc.study_permit_renewal_application_id && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800 mb-2">
                        <FiFileText className="mr-1" />
                        CAQ/Permis d'études
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

                  <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t border-gray-100">
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
                          setUploadStep(1)
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
          <Card className="max-w-md w-full p-4 sm:p-6 md:p-8 animate-scale-in max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-2">Uploader un document</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFile(null)
                  setType('')
                  setCustomName('')
                  setDocumentCategory('')
                  setSelectedInscriptionId('')
                  setSelectedWorkPermitId('')
                  setSelectedResidenceId('')
                  setSelectedStudyPermitRenewalId('')
                  setUploadStep(1)
                  setWantToRename(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Indicateur de progression */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-semibold text-xs sm:text-sm ${
                      uploadStep >= step 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {uploadStep > step ? '✓' : step}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
                        uploadStep > step ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 px-1">
                <span className={`truncate ${uploadStep === 1 ? 'font-semibold text-primary-600' : ''}`}>Catégorie</span>
                <span className={`truncate ${uploadStep === 2 ? 'font-semibold text-primary-600' : ''}`}>Type</span>
                <span className={`truncate ${uploadStep === 3 ? 'font-semibold text-primary-600' : ''}`}>Fichier</span>
                <span className={`truncate ${uploadStep === 4 ? 'font-semibold text-primary-600' : ''}`}>Nom</span>
              </div>
            </div>

            {/* Phase 1: Catégorie de demande */}
            {uploadStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie de demande <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={documentCategory}
                    onChange={(e) => {
                      setDocumentCategory(e.target.value)
                      setSelectedInscriptionId('')
                      setSelectedWorkPermitId('')
                      setSelectedResidenceId('')
                      setSelectedStudyPermitRenewalId('')
                    }}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {getAvailableCategories().map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </option>
                    ))}
                  </select>
                  {getAvailableCategories().length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Vous devez avoir au moins une demande pour uploader un document
                    </p>
                  )}
                </div>

                {documentCategory === 'inscription' && inscriptions.length > 1 && (
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

                {documentCategory === 'work_permit' && workPermitApplications.length > 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Demande de visa <span className="text-red-500">*</span>
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
                          {app.visa_type === 'visitor_visa' ? 'Visa Visiteur' : 'Permis de travail'} - {app.country?.name || 'N/A'} - {new Date(app.created_at).toLocaleDateString('fr-FR')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {documentCategory === 'residence' && residenceApplications.length > 1 && (
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

                {documentCategory === 'study_permit_renewal' && studyPermitRenewalApplications.length > 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Demande de renouvellement CAQ/Permis d'études <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedStudyPermitRenewalId}
                      onChange={(e) => setSelectedStudyPermitRenewalId(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Sélectionnez une demande</option>
                      {studyPermitRenewalApplications.map((app) => (
                        <option key={app.id} value={app.id}>
                          CAQ/Permis - {app.country || 'Canada'} - {new Date(app.created_at).toLocaleDateString('fr-FR')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
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
                      setSelectedStudyPermitRenewalId('')
                      setUploadStep(1)
                    }}
                    className="w-full sm:w-auto"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Vérifier qu'une catégorie est sélectionnée et qu'une demande est sélectionnée si nécessaire
                      if (!documentCategory) {
                        toast.error('Veuillez sélectionner une catégorie')
                        return
                      }
                      const applications = getCategoryApplications(documentCategory)
                      if (applications.length > 1) {
                        const hasSelection = 
                          (documentCategory === 'inscription' && selectedInscriptionId) ||
                          (documentCategory === 'work_permit' && selectedWorkPermitId) ||
                          (documentCategory === 'residence' && selectedResidenceId) ||
                          (documentCategory === 'study_permit_renewal' && selectedStudyPermitRenewalId)
                        if (!hasSelection) {
                          toast.error('Veuillez sélectionner une demande')
                          return
                        }
                      }
                      setUploadStep(2)
                    }}
                    disabled={!documentCategory || getAvailableCategories().length === 0}
                    className="w-full sm:w-auto"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Phase 2: Type de document */}
            {uploadStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de document <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {documentTypes.map((dt) => (
                      <option key={dt.value} value={dt.value}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setUploadStep(1)}
                    className="w-full sm:w-auto"
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!type) {
                        toast.error('Veuillez sélectionner un type de document')
                        return
                      }
                      setUploadStep(3)
                    }}
                    disabled={!type}
                    className="w-full sm:w-auto"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Phase 3: Fichier */}
            {uploadStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fichier <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-primary-400 transition-colors">
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
                      <FiUpload className="text-3xl sm:text-4xl text-gray-400 mb-2" />
                      <span className="text-xs sm:text-sm text-gray-600 mb-1 break-words text-center px-2">
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
                  <p className="text-xs text-gray-500 mt-2">
                    Taille maximale: 10 MB
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => setUploadStep(2)}
                    className="w-full sm:w-auto"
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!file) {
                        toast.error('Veuillez sélectionner un fichier')
                        return
                      }
                      if (file.size > MAX_FILE_SIZE) {
                        toast.error(`Le fichier dépasse la taille maximale de ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`)
                        return
                      }
                      // Réinitialiser l'état de renommage
                      setWantToRename(null)
                      setCustomName('')
                      setUploadStep(4)
                    }}
                    disabled={!file || file.size > MAX_FILE_SIZE}
                    className="w-full sm:w-auto"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {/* Phase 4: Renommer le document */}
            {uploadStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                {wantToRename === null ? (
                  // Question: Voulez-vous renommer le document ?
                  <>
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        Voulez-vous renommer le document ?
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 break-words px-2">
                        Le fichier sera nommé: <strong className="break-all">{file?.name || 'N/A'}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          setWantToRename(false)
                          setCustomName('')
                        }}
                        className="w-full sm:min-w-[120px]"
                      >
                        Non, garder le nom
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => {
                          setWantToRename(true)
                          // Pré-remplir le nom avec le nom du fichier sans extension
                          const fileNameWithoutExt = file?.name.replace(/\.[^/.]+$/, '') || ''
                          setCustomName(fileNameWithoutExt)
                        }}
                        className="w-full sm:min-w-[120px]"
                      >
                        Oui, renommer
                      </Button>
                    </div>
                  </>
                ) : wantToRename === true ? (
                  // Afficher le champ de renommage
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom du document <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={file ? file.name.replace(/\.[^/.]+$/, '') : 'Nom du document'}
                        className="w-full"
                        maxLength={255}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {customName.length}/255 caractères
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Astuce: Utilisez un nom descriptif (ex: "Passeport_Jean_Dupont_2024")
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => setWantToRename(null)}
                        className="w-full sm:w-auto"
                      >
                        Retour
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!customName.trim()) {
                            toast.error('Veuillez entrer un nom pour le document')
                            return
                          }
                          // Passer à l'affichage du récapitulatif (on reste sur step 4 mais on change l'affichage)
                          setWantToRename('confirmed')
                        }}
                        disabled={!customName.trim()}
                        className="w-full sm:w-auto"
                      >
                        Confirmer
                      </Button>
                    </div>
                  </>
                ) : wantToRename === 'confirmed' ? (
                  // Récapitulatif final si renommage confirmé
                  <>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Récapitulatif:</p>
                      <div className="space-y-1 text-xs text-gray-600 break-words">
                        <p><strong>Catégorie:</strong> {getAvailableCategories().find(c => c.value === documentCategory)?.label || 'N/A'}</p>
                        <p><strong>Type:</strong> {documentTypes.find(dt => dt.value === type)?.label || 'N/A'}</p>
                        <p><strong>Fichier:</strong> <span className="break-all">{file?.name || 'N/A'}</span></p>
                        <p><strong>Nom du document:</strong> <span className="break-all">{customName || file?.name || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => setWantToRename(true)}
                        className="w-full sm:w-auto"
                      >
                        Retour
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={loading || (file && file.size > MAX_FILE_SIZE)}
                        loading={loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? 'Upload...' : 'Confirmer'}
                      </Button>
                    </div>
                  </>
                ) : (
                  // Afficher le récapitulatif et permettre l'upload (quand on garde le nom)
                  <>
                    {/* Récapitulatif */}
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Récapitulatif:</p>
                      <div className="space-y-1 text-xs text-gray-600 break-words">
                        <p><strong>Catégorie:</strong> {getAvailableCategories().find(c => c.value === documentCategory)?.label || 'N/A'}</p>
                        <p><strong>Type:</strong> {documentTypes.find(dt => dt.value === type)?.label || 'N/A'}</p>
                        <p><strong>Fichier:</strong> <span className="break-all">{file?.name || 'N/A'}</span></p>
                        <p><strong>Nom du document:</strong> <span className="break-all">{file?.name || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => setWantToRename(null)}
                        className="w-full sm:w-auto"
                      >
                        Retour
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={loading || (file && file.size > MAX_FILE_SIZE)}
                        loading={loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? 'Upload...' : 'Confirmer'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{previewDocument.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {getDocumentTypeLabel(previewDocument.type)} •{' '}
                  {previewDocument.size
                    ? (previewDocument.size / 1024 / 1024).toFixed(2) + ' MB'
                    : 'Taille inconnue'}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(previewDocument)}
                  icon={FiDownload}
                  className="hidden sm:flex"
                >
                  Télécharger
                </Button>
                <button
                  onClick={() => handleDownload(previewDocument)}
                  className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  aria-label="Télécharger"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
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
            <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-gray-50">
              {!previewUrl ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : isImage(previewDocument.mime_type) ? (
                <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <img
                    src={previewUrl}
                    alt={previewDocument.name}
                    className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const errorDiv = e.target.nextSibling
                      if (errorDiv) errorDiv.style.display = 'flex'
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-gray-500">
                    <FiFile className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                    <p className="text-sm sm:text-base">Impossible de charger l'image</p>
                  </div>
                </div>
              ) : isPdf(previewDocument.mime_type) ? (
                <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[60vh] sm:h-[70vh] border-0 rounded-lg shadow-lg"
                    title={previewDocument.name}
                    onError={() => {
                      toast.error('Impossible de charger le PDF')
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-gray-500 px-4">
                  <FiFile className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                  <p className="text-base sm:text-lg font-semibold mb-2 text-center">Aperçu non disponible</p>
                  <p className="text-xs sm:text-sm mb-4 text-center">
                    Ce type de fichier ({previewDocument.mime_type || 'inconnu'}) ne peut pas être prévisualisé
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => handleDownload(previewDocument)}
                    icon={FiDownload}
                    className="w-full sm:w-auto"
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


