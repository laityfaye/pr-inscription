import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiStar, FiGlobe, FiMessageSquare, FiArrowLeft } from 'react-icons/fi'

const AddReview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    country_obtained: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/reviews', formData)
      toast.success('Avis soumis avec succès. Il sera publié après modération.')
      navigate('/client/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Retour au tableau de bord
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Laisser un avis ⭐
          </h1>
          <p className="text-xl text-gray-600">
            Partagez votre expérience avec la communauté
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-10 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Votre note
                </label>
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                      aria-label={`Note ${rating} sur 5`}
                    >
                      <FiStar
                        className={`w-12 h-12 transition-all ${
                          rating <= formData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-lg font-semibold text-gray-700">
                    {formData.rating} / 5
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez sur les étoiles pour donner votre note
                </p>
              </div>

              {/* Country Obtained */}
              <div>
                <Input
                  label="Pays obtenu"
                  icon={FiGlobe}
                  type="text"
                  value={formData.country_obtained}
                  onChange={(e) => setFormData({ ...formData, country_obtained: e.target.value })}
                  placeholder="Ex: France, Canada, États-Unis..."
                  helperText="Indiquez le pays pour lequel vous avez obtenu votre visa"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Votre avis
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="8"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Partagez votre expérience avec TFKS... Comment s'est déroulé votre processus de préinscription ? Quels sont les points forts de notre service ?"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.content.length} caractères
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Votre avis sera soumis à modération avant d'être publié. 
                  Nous nous réservons le droit de refuser tout avis ne respectant pas nos conditions d'utilisation.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/client/dashboard')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="min-w-[150px]"
                >
                  {loading ? 'Envoi...' : 'Soumettre mon avis'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default AddReview


