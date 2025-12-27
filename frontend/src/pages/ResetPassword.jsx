import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { FiLock, FiArrowRight, FiCheck } from 'react-icons/fi'
import api from '../services/api'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (email && token) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
        token,
      }))
    } else {
      toast.error('Lien de réinitialisation invalide')
      navigate('/forgot-password')
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      await api.post('/reset-password', {
        email: formData.email,
        token: formData.token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })
      setSuccess(true)
      toast.success('Votre mot de passe a été réinitialisé avec succès !')
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full animate-fade-in">
            <Card padding="xl" className="shadow-2xl border-neutral-200/80">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <FiCheck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  Mot de passe réinitialisé !
                </h2>
                <p className="text-neutral-600 mb-6">
                  Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/login')}
                  icon={FiArrowRight}
                  iconPosition="right"
                >
                  Aller à la page de connexion
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full animate-fade-in">
          <Card padding="xl" className="shadow-2xl border-neutral-200/80">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg">
                  <FiLock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                Réinitialiser votre mot de passe
              </h2>
              <p className="text-neutral-600 text-base">
                Entrez votre nouveau mot de passe ci-dessous
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Adresse email"
                value={formData.email}
                disabled
                className="bg-neutral-100"
              />

              <Input
                type="password"
                label="Nouveau mot de passe"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                icon={FiLock}
                minLength={8}
              />

              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required
                icon={FiLock}
                minLength={8}
              />

              <div className="text-sm text-neutral-500">
                <p>Le mot de passe doit contenir au moins 8 caractères.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={FiArrowRight}
                iconPosition="right"
              >
                Réinitialiser le mot de passe
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-600">
                Vous vous souvenez de votre mot de passe ?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

