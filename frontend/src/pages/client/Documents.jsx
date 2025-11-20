import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiUpload, FiDownload, FiTrash2, FiFile, FiFileText, FiImage, FiPaperclip } from 'react-icons/fi'

const ClientDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [file, setFile] = useState(null)
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleUpload = async () => {
    if (!file || !type) {
      toast.error('Veuillez sélectionner un fichier et un type')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploadé avec succès')
      setShowModal(false)
      setFile(null)
      setType('')
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', document.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document supprimé')
      fetchDocuments()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const documentTypes = [
    { value: 'identity', label: 'Pièce d\'identité' },
    { value: 'passport', label: 'Passeport' },
    { value: 'transcript', label: 'Relevé de notes' },
    { value: 'diploma', label: 'Diplôme' },
    { value: 'other', label: 'Autre' },
  ]

  const getDocumentTypeLabel = (type) => {
    const types = {
      identity: 'Pièce d\'identité',
      passport: 'Passeport',
      transcript: 'Relevé de notes',
      diploma: 'Diplôme',
      other: 'Autre',
    }
    return types[type] || type
  }

  const getDocumentIcon = (type) => {
    if (type === 'image' || type.includes('image')) return FiImage
    return FiFileText
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Mes documents 📄
            </h1>
            <p className="text-xl text-gray-600">
              Gérez tous vos documents en un seul endroit
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0"
          >
            <FiUpload className="mr-2" />
            Uploader un document
          </Button>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Card className="p-12 text-center animate-slide-up">
            <FiFile className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Aucun document</p>
            <p className="text-gray-500 mb-6">Commencez par uploader votre premier document</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FiUpload className="mr-2" />
              Uploader un document
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => {
              const DocIcon = getDocumentIcon(doc.type)
              return (
                <Card
                  key={doc.id}
                  hover
                  className="p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                      <DocIcon className="text-2xl text-white" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPaperclip className="mr-2" />
                      <span className="font-medium">{getDocumentTypeLabel(doc.type)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <FiDownload className="mr-2" />
                      Télécharger
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploader un document</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de document
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Sélectionner un type</option>
                  {documentTypes.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fichier
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FiUpload className="text-4xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false)
                  setFile(null)
                  setType('')
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || !type || loading}
                loading={loading}
              >
                {loading ? 'Upload...' : 'Uploader'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default ClientDocuments


