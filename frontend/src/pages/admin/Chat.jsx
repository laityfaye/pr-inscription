import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { FiSend, FiUser, FiMessageSquare, FiSearch, FiX } from 'react-icons/fi'
import io from 'socket.io-client'
import { getSocketUrl } from '../../utils/socketUrl'

const AdminChat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const messagesEndRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    // Initialiser Socket.io pour le chat temps réel
    const newSocket = io(getSocketUrl())
    setSocket(newSocket)

    newSocket.on('message', (message) => {
      setMessages((prev) => [...prev, message])
      // Mettre à jour le compteur de messages non lus
      fetchConversations()
    })

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient.id)
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
    // Ajouter le client à la liste des conversations s'il n'y est pas déjà
    if (!conversations.find(c => c.id === client.id)) {
      setConversations([client, ...conversations])
    }
  }

  const fetchMessages = async (clientId) => {
    try {
      const response = await api.get(`/messages/${clientId}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedClient) return

    try {
      const response = await api.post('/messages', {
        receiver_id: selectedClient.id,
        content: newMessage,
      })
      setMessages((prev) => [...prev, response.data])
      setNewMessage('')
      
      // Envoyer via socket
      if (socket) {
        socket.emit('message', response.data)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages des clients</h1>
          <p className="text-gray-600">Gérez les conversations avec vos clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <Card className="lg:col-span-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900 mb-3">Conversations</h2>
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
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
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
            <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
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
                      onClick={() => setSelectedClient(client)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedClient?.id === client.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {client.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </div>
                        {client.unread_count > 0 && (
                          <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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
          <Card className="lg:col-span-2 flex flex-col" style={{ height: '500px' }}>
            {selectedClient ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedClient.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h2 className="font-bold">{selectedClient.name}</h2>
                      <p className="text-sm text-primary-100">{selectedClient.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FiMessageSquare className="mx-auto text-4xl mb-2 opacity-50" />
                      <p>Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                            message.sender_id === user?.id
                              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 input"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newMessage.trim()}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
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
    </Layout>
  )
}

export default AdminChat


