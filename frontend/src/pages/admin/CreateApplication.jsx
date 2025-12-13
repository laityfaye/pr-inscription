import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { 
  FiUser, 
  FiFileText, 
  FiBriefcase, 
  FiHome, 
  FiUpload, 
  FiX, 
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiFile
} from 'react-icons/fi'

const CreateApplication = () => {
  const [step, setStep] = useState(1) // 1: Sélection client, 2: Type demande, 3: Formulaire, 4: Documents
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [applicationType, setApplicationType] = useState('') // inscription, work_permit, residence, study_permit_renewal
  const [users, setUsers] = useState([])
  const [countries, setCountries] = useState([])
  const [workPermitCountries, setWorkPermitCountries] = useState([])
  const [loading, setLoading] = useState(false)
  
  // États pour les formulaires
  const [inscriptionData, setInscriptionData] = useState({
    country_id: '',
    current_education_level: '',
    current_field: '',
    requested_education_level: '',
    requested_field: '',
  })
  
  const [workPermitData, setWorkPermitData] = useState({
    work_permit_country_id: '',
    visa_type: 'work_permit',
    age: '',
    profession: '',
    experience_years: '',
    current_employer: '',
    phone_number: '',
    address: '',
    education_level: '',
    language_skills: '',
  })
  
  const [residenceData, setResidenceData] = useState({
    current_residence_country: '',
    residence_type: '',
    family_members: [],
    employment_status: '',
    financial_situation: '',
  })
  
  const [studyPermitRenewalData, setStudyPermitRenewalData] = useState({
    arrival_date: '',
    institution_name: '',
    expiration_date: '',
    address: '',
    address_number: '',
    country: 'Canada',
  })
  
  // États pour les documents
  const [documents, setDocuments] = useState([]) // [{ file, type, name, applicationId }]
  const [currentDocument, setCurrentDocument] = useState({
    file: null,
    type: '',
    name: '',
    applicationId: null,
  })
  const [createdApplication, setCreatedApplication] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchCountries()
    fetchWorkPermitCountries()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      // Filtrer pour ne garder que les clients
      const clients = response.data.filter(user => user.role === 'client')
      setUsers(clients)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Erreur lors du chargement des clients')
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries')
      setCountries(response.data || [])
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchWorkPermitCountries = async () => {
    try {
      const response = await api.get('/work-permit-countries')
      setWorkPermitCountries(response.data || [])
    } catch (error) {
      console.error('Error fetching work permit countries:', error)
    }
  }

  const handleClientSelect = () => {
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un client')
      return
    }
    const client = users.find(u => u.id === parseInt(selectedUserId))
    if (!client) {
      toast.error('Client non trouvé')
      return
    }
    setSelectedClient(client)
    setStep(2)
  }

  const handleApplicationTypeSelect = () => {
    if (!applicationType) {
      toast.error('Veuillez sélectionner un type de demande')
      return
    }
    setStep(3)
  }

  const handleCreateApplication = async () => {
    setLoading(true)
    try {
      let response
      const payload = { user_id: selectedUserId }

      switch (applicationType) {
        case 'inscription':
          if (!inscriptionData.country_id) {
            toast.error('Veuillez sélectionner un pays')
            setLoading(false)
            return
          }
          response = await api.post('/inscriptions', {
            ...inscriptionData,
            ...payload,
          })
          break
        case 'work_permit':
          if (!workPermitData.work_permit_country_id) {
            toast.error('Veuillez sélectionner un pays')
            setLoading(false)
            return
          }
          response = await api.post('/work-permit-applications', {
            ...workPermitData,
            ...payload,
          })
          break
        case 'residence':
          response = await api.post('/residence-applications', {
            ...residenceData,
            ...payload,
          })
          break
        case 'study_permit_renewal':
          response = await api.post('/study-permit-renewal-applications', {
            ...studyPermitRenewalData,
            ...payload,
          })
          break
        default:
          toast.error('Type de demande invalide')
          setLoading(false)
          return
      }

      const application = response.data
      console.log('Application created:', application)
      console.log('Application type:', applicationType)
      console.log('Application ID:', application?.id)
      
      if (!application || !application.id) {
        console.error('Application created but missing ID:', application)
        toast.error('Erreur: La demande a été créée mais l\'ID est manquant')
        return
      }
      
      setCreatedApplication(application)
      toast.success('Demande créée avec succès')
      setStep(4)
    } catch (error) {
      console.error('Error creating application:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la demande')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = () => {
    try {
      if (!currentDocument.file || !currentDocument.type) {
        toast.error('Veuillez sélectionner un fichier et un type')
        return
      }
      
      if (!createdApplication) {
        toast.error('Erreur: La demande n\'a pas été créée. Veuillez d\'abord créer la demande.')
        return
      }

      if (!createdApplication.id) {
        console.error('createdApplication without id:', createdApplication)
        toast.error('Erreur: La demande n\'a pas d\'ID. Veuillez réessayer.')
        return
      }
      
      if (!applicationType) {
        console.error('applicationType is not set')
        toast.error('Erreur: Type de demande non défini')
        return
      }
      
      const applicationIdFieldMap = {
        inscription: 'inscription_id',
        work_permit: 'work_permit_application_id',
        residence: 'residence_application_id',
        study_permit_renewal: 'study_permit_renewal_application_id',
      }
      
      const applicationIdField = applicationIdFieldMap[applicationType]

      if (!applicationIdField) {
        console.error('Invalid applicationType:', applicationType)
        toast.error(`Type de demande invalide: ${applicationType}`)
        return
      }

      const newDocument = {
        file: currentDocument.file,
        type: currentDocument.type,
        name: currentDocument.name || '',
        applicationIdField: applicationIdField,
        applicationId: createdApplication.id,
      }

      console.log('Adding document to list:', {
        fileName: newDocument.file?.name,
        type: newDocument.type,
        applicationIdField: newDocument.applicationIdField,
        applicationId: newDocument.applicationId,
        applicationType: applicationType,
        createdApplication: createdApplication,
      })

      setDocuments([...documents, newDocument])
      
      setCurrentDocument({
        file: null,
        type: '',
        name: '',
        applicationId: null,
      })
      
      // Réinitialiser le champ fichier
      const fileInput = document.getElementById('document-file-input')
      if (fileInput) {
        fileInput.value = ''
      }
      
      toast.success('Document ajouté à la liste')
    } catch (error) {
      console.error('Error in handleAddDocument:', error)
      console.error('Error stack:', error.stack)
      console.error('Current state:', {
        currentDocument,
        createdApplication,
        applicationType,
        documents,
      })
      toast.error(`Erreur: ${error.message || 'Une erreur inattendue s\'est produite'}`)
    }
  }

  const handleRemoveDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleUploadDocuments = async () => {
    if (documents.length === 0) {
      toast.success('Demande créée sans documents')
      // Rediriger vers la page de gestion
      window.location.href = getApplicationListUrl()
      return
    }

    setLoading(true)
    try {
      let successCount = 0
      let errorCount = 0
      const errors = []

      for (const doc of documents) {
        try {
          if (!doc.file) {
            console.error('Document sans fichier:', doc)
            errorCount++
            errors.push(`${doc.name || 'Document'}: Fichier manquant`)
            continue
          }

          const formData = new FormData()
          formData.append('file', doc.file)
          formData.append('type', doc.type)
          formData.append('user_id', String(selectedUserId)) // S'assurer que c'est une string
          if (doc.name && doc.name.trim()) {
            formData.append('name', doc.name.trim())
          }
          formData.append(doc.applicationIdField, String(doc.applicationId))

          // Vérifier que tous les champs sont présents
          console.log('Uploading document:', {
            fileName: doc.file?.name,
            fileSize: doc.file?.size,
            fileType: doc.file?.type,
            type: doc.type,
            userId: selectedUserId,
            applicationIdField: doc.applicationIdField,
            applicationId: doc.applicationId,
            name: doc.name,
          })

          // Vérifier que le FormData contient bien le fichier
          const fileInFormData = formData.get('file')
          if (!fileInFormData) {
            console.error('Fichier non trouvé dans FormData')
            errorCount++
            errors.push(`${doc.file?.name}: Erreur lors de la préparation du fichier`)
            continue
          }

          const response = await api.post('/documents', formData)
          successCount++
          console.log(`Document ${doc.file?.name} uploadé avec succès:`, response.data)
        } catch (error) {
          console.error(`Error uploading document ${doc.file?.name}:`, error)
          console.error('Error response:', error.response?.data)
          console.error('Error status:', error.response?.status)
          errorCount++
          const errorMessage = error.response?.data?.message || 'Erreur inconnue'
          errors.push(`${doc.file?.name}: ${errorMessage}`)
          
          if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors
            Object.values(validationErrors).flat().forEach(err => {
              errors.push(`${doc.file?.name}: ${err}`)
            })
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} document(s) uploadé(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`)
        if (errors.length > 0) {
          console.error('Erreurs détaillées:', errors)
          // Afficher les erreurs dans la console pour debug
          errors.forEach(err => console.error(err))
        }
        // Rediriger vers la page de gestion après un court délai
        setTimeout(() => {
          window.location.href = getApplicationListUrl()
        }, 1500)
      } else {
        toast.error('Aucun document n\'a pu être uploadé')
        errors.forEach(err => toast.error(err, { duration: 5000 }))
        // Ne pas rediriger si tous les uploads ont échoué
      }
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload des documents')
    } finally {
      setLoading(false)
    }
  }

  const getApplicationListUrl = () => {
    switch (applicationType) {
      case 'inscription':
        return '/admin/inscriptions'
      case 'work_permit':
        return '/admin/work-permit-applications'
      case 'residence':
        return '/admin/residence-applications'
      case 'study_permit_renewal':
        return '/admin/study-permit-renewal-applications'
      default:
        return '/admin/dashboard'
    }
  }

  const getDocumentTypes = () => {
    try {
      if (!applicationType) {
        console.warn('getDocumentTypes called without applicationType')
        return []
      }
      
      switch (applicationType) {
        case 'inscription':
          return [
            'diplome',
            'releve_notes',
            'cv',
            'lettre_motivation',
            'passeport',
            'photo_identite',
            'certificat_langue',
            'autre',
          ]
        case 'work_permit':
          return [
            'passeport',
            'cv',
            'lettre_offre_emploi',
            'diplome',
            'certificat_experience',
            'certificat_langue',
            'autre',
          ]
        case 'residence':
          return [
            'passeport',
            'acte_naissance',
            'acte_mariage',
            'certificat_residence',
            'preuve_financiere',
            'autre',
          ]
        case 'study_permit_renewal':
          return [
            'passeport',
            'caq',
            'permis_etudes',
            'releve_notes',
            'preuve_inscription',
            'autre',
          ]
        default:
          console.warn('Unknown applicationType in getDocumentTypes:', applicationType)
          return []
      }
    } catch (error) {
      console.error('Error in getDocumentTypes:', error)
      return []
    }
  }

  return (
    <Layout>
      <div className="section-container py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Créer une demande pour un client
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            Créez une demande de préinscription, visa, résidence ou renouvellement au nom d'un client
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step >= s 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'bg-white border-neutral-300 text-neutral-400'
                }`}>
                  {step > s ? <FiCheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary-600' : 'bg-neutral-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>Client</span>
            <span>Type</span>
            <span>Formulaire</span>
            <span>Documents</span>
          </div>
        </div>

        <Card padding="lg" className="bg-white shadow-sm">
          {/* Étape 1: Sélection du client */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Sélectionner un client</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Client *
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Sélectionner un client</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedUserId && (
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                          {users.find(u => u.id === parseInt(selectedUserId))?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {users.find(u => u.id === parseInt(selectedUserId))?.name}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {users.find(u => u.id === parseInt(selectedUserId))?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleClientSelect}
                  disabled={!selectedUserId}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* Étape 2: Sélection du type de demande */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Sélectionner le type de demande</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setApplicationType('inscription')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      applicationType === 'inscription'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <FiFileText className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">Préinscription</h3>
                    <p className="text-sm text-neutral-600">Demande de préinscription pour études</p>
                  </button>
                  
                  <button
                    onClick={() => setApplicationType('work_permit')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      applicationType === 'work_permit'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <FiBriefcase className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">Demande de visa</h3>
                    <p className="text-sm text-neutral-600">Visa visiteur ou permis de travail</p>
                  </button>
                  
                  <button
                    onClick={() => setApplicationType('residence')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      applicationType === 'residence'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <FiHome className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">Résidence Canada</h3>
                    <p className="text-sm text-neutral-600">Demande de résidence permanente</p>
                  </button>
                  
                  <button
                    onClick={() => setApplicationType('study_permit_renewal')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      applicationType === 'study_permit_renewal'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <FiFileText className="w-8 h-8 text-primary-600 mb-3" />
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">Renouvellement CAQ/Permis</h3>
                    <p className="text-sm text-neutral-600">Renouvellement CAQ/Permis d'études</p>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplicationTypeSelect}
                  disabled={!applicationType}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Formulaire */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Remplir le formulaire</h2>
                
                {/* Formulaire Préinscription */}
                {applicationType === 'inscription' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Pays * <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={inscriptionData.country_id}
                        onChange={(e) => setInscriptionData({ ...inscriptionData, country_id: e.target.value })}
                        className="input w-full"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Niveau d'études actuel
                        </label>
                        <select
                          value={inscriptionData.current_education_level}
                          onChange={(e) => setInscriptionData({ ...inscriptionData, current_education_level: e.target.value })}
                          className="input w-full"
                        >
                          <option value="">Sélectionner</option>
                          <option value="bac">Bac</option>
                          <option value="licence_1">Licence 1</option>
                          <option value="licence_2">Licence 2</option>
                          <option value="licence_3">Licence 3</option>
                          <option value="master_1">Master 1</option>
                          <option value="master_2">Master 2</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Domaine actuel
                        </label>
                        <Input
                          value={inscriptionData.current_field}
                          onChange={(e) => setInscriptionData({ ...inscriptionData, current_field: e.target.value })}
                          placeholder="Ex: Informatique"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Niveau d'études demandé
                        </label>
                        <select
                          value={inscriptionData.requested_education_level}
                          onChange={(e) => setInscriptionData({ ...inscriptionData, requested_education_level: e.target.value })}
                          className="input w-full"
                        >
                          <option value="">Sélectionner</option>
                          <option value="bac">Bac</option>
                          <option value="licence_1">Licence 1</option>
                          <option value="licence_2">Licence 2</option>
                          <option value="licence_3">Licence 3</option>
                          <option value="master_1">Master 1</option>
                          <option value="master_2">Master 2</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Domaine demandé
                        </label>
                        <Input
                          value={inscriptionData.requested_field}
                          onChange={(e) => setInscriptionData({ ...inscriptionData, requested_field: e.target.value })}
                          placeholder="Ex: Génie logiciel"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulaire Visa/Permis de travail */}
                {applicationType === 'work_permit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Pays * <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={workPermitData.work_permit_country_id}
                        onChange={(e) => setWorkPermitData({ ...workPermitData, work_permit_country_id: e.target.value })}
                        className="input w-full"
                        required
                      >
                        <option value="">Sélectionner un pays</option>
                        {workPermitCountries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Type de visa *
                      </label>
                      <select
                        value={workPermitData.visa_type}
                        onChange={(e) => setWorkPermitData({ ...workPermitData, visa_type: e.target.value })}
                        className="input w-full"
                      >
                        <option value="work_permit">Permis de travail</option>
                        <option value="visitor_visa">Visa visiteur</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Âge</label>
                        <Input
                          type="number"
                          value={workPermitData.age}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, age: e.target.value })}
                          placeholder="Ex: 25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Profession</label>
                        <Input
                          value={workPermitData.profession}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, profession: e.target.value })}
                          placeholder="Ex: Développeur"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Années d'expérience</label>
                        <Input
                          type="number"
                          value={workPermitData.experience_years}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, experience_years: e.target.value })}
                          placeholder="Ex: 5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Employeur actuel</label>
                        <Input
                          value={workPermitData.current_employer}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, current_employer: e.target.value })}
                          placeholder="Ex: Entreprise XYZ"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Téléphone</label>
                        <Input
                          value={workPermitData.phone_number}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, phone_number: e.target.value })}
                          placeholder="Ex: +221 77 123 45 67"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Niveau d'éducation</label>
                        <Input
                          value={workPermitData.education_level}
                          onChange={(e) => setWorkPermitData({ ...workPermitData, education_level: e.target.value })}
                          placeholder="Ex: Master"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Adresse</label>
                      <textarea
                        value={workPermitData.address}
                        onChange={(e) => setWorkPermitData({ ...workPermitData, address: e.target.value })}
                        className="input w-full"
                        rows="3"
                        placeholder="Adresse complète"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Compétences linguistiques</label>
                      <textarea
                        value={workPermitData.language_skills}
                        onChange={(e) => setWorkPermitData({ ...workPermitData, language_skills: e.target.value })}
                        className="input w-full"
                        rows="3"
                        placeholder="Ex: Français (courant), Anglais (intermédiaire)"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Résidence */}
                {applicationType === 'residence' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Pays de résidence actuel
                      </label>
                      <Input
                        value={residenceData.current_residence_country}
                        onChange={(e) => setResidenceData({ ...residenceData, current_residence_country: e.target.value })}
                        placeholder="Ex: Sénégal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Type de résidence
                      </label>
                      <Input
                        value={residenceData.residence_type}
                        onChange={(e) => setResidenceData({ ...residenceData, residence_type: e.target.value })}
                        placeholder="Ex: Résidence permanente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Membres de la famille (séparés par des virgules)
                      </label>
                      <Input
                        value={Array.isArray(residenceData.family_members) ? residenceData.family_members.join(', ') : ''}
                        onChange={(e) => {
                          const members = e.target.value.split(',').map(m => m.trim()).filter(m => m)
                          setResidenceData({ ...residenceData, family_members: members })
                        }}
                        placeholder="Ex: Épouse, Enfant 1, Enfant 2"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Séparez les membres par des virgules
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Statut d'emploi
                      </label>
                      <Input
                        value={residenceData.employment_status}
                        onChange={(e) => setResidenceData({ ...residenceData, employment_status: e.target.value })}
                        placeholder="Ex: Employé à temps plein"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Situation financière
                      </label>
                      <textarea
                        value={residenceData.financial_situation}
                        onChange={(e) => setResidenceData({ ...residenceData, financial_situation: e.target.value })}
                        className="input w-full"
                        rows="3"
                        placeholder="Décrire la situation financière"
                      />
                    </div>
                  </div>
                )}

                {/* Formulaire Renouvellement CAQ/Permis */}
                {applicationType === 'study_permit_renewal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Date d'arrivée au Canada
                        </label>
                        <Input
                          type="date"
                          value={studyPermitRenewalData.arrival_date}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, arrival_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Date d'expiration
                        </label>
                        <Input
                          type="date"
                          value={studyPermitRenewalData.expiration_date}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, expiration_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Nom de l'établissement
                        </label>
                        <Input
                          value={studyPermitRenewalData.institution_name}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, institution_name: e.target.value })}
                          placeholder="Ex: Université de Montréal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Pays
                        </label>
                        <Input
                          value={studyPermitRenewalData.country}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, country: e.target.value })}
                          placeholder="Ex: Canada"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Adresse
                        </label>
                        <Input
                          value={studyPermitRenewalData.address}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, address: e.target.value })}
                          placeholder="Adresse"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Numéro d'adresse
                        </label>
                        <Input
                          value={studyPermitRenewalData.address_number}
                          onChange={(e) => setStudyPermitRenewalData({ ...studyPermitRenewalData, address_number: e.target.value })}
                          placeholder="Ex: 123"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateApplication}
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer la demande'}
                </Button>
              </div>
            </div>
          )}

          {/* Étape 4: Upload de documents */}
          {step === 4 && createdApplication && applicationType && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Demande créée avec succès</h3>
                </div>
                <p className="text-sm text-green-700">
                  Vous pouvez maintenant ajouter des documents à cette demande.
                </p>
                {(!createdApplication.id || !applicationType) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">
                      Erreur: Données manquantes. ID: {createdApplication.id}, Type: {applicationType}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Ajouter des documents</h2>
                
                {/* Formulaire d'ajout de document */}
                <Card padding="md" className="mb-6 bg-neutral-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Fichier *
                      </label>
                      <input
                        type="file"
                        id="document-file-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setCurrentDocument({ ...currentDocument, file })
                          }
                        }}
                        className="input w-full"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Type de document *
                      </label>
                      <select
                        value={currentDocument.type}
                        onChange={(e) => setCurrentDocument({ ...currentDocument, type: e.target.value })}
                        className="input w-full"
                      >
                        <option value="">Sélectionner un type</option>
                        {(() => {
                          try {
                            const types = getDocumentTypes()
                            if (!types || types.length === 0) {
                              console.warn('No document types available for applicationType:', applicationType)
                              return <option value="" disabled>Aucun type disponible</option>
                            }
                            return types.map((type) => (
                              <option key={type} value={type}>
                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))
                          } catch (error) {
                            console.error('Error in getDocumentTypes:', error)
                            return <option value="" disabled>Erreur lors du chargement des types</option>
                          }
                        })()}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Nom du document (optionnel)
                      </label>
                      <Input
                        value={currentDocument.name}
                        onChange={(e) => setCurrentDocument({ ...currentDocument, name: e.target.value })}
                        placeholder="Ex: Diplôme de Master"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleAddDocument}
                      icon={FiPlus}
                    >
                      Ajouter à la liste
                    </Button>
                  </div>
                </Card>

                {/* Liste des documents à uploader */}
                {documents.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-neutral-900">Documents à uploader ({documents.length})</h3>
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center gap-3">
                          <FiFile className="w-5 h-5 text-primary-600" />
                          <div>
                            <p className="font-semibold text-neutral-900">{doc.file.name}</p>
                            <p className="text-sm text-neutral-600">
                              Type: {doc.type.replace(/_/g, ' ')}
                              {doc.name && ` - ${doc.name}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(index)}
                          icon={FiTrash2}
                          className="text-red-600 hover:text-red-700"
                        >
                          Retirer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(3)}
                  >
                    Retour
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => window.location.href = getApplicationListUrl()}
                    >
                      Passer cette étape
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUploadDocuments}
                      disabled={loading || documents.length === 0}
                      icon={FiUpload}
                    >
                      {loading ? 'Upload...' : `Uploader ${documents.length} document(s)`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export default CreateApplication

