import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import api from '../services/api'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi'
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUrl'

const News = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedNews, setExpandedNews] = useState({})
  const itemsPerPage = 6

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await api.get('/news')
      setNews(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer les indices pour la pagination
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = news.slice(startIndex, endIndex)

  // Fonction pour basculer l'état "Lire la suite"
  const toggleExpand = (newsId) => {
    setExpandedNews(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }))
  }

  // Navigation avec les flèches
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Layout>
      <div className="section-container py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in px-4">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Link
              to="/"
              className="flex items-center text-sm sm:text-base text-primary-600 hover:text-primary-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Actualités 📰
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 px-4">
            Restez informé de nos dernières nouvelles et opportunités
          </p>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des actualités...</p>
          </div>
        ) : news.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-600 mb-2">Aucune actualité pour le moment</p>
            <p className="text-gray-500">Revenez bientôt pour découvrir nos dernières nouvelles !</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentNews.map((item, index) => {
                const isExpanded = expandedNews[item.id]
                const contentPreview = item.content?.substring(0, 150) || ''
                const hasMoreContent = item.content?.length > 150

                return (
                  <Card
                    key={item.id}
                    hover
                    className="overflow-hidden animate-slide-up group flex flex-col h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image ou Video */}
                    {item.image && (
                      <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    )}
                    {item.video_url && (
                      <div className="relative h-48 sm:h-56 flex-shrink-0">
                        <ReactPlayer
                          url={item.video_url}
                          width="100%"
                          height="100%"
                          controls
                          className="absolute inset-0"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-primary-700 transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4 flex-grow">
                        {isExpanded ? (
                          <div>
                            <p className="whitespace-pre-wrap break-words">{item.content}</p>
                            {hasMoreContent && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="mt-2 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-semibold transition-colors"
                              >
                                Voir moins
                              </button>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="break-words">{hasMoreContent ? `${contentPreview}...` : item.content}</p>
                            {hasMoreContent && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="mt-2 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-semibold flex items-center transition-colors"
                              >
                                Lire la suite
                                <FiChevronRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-xs text-gray-500">
                          <FiCalendar className="mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(item.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Pagination avec flèches */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-12 gap-3 sm:gap-4 px-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <FiChevronLeft className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Précédent</span>
                  <span className="sm:hidden">Préc.</span>
                </button>

                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-base font-semibold transition-all flex-shrink-0 ${
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suiv.</span>
                  <FiChevronRight className="ml-1 sm:ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default News

