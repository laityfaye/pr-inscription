import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiXCircle, FiStar } from 'react-icons/fi'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/all')
      console.log('Admin reviews fetched:', response.data)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Erreur lors du chargement des avis')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/reviews/${id}/status`, { status })
      toast.success('Statut mis à jour')
      fetchReviews()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return
    }

    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Avis supprimé')
      fetchReviews()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approuvé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeté' },
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Modération des avis</h1>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-gray-600 mb-2">Aucun avis à modérer</p>
            <p className="text-gray-500">Les avis soumis par les clients apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{review.user?.name || 'Anonyme'}</h3>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {getStatusBadge(review.status)}
              </div>
              <p className="text-gray-700 mb-2">{review.content}</p>
              {review.country_obtained && (
                <p className="text-sm text-primary-600 mb-4">
                  Pays obtenu: {review.country_obtained}
                </p>
              )}
              <div className="flex justify-end space-x-2">
                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                    >
                      <FiCheckCircle className="mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(review.id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                    >
                      <FiXCircle className="mr-2" />
                      Rejeter
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReviews








