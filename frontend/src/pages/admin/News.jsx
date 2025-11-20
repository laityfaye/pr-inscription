import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import ReactPlayer from 'react-player'
import { getImageUrl } from '../../utils/imageUrl'

const AdminNews = () => {
  const [news, setNews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    video_type: 'youtube',
    is_published: true,
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await api.get('/news?all=true')
      setNews(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation côté client
    if (!formData.title || !formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (!formData.content || !formData.content.trim()) {
      toast.error('Le contenu est requis')
      return
    }
    
    const data = new FormData()
    data.append('title', formData.title.trim())
    data.append('content', formData.content.trim())
    
    // Ne pas envoyer video_url si vide
    if (formData.video_url && formData.video_url.trim()) {
      data.append('video_url', formData.video_url.trim())
      data.append('video_type', formData.video_type)
    } else {
      // S'assurer que video_url est null si vide
      data.append('video_url', '')
    }
    
    // Convertir is_published en booléen
    data.append('is_published', formData.is_published ? '1' : '0')
    
    if (image) {
      data.append('image', image)
      console.log('Image ajoutée au FormData:', image.name, image.type, image.size)
    } else {
      console.log('Aucune image sélectionnée')
    }

    try {
      let response
      if (editingNews) {
        // Utiliser POST avec _method=PUT pour FormData (comme dans Settings)
        data.append('_method', 'PUT')
        response = await api.post(`/news/${editingNews.id}`, data)
        toast.success('Actualité modifiée')
      } else {
        response = await api.post('/news', data)
        toast.success('Actualité créée')
      }
      
      // Vérifier si l'image a été sauvegardée
      if (response.data?.image) {
        console.log('Image sauvegardée:', response.data.image)
      }
      
      setShowModal(false)
      resetForm()
      fetchNews()
    } catch (error) {
      // Afficher les erreurs de validation
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`)
        })
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
      console.error('Error:', error.response?.data)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      return
    }

    try {
      await api.delete(`/news/${id}`)
      toast.success('Actualité supprimée')
      fetchNews()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleEdit = (item) => {
    setEditingNews(item)
    setFormData({
      title: item.title,
      content: item.content,
      video_url: item.video_url || '',
      video_type: item.video_type || 'youtube',
      is_published: item.is_published,
    })
    setImagePreview(item.image ? getImageUrl(item.image) : null)
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      video_url: '',
      video_type: 'youtube',
      is_published: true,
    })
    setImage(null)
    setImagePreview(null)
    setEditingNews(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des actualités</h1>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            Nouvelle actualité
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {item.image && (
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              {item.video_url && (
                <div className="w-full h-48">
                  <ReactPlayer
                    url={item.video_url}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.content}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de vidéo
                  </label>
                  <select
                    value={formData.video_type}
                    onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="file">Fichier MP4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Vidéo
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="URL YouTube ou chemin fichier"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Publier</label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingNews ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminNews


