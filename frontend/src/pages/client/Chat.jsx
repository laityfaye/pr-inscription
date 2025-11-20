import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi'
import io from 'socket.io-client'
import { getSocketUrl } from '../../utils/socketUrl'

const ClientChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [admin, setAdmin] = useState(null)
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversation()
    // Initialiser Socket.io pour le chat temps réel
    const newSocket = io(getSocketUrl())
    setSocket(newSocket)

    newSocket.on('message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await api.get('/messages')
      setMessages(response.data.messages || [])
      setAdmin(response.data.other_user)
    } catch (error) {
      console.error('Error fetching conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !admin) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      const response = await api.post('/messages', {
        receiver_id: admin.id,
        content: messageContent,
      })
      setMessages((prev) => [...prev, response.data])
      
      // Envoyer via socket
      if (socket) {
        socket.emit('message', response.data)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent) // Restaurer le message en cas d'erreur
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Messages 💬
          </h1>
          <p className="text-xl text-gray-600">
            Contactez l'administrateur pour toute question
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="flex flex-col overflow-hidden" style={{ height: '500px' }}>
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {admin ? (
                    <span className="text-white font-bold text-lg">
                      {admin.name?.charAt(0) || 'A'}
                    </span>
                  ) : (
                    <FiUser className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {admin ? admin.name : 'Chargement...'}
                  </h2>
                  <p className="text-sm text-primary-100">
                    {admin ? 'Administrateur TFKS' : 'Connexion en cours...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
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
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    } animate-slide-up`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-soft ${
                        message.sender_id === user?.id
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender_id === user?.id
                            ? 'text-primary-100'
                            : 'text-gray-500'
                        }`}
                      >
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
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                  disabled={!admin}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!newMessage.trim() || !admin}
                  className="px-6"
                >
                  <FiSend className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default ClientChat


