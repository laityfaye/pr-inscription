# TestimonialCarousel - Composant Premium d'Avis Clients

## Description

Composant de carousel d'avis clients moderne, professionnel et élégant, inspiré des designs de Stripe, Airbnb et Apple. Le composant propose deux variantes avec des animations fluides et continues.

## Caractéristiques

- ✨ **Design Premium** : Style épuré, minimaliste et professionnel
- 🎬 **Animations Fluides** : Défilement continu sans pause, transitions soignées
- 📱 **Responsive** : Adapté à tous les écrans (desktop, tablette, mobile)
- 🎨 **Deux Variantes** :
  - Carousel horizontal continu
  - 3 colonnes défilantes avec directions différentes
- ⚡ **Performance** : Optimisé avec `will-change` et animations CSS natives
- 🎯 **Accessibilité** : Pause automatique au survol

## Installation

Le composant est déjà intégré dans le projet. Importez-le simplement :

```jsx
import TestimonialCarousel from '../components/TestimonialCarousel'
```

## Utilisation

### Exemple de base

```jsx
import TestimonialCarousel from '../components/TestimonialCarousel'

const MyComponent = () => {
  const reviews = [
    {
      id: 1,
      user: { name: 'John Doe' },
      rating: 5,
      content: 'Excellent service !',
      country_obtained: 'Canada',
      created_at: '2024-01-15'
    },
    // ... autres avis
  ]

  return (
    <TestimonialCarousel 
      reviews={reviews} 
      variant="horizontal"
    />
  )
}
```

### Variantes

#### 1. Carousel Horizontal Continu

```jsx
<TestimonialCarousel 
  reviews={reviews} 
  variant="horizontal"
/>
```

- Défilement horizontal continu de gauche à droite
- Effet de fondu sur les bords
- Pause automatique au survol

#### 2. 3 Colonnes Défilantes

```jsx
<TestimonialCarousel 
  reviews={reviews} 
  variant="columns"
/>
```

- 3 colonnes avec défilement vertical
- Colonne 1 : descend
- Colonne 2 : monte (direction inverse)
- Colonne 3 : descend
- Effet visuel dynamique et moderne

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `reviews` | `Array` | `[]` | Tableau d'objets avis |
| `variant` | `'horizontal' \| 'columns'` | `'horizontal'` | Variante du carousel |
| `className` | `string` | `''` | Classes CSS supplémentaires |

## Structure des données Review

Chaque avis doit avoir la structure suivante :

```typescript
interface Review {
  id: number | string
  user?: {
    name: string
  }
  rating: number // 1-5
  content: string
  country_obtained?: string
  created_at?: string
}
```

## Personnalisation

### Styles CSS

Les styles sont définis dans `frontend/src/index.css` avec les classes suivantes :

- `.testimonial-carousel-horizontal` : Conteneur du carousel horizontal
- `.testimonial-carousel-columns` : Conteneur des 3 colonnes
- `.testimonial-card` : Carte d'avis individuelle
- `.testimonial-card-compact` : Version compacte pour les colonnes

### Modifier les animations

Les durées d'animation peuvent être ajustées dans le CSS :

```css
.testimonial-track-1 {
  animation: testimonial-scroll-horizontal 60s linear infinite;
  /* Modifier 60s pour changer la vitesse */
}
```

## Responsive

Le composant s'adapte automatiquement :

- **Desktop (> 1024px)** : Affichage complet avec 3 colonnes ou carousel horizontal
- **Tablette (768px - 1024px)** : Colonnes empilées verticalement
- **Mobile (< 768px)** : Cartes optimisées pour petits écrans

## Exemples d'utilisation

### Page de démonstration

Une page de démonstration complète est disponible dans `frontend/src/pages/TestimonialsDemo.jsx` qui montre les deux variantes avec un sélecteur.

### Intégration dans une page existante

```jsx
import { useEffect, useState } from 'react'
import TestimonialCarousel from '../components/TestimonialCarousel'
import api from '../services/api'

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await api.get('/reviews')
      setReviews(response.data)
    }
    fetchReviews()
  }, [])

  return (
    <div>
      <h1>Avis Clients</h1>
      <TestimonialCarousel reviews={reviews} variant="horizontal" />
    </div>
  )
}
```

## Notes techniques

- Le composant duplique automatiquement les avis pour créer un défilement infini fluide
- Les animations utilisent `transform` et `will-change` pour de meilleures performances
- Le carousel se met en pause automatiquement au survol de la souris
- Compatible avec tous les navigateurs modernes

## Support

Pour toute question ou problème, consultez le code source dans `frontend/src/components/TestimonialCarousel.jsx`.

