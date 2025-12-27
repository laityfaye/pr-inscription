import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import api from '../services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/forgot-password', { email })
      setEmailSent(true)
      toast.success('Un e-mail de réinitialisation a été envoyé si un compte existe avec cet e-mail.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'e-mail')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full animate-fade-in">
            <Card padding="xl" className="shadow-2xl border-neutral-200/80">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  E-mail envoyé !
                </h2>
                <p className="text-neutral-600 mb-6">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un e-mail contenant un lien pour réinitialiser votre mot de passe.
                </p>
                <p className="text-sm text-neutral-500 mb-6">
                  Vérifiez votre boîte de réception et votre dossier spam. Le lien est valide pendant 60 minutes.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/login')}
                    icon={FiArrowLeft}
                    iconPosition="left"
                  >
                    Retour à la connexion
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                    }}
                  >
                    Envoyer un autre e-mail
                  </Button>
                </div>
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
                  <FiMail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                Mot de passe oublié ?
              </h2>
              <p className="text-neutral-600 text-base">
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Adresse email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={FiMail}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={FiArrowRight}
                iconPosition="right"
              >
                Envoyer le lien de réinitialisation
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium"
              >
                <FiArrowLeft className="mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

