import { useEffect, useRef, useState } from 'react'
import { FiGlobe } from 'react-icons/fi'

const PartnersCarousel3D = ({ partners = [] }) => {
  const boxRef = useRef(null)
  const [translateZ, setTranslateZ] = useState(280)
  const [imageSize, setImageSize] = useState(140)

  useEffect(() => {
    // Ajuster la distance 3D et la taille des images selon la taille de l'écran
    const updateSizes = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setTranslateZ(320) // lg
        setImageSize(200)
      } else if (width >= 768) {
        setTranslateZ(300) // md
        setImageSize(180)
      } else if (width >= 640) {
        setTranslateZ(280) // sm
        setImageSize(160)
      } else {
        setTranslateZ(240) // mobile
        setImageSize(140)
      }
    }

    updateSizes()
    window.addEventListener('resize', updateSizes)
    return () => window.removeEventListener('resize', updateSizes)
  }, [])

  // Si pas de partenaires, retourner un message ou rien
  if (!partners || partners.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiGlobe className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Aucun partenaire disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full flex items-center justify-center py-12 sm:py-16 md:py-20 overflow-hidden min-h-[500px] sm:min-h-[600px]">
      {/* Container 3D */}
      <div 
        ref={boxRef}
        className="partners-3d-carousel relative w-[280px] h-[220px] sm:w-[320px] sm:h-[250px] md:w-[360px] md:h-[280px] lg:w-[400px] lg:h-[300px] group/carousel"
        onMouseEnter={() => {
          if (boxRef.current) {
            boxRef.current.style.animationPlayState = 'paused'
            boxRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
        onMouseLeave={() => {
          if (boxRef.current) {
            boxRef.current.style.animationPlayState = 'running'
            boxRef.current.style.transition = 'none'
          }
        }}
      >
        {partners.map((partner, index) => {
          const angle = (360 / partners.length) * index
          // Correction pour éviter l'inversion des images : si l'image est derrière (entre 90 et 270 degrés), on ajoute 180 degrés
          const normalizedAngle = ((angle % 360) + 360) % 360 // Normaliser entre 0 et 360
          const isBehind = normalizedAngle > 90 && normalizedAngle <= 270
          // Pour les images derrière, on inverse en ajoutant 180 degrés à la rotation inverse
          const correctionAngle = isBehind ? -angle + 180 : -angle
          
          return (
            <div
              key={index}
              className="partners-3d-item absolute top-0 left-0 w-full h-full"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`
              }}
            >
              <div className="relative w-full h-full">
                {/* Carte avec effet glassmorphism premium */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 rounded-3xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] border border-neutral-200/60 p-5 sm:p-7 md:p-9 flex items-center justify-center backdrop-blur-md">
                  
                  {/* Contenu de l'image avec rotation inverse pour rester droit */}
                  <div 
                    className="relative z-10 w-full h-full flex flex-col items-center justify-center"
                    style={{
                      transform: `rotateY(${correctionAngle}deg)`
                    }}
                  >
                    <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center mb-1 sm:mb-1.5 p-2 sm:p-3">
                      {/* Conteneur d'image avec taille fixe absolue */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <div 
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: `${imageSize}px`,
                            height: `${imageSize}px`
                          }}
                        >
                          <img
                            src={partner.image}
                            alt={partner.alt || partner.name}
                            className="relative z-10 object-contain object-center filter drop-shadow-md"
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              minWidth: `${imageSize}px`,
                              minHeight: `${imageSize}px`,
                              maxWidth: `${imageSize}px`,
                              maxHeight: `${imageSize}px`
                            }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const fallback = e.target.nextElementSibling
                            if (fallback) {
                              fallback.style.display = 'flex'
                            }
                          }}
                        />
                        </div>
                        {/* Fallback si l'image ne charge pas */}
                        <div
                          className="hidden items-center justify-center w-full h-full absolute inset-0"
                          style={{ display: 'none' }}
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-100 via-accent-100 to-primary-100 rounded-2xl flex items-center justify-center shadow-lg border border-primary-200/50">
                            <FiGlobe className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Nom du partenaire */}
                    <div className="relative z-10 w-full px-3">
                      <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-neutral-700 text-center leading-tight line-clamp-2">
                        {partner.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PartnersCarousel3D

