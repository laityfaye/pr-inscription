import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      toast.success('Connexion réussie !')
      // Rediriger selon le rôle de l'utilisateur
      if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user?.role === 'avocat') {
        navigate('/avocat/dashboard')
      } else {
        navigate('/client/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
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
                Bienvenue de retour
              </h2>
              <p className="text-neutral-600 text-base">
                Connectez-vous à votre compte pour continuer
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                icon={FiLock}
              />

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium"
                >
                  Mot de passe oublié ?
                </Link>
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
                Se connecter
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-600">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login


