import { useState, useEffect, useRef } from 'react'
import { FiStar } from 'react-icons/fi'

/**
 * Composant de carousel d'avis clients premium
 * Deux variantes : horizontal continu et 3 colonnes défilantes
 * Design inspiré de Stripe, Airbnb et Apple
 */
const TestimonialCarousel = ({ reviews = [], variant = 'horizontal', className = '' }) => {
  if (reviews.length === 0) {
    return null
  }

  // Dupliquer les avis pour un défilement infini fluide
  // S'assurer d'avoir au moins 6 avis pour un défilement fluide
  let duplicatedReviews = reviews
  if (reviews.length > 0) {
    const multiplier = Math.max(3, Math.ceil(6 / reviews.length))
    duplicatedReviews = Array(multiplier).fill(reviews).flat()
  }

  if (variant === 'horizontal') {
    return <HorizontalCarousel reviews={duplicatedReviews} className={className} />
  } else if (variant === 'columns') {
    return <ThreeColumnsCarousel reviews={duplicatedReviews} className={className} />
  } else {
    return <HorizontalCarousel reviews={duplicatedReviews} className={className} />
  }
}

/**
 * Variante 1 : Carousel horizontal continu
 * Défilement infini fluide de gauche à droite
 */
const HorizontalCarousel = ({ reviews, className }) => {
  const containerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className={`testimonial-carousel-horizontal testimonial-3d-container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient overlays pour effet de fondu sur les bords */}
      <div className="testimonial-fade-left" />
      <div className="testimonial-fade-right" />

      <div
        ref={containerRef}
        className={`testimonial-scroll-container ${isPaused ? 'paused' : ''}`}
      >
        {/* Première série */}
        <div className="testimonial-scroll-track testimonial-track-1">
          {reviews.map((review, index) => (
            <TestimonialCard key={`track1-${review.id}-${index}`} review={review} />
          ))}
        </div>
        {/* Deuxième série pour continuité */}
        <div className="testimonial-scroll-track testimonial-track-2">
          {reviews.map((review, index) => (
            <TestimonialCard key={`track2-${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Variante 2 : 3 colonnes défilantes avec directions différentes
 * Colonne gauche : descend, Colonne centre : monte, Colonne droite : descend
 */
const ThreeColumnsCarousel = ({ reviews, className }) => {
  const [isPaused, setIsPaused] = useState(false)

  // Diviser les avis en 3 groupes pour les 3 colonnes
  // S'assurer que chaque colonne a au moins quelques éléments
  let column1 = reviews.filter((_, i) => i % 3 === 0)
  let column2 = reviews.filter((_, i) => i % 3 === 1)
  let column3 = reviews.filter((_, i) => i % 3 === 2)
  
  // Si une colonne est vide, répartir les avis équitablement
  if (column1.length === 0 || column2.length === 0 || column3.length === 0) {
    const perColumn = Math.ceil(reviews.length / 3)
    column1 = reviews.slice(0, perColumn)
    column2 = reviews.slice(perColumn, perColumn * 2)
    column3 = reviews.slice(perColumn * 2)
  }

  return (
    <div
      className={`testimonial-carousel-columns testimonial-3d-container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Colonne 1 - Descend */}
      <div className={`testimonial-column testimonial-column-1 ${isPaused ? 'paused' : ''}`}>
        <div className="testimonial-column-track">
          {column1.map((review, index) => (
            <TestimonialCard key={`col1-${review.id}-${index}`} review={review} compact />
          ))}
          {/* Dupliquer pour continuité */}
          {column1.map((review, index) => (
            <TestimonialCard key={`col1-dup-${review.id}-${index}`} review={review} compact />
          ))}
        </div>
      </div>

      {/* Colonne 2 - Monte (direction inverse) */}
      <div className={`testimonial-column testimonial-column-2 ${isPaused ? 'paused' : ''}`}>
        <div className="testimonial-column-track testimonial-column-reverse">
          {column2.map((review, index) => (
            <TestimonialCard key={`col2-${review.id}-${index}`} review={review} compact />
          ))}
          {/* Dupliquer pour continuité */}
          {column2.map((review, index) => (
            <TestimonialCard key={`col2-dup-${review.id}-${index}`} review={review} compact />
          ))}
        </div>
      </div>

      {/* Colonne 3 - Descend */}
      <div className={`testimonial-column testimonial-column-3 ${isPaused ? 'paused' : ''}`}>
        <div className="testimonial-column-track">
          {column3.map((review, index) => (
            <TestimonialCard key={`col3-${review.id}-${index}`} review={review} compact />
          ))}
          {/* Dupliquer pour continuité */}
          {column3.map((review, index) => (
            <TestimonialCard key={`col3-dup-${review.id}-${index}`} review={review} compact />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Carte d'avis premium avec effets 3D
 */
const TestimonialCard = ({ review, compact = false }) => {
  const userName = review.user?.name || 'Anonyme'
  const userInitial = userName.charAt(0).toUpperCase()
  const rating = review.rating || 5
  const content = review.content || ''
  const country = review.country_obtained || null
  const cardRef = useRef(null)

  // Gestion de l'effet 3D élégant et stable
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Rotation très subtile et élégante
    const rotateX = (y - centerY) / 50
    const rotateY = (centerX - x) / 50
    
    card.style.setProperty('--rotate-x', `${rotateX}deg`)
    card.style.setProperty('--rotate-y', `${rotateY}deg`)
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    const card = cardRef.current
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  return (
    <div 
      ref={cardRef}
      className={`testimonial-card ${compact ? 'testimonial-card-compact' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Effet de brillance premium */}
      <div className="testimonial-card-shine" />
      
      {/* Gradient de fond animé */}
      <div className="testimonial-card-gradient" />

      {/* Header avec avatar et nom */}
      <div className="testimonial-card-header">
        <div className="testimonial-avatar">
          <div className="testimonial-avatar-glow" />
          <div className="testimonial-avatar-inner">
            <span className="testimonial-avatar-text">{userInitial}</span>
          </div>
        </div>
        <div className="testimonial-card-info">
          <h4 className="testimonial-card-name">{userName}</h4>
          {country && (
            <p className="testimonial-card-location">{country}</p>
          )}
        </div>
      </div>

      {/* Note en étoiles */}
      <div className="testimonial-card-rating">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`testimonial-star ${
              i < rating ? 'testimonial-star-filled' : 'testimonial-star-empty'
            }`}
            style={{ transitionDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>

      {/* Contenu du témoignage */}
      <p className="testimonial-card-content">
        "{content}"
      </p>

      {/* Footer avec date (optionnel) */}
      {review.created_at && (
        <div className="testimonial-card-footer">
          <span className="testimonial-card-date">
            {new Date(review.created_at).toLocaleDateString('fr-FR', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}

export default TestimonialCarousel

