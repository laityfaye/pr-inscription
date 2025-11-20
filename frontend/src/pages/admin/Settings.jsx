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
  })
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
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
      })
      if (data.logo) {
        setLogoPreview(getLogoUrl(data.logo))
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
    
    // Ajouter tous les champs de settings, même s'ils sont vides
    Object.keys(settings).forEach((key) => {
      const value = settings[key]
      // Envoyer la valeur même si elle est vide (ne pas utiliser || '' car ça enlève les valeurs 0)
      data.append(key, value !== null && value !== undefined ? value : '')
    })
    
    if (logo) {
      data.append('logo', logo)
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
        
        // Émettre un événement personnalisé pour forcer le rechargement
        window.dispatchEvent(new CustomEvent('agencySettingsUpdated', { 
          detail: response.data 
        }))
        
        // Informer l'utilisateur
        toast.success('Les modifications seront visibles sur la page d\'accueil après un rafraîchissement (F5)')
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



