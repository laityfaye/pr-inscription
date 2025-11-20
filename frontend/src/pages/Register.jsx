import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiGlobe, FiLock, FiArrowRight } from 'react-icons/fi'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+221',
    target_country: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries')
      setCountries(response.data)
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Nettoyer les données : convertir les chaînes vides en null pour les champs nullable
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        target_country: formData.target_country.trim() || null,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }

      const user = await register(cleanedData)
      toast.success('Inscription réussie ! Bienvenue !')
      // Rediriger selon le rôle de l'utilisateur (normalement toujours client pour l'inscription)
      if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/client/dashboard')
      }
    } catch (error) {
      // Afficher les erreurs de validation détaillées
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const firstError = Object.values(validationErrors).flat()[0]
        toast.error(firstError || 'Erreur de validation')
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full animate-fade-in">
          <div className="card p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl mb-4 shadow-lg">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un compte
              </h2>
              <p className="text-gray-600">
                Rejoignez-nous pour commencer votre aventure
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                type="text"
                label="Nom complet"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                icon={FiUser}
              />

              <Input
                type="email"
                label="Adresse email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                icon={FiMail}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className="input pl-12"
                    placeholder="+221 XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.trim()
                      
                      // Si le champ est vide, mettre +221
                      if (value === '') {
                        setFormData({ ...formData, phone: '+221' })
                        return
                      }
                      
                      // Si ça commence déjà par +221, garder tel quel
                      if (value.startsWith('+221')) {
                        setFormData({ ...formData, phone: value })
                        return
                      }
                      
                      // Si ça commence par + mais pas +221, remplacer le préfixe
                      if (value.startsWith('+')) {
                        const rest = value.substring(1).replace(/\D/g, '') // Garder seulement les chiffres
                        setFormData({ ...formData, phone: '+221' + rest })
                        return
                      }
                      
                      // Si ça ne commence pas par +, ajouter +221 et garder seulement les chiffres
                      const digits = value.replace(/\D/g, '') // Garder seulement les chiffres
                      setFormData({ ...formData, phone: '+221' + digits })
                    }}
                    onBlur={(e) => {
                      // S'assurer que le préfixe est toujours présent à la perte de focus
                      let value = e.target.value.trim()
                      if (!value.startsWith('+221')) {
                        if (value === '' || value === '+') {
                          setFormData({ ...formData, phone: '+221' })
                        } else {
                          const digits = value.replace(/\D/g, '')
                          setFormData({ ...formData, phone: '+221' + digits })
                        }
                      }
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Format: +221 XX XXX XX XX
                </p>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays visé
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiGlobe className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="input pl-12"
                    value={formData.target_country}
                    onChange={(e) => setFormData({ ...formData, target_country: e.target.value })}
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                icon={FiLock}
              />

              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required
                icon={FiLock}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {!loading && (
                  <>
                    Créer mon compte
                    <FiArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

