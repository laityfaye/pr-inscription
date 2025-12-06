import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiX, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiLinkedin,
  FiBriefcase,
  FiCode,
  FiShoppingCart,
  FiImage,
  FiTarget,
  FiZap,
  FiInfo,
  FiArrowRight,
  FiGlobe,
  FiCalendar,
  FiStar,
  FiHeart
} from 'react-icons/fi'
import Card from './ui/Card'
import Button from './ui/Button'

const Footer = () => {
  const [showCompanyCard, setShowCompanyCard] = useState(false)

  const handleContactClick = (e) => {
    // Si on est déjà sur la page d'accueil, faire un scroll vers la section
    if (window.location.pathname === '/') {
      e.preventDefault()
      const element = document.getElementById('about-us')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    // Sinon, le Link normal redirigera vers /#about-us
  }

  return (
    <>
      <footer className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-16 mt-20 overflow-hidden">
        {/* Effets de fond animés */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
        </div>
        
        {/* Pattern de fond */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* À propos */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                  <FiGlobe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                  À propos
                </h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed mb-4 max-w-md">
                Votre destination, notre mission. Nous vous accompagnons dans vos démarches de préinscription pour vos études à l'étranger.
              </p>
              <div className="flex items-center gap-2 text-primary-300">
                <FiHeart className="w-4 h-4" />
                <span className="text-xs">Fait avec passion pour votre réussite</span>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <FiArrowRight className="w-5 h-5 text-primary-400" />
                Navigation
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="flex items-center gap-2 text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group">
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Accueil</span>
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="flex items-center gap-2 text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group">
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Avis clients</span>
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="flex items-center gap-2 text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group">
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Actualités</span>
                  </Link>
                </li>
                <li>
                  <Link to="/appointment" className="flex items-center gap-2 text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 group">
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Rendez-vous</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <FiMail className="w-5 h-5 text-primary-400" />
                Contact
              </h3>
              <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                Pour toute question, n'hésitez pas à nous contacter. Notre équipe est à votre disposition.
              </p>
              <div className="space-y-2">
                <Link 
                  to="/#about-us" 
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-sm font-medium transition-all duration-200 border border-primary-500/30"
                >
                  <FiMail className="w-4 h-4" />
                  <span>Contact</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Séparateur avec effet */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-neutral-900 px-4">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Copyright et crédits */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>© {new Date().getFullYear()} Tous droits réservés</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCompanyCard(true)}
                className="flex items-center gap-2 text-neutral-400 hover:text-primary-400 transition-colors text-sm group"
              >
                <FiInfo className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>À propos du développeur</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bouton flottant pour afficher la carte de l'entreprise */}
        <button
          onClick={() => setShowCompanyCard(!showCompanyCard)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 group ring-4 ring-primary-500/20 hover:ring-primary-500/40 ${
            showCompanyCard ? 'rotate-45' : ''
          }`}
          aria-label="Informations sur l'entreprise"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <FiInfo className={`w-7 h-7 relative z-10 transition-transform ${showCompanyCard ? 'rotate-0' : 'group-hover:rotate-12'}`} />
          {!showCompanyCard && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </footer>

      {/* Carte de l'entreprise - Positionnée en bas à droite */}
      {showCompanyCard && (
        <div className="fixed bottom-28 right-2 sm:right-4 md:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[400px] md:w-[420px] max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-[420px] animate-slide-up">
          <Card className="bg-white shadow-2xl border-2 border-primary-200 max-h-[85vh] overflow-hidden flex flex-col backdrop-blur-xl">
            {/* Header avec gradient animé */}
            <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-800 px-4 sm:px-6 py-6 sm:py-8 min-h-[100px] sm:min-h-[120px] text-white overflow-hidden">
              {/* Effet de brillance */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"
                style={{
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
              
              <div className="relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative z-20">
                    <div className="absolute inset-0 bg-white/30 rounded-xl blur-xl"></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <FiBriefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>
                  <div className="relative z-20 flex flex-col gap-1.5">
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">InnoSoft Creation</h3>
                    <p className="text-white text-[10px] sm:text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight px-2 py-1 bg-black/10 rounded backdrop-blur-sm">Technologies de l'Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanyCard(false)}
                  className="relative z-20 p-2 hover:bg-white/20 rounded-lg transition-all hover:rotate-90"
                  aria-label="Fermer"
                >
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Secteur d'activité */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <FiTarget className="w-4 h-4 text-white" />
                  </div>
                  Secteur d'activité
                </h4>
                <p className="text-sm text-neutral-700 pl-10">Technologies de l'Information et de la Communication (TIC)</p>
              </div>

              {/* Domaines d'expertise */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 p-4 rounded-xl border border-purple-200">
                <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <FiZap className="w-4 h-4 text-white" />
                  </div>
                  Domaines d'expertise
                </h4>
                <ul className="space-y-2.5 pl-10">
                  <li className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors">
                      <FiCode className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">Développement de solutions numériques</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors">
                      <FiShoppingCart className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">Vente de matériel électronique</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors">
                      <FiImage className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">Infographie et communication visuelle</span>
                  </li>
                </ul>
              </div>

              {/* Mission */}
              <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <FiTarget className="w-4 h-4 text-white" />
                  </div>
                  Mission
                </h4>
                <p className="text-sm text-neutral-700 leading-relaxed pl-10">
                  Fournir des solutions technologiques innovantes, accessibles et personnalisées pour accompagner les entreprises et institutions dans leur transformation numérique.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-gradient-to-br from-accent-50 via-white to-primary-50 p-4 rounded-xl border-2 border-accent-200 shadow-sm">
                <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                    <FiZap className="w-4 h-4 text-white" />
                  </div>
                  Vision
                </h4>
                <p className="text-sm text-neutral-700 leading-relaxed pl-10">
                  Devenir un acteur de premier plan dans le secteur des TIC, en contribuant à l'optimisation des systèmes d'information et en renforçant la connectivité entre les services et les utilisateurs.
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-3 pt-3 border-t-2 border-neutral-200">
                <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <FiMail className="w-4 h-4 text-white" />
                  </div>
                  Contact
                </h4>
                <a 
                  href="tel:+221780186229" 
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <FiPhone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">+221 78 018 62 29</span>
                </a>
                <a 
                  href="mailto:laityfaye1709@gmail.com" 
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-green-100/30 rounded-lg border border-green-200 hover:border-green-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <FiMail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 break-all">laityfaye1709@gmail.com</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/laity-faye-496b50311" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-lg border border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <FiLinkedin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">LinkedIn</span>
                </a>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-neutral-50 to-neutral-100/30 rounded-lg border border-neutral-200">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-500 to-neutral-600 flex items-center justify-center shadow-sm">
                    <FiMapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">Sénégal, Thiès, Ville verte</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

export default Footer

