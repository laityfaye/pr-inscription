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
    phone: '',
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl mb-4 shadow-lg">
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

              <Input
                type="tel"
                label="Téléphone"
                placeholder="+XXX XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={FiPhone}
              />
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

