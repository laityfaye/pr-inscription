import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiUpload, FiMail, FiPhone, FiMapPin, FiMessageCircle, FiFileText, FiGlobe, FiCalendar } from 'react-icons/fi'
import { getLogoUrl } from '../../utils/imageUrl'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    hero_subtitle: '',
    email: '',
    whatsapp: '',
    phone: '',
    address: '',
    registration_number: '',
    lawyer_card_enabled: false,
    lawyer_first_name: '',
    lawyer_last_name: '',
    lawyer_title: '',
    lawyer_phone: '',
    lawyer_email: '',
  })
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [lawyerImage, setLawyerImage] = useState(null)
  const [lawyerImagePreview, setLawyerImagePreview] = useState(null)
  const [rentreeText, setRentreeText] = useState('Rentrée 2025 - 2026 - Inscriptions ouvertes')

  useEffect(() => {
    fetchSettings()
    fetchRentreeText()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/agency')
      const data = response.data
      setSettings({
        name: data.name || '',
        description: data.description || '',
        hero_subtitle: data.hero_subtitle || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        phone: data.phone || '',
        address: data.address || '',
        registration_number: data.registration_number || '',
        lawyer_card_enabled: data.lawyer_card_enabled || false,
        lawyer_first_name: data.lawyer_first_name || '',
        lawyer_last_name: data.lawyer_last_name || '',
        lawyer_title: data.lawyer_title || '',
        lawyer_phone: data.lawyer_phone || '',
        lawyer_email: data.lawyer_email || '',
      })
      if (data.logo) {
        setLogoPreview(getLogoUrl(data.logo))
      }
      if (data.lawyer_image) {
        setLawyerImagePreview(getLogoUrl(data.lawyer_image))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchRentreeText = async () => {
    try {
      const response = await api.get('/settings/rentree_text')
      if (response.data?.value) {
        setRentreeText(response.data.value)
      }
    } catch (error) {
      console.error('Error fetching rentree text:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    
    // Vérifier si les informations minimales de l'avocat sont présentes
    const hasMinimalLawyerInfo = (settings.lawyer_first_name && settings.lawyer_first_name.trim()) || 
                                 (settings.lawyer_last_name && settings.lawyer_last_name.trim())
    
    // Désactiver automatiquement lawyer_card_enabled si les informations minimales ne sont pas présentes
    const lawyerCardEnabled = hasMinimalLawyerInfo && settings.lawyer_card_enabled
    
    // Ajouter tous les champs de settings, même s'ils sont vides
    Object.keys(settings).forEach((key) => {
      const value = settings[key]
      // Pour les booléens, convertir en string
      if (key === 'lawyer_card_enabled') {
        // Utiliser la valeur validée
        data.append(key, lawyerCardEnabled ? 'true' : 'false')
      } else {
        // Envoyer la valeur même si elle est vide (ne pas utiliser || '' car ça enlève les valeurs 0)
        data.append(key, value !== null && value !== undefined ? value : '')
      }
    })
    
    // Avertir l'utilisateur si la carte a été désactivée automatiquement
    if (settings.lawyer_card_enabled && !lawyerCardEnabled) {
      toast.error('La carte de l\'avocat a été désactivée car les informations minimales (prénom ou nom) sont manquantes')
    }
    
    if (logo) {
      data.append('logo', logo)
    }
    if (lawyerImage) {
      data.append('lawyer_image', lawyerImage)
    }

    // Ajouter _method=PUT pour Laravel (nécessaire avec FormData)
    data.append('_method', 'PUT')

    // Debug: afficher les données envoyées
    console.log('Données à envoyer:', Object.fromEntries(data.entries()))

    try {
      // Utiliser POST avec _method=PUT pour que Laravel puisse parser FormData correctement
      const response = await api.post('/agency', data)
      
      // Sauvegarder aussi le texte de rentrée
      await api.put('/settings/rentree_text', { value: rentreeText })
      
      if (response.data) {
        toast.success('Paramètres mis à jour avec succès')
        
        // Rafraîchir les paramètres
        await fetchSettings()
        await fetchRentreeText()
        
        // Vérifier les données retournées
        console.log('Données mises à jour:', response.data)
        console.log('Données sauvegardées:', {
          name: response.data.name,
          description: response.data.description,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
        })
        
        // Définir un signal dans localStorage pour forcer le rechargement de la page d'accueil
        localStorage.setItem('agency_updated', Date.now().toString())
        
        // Émettre un événement personnalisé avec les données mises à jour
        // Le contexte Agency utilisera ces données directement pour une mise à jour immédiate
        window.dispatchEvent(new CustomEvent('agencySettingsUpdated', { 
          detail: response.data 
        }))
        
        // Informer l'utilisateur
        toast.success('Paramètres mis à jour avec succès. Les modifications sont visibles immédiatement.')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      console.error('Error details:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la mise à jour'
      toast.error(errorMessage)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleLawyerImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLawyerImage(file)
      setLawyerImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
            Paramètres de l'agence
          </h1>
          <p className="text-neutral-600">
            Gérez les informations de votre agence
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card padding="lg" className="space-y-6">
            {/* Informations générales */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <FiGlobe className="text-primary-600" />
                Informations générales
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  label="Nom de l'agence"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  icon={FiFileText}
                  placeholder="Nom de l'agence"
                />

                <div className="form-group">
                  <label className="form-label">
                    Logo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="input cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {logoPreview && (
                      <div className="mt-4">
                        <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain rounded-xl border-2 border-neutral-200" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows="4"
                  placeholder="Description de l'agence"
                  className="input resize-none"
                />
                <p className="form-helper">
                  Cette description apparaîtra sous le titre principal de la page d'accueil
                </p>
              </div>

              <div className="mt-6 form-group">
                <label className="form-label">
                  Sous-titre Hero
                </label>
                <textarea
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  rows="3"
                  placeholder="Transformez votre rêve d'études à l'étranger en réalité avec notre accompagnement expert"
                  className="input resize-none"
                />
                <p className="form-helper">
                  Texte d'accompagnement qui apparaît sous la description principale sur la page d'accueil
                </p>
              </div>

              <div className="mt-6 form-group">
                <label className="form-label flex items-center gap-2">
                  <FiCalendar className="text-primary-600" />
                  Texte de rentrée
                </label>
                <Input
                  type="text"
                  value={rentreeText}
                  onChange={(e) => setRentreeText(e.target.value)}
                  placeholder="Rentrée 2025 - 2026 - Inscriptions ouvertes"
                  icon={FiCalendar}
                />
                <p className="form-helper">
                  Texte affiché dans le badge en haut de la page d'accueil (ex: "Rentrée 2025 - 2026 - Inscriptions ouvertes")
                </p>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <FiMail className="text-primary-600" />
                Coordonnées
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  type="email"
                  label="Email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  icon={FiMail}
                  placeholder="email@exemple.com"
                />

                <Input
                  type="text"
                  label="Téléphone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  icon={FiPhone}
                  placeholder="+221 XX XXX XX XX"
                />

                <Input
                  type="text"
                  label="WhatsApp"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  icon={FiMessageCircle}
                  placeholder="+221 XX XXX XX XX"
                  helperText="Numéro au format international"
                />

                <Input
                  type="text"
                  label="Adresse"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  icon={FiMapPin}
                  placeholder="Adresse complète"
                />
              </div>
            </div>

            {/* Informations légales */}
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <FiFileText className="text-primary-600" />
                Informations légales
              </h2>
              <div className="max-w-md">
                <Input
                  type="text"
                  label="Numéro d'immatriculation"
                  value={settings.registration_number}
                  onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                  placeholder="SN.DKR.2025.A.34574"
                  helperText="Numéro d'enregistrement officiel"
                />
              </div>
            </div>

            {/* Informations de l'avocat */}
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <FiCalendar className="text-primary-600" />
                Informations de l'avocat
              </h2>
              
              {/* Vérifier si les informations minimales sont présentes */}
              {(() => {
                const hasMinimalInfo = (settings.lawyer_first_name && settings.lawyer_first_name.trim()) || 
                                      (settings.lawyer_last_name && settings.lawyer_last_name.trim())
                const canEnable = hasMinimalInfo
                
                return (
                  <>
                    <div className="mb-6">
                      <label className={`flex items-center gap-3 ${canEnable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                        <input
                          type="checkbox"
                          checked={settings.lawyer_card_enabled}
                          disabled={!canEnable}
                          onChange={(e) => {
                            if (canEnable) {
                              setSettings({ ...settings, lawyer_card_enabled: e.target.checked })
                            } else {
                              toast.error('Veuillez d\'abord remplir au moins le prénom ou le nom de l\'avocat')
                            }
                          }}
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-semibold text-neutral-700">
                          Afficher la carte de l'avocat sur la page d'accueil
                        </span>
                      </label>
                      {!canEnable && (
                        <p className="form-error mt-2 flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Vous devez remplir au moins le prénom ou le nom de l'avocat pour activer cette option</span>
                        </p>
                      )}
                      {canEnable && !settings.lawyer_card_enabled && (
                        <p className="form-helper mt-2">
                          Activez cette option pour afficher la carte de l'avocat dans la section Hero de la page d'accueil
                        </p>
                      )}
                      {canEnable && settings.lawyer_card_enabled && (
                        <p className="form-helper mt-2 text-success-600">
                          ✓ La carte de l'avocat sera affichée sur la page d'accueil
                        </p>
                      )}
                    </div>

                    {/* Désactiver automatiquement si les informations minimales sont supprimées */}
                    {settings.lawyer_card_enabled && !canEnable && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Les informations minimales ont été supprimées. La carte sera désactivée lors de la sauvegarde.
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Toujours afficher les champs pour permettre la saisie des informations */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                {!settings.lawyer_first_name && !settings.lawyer_last_name && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Remplissez au moins le prénom ou le nom de l'avocat pour pouvoir activer l'affichage de la carte
                    </p>
                  </div>
                )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      label="Prénom de l'avocat"
                      value={settings.lawyer_first_name}
                      onChange={(e) => setSettings({ ...settings, lawyer_first_name: e.target.value })}
                      placeholder="Touba"
                      helperText="Au moins le prénom ou le nom est requis pour activer la carte"
                    />
                    <Input
                      type="text"
                      label="Nom de l'avocat"
                      value={settings.lawyer_last_name}
                      onChange={(e) => setSettings({ ...settings, lawyer_last_name: e.target.value })}
                      placeholder="Fall"
                      helperText="Au moins le prénom ou le nom est requis pour activer la carte"
                    />
                  </div>

                  <Input
                    type="text"
                    label="Titre / Fonction"
                    value={settings.lawyer_title}
                    onChange={(e) => setSettings({ ...settings, lawyer_title: e.target.value })}
                    placeholder="Avocat spécialisé en immigration"
                    helperText="Ex: Maître, Avocat spécialisé en immigration, etc."
                  />

                  <div className="form-group">
                    <label className="form-label">
                      Photo de l'avocat
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLawyerImageChange}
                        className="input cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {lawyerImagePreview && (
                        <div className="mt-4">
                          <img src={lawyerImagePreview} alt="Photo avocat preview" className="w-32 h-32 object-cover rounded-full border-4 border-primary-200 shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      type="tel"
                      label="Téléphone de l'avocat"
                      value={settings.lawyer_phone}
                      onChange={(e) => setSettings({ ...settings, lawyer_phone: e.target.value })}
                      icon={FiPhone}
                      placeholder="+221 XX XXX XX XX"
                    />
                    <Input
                      type="email"
                      label="Email de l'avocat"
                      value={settings.lawyer_email}
                      onChange={(e) => setSettings({ ...settings, lawyer_email: e.target.value })}
                      icon={FiMail}
                      placeholder="avocat@exemple.com"
                    />
                  </div>
                </div>
              
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={FiSave}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </Layout>
  )
}

export default AdminSettings



