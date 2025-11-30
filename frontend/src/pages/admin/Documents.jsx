import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiXCircle, FiClock, FiDownload, FiFile, FiUser, FiSearch, FiFilter, FiEye, FiX } from 'react-icons/fi'

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [filterStatus])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (document) => {
    try {
      await api.post(`/documents/${document.id}/approve`)
      toast.success('Document approuvé')
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      toast.error('Veuillez fournir une raison de rejet (minimum 10 caractères)')
      return
    }

    try {
      await api.post(`/documents/${selectedDocument.id}/reject`, {
        rejection_reason: rejectionReason,
      })
      toast.success('Document rejeté')
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedDocument(null)
      fetchDocuments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet')
    }
  }

  const handleView = async (doc) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
    
    // Créer un blob URL pour la prévisualisation
    try {
      const response = await api.get(`/documents/${doc.id}/view`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: doc.mime_type || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Error loading preview:', error)
      toast.error('Impossible de charger la prévisualisation')
      setShowPreviewModal(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      })
      // Créer le blob avec le type MIME correct
      const blob = new Blob([response.data], { 
        type: doc.mime_type || response.headers['content-type'] || 'application/octet-stream' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // S'assurer que le nom a la bonne extension
      let fileName = doc.name
      if (!fileName.includes('.')) {
        // Si pas d'extension, essayer de la déduire du type MIME
        const mimeToExt = {
          'application/pdf': 'pdf',
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        }
        const ext = mimeToExt[doc.mime_type] || mimeToExt[response.headers['content-type']] || ''
        if (ext) fileName += '.' + ext
      }
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  // Nettoyer l'URL du blob quand le modal se ferme
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith('image/')
  }

  const isPdf = (mimeType) => {
    return mimeType && mimeType === 'application/pdf'
  }

  const openRejectModal = (document) => {
    setSelectedDocument(document)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'En attente',
        icon: FiClock,
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approuvé',
        icon: FiCheckCircle,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rejeté',
        icon: FiXCircle,
      },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

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

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = !filterStatus || doc.status === filterStatus
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDocumentTypeLabel(doc.type).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Validation des documents 📄
            </h1>
            <p className="text-xl text-gray-600">
              Gérez et validez les documents soumis par les clients
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiFilter className="mr-2" />
              <span>
                {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-600">Chargement...</p>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <FiFile className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Aucun document</p>
            <p className="text-gray-500">
              {filterStatus || searchQuery
                ? 'Aucun document ne correspond aux filtres'
                : 'Aucun document soumis pour le moment'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FiFile className="text-2xl text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-2 truncate" title={doc.name}>
                          {doc.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            <span>{doc.user?.name || 'Utilisateur inconnu'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {getDocumentTypeLabel(doc.type)}
                          </div>
                          <div>
                            <span className="font-medium">Date d'upload:</span>{' '}
                            {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {doc.validated_at && (
                            <div>
                              <span className="font-medium">Validé le:</span>{' '}
                              {new Date(doc.validated_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {doc.validator && ` par ${doc.validator.name}`}
                            </div>
                          )}
                          {doc.status === 'rejected' && doc.rejection_reason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <span className="font-medium text-red-800">Raison du rejet:</span>
                              <p className="text-red-700 mt-1">{doc.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <div>{getStatusBadge(doc.status)}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleView(doc)}
                      >
                        <FiEye className="mr-2" />
                        Visualiser
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <FiDownload className="mr-2" />
                      </Button>
                      {doc.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(doc)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <FiCheckCircle className="mr-2" />
                            Approuver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRejectModal(doc)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <FiXCircle className="mr-2" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card className="max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rejeter le document</h2>
            <p className="text-gray-600 mb-4">
              Document: <span className="font-semibold">{selectedDocument.name}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Raison du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi ce document est rejeté (minimum 10 caractères)..."
                className="input w-full min-h-[120px] resize-none"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/10 caractères minimum
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setSelectedDocument(null)
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10}
                className="bg-red-600 hover:bg-red-700"
              >
                Rejeter
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">{previewDocument.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getDocumentTypeLabel(previewDocument.type)} •{' '}
                  {previewDocument.size
                    ? (previewDocument.size / 1024 / 1024).toFixed(2) + ' MB'
                    : 'Taille inconnue'}
                  {previewDocument.user && ` • Client: ${previewDocument.user.name}`}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(previewDocument)}
                  icon={FiDownload}
                >
                  Télécharger
                </Button>
                <button
                  onClick={() => {
                    if (previewUrl) {
                      window.URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }
                    setShowPreviewModal(false)
                    setPreviewDocument(null)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu de prévisualisation */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {!previewUrl ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : isImage(previewDocument.mime_type) ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <img
                    src={previewUrl}
                    alt={previewDocument.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const errorDiv = e.target.nextSibling
                      if (errorDiv) errorDiv.style.display = 'flex'
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center min-h-[400px] text-gray-500">
                    <FiFile className="w-16 h-16 mb-4" />
                    <p>Impossible de charger l'image</p>
                  </div>
                </div>
              ) : isPdf(previewDocument.mime_type) ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] border-0 rounded-lg shadow-lg"
                    title={previewDocument.name}
                    onError={() => {
                      toast.error('Impossible de charger le PDF')
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                  <FiFile className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold mb-2">Aperçu non disponible</p>
                  <p className="text-sm mb-4">
                    Ce type de fichier ({previewDocument.mime_type || 'inconnu'}) ne peut pas être prévisualisé
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => handleDownload(previewDocument)}
                    icon={FiDownload}
                  >
                    Télécharger pour visualiser
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default AdminDocuments

