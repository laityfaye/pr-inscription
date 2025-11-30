import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiSend, FiMessageSquare, FiUser, FiFile, FiUpload, FiX, FiDownload, FiImage, FiVideo, FiFileText, FiBriefcase, FiHome, FiFileText as FiFileTextIcon } from 'react-icons/fi'

const ClientChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [applicationType, setApplicationType] = useState(null)
  const [applications, setApplications] = useState({ inscriptions: [], workPermits: [], residences: [] })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const fileInputRef = useRef(null)
  const messagesRef = useRef([]) // Ref pour accéder à la valeur actuelle de messages

  // Fonction utilitaire pour dédupliquer les messages
  const deduplicateMessages = useCallback((messages) => {
    const seen = new Map()
    return messages.filter(msg => {
      if (!msg.id) return true // Garder les messages sans ID (ne devrait pas arriver)
      if (seen.has(msg.id)) return false
      seen.set(msg.id, true)
      return true
    })
  }, [])

  // Déclarer toutes les fonctions AVANT les useEffect qui les utilisent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchAdmin = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations')
      if (response.data && response.data.length > 0) {
        setAdmin(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
    }
  }, [])

  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApplications(true)
      // Charger seulement les données minimales nécessaires pour la liste
      const [inscriptionsRes, workPermitsRes, residencesRes] = await Promise.all([
        api.get('/inscriptions?minimal=1').catch(() => ({ data: [] })),
        api.get('/work-permit-applications?minimal=1').catch(() => ({ data: [] })),
        api.get('/residence-applications?minimal=1').catch(() => ({ data: [] })),
      ])
      
      setApplications({
        inscriptions: inscriptionsRes.data || [],
        workPermits: workPermitsRes.data || [],
        residences: residencesRes.data || [],
      })
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }, [])

  const fetchConversation = useCallback(async (sinceId = null) => {
    if (!admin || !selectedApplication) return

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
      const response = await api.get(`/messages/${admin.id}?${params.toString()}`)
      const newMessages = response.data.messages || []
      if (sinceId) {
        // Ajouter seulement les nouveaux messages (éviter les doublons)
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const uniqueNewMessages = newMessages.filter(m => m.id && !existingIds.has(m.id))
          if (uniqueNewMessages.length === 0) return prev
          const updated = deduplicateMessages([...prev, ...uniqueNewMessages])
          messagesRef.current = updated
          return updated
        })
      } else {
        // Chargement initial - dédupliquer au cas où
        const uniqueMessages = deduplicateMessages(newMessages)
        setMessages(uniqueMessages)
        messagesRef.current = uniqueMessages
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    } finally {
      setLoading(false)
    }
  }, [admin, selectedApplication, applicationType, deduplicateMessages])

  const fetchNewMessages = useCallback(async () => {
    if (!admin || !selectedApplication) return
    
    const currentMessages = messagesRef.current
    if (currentMessages.length === 0) return
    
    const lastMessageId = currentMessages[currentMessages.length - 1]?.id
    if (!lastMessageId) return

    try {
      const params = new URLSearchParams()
      if (applicationType && selectedApplication) {
        params.append('application_type', applicationType)
        params.append('application_id', selectedApplication.id)
      }
      params.append('since_id', lastMessageId)
      
      const response = await api.get(`/messages/${admin.id}?${params.toString()}`)
      const newMessages = response.data.messages || []
      if (newMessages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const uniqueNewMessages = newMessages.filter(m => m.id && !existingIds.has(m.id))
          if (uniqueNewMessages.length === 0) return prev
          const updated = deduplicateMessages([...prev, ...uniqueNewMessages])
          messagesRef.current = updated
          return updated
        })
      }
    } catch (error) {
      console.error('Error fetching new messages:', error)
    }
  }, [admin, selectedApplication, applicationType, deduplicateMessages])

  const handleApplicationSelect = useCallback((type, application) => {
    setApplicationType(type)
    setSelectedApplication(application)
    setMessages([])
    messagesRef.current = [] // Réinitialiser aussi la ref
    setLoading(true)
    // Le fetchConversation sera déclenché par un useEffect séparé
  }, [])

  // Charger l'admin et les applications une seule fois au montage
  useEffect(() => {
    fetchAdmin()
    fetchApplications()
  }, [fetchAdmin, fetchApplications]) // Utiliser les callbacks mémorisés

  // Charger les messages quand une application est sélectionnée
  useEffect(() => {
    if (admin && selectedApplication && applicationType) {
      setLoading(true)
      fetchConversation()
    }
  }, [admin?.id, selectedApplication?.id, applicationType, fetchConversation])

  // Polling pour les nouveaux messages (séparé pour éviter les rechargements)
  useEffect(() => {
    if (!admin || !selectedApplication) return

    // Polling pour les nouveaux messages toutes les 5 secondes
    pollingIntervalRef.current = setInterval(() => {
      fetchNewMessages()
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [admin?.id, selectedApplication?.id, applicationType, fetchNewMessages]) // Utiliser les IDs pour la stabilité

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      console.error('Download error:', error)
      if (error.response?.data) {
        // Si c'est une erreur JSON
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result)
            toast.error(errorData.message || 'Erreur lors du téléchargement')
          } catch (e) {
            toast.error('Erreur lors du téléchargement')
          }
        }
        reader.readAsText(error.response.data)
      } else {
        toast.error('Erreur lors du téléchargement')
      }
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !admin) return

    const formData = new FormData()
    formData.append('receiver_id', admin.id)
    if (newMessage.trim()) {
      formData.append('content', newMessage.trim())
    }
    if (selectedApplication && applicationType) {
      formData.append('application_type', applicationType)
      formData.append('application_id', selectedApplication.id)
    }
    if (selectedFile) {
      formData.append('file', selectedFile)
    }

    const messageContent = newMessage.trim()
    setNewMessage('')
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
      // Vérifier que le message n'existe pas déjà avant de l'ajouter
      setMessages((prev) => {
        const exists = prev.some(m => m.id === response.data.id)
        if (exists) return prev
        const updated = [...prev, response.data]
        messagesRef.current = updated
        return updated
      })
      // Ne pas recharger toute la conversation, le message est déjà ajouté
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message')
      setNewMessage(messageContent)
    }
  }

  // Mémoriser allApplications pour éviter les recalculs inutiles
  const allApplications = useMemo(() => {
    const inscriptions = (applications.inscriptions || []).map(app => ({ 
      ...app, 
      type: 'inscription', 
      label: `Préinscription - ${app.country?.name || 'N/A'}`,
      uniqueKey: `inscription-${app.id}`
    }))
    
    const workPermits = (applications.workPermits || []).map(app => ({ 
      ...app, 
      type: 'work_permit', 
      label: `Permis de travail - ${app.country?.name || 'N/A'}`,
      uniqueKey: `work_permit-${app.id}`
    }))
    
    const residences = (applications.residences || []).map(app => ({ 
      ...app, 
      type: 'residence', 
      label: 'Résidence Canada',
      uniqueKey: `residence-${app.id}`
    }))
    
    // Filtrer les doublons potentiels et trier
    const all = [...inscriptions, ...workPermits, ...residences]
    const unique = all.filter((app, index, self) => 
      index === self.findIndex(a => a.uniqueKey === app.uniqueKey)
    )
    
    return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [applications.inscriptions, applications.workPermits, applications.residences])

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Suivi de demande 💬
          </h1>
          <p className="text-xl text-gray-600">
            Suivez l'avancement de vos demandes et communiquez avec l'administrateur
          </p>
        </div>

          <div className="max-w-7xl mx-auto space-y-6">
            {/* Sidebar - Sélection de demande */}
           <Card className="shadow-lg">
             <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
               <h2 className="font-bold text-gray-900 mb-1 text-lg">Mes demandes</h2>
               <p className="text-sm text-gray-600">Sélectionnez une demande pour voir les messages</p>
             </div>
            <div className="p-4">
              {loadingApplications ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2, 3].map(i => (
                    <div key={`skeleton-${i}`} className="flex-shrink-0 w-[200px] h-[150px] bg-gray-200 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : allApplications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
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
                        key={app.uniqueKey || `${app.type}-${app.id}`}
                        onClick={() => handleApplicationSelect(app.type, app)}
                        className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg min-w-[200px] ${
                          isSelected 
                            ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white border-primary-600 shadow-lg scale-105' 
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

          {/* Zone de chat */}
          <Card className="flex flex-col overflow-hidden shadow-lg" style={{ height: '600px' }}>
            {selectedApplication ? (
              <>
             {/* Header */}
             <div className="p-6 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white shadow-lg">
                   <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg ring-2 ring-white/30">
                   {admin ? (
                     <span className="text-white font-bold text-xl">
                       {admin.name?.charAt(0) || 'A'}
                     </span>
                   ) : (
                     <FiUser className="w-7 h-7" />
                   )}
                 </div>
                 <div>
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     {admin ? admin.name : 'Chargement...'}
                     {admin && (
                       <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-normal">
                         <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                         En ligne
                       </span>
                     )}
                   </h2>
                   <p className="text-sm text-primary-100 mt-1 flex items-center gap-2">
                     <span className="inline-block w-1.5 h-1.5 bg-primary-200 rounded-full"></span>
                           {selectedApplication.label}
                   </p>
                       </div>
                 </div>
               </div>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 space-y-4 scroll-smooth">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-600">Chargement des messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FiMessageSquare className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-xl text-gray-600 mb-2">Aucun message</p>
                    <p className="text-gray-500">Commencez la conversation !</p>
                  </div>
                </div>
              ) : (
                    // Filtrer les doublons avant de rendre
                    messages.filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx)
                      .map((message, index) => {
                        const isSender = message.sender_id === user?.id
                        const FileIcon = message.file_path ? getFileIcon(message.file_type) : null
                        // Utiliser une clé composite pour garantir l'unicité
                        const uniqueKey = `msg-${message.id}-${index}`
                        return (
                           <div key={uniqueKey} className="space-y-2">
                             <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                           <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                             isSender
                           ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                           : 'bg-white text-gray-900 border border-gray-200'
                           }`}>
                            {message.status_update && (
                              <div className={`mb-2 p-2 rounded-lg ${
                                isSender ? 'bg-white/20' : 'bg-blue-50'
                              }`}>
                                <p className={`text-xs font-semibold ${
                                  isSender ? 'text-white' : 'text-blue-800'
                                }`}>
                                  📍 Mise à jour: {message.status_update}
                                </p>
                              </div>
                            )}
                            {message.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                            )}
                            {message.file_path && (
                              <div className={`mt-2 p-2 rounded-lg ${
                                isSender ? 'bg-white/20' : 'bg-gray-100'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {FileIcon && <FileIcon className={`w-4 h-4 ${isSender ? 'text-white' : 'text-gray-600'}`} />}
                                  <span className={`text-xs truncate flex-1 ${isSender ? 'text-white' : 'text-gray-700'}`}>
                                    {message.file_name}
                                  </span>
                                  <button
                                    onClick={() => handleDownloadFile(message)}
                                    className={`p-1 rounded hover:bg-white/20 ${isSender ? 'text-white' : 'text-primary-600'}`}
                                    title="Télécharger"
                                  >
                                    <FiDownload className="w-3 h-3" />
                                  </button>
                                </div>
                                {filePreview && message.file_type?.startsWith('image/') && (
                                  <img src={filePreview} alt={message.file_name} className="mt-2 max-w-full rounded" />
                                )}
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
                   disabled={!admin}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault()
                       if ((newMessage.trim() || selectedFile) && admin) {
                         handleSend(e)
                       }
                     }
                   }}
                 />
                 <Button
                   type="submit"
                   variant="primary"
                       disabled={(!newMessage.trim() && !selectedFile) || !admin}
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
               <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
                 <div className="text-center max-w-md px-6">
                   <div className="mb-6">
                     <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center shadow-lg">
                       <FiMessageSquare className="text-5xl text-primary-600" />
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez une demande</h3>
                   <p className="text-gray-600 leading-relaxed">
                     Choisissez une demande dans la liste ci-dessus pour commencer la conversation et suivre son avancement
                   </p>
                 </div>
               </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default ClientChat
