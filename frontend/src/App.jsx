import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AgencyProvider } from './contexts/AgencyContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Pages publiques
import Home from './pages/Home'
import Reviews from './pages/Reviews'
import News from './pages/News'
import Login from './pages/Login'
import Register from './pages/Register'
import Appointment from './pages/Appointment'

// Pages client
import ClientDashboard from './pages/client/Dashboard'
import ClientInscriptions from './pages/client/Inscriptions'
import ClientDocuments from './pages/client/Documents'
import ClientChat from './pages/client/Chat'
import AddReview from './pages/client/AddReview'
import ClientResidenceApplications from './pages/client/ResidenceApplications'
import ClientWorkPermitApplications from './pages/client/WorkPermitApplications'
import ClientStudyPermitRenewalApplications from './pages/client/StudyPermitRenewalApplications'

// Pages admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminInscriptions from './pages/admin/Inscriptions'
import AdminNews from './pages/admin/News'
import AdminReviews from './pages/admin/Reviews'
import AdminSettings from './pages/admin/Settings'
import AdminChat from './pages/admin/Chat'
import AdminCountries from './pages/admin/Countries'
import AdminDocuments from './pages/admin/Documents'
import AdminWorkPermitCountries from './pages/admin/WorkPermitCountries'
import AdminWorkPermitApplications from './pages/admin/WorkPermitApplications'
import AdminResidenceApplications from './pages/admin/ResidenceApplications'
import AdminStudyPermitRenewalApplications from './pages/admin/StudyPermitRenewalApplications'
import AdminAppointments from './pages/admin/Appointments'

function App() {
  return (
      <AuthProvider>
      <AgencyProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen">
            <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/news" element={<News />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/appointment" element={<Appointment />} />

            {/* Routes client */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/inscriptions"
              element={
                <ProtectedRoute>
                  <ClientInscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/documents"
              element={
                <ProtectedRoute>
                  <ClientDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/chat"
              element={
                <ProtectedRoute>
                  <ClientChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/review/add"
              element={
                <ProtectedRoute>
                  <AddReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/residence-applications"
              element={
                <ProtectedRoute>
                  <ClientResidenceApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/work-permit-applications"
              element={
                <ProtectedRoute>
                  <ClientWorkPermitApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/study-permit-renewal-applications"
              element={
                <ProtectedRoute>
                  <ClientStudyPermitRenewalApplications />
                </ProtectedRoute>
              }
            />

            {/* Routes admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inscriptions"
              element={
                <AdminRoute>
                  <AdminInscriptions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/news"
              element={
                <AdminRoute>
                  <AdminNews />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <AdminRoute>
                  <AdminChat />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/countries"
              element={
                <AdminRoute>
                  <AdminCountries />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/documents"
              element={
                <AdminRoute>
                  <AdminDocuments />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/work-permit-countries"
              element={
                <AdminRoute>
                  <AdminWorkPermitCountries />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/work-permit-applications"
              element={
                <AdminRoute>
                  <AdminWorkPermitApplications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/residence-applications"
              element={
                <AdminRoute>
                  <AdminResidenceApplications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/study-permit-renewal-applications"
              element={
                <AdminRoute>
                  <AdminStudyPermitRenewalApplications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <AdminRoute>
                  <AdminAppointments />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AgencyProvider>
    </AuthProvider>
  )
}

export default App

