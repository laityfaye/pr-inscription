import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AvocatRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'avocat') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AvocatRoute

