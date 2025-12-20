import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { FiCalendar, FiClock, FiPhone, FiMail, FiUser, FiMessageSquare, FiCheck, FiAlertCircle, FiInfo, FiUpload, FiX, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'
import { useAuth } from '../contexts/AuthContext'

const Appointment = () => {
  const { user } = useAuth()
  const [agency, setAgency] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState(() => new Set())
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = semaine en cours, 1 = semaine prochaine
  const [paymentProof, setPaymentProof] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([]) // Créneaux déjà réservés
  const [unavailableDays, setUnavailableDays] = useState([]) // Jours indisponibles
  const [slotPrices, setSlotPrices] = useState({}) // Prix des créneaux horaires
  const [clientAppointment, setClientAppointment] = useState(null) // Rendez-vous du client
  const [checkEmail, setCheckEmail] = useState('') // Email pour vérifier le statut
  const [isCheckingStatus, setIsCheckingStatus] = useState(false) // État de chargement

  // Heures disponibles : 8h à 12h et 15h à 18h
  const availableHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '15:00', '16:00', '17:00', '18:00'
  ]

  // Images pour le carrousel - défini en dehors du composant ou avec useMemo
  const heroImages = [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  ]

  useEffect(() => {
    fetchAgency()
    fetchBookedSlots()
    fetchUnavailableDays()
    fetchSlotPrices()
  }, [])

  // Auto-remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
      // Mettre à jour l'email de vérification également
      if (user.email) {
        setCheckEmail(user.email)
      }
    }
  }, [user])

  // Précharger toutes les images
  useEffect(() => {
    let isMounted = true
    
    const imagePromises = heroImages.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          if (isMounted) {
            setLoadedImages((prev) => {
              const newSet = new Set(prev)
              newSet.add(index)
              return newSet
            })
          }
          resolve()
        }
        img.onerror = () => {
          console.warn(`Failed to load image ${index + 1}`)
          resolve() // Continue même si une image échoue
        }
        img.src = src
      })
    })

    Promise.all(imagePromises).catch((error) => {
      console.error('Error loading images:', error)
    })

    return () => {
      isMounted = false
    }
  }, []) // heroImages est constant, pas besoin de dépendance

  // Carrousel automatique des images
  useEffect(() => {
    // Ne démarrer le carrousel que si au moins une image est chargée
    if (loadedImages.size === 0) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Change d'image toutes les 5 secondes

    return () => clearInterval(interval)
  }, [loadedImages.size, heroImages.length])

  const fetchAgency = async () => {
    try {
      const response = await api.get('/agency')
      if (response && response.data) {
        setAgency(response.data)
      }
    } catch (error) {
      console.error('Error fetching agency:', error)
      // Ne pas bloquer l'application si l'API échoue
      setAgency(null)
    }
  }

  // Récupérer les créneaux déjà réservés
  const fetchBookedSlots = async () => {
    try {
      const response = await api.get('/appointments/booked-slots')
      if (response && response.data) {
        // Format: [{ date: '2024-01-15', time: '09:00' }, ...]
        setBookedSlots(response.data)
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error)
      // En cas d'erreur, on continue sans bloquer
      setBookedSlots([])
    }
  }

  // Récupérer les jours indisponibles
  const fetchUnavailableDays = async () => {
    try {
      const response = await api.get('/appointments/unavailable-days')
      if (response && response.data) {
        // Format: ['2024-01-15', '2024-01-20', ...]
        setUnavailableDays(response.data)
      }
    } catch (error) {
      console.error('Error fetching unavailable days:', error)
      setUnavailableDays([])
    }
  }

  // Récupérer les prix des créneaux horaires
  const fetchSlotPrices = async () => {
    try {
      const response = await api.get('/appointments/slot-prices')
      const prices = response.data || {}
      
      // Normaliser les prix - gérer le nouveau format (objet avec price et currency) et l'ancien format
      const normalizedPrices = {}
      if (prices && typeof prices === 'object') {
        Object.keys(prices).forEach(time => {
          const value = prices[time]
          
          // Gérer le nouveau format (objet avec price et currency)
          if (typeof value === 'object' && value !== null) {
            const priceVal = value.price
            const currencyVal = value.currency || 'FCFA'
            if (priceVal !== null && priceVal !== undefined && priceVal !== '') {
              const numValue = typeof priceVal === 'number' ? priceVal : parseFloat(priceVal)
              if (!isNaN(numValue) && numValue > 0) {
                normalizedPrices[time] = {
                  price: numValue,
                  currency: currencyVal
                }
              }
            }
          } else if (value !== null && value !== undefined && value !== '') {
            // Ancien format : juste un nombre
            const numValue = typeof value === 'number' ? value : parseFloat(value)
            if (!isNaN(numValue) && numValue > 0) {
              normalizedPrices[time] = {
                price: numValue,
                currency: 'FCFA'
              }
            }
          }
        })
      }
      
      setSlotPrices(normalizedPrices)
    } catch (error) {
      console.error('Error fetching slot prices:', error)
      // Ne pas bloquer l'application si les prix ne peuvent pas être chargés
      setSlotPrices({})
    }
  }

  useEffect(() => {
    fetchBookedSlots()
    fetchUnavailableDays()
    fetchSlotPrices()
    // Rafraîchir les créneaux toutes les 30 secondes
    const interval = setInterval(() => {
      fetchBookedSlots()
      fetchUnavailableDays()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Générer les jours de la semaine (7 jours)
  const getWeekDays = () => {
    const days = []
    const today = new Date()
    const startDay = currentWeek * 7 // 0 pour semaine en cours, 7 pour semaine prochaine
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + startDay + i)
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
      const dayNumber = date.getDate()
      const month = date.toLocaleDateString('fr-FR', { month: 'short' })
      const dateString = date.toISOString().split('T')[0]
      const isUnavailable = unavailableDays.includes(dateString)
      
      days.push({
        date: date,
        dateString: dateString,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNumber: dayNumber,
        month: month,
        isToday: startDay + i === 0, // Aujourd'hui seulement si on est dans la semaine en cours
        isUnavailable: isUnavailable,
      })
    }
    
    return days
  }

  // Validation des champs
  const validateField = (name, value) => {
    let error = ''
    
    // S'assurer que value est une string
    const stringValue = value || ''
    const trimmedValue = stringValue.toString().trim()
    
    switch (name) {
      case 'name':
        if (!trimmedValue) {
          error = 'Le nom est requis'
        } else if (trimmedValue.length < 2) {
          error = 'Le nom doit contenir au moins 2 caractères'
        }
        break
      case 'email':
        if (!trimmedValue) {
          error = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          error = 'Veuillez entrer un email valide'
        }
        break
      case 'phone':
        if (!trimmedValue) {
          error = 'Le téléphone est requis'
        } else if (!/^[\d\s\+\-\(\)]+$/.test(trimmedValue)) {
          error = 'Veuillez entrer un numéro de téléphone valide'
        }
        break
      default:
        break
    }
    
    return error
  }

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString)
    setSelectedTime(null) // Réinitialiser l'heure quand on change de jour
    setFormData({
      ...formData,
      date: dateString,
      time: '', // Réinitialiser l'heure
    })
    // Scroll vers la sélection d'heure
    setTimeout(() => {
      try {
        const timeSection = document.querySelector('[data-time-section]')
        if (timeSection && typeof timeSection.scrollIntoView === 'function') {
          timeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      } catch (scrollError) {
        console.warn('Error scrolling to time section:', scrollError)
      }
    }, 100)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setFormData({
      ...formData,
      time: time,
    })
  }

  const handlePaymentProofChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux. Taille maximale : 5MB')
        e.target.value = ''
        return
      }
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autorisé. Formats acceptés : JPG, PNG, PDF')
        e.target.value = ''
        return
      }
      setPaymentProof(file)
      // Effacer l'erreur si le fichier est valide
      if (errors.paymentProof) {
        setErrors({ ...errors, paymentProof: '' })
      }
    }
  }

  const removePaymentProof = () => {
    setPaymentProof(null)
    setErrors({ ...errors, paymentProof: '' })
  }

  // Vérifier si un créneau est disponible
  const isSlotAvailable = (date, time) => {
    return !bookedSlots.some(slot => slot.date === date && slot.time === time)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })
    const error = validateField(name, value)
    setErrors({ ...errors, [name]: error })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Valider en temps réel si le champ a déjà été touché
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors({ ...errors, [name]: error })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Marquer tous les champs comme touchés
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      date: true,
      time: true,
      paymentProof: true,
    }
    setTouched(allTouched)
    
    // Valider tous les champs
    const newErrors = {}
    newErrors.name = validateField('name', formData.name)
    newErrors.email = validateField('email', formData.email)
    newErrors.phone = validateField('phone', formData.phone)
    
    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner un jour'
    }
    if (!formData.time) {
      newErrors.time = 'Veuillez sélectionner une heure'
    }
    if (!paymentProof) {
      newErrors.paymentProof = 'La preuve de paiement est obligatoire'
    }
    
    setErrors(newErrors)
    
    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(newErrors).some(error => error !== '')
    if (hasErrors || !formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !paymentProof) {
      toast.error('Veuillez corriger les erreurs avant de soumettre')
      // Scroll vers la première erreur
      try {
        const firstErrorField = document.querySelector('[data-error]')
        if (firstErrorField && typeof firstErrorField.scrollIntoView === 'function') {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } catch (scrollError) {
        console.warn('Error scrolling to error field:', scrollError)
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      // Vérifier si le jour est indisponible
      const isDayUnavailable = unavailableDays.includes(formData.date)
      if (isDayUnavailable) {
        toast.error('Ce jour n\'est pas disponible pour les rendez-vous.')
        await fetchUnavailableDays() // Rafraîchir les jours indisponibles
        setIsSubmitting(false)
        return
      }

      // Vérifier si le créneau est toujours disponible
      const slotKey = `${formData.date}_${formData.time}`
      const isSlotBooked = bookedSlots.some(slot => 
        `${slot.date}_${slot.time}` === slotKey
      )
      
      if (isSlotBooked) {
        toast.error('Ce créneau n\'est plus disponible. Veuillez en sélectionner un autre.')
        await fetchBookedSlots() // Rafraîchir les créneaux
        setIsSubmitting(false)
        return
      }

      // Créer un FormData pour envoyer le fichier
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('date', formData.date)
      formDataToSend.append('time', formData.time)
      formDataToSend.append('message', formData.message || '')
      formDataToSend.append('payment_proof', paymentProof)

      // Envoyer la demande de rendez-vous avec la preuve de paiement
      const response = await api.post('/appointments', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response && response.data) {
        toast.success('Votre demande de rendez-vous a été envoyée avec succès ! Elle est en cours de validation.', {
          duration: 5000,
          icon: '✅',
        })
        
        // Rafraîchir les créneaux réservés et les jours indisponibles
        await fetchBookedSlots()
        await fetchUnavailableDays()
        
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          message: '',
        })
        setSelectedDate(null)
        setSelectedTime(null)
        setPaymentProof(null)
        setErrors({})
        setTouched({})
        
        // Rafraîchir le statut du rendez-vous si l'email correspond
        if (checkEmail === formData.email) {
          setTimeout(() => {
            fetchAppointmentByEmail(formData.email)
          }, 1000)
        }
      }
      
      // Scroll vers le haut
      try {
        if (typeof window !== 'undefined' && window.scrollTo) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch (scrollError) {
        console.warn('Error scrolling to top:', scrollError)
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Récupérer le statut du rendez-vous par email
  const fetchAppointmentByEmail = async (email) => {
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await api.get('/appointments/by-email', {
        params: { email }
      })
      if (response && response.data && response.data.appointment) {
        setClientAppointment(response.data.appointment)
      } else {
        setClientAppointment(null)
        toast('Aucun rendez-vous trouvé pour cet email', {
          icon: 'ℹ️',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
      setClientAppointment(null)
      toast.error('Erreur lors de la vérification du statut')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Séparer les heures en matin et après-midi
  const morningHours = availableHours.filter(h => parseInt(h.split(':')[0]) < 13)
  const afternoonHours = availableHours.filter(h => parseInt(h.split(':')[0]) >= 13)

  return (
    <Layout>
      {/* Hero Section avec carrousel d'images */}
      <div className="relative text-white py-6 sm:py-8 lg:py-10 overflow-hidden h-[400px] sm:h-[450px] lg:h-[500px]">
        {/* Fond de secours avec image */}
        <div className="absolute inset-0">
          <img
            src={heroImages[0]}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Si l'image échoue, utiliser un gradient de secours
              e.target.style.display = 'none'
              const fallback = e.target.nextElementSibling
              if (fallback) fallback.style.display = 'block'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 hidden"></div>
        </div>

        {/* Carrousel d'images en arrière-plan */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => {
            const isLoaded = loadedImages.has(index)
            const isActive = index === currentImageIndex
            
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive && isLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{
                  display: isLoaded ? 'block' : 'none'
                }}
              >
                <img
                  src={image}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    console.warn(`Image ${index + 1} failed to load`)
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Overlay avec gradient pour la lisibilité (réduit pour voir plus les images) */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/75 via-primary-800/70 to-accent-900/75 z-10"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse-slow"></div>
        
        {/* Gradient orbs for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>

        {/* Indicateurs de carrousel */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="section-container relative z-10 px-4 sm:px-6 h-full flex items-center">
          <div className="text-center max-w-3xl mx-auto w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-xl rounded-full mb-4 sm:mb-5 shadow-2xl border-2 border-white/30 animate-scale-in hover:scale-110 transition-transform duration-300">
              <FiCalendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 animate-slide-up leading-tight drop-shadow-lg">
              Prendre rendez-vous
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto animate-slide-up px-4 leading-relaxed drop-shadow-md" style={{ animationDelay: '0.1s' }}>
              {agency && (agency.lawyer_first_name || agency.lawyer_last_name) 
                ? `Réservez une consultation avec ${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() + ' pour discuter de votre projet d\'immigration'
                : 'Réservez une consultation pour discuter de votre projet d\'immigration'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Section de vérification du statut du rendez-vous */}
          <Card className="mb-6 sm:mb-8 p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg animate-slide-up">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FiInfo className="w-5 h-5 text-white" />
                </div>
                Vérifier le statut de votre rendez-vous
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Entrez votre adresse email pour voir si votre demande a été validée ou rejetée
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  icon={FiMail}
                  className="w-full"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      fetchAppointmentByEmail(checkEmail)
                    }
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => fetchAppointmentByEmail(checkEmail)}
                icon={FiSearch}
                disabled={isCheckingStatus || !checkEmail}
                className="w-full sm:w-auto"
              >
                {isCheckingStatus ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>

            {/* Affichage du statut du rendez-vous */}
            {clientAppointment && (
              <div className="mt-4 p-4 sm:p-6 rounded-xl border-2 animate-fade-in">
                {clientAppointment.status === 'validated' && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <FiCheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2">
                          Rendez-vous validé ✓
                        </h3>
                        <p className="text-sm sm:text-base text-green-800 mb-4">
                          Votre demande de rendez-vous a été validée. Voici les détails de votre rendez-vous :
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                            <FiCalendar className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-xs text-green-700 block">Date</span>
                              <span className="font-bold text-green-900">
                                {new Date(clientAppointment.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                            <FiClock className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-xs text-green-700 block">Heure</span>
                              <span className="font-bold text-green-900">{clientAppointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {clientAppointment.status === 'pending' && (
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                        <FiClock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-yellow-900 mb-2">
                          Demande en attente
                        </h3>
                        <p className="text-sm sm:text-base text-yellow-800">
                          Votre demande de rendez-vous est en cours de validation. Vous serez notifié une fois qu'elle sera traitée.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {clientAppointment.status === 'rejected' && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <FiXCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">
                          Demande rejetée
                        </h3>
                        <p className="text-sm sm:text-base text-red-800 mb-2">
                          Votre demande de rendez-vous a été rejetée.
                        </p>
                        {clientAppointment.rejection_reason && (
                          <div className="mt-3 p-3 bg-white/60 rounded-lg">
                            <p className="text-sm font-semibold text-red-900 mb-1">Raison :</p>
                            <p className="text-sm text-red-800">{clientAppointment.rejection_reason}</p>
                          </div>
                        )}
                        <p className="text-sm text-red-700 mt-3">
                          Vous pouvez soumettre une nouvelle demande de rendez-vous en remplissant le formulaire ci-dessous.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className={`grid grid-cols-1 ${agency && (agency.lawyer_first_name || agency.lawyer_last_name) ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 sm:gap-8`}>
            {/* Lawyer Info Card */}
            {agency && (agency.lawyer_first_name || agency.lawyer_last_name) && (
              <Card className="lg:col-span-1 p-6 sm:p-8 bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
                <div className="text-center">
                  {agency.lawyer_image && (
                    <div className="relative inline-block mb-4 sm:mb-6">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-4 ring-primary-100 hover:ring-primary-200 transition-all duration-300">
                        <img 
                          src={getImageUrl(agency.lawyer_image)} 
                          alt={`${agency.lawyer_first_name || ''} ${agency.lawyer_last_name || ''}`.trim() || 'Avocat'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                    {agency.lawyer_first_name || ''} {agency.lawyer_last_name || ''}
                  </h3>
                  {agency.lawyer_title && (
                    <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6 font-medium">{agency.lawyer_title}</p>
                  )}
                  
                  <div className="space-y-3 sm:space-y-4 text-left bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-primary-100">
                    {agency.lawyer_phone && (
                      <div className="flex items-center text-neutral-700 group cursor-default">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-all duration-300 flex-shrink-0">
                          <FiPhone className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-sm sm:text-base break-words">{agency.lawyer_phone}</span>
                      </div>
                    )}
                    {agency.lawyer_email && (
                      <div className="flex items-center text-neutral-700 group cursor-default">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-all duration-300 flex-shrink-0">
                          <FiMail className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-sm sm:text-base break-all">{agency.lawyer_email}</span>
                      </div>
                    )}
                    <div className="flex items-center text-neutral-700 group cursor-default">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-all duration-300 flex-shrink-0">
                        <FiClock className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">8h - 12h et 15h - 18h</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Form */}
            <Card className={`${agency && (agency.lawyer_first_name || agency.lawyer_last_name) ? 'lg:col-span-2' : 'lg:col-span-1'} p-6 sm:p-8 md:p-10 shadow-xl border-2 border-neutral-100 bg-white/95 backdrop-blur-sm animate-slide-up`} style={{ animationDelay: '0.1s' }}>
              <div className="mb-6 sm:mb-8 pb-6 border-b border-neutral-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Formulaire de réservation</h2>
                <p className="text-sm text-neutral-600">Remplissez les informations ci-dessous pour réserver votre consultation</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="animate-fade-in" data-error={errors.name ? true : undefined}>
                    <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        errors.name ? 'bg-red-100' : 'bg-primary-100'
                      }`}>
                        <FiUser className={`w-4 h-4 ${errors.name ? 'text-red-600' : 'text-primary-600'}`} />
                      </div>
                      <span>Nom complet *</span>
                    </label>
                    <div className="relative mb-6">
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Votre nom complet"
                        required
                        className={`border-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                            : touched.name && !errors.name
                            ? 'border-green-300 focus:border-primary-400'
                            : 'border-neutral-200 focus:border-primary-400'
                        }`}
                      />
                      {touched.name && errors.name && (
                        <div className="absolute top-full left-0 flex items-center gap-1 text-red-600 text-xs mt-1 animate-fade-in">
                          <FiAlertCircle className="w-3 h-3" />
                          <span>{errors.name}</span>
                        </div>
                      )}
                      {touched.name && !errors.name && formData.name && (
                        <div className="absolute top-full left-0 flex items-center gap-1 text-green-600 text-xs mt-1 animate-fade-in">
                          <FiCheck className="w-3 h-3" />
                          <span>Valide</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '0.05s' }} data-error={errors.email ? true : undefined}>
                    <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        errors.email ? 'bg-red-100' : 'bg-primary-100'
                      }`}>
                        <FiMail className={`w-4 h-4 ${errors.email ? 'text-red-600' : 'text-primary-600'}`} />
                      </div>
                      <span>Email *</span>
                    </label>
                    <div className="relative mb-6">
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="votre@email.com"
                        required
                        className={`border-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                            : touched.email && !errors.email
                            ? 'border-green-300 focus:border-primary-400'
                            : 'border-neutral-200 focus:border-primary-400'
                        }`}
                      />
                      {touched.email && errors.email && (
                        <div className="absolute top-full left-0 flex items-center gap-1 text-red-600 text-xs mt-1 animate-fade-in">
                          <FiAlertCircle className="w-3 h-3" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                      {touched.email && !errors.email && formData.email && (
                        <div className="absolute top-full left-0 flex items-center gap-1 text-green-600 text-xs mt-1 animate-fade-in">
                          <FiCheck className="w-3 h-3" />
                          <span>Valide</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }} data-error={errors.phone ? true : undefined}>
                  <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      errors.phone ? 'bg-red-100' : 'bg-primary-100'
                    }`}>
                      <FiPhone className={`w-4 h-4 ${errors.phone ? 'text-red-600' : 'text-primary-600'}`} />
                    </div>
                    <span>Téléphone *</span>
                  </label>
                  <div className="relative mb-6">
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="+221 XX XXX XX XX"
                      required
                      className={`border-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-200' 
                          : touched.phone && !errors.phone
                          ? 'border-green-300 focus:border-primary-400'
                          : 'border-neutral-200 focus:border-primary-400'
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <div className="absolute top-full left-0 flex items-center gap-1 text-red-600 text-xs mt-1 animate-fade-in">
                        <FiAlertCircle className="w-3 h-3" />
                        <span>{errors.phone}</span>
                      </div>
                    )}
                    {touched.phone && !errors.phone && formData.phone && (
                      <div className="absolute top-full left-0 flex items-center gap-1 text-green-600 text-xs mt-1 animate-fade-in">
                        <FiCheck className="w-3 h-3" />
                        <span>Valide</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sélection de la date */}
                <div className={`bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 rounded-2xl p-4 sm:p-6 border-2 animate-fade-in transition-all duration-300 shadow-sm ${
                  errors.date ? 'border-red-200 bg-red-50/30' : 'border-neutral-200 hover:border-primary-200'
                }`} style={{ animationDelay: '0.15s' }} data-error={errors.date ? true : undefined}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg flex-shrink-0 ${
                      errors.date ? 'ring-2 ring-red-300' : ''
                    }`}>
                      <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm sm:text-base font-bold text-neutral-900">
                        Sélectionnez un jour *
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {currentWeek === 0 ? 'Semaine en cours' : 'Semaine prochaine'}
                      </p>
                      {errors.date && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <FiAlertCircle className="w-3 h-3" />
                          <span>{errors.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Navigation entre les semaines */}
                  <div className="flex gap-2 mb-4 sm:mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentWeek(0)
                        setSelectedDate(null)
                        setFormData({ ...formData, date: '', time: '' })
                        setSelectedTime(null)
                        fetchBookedSlots()
                        fetchUnavailableDays()
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm sm:text-base ${
                        currentWeek === 0
                          ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                      }`}
                    >
                      Semaine en cours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentWeek(1)
                        setSelectedDate(null)
                        setFormData({ ...formData, date: '', time: '' })
                        setSelectedTime(null)
                        fetchBookedSlots()
                        fetchUnavailableDays()
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-300 font-semibold text-sm sm:text-base ${
                        currentWeek === 1
                          ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md text-neutral-700'
                      }`}
                    >
                      Semaine prochaine
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                    {getWeekDays().map((day, index) => (
                      <button
                        key={day.dateString}
                        type="button"
                        onClick={() => !day.isUnavailable && handleDateSelect(day.dateString)}
                        disabled={day.isUnavailable}
                        className={`group relative p-2.5 sm:p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                          day.isUnavailable
                            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                            : selectedDate === day.dateString
                            ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-105 hover:scale-105 active:scale-95'
                            : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg text-gray-700 hover:scale-105 active:scale-95'
                        } ${day.isToday && !day.isUnavailable ? 'ring-2 ring-primary-300 ring-offset-1 sm:ring-offset-2' : ''}`}
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        {selectedDate === day.dateString && (
                          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-accent-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                            <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                        )}
                        {day.isUnavailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200/80 rounded-xl">
                            <span className="text-xs font-semibold text-neutral-500">Indisponible</span>
                          </div>
                        )}
                        <div className={`text-[10px] sm:text-xs font-semibold mb-0.5 ${
                          selectedDate === day.dateString ? 'text-white/90' : day.isUnavailable ? 'text-neutral-400' : 'text-gray-500'
                        }`}>
                          {day.dayName.substring(0, 3).toUpperCase()}
                        </div>
                        <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-0.5 ${
                          selectedDate === day.dateString ? 'text-white' : day.isUnavailable ? 'text-neutral-400' : 'text-neutral-900'
                        }`}>
                          {day.dayNumber}
                        </div>
                        <div className={`text-[10px] sm:text-xs font-medium mb-0.5 ${
                          selectedDate === day.dateString ? 'text-white/80' : day.isUnavailable ? 'text-neutral-400' : 'text-gray-500'
                        }`}>
                          {day.month}
                        </div>
                        {day.isToday && !day.isUnavailable && (
                          <div className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold mt-0.5 sm:mt-1 px-0.5 sm:px-1 md:px-1.5 py-0.5 rounded-full whitespace-nowrap w-full text-center leading-tight ${
                            selectedDate === day.dateString 
                              ? 'bg-white/20 text-white' 
                              : 'bg-primary-100 text-primary-700'
                          }`}>
                            <span className="hidden md:inline">Aujourd'hui</span>
                            <span className="md:hidden">Auj.</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sélection de l'heure */}
                {selectedDate && (
                  <div className="bg-gradient-to-br from-neutral-50 via-white to-accent-50/30 rounded-2xl p-4 sm:p-6 border-2 border-neutral-200 shadow-sm animate-slide-up hover:border-primary-200 transition-colors" data-time-section>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg flex-shrink-0 ${
                        errors.time ? 'ring-2 ring-red-300' : ''
                      }`}>
                        <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm sm:text-base font-bold text-neutral-900">
                          Sélectionnez une heure *
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">Créneaux horaires disponibles</p>
                        {errors.time && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <FiAlertCircle className="w-3 h-3" />
                            <span>{errors.time}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Créneaux du matin */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
                        <span className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wider px-2 sm:px-3 py-1 bg-primary-50 rounded-full">
                          Matin
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                        {morningHours.map((hour, index) => {
                          const [hours, minutes] = hour.split(':')
                          const displayHour = `${hours}h${minutes !== '00' ? minutes : ''}`
                          const isAvailable = selectedDate ? isSlotAvailable(selectedDate, hour) : true
                          return (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => isAvailable && handleTimeSelect(hour)}
                              disabled={!isAvailable}
                              className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 overflow-hidden ${
                                !isAvailable
                                  ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                                  : selectedTime === hour
                                  ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-105 hover:scale-105 active:scale-95 ring-2 ring-primary-300 ring-offset-1'
                                  : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-lg text-gray-700 hover:scale-105 active:scale-95 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white'
                              }`}
                              style={{ animationDelay: `${index * 0.03}s` }}
                            >
                              {selectedTime === hour && (
                                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-accent-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                                  <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                </div>
                              )}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-200/80 rounded-xl">
                                  <span className="text-xs font-semibold text-neutral-500">Indisponible</span>
                                </div>
                              )}
                              <div className="flex flex-col items-center w-full">
                                <FiClock className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 transition-colors ${
                                  selectedTime === hour ? 'text-white' : isAvailable ? 'text-primary-500' : 'text-neutral-400'
                                }`} />
                                <span className="font-bold text-base sm:text-lg mb-1">{displayHour}</span>
                                {slotPrices[hour] && typeof slotPrices[hour] === 'object' && slotPrices[hour].price > 0 && (
                                  <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                                    selectedTime === hour 
                                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                                      : 'bg-primary-100 text-primary-700 group-hover:bg-primary-200'
                                  }`}>
                                    {Number(slotPrices[hour].price).toLocaleString('fr-FR')} {slotPrices[hour].currency || 'FCFA'}
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Créneaux de l'après-midi */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-200 to-transparent"></div>
                        <span className="text-[10px] sm:text-xs font-semibold text-accent-600 uppercase tracking-wider px-2 sm:px-3 py-1 bg-accent-50 rounded-full">
                          Après-midi
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-200 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                        {afternoonHours.map((hour, index) => {
                          const [hours, minutes] = hour.split(':')
                          const displayHour = `${hours}h${minutes !== '00' ? minutes : ''}`
                          const isAvailable = selectedDate ? isSlotAvailable(selectedDate, hour) : true
                          return (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => isAvailable && handleTimeSelect(hour)}
                              disabled={!isAvailable}
                              className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 overflow-hidden ${
                                !isAvailable
                                  ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                                  : selectedTime === hour
                                  ? 'border-accent-500 bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-xl scale-105 hover:scale-105 active:scale-95 ring-2 ring-accent-300 ring-offset-1'
                                  : 'border-neutral-200 bg-white hover:border-accent-300 hover:shadow-lg text-gray-700 hover:scale-105 active:scale-95 hover:bg-gradient-to-br hover:from-accent-50 hover:to-white'
                              }`}
                              style={{ animationDelay: `${(morningHours.length + index) * 0.03}s` }}
                            >
                              {selectedTime === hour && (
                                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                                  <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                </div>
                              )}
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-200/80 rounded-xl">
                                  <span className="text-xs font-semibold text-neutral-500">Indisponible</span>
                                </div>
                              )}
                              <div className="flex flex-col items-center w-full">
                                <FiClock className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2 transition-colors ${
                                  selectedTime === hour ? 'text-white' : isAvailable ? 'text-accent-500' : 'text-neutral-400'
                                }`} />
                                <span className="font-bold text-base sm:text-lg mb-1">{displayHour}</span>
                                {slotPrices[hour] && typeof slotPrices[hour] === 'object' && slotPrices[hour].price > 0 && (
                                  <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                                    selectedTime === hour 
                                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                                      : 'bg-accent-100 text-accent-700 group-hover:bg-accent-200'
                                  }`}>
                                    {Number(slotPrices[hour].price).toLocaleString('fr-FR')} {slotPrices[hour].currency || 'FCFA'}
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-sm animate-fade-in hover:border-primary-200 transition-colors" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FiMessageSquare className="w-4 h-4 text-primary-600" />
                    </div>
                    <span>Message (optionnel)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 resize-none transition-all duration-300 bg-white text-sm sm:text-base"
                    placeholder="Décrivez brièvement votre demande ou vos questions..."
                  />
                </div>

                {/* Preuve de paiement */}
                <div className={`bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 rounded-2xl p-4 sm:p-6 border-2 animate-fade-in transition-all duration-300 shadow-sm ${
                  errors.paymentProof ? 'border-red-200 bg-red-50/30' : 'border-neutral-200 hover:border-primary-200'
                }`} style={{ animationDelay: '0.25s' }} data-error={errors.paymentProof ? true : undefined}>
                  <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      errors.paymentProof ? 'bg-red-100' : 'bg-primary-100'
                    }`}>
                      <FiUpload className={`w-4 h-4 ${errors.paymentProof ? 'text-red-600' : 'text-primary-600'}`} />
                    </div>
                    <span>Preuve de paiement *</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Formats acceptés : JPG, PNG, PDF (max 5MB)</p>
                  
                  {!paymentProof ? (
                    <div className="relative">
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handlePaymentProofChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="payment-proof"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${
                          errors.paymentProof
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : 'border-neutral-300 bg-white/80 backdrop-blur-sm hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className={`w-8 h-8 mb-2 ${errors.paymentProof ? 'text-red-500' : 'text-neutral-400'}`} />
                          <p className={`text-sm font-semibold mb-1 ${errors.paymentProof ? 'text-red-600' : 'text-neutral-700'}`}>
                            Cliquez pour téléverser
                          </p>
                          <p className="text-xs text-neutral-500">ou glissez-déposez le fichier</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-200 shadow-sm">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                        <FiUpload className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate mb-0.5">{paymentProof.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-neutral-500">
                            {(paymentProof.size / 1024).toFixed(2)} KB
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            ✓ Téléversé
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removePaymentProof}
                        className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                        aria-label="Supprimer le fichier"
                      >
                        <FiX className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                  
                  {touched.paymentProof && errors.paymentProof && (
                    <div className="flex items-center gap-1 text-red-600 text-xs mt-2 animate-fade-in">
                      <FiAlertCircle className="w-3 h-3" />
                      <span>{errors.paymentProof}</span>
                    </div>
                  )}
                </div>

                {/* Résumé de la sélection */}
                {(selectedDate && selectedTime) && (
                  <div className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-2xl p-5 sm:p-6 border-2 border-primary-200/50 shadow-lg animate-fade-in overflow-hidden">
                    {/* Effet de brillance animé */}
                    <div 
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'shimmer-slide 3s ease-in-out infinite'
                      }}
                    ></div>
                    <style>{`
                      @keyframes shimmer-slide {
                        0% { transform: translateX(-100%) skewX(-15deg); }
                        100% { transform: translateX(200%) skewX(-15deg); }
                      }
                    `}</style>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FiInfo className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-neutral-900 mb-3 text-base sm:text-lg flex items-center gap-2">
                          <span>Résumé de votre rendez-vous</span>
                          <span className="text-xs font-normal text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                            {slotPrices[selectedTime] && slotPrices[selectedTime] > 0 
                              ? `${Number(slotPrices[selectedTime]).toLocaleString('fr-FR')} FCFA`
                              : 'Prix à confirmer'}
                          </span>
                        </h4>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-primary-100/50">
                            <FiCalendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            <div>
                              <span className="text-xs text-neutral-500 font-medium">Date</span>
                              <p className="text-sm font-semibold text-neutral-900">
                                {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-primary-100/50">
                            <FiClock className="w-4 h-4 text-accent-600 flex-shrink-0" />
                            <div>
                              <span className="text-xs text-neutral-500 font-medium">Heure</span>
                              <p className="text-sm font-semibold text-neutral-900">{selectedTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ animationDelay: '0.25s' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <FiCalendar className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      <span>Confirmer le rendez-vous</span>
                    </>
                  )}
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

