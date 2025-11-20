import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import TestimonialCarousel from '../components/TestimonialCarousel'
import api from '../services/api'
import { FiStar } from 'react-icons/fi'

/**
 * Page de démonstration des deux variantes du carousel d'avis premium
 */
const TestimonialsDemo = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState('horizontal')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews')
      console.log('Reviews fetched:', response.data)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer la note moyenne
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Avis de nos clients
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez les expériences authentiques de nos clients avec TFKS
          </p>
          
          {/* Stats */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-soft px-6 py-4 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold text-primary-600">{averageRating}</div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Note moyenne</p>
              </div>
              <div className="bg-white rounded-2xl shadow-soft px-6 py-4 border border-gray-100">
                <div className="text-3xl font-bold text-primary-600">{reviews.length}</div>
                <p className="text-sm text-gray-600 mt-1">Avis publiés</p>
              </div>
            </div>
          )}

          {/* Sélecteur de variante */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedVariant('horizontal')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedVariant === 'horizontal'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                }`}
              >
                Carousel Horizontal
              </button>
              <button
                onClick={() => setSelectedVariant('columns')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedVariant === 'columns'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                }`}
              >
                3 Colonnes Défilantes
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des avis...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft p-12 text-center border border-gray-100">
            <FiStar className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Aucun avis pour le moment</p>
            <p className="text-gray-500">Soyez le premier à partager votre expérience !</p>
          </div>
        ) : (
          <>
            {/* Variante sélectionnée */}
            <div className="mb-8">
              <TestimonialCarousel 
                reviews={reviews} 
                variant={selectedVariant}
              />
            </div>

            {/* Séparateur avec titre pour la deuxième variante */}
            {selectedVariant === 'horizontal' && (
              <div className="mt-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Variante Alternative
                  </h2>
                  <p className="text-lg text-gray-600">
                    Découvrez l'effet 3 colonnes avec directions différentes
                  </p>
                </div>
                <TestimonialCarousel 
                  reviews={reviews} 
                  variant="columns"
                />
              </div>
            )}

            {selectedVariant === 'columns' && (
              <div className="mt-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Variante Alternative
                  </h2>
                  <p className="text-lg text-gray-600">
                    Découvrez le carousel horizontal continu
                  </p>
                </div>
                <TestimonialCarousel 
                  reviews={reviews} 
                  variant="horizontal"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TestimonialsDemo

