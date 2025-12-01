import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { FiCalendar, FiClock, FiPhone, FiMail, FiUser, FiMessageSquare, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'

const Appointment = () => {
  const [agency, setAgency] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  })

  useEffect(() => {
    fetchAgency()
  }, [])

  const fetchAgency = async () => {
    try {
      const response = await api.get('/agency')
      setAgency(response.data)
    } catch (error) {
      console.error('Error fetching agency:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Ici, vous pouvez ajouter l'appel API pour envoyer la demande de rendez-vous
    // Pour l'instant, on simule juste l'envoi
    toast.success('Votre demande de rendez-vous a été envoyée avec succès !')
    
    // Réinitialiser le formulaire
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      message: '',
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Layout>
      <div className="section-container py-12">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FiArrowLeft className="mr-2" />
          Retour à l'accueil
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mb-6 shadow-xl">
              <FiCalendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Prendre rendez-vous
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {agency && (agency.lawyer_first_name || agency.lawyer_last_name) 
                ? `Réservez une consultation avec ${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() + ' pour discuter de votre projet d\'immigration'
                : 'Réservez une consultation pour discuter de votre projet d\'immigration'
              }
            </p>
          </div>

          <div className={`grid grid-cols-1 ${agency && (agency.lawyer_first_name || agency.lawyer_last_name) ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
            {/* Lawyer Info Card */}
            {agency && (agency.lawyer_first_name || agency.lawyer_last_name) && (
              <Card className="lg:col-span-1 p-6">
                <div className="text-center">
                  {agency.lawyer_image && (
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                        <img 
                          src={getImageUrl(agency.lawyer_image)} 
                          alt={`${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() || 'Avocat'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {agency.lawyer_first_name || ''} {agency.lawyer_last_name || ''}
                  </h3>
                  {agency.lawyer_title && (
                    <p className="text-neutral-600 mb-6">{agency.lawyer_title}</p>
                  )}
                  
                  <div className="space-y-4 text-left">
                    {agency.lawyer_phone && (
                      <div className="flex items-center text-neutral-700">
                        <FiPhone className="w-5 h-5 mr-3 text-primary-600" />
                        <span>{agency.lawyer_phone}</span>
                      </div>
                    )}
                    {agency.lawyer_email && (
                      <div className="flex items-center text-neutral-700">
                        <FiMail className="w-5 h-5 mr-3 text-primary-600" />
                        <span>{agency.lawyer_email}</span>
                      </div>
                    )}
                    <div className="flex items-center text-neutral-700">
                      <FiClock className="w-5 h-5 mr-3 text-primary-600" />
                      <span>Lun - Ven: 9h - 18h</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Form */}
            <Card className={`${agency && (agency.lawyer_first_name || agency.lawyer_last_name) ? 'lg:col-span-2' : 'lg:col-span-1'} p-8`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <FiUser className="inline w-4 h-4 mr-2" />
                      Nom complet *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <FiMail className="inline w-4 h-4 mr-2" />
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <FiPhone className="inline w-4 h-4 mr-2" />
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+221 XX XXX XX XX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <FiCalendar className="inline w-4 h-4 mr-2" />
                      Date souhaitée *
                    </label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    <FiClock className="inline w-4 h-4 mr-2" />
                    Heure souhaitée *
                  </label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    <FiMessageSquare className="inline w-4 h-4 mr-2" />
                    Message (optionnel)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Décrivez brièvement votre demande..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-lg"
                >
                  <FiCalendar className="inline w-5 h-5 mr-2" />
                  Confirmer le rendez-vous
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Appointment

