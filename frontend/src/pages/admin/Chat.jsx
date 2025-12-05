import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSend, FiUser, FiMessageSquare, FiSearch, FiX, FiFile, FiUpload, FiDownload, FiImage, FiVideo, FiFileText, FiBriefcase, FiHome, FiFileText as FiFileTextIcon, FiCheckCircle } from 'react-icons/fi'

const STATUS_OPTIONS = {
  inscription: [
    'Validation des documents',
    'Paiement à la banque',
    'Entretien programmé',
    'Acceptation',
    'En attente de visa',
    'Visa obtenu',
  ],
  work_permit: [
    'Validation des documents',
    'Vérification des compétences',
    'Entretien avec l\'employeur',
    'Paiement des frais',
    'Acceptation',
    'Permis délivré',
  ],
  residence: [
    'Validation des documents',
    'Vérification des critères d\'éligibilité',
    'Entretien',
    'Paiement des frais',
    'Acceptation',
    'Résidence permanente accordée',
  ],
}

const AdminChat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [applicationType, setApplicationType] = useState(null)
  const [applications, setApplications] = useState({ inscriptions: [], workPermits: [], residences: [] })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const messagesEndRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    
    // Polling pour les nouveaux messages toutes les 5 secondes
    pollingIntervalRef.current = setInterval(() => {
      if (selectedClient && selectedApplication) {
        fetchNewMessages(selectedClient.id)
      }
      // Mettre à jour les conversations moins fréquemment (toutes les 15 secondes)
      if (Date.now() % 15000 < 5000) {
      fetchConversations()
      }
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [selectedClient, selectedApplication, applicationType])

  useEffect(() => {
    if (selectedClient) {
      fetchApplications(selectedClient.id)
    }
  }, [selectedClient])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fermer les résultats de recherche quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchResults])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations')
      setConversations(response.data || [])
      // Sélectionner le premier client si aucun n'est sélectionné
      if (!selectedClient && response.data.length > 0) {
        setSelectedClient(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchApplications = async (clientId) => {
    try {
      const [inscriptionsRes, workPermitsRes, residencesRes] = await Promise.all([
        api.get(`/inscriptions?user_id=${clientId}`).catch(() => ({ data: [] })),
        api.get(`/work-permit-applications?user_id=${clientId}`).catch(() => ({ data: [] })),
        api.get(`/residence-applications?user_id=${clientId}`).catch(() => ({ data: [] })),
      ])
      setApplications({
        inscriptions: inscriptionsRes.data || [],
        workPermits: workPermitsRes.data || [],
        residences: residencesRes.data || [],
      })
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const searchClients = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      setSearchResults(response.data || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Error searching clients:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    // Délai de debounce pour éviter trop de requêtes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchClients(value)
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSelectClient = (client) => {
    setSelectedClient(client)
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedApplication(null)
    setApplicationType(null)
    setMessages([])
    // Ajouter le client à la liste des conversations s'il n'y est pas déjà
    if (!conversations.find(c => c.id === client.id)) {
      setConversations([client, ...conversations])
    }
  }

  const handleApplicationSelect = (type, application) => {
    setApplicationType(type)
    setSelectedApplication(application)
    setMessages([])
    fetchMessages(selectedClient.id)
  }

  const fetchMessages = async (clientId, sinceId = null) => {
    if (!clientId) return

    try {
      const params = new URLSearchParams()
      if (applicationType && selectedApplication) {
        params.append('application_type', applicationType)
        params.append('application_id', selectedApplication.id)
      }
      if (sinceId) {
        params.append('since_id', sinceId)
      } else {
        params.append('limit', '50') // Limiter à 50 messages initiaux
      }
      const response = await api.get(`/messages/${clientId}?${params.toString()}`)
      const newMessages = response.data.messages || []
      if (sinceId) {
        // Ajouter seulement les nouveaux messages
        setMessages(prev => [...prev, ...newMessages])
      } else {
        // Chargement initial
        setMessages(newMessages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchNewMessages = async (clientId) => {
    if (!clientId || messages.length === 0) return
    
    const lastMessageId = messages[messages.length - 1]?.id
    if (lastMessageId) {
      await fetchMessages(clientId, lastMessageId)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 10 MB')
        return
      }
      setSelectedFile(file)
      // Créer une prévisualisation pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return FiImage
    if (fileType?.startsWith('video/')) return FiVideo
    return FiFileText
  }

  const handleDownloadFile = async (message) => {
    try {
      const response = await api.get(`/messages/${message.id}/download`, { 
        responseType: 'blob',
        headers: {
          'Accept': message.file_type || 'application/octet-stream'
        }
      })
      
      // Vérifier si la réponse est une erreur JSON
      if (response.data instanceof Blob && response.data.size === 0) {
        const text = await response.data.text()
        try {
          const error = JSON.parse(text)
          toast.error(error.message || 'Erreur lors du téléchargement')
          return
        } catch (e) {
          // Ce n'est pas du JSON, continuer
        }
      }
      
      const blob = new Blob([response.data], { type: message.file_type || response.headers['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // S'assurer que le nom du fichier a la bonne extension
      let fileName = message.file_name || 'download'
      if (message.file_type && !fileName.includes('.')) {
        const mimeToExt = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'application/pdf': 'pdf',
          'video/mp4': 'mp4',
          'video/quicktime': 'mov',
        }
        const ext = mimeToExt[message.file_type]
        if (ext) fileName += '.' + ext
      }
      
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Fichier téléchargé')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile && !statusUpdate) || !selectedClient) return

    const formData = new FormData()
    formData.append('receiver_id', selectedClient.id)
    if (newMessage.trim()) {
      formData.append('content', newMessage.trim())
    }
    if (selectedApplication && applicationType) {
      formData.append('application_type', applicationType)
      formData.append('application_id', selectedApplication.id)
    }
    if (statusUpdate) {
      formData.append('status_update', statusUpdate)
    }
    if (selectedFile) {
      formData.append('file', selectedFile)
    }

    const messageContent = newMessage.trim()
    const statusUpdateValue = statusUpdate
    setNewMessage('')
    setStatusUpdate('')
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    try {
      const response = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setMessages((prev) => [...prev, response.data])
      fetchMessages(selectedClient.id)
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message')
      setNewMessage(messageContent)
      setStatusUpdate(statusUpdateValue)
    }
  }

  const allApplications = selectedClient ? [
    ...applications.inscriptions.map(app => ({ ...app, type: 'inscription', label: `Préinscription - ${app.country?.name || 'N/A'}` })),
    ...applications.workPermits.map(app => ({ ...app, type: 'work_permit', label: `Permis de travail - ${app.country?.name || 'N/A'}` })),
    ...applications.residences.map(app => ({ ...app, type: 'residence', label: 'Résidence Canada' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Suivi des demandes</h1>
          <p className="text-gray-600">Gérez les conversations et suivez l'avancement des demandes</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Liste des conversations */}
            <Card className="lg:col-span-2 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
              <h2 className="font-bold text-gray-900 mb-3 text-lg">Conversations</h2>
              {/* Barre de recherche */}
              <div className="relative search-container">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Rechercher un client..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowSearchResults(true)
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                        setShowSearchResults(false)
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Résultats de recherche */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-800 rounded-full flex items-center justify-center text-white font-semibold">
                            {client.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Recherche en cours...
                  </div>
                )}
                {showSearchResults && !isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Aucun client trouvé
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiMessageSquare className="mx-auto text-4xl mb-2 opacity-50" />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className={`w-full p-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                        selectedClient?.id === client.id 
                          ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-l-4 border-primary-600 shadow-sm' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                            selectedClient?.id === client.id 
                              ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md' 
                              : 'bg-gradient-to-br from-primary-500 to-primary-800 text-white'
                          }`}>
                            {client.name?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">{client.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {client.email}
                            </p>
                          </div>
                        </div>
                        {client.unread_count > 0 && (
                          <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                            selectedClient?.id === client.id 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-primary-600 text-white'
                          }`}>
                            {client.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

            {/* Zone de chat */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {/* Liste des demandes du client sélectionné - Disposition horizontale en haut */}
              {selectedClient && (
                <Card className="overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
                    <h2 className="font-bold text-gray-900 mb-2 text-lg">Demandes de {selectedClient.name}</h2>
                    <p className="text-sm text-gray-600">Sélectionnez une demande pour voir les messages</p>
                  </div>
                  <div className="p-4">
                    {allApplications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <FiMessageSquare className="mx-auto text-4xl mb-2 opacity-50" />
                        <p className="text-sm">Aucune demande</p>
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                        {allApplications.map((app) => {
                          const Icon = app.type === 'inscription' ? FiFileTextIcon : app.type === 'work_permit' ? FiBriefcase : FiHome
                          const isSelected = selectedApplication?.id === app.id && applicationType === app.type
                          return (
                            <button
                              key={`${app.type}-${app.id}`}
                              onClick={() => handleApplicationSelect(app.type, app)}
                              className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg min-w-[200px] ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white border-primary-600 shadow-lg scale-105' 
                                  : 'bg-white text-gray-900 border-gray-200 hover:border-primary-300'
                              }`}
                            >
                              <div className="flex flex-col items-center text-center space-y-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-semibold text-sm ${
                                    isSelected ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {app.label}
                                  </p>
                                  <p className={`text-xs mt-1 ${
                                    isSelected ? 'text-white/80' : 'text-gray-500'
                                  }`}>
                                    {new Date(app.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Zone de messages */}
              <Card className="flex-1 flex flex-col shadow-lg" style={{ minHeight: '500px', maxHeight: '600px' }}>
                {selectedClient ? (
                  <>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-800 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg ring-2 ring-white/30">
                        <span className="text-white font-bold text-xl">
                          {selectedClient.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          {selectedClient.name}
                          {selectedApplication && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-normal">
                              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                              En cours
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-primary-100 mt-1 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 bg-primary-200 rounded-full"></span>
                          {selectedApplication ? selectedApplication.label : selectedClient.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 space-y-4 scroll-smooth">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FiMessageSquare className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-xl text-gray-600 mb-2">
                          {selectedApplication ? 'Aucun message pour cette demande' : 'Sélectionnez une demande pour voir les messages'}
                        </p>
                        <p className="text-gray-500">Commencez la conversation !</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isSender = message.sender_id === user?.id
                      const FileIcon = message.file_path ? getFileIcon(message.file_type) : null
                      const messageDate = new Date(message.created_at)
                      const isToday = messageDate.toDateString() === new Date().toDateString()
                      const showDateSeparator = index === 0 || new Date(messages[index - 1]?.created_at).toDateString() !== messageDate.toDateString()
                      
                      return (
                        <div key={message.id} className="space-y-2">
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                                {isToday ? "Aujourd'hui" : messageDate.toLocaleDateString('fr-FR', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </div>
                            </div>
                          )}
                          <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                              isSender
                                ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                              {message.status_update && (
                                <div className={`mb-2 p-3 rounded-lg border ${
                                  isSender ? 'bg-white/20 border-white/30' : 'bg-blue-50 border-blue-200'
                                }`}>
                                  <p className={`text-xs font-semibold flex items-center gap-2 ${
                                    isSender ? 'text-white' : 'text-blue-800'
                                  }`}>
                                    <FiCheckCircle className="w-4 h-4" />
                                    <span>Mise à jour: {message.status_update}</span>
                                  </p>
                                </div>
                              )}
                              {message.content && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              )}
                              {message.file_path && (
                                <div className={`mt-2 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                                  isSender ? 'bg-white/20 border-white/30' : 'bg-gray-50 border-gray-200'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    {FileIcon && <FileIcon className={`w-5 h-5 ${isSender ? 'text-white' : 'text-gray-600'}`} />}
                                    <span className={`text-xs truncate flex-1 font-medium ${isSender ? 'text-white' : 'text-gray-700'}`}>
                                      {message.file_name}
                                    </span>
                                    <button
                                      onClick={() => handleDownloadFile(message)}
                                      className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                                        isSender 
                                          ? 'text-white hover:bg-white/30' 
                                          : 'text-primary-600 hover:bg-primary-50'
                                      }`}
                                      title="Télécharger"
                                    >
                                      <FiDownload className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-end gap-1 mt-2">
                                <p className={`text-xs flex items-center gap-1 ${isSender ? 'text-primary-100' : 'text-gray-500'}`}>
                                  {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-lg">
                  {selectedApplication && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        📍 Mise à jour du niveau d'avancement
                      </label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full input text-sm border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Sélectionnez un niveau d'avancement...</option>
                        {STATUS_OPTIONS[applicationType]?.map((status, index) => (
                          <option key={index} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FiFile className="w-7 h-7 text-primary-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-800 font-medium truncate block">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      icon={FiUpload}
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Fichier
                    </Button>
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 shadow-sm focus:shadow-md transition-all duration-200"
                      disabled={!selectedClient}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if ((newMessage.trim() || selectedFile || statusUpdate) && selectedClient) {
                            handleSend(e)
                          }
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={(!newMessage.trim() && !selectedFile && !statusUpdate) || !selectedClient}
                      className="px-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <FiSend className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Appuyez sur <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Entrée</kbd> pour envoyer
                  </p>
                </form>
              </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FiUser className="mx-auto text-6xl mb-4 opacity-50" />
                      <p>Sélectionnez un client pour commencer la conversation</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminChat
