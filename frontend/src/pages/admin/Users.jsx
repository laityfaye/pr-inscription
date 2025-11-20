import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiEye, FiMail, FiPhone, FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterHasPhone, setFilterHasPhone] = useState('')
  const [countries, setCountries] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchCountries()
  }, [])

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filterCountry) params.append('target_country', filterCountry)
      if (filterHasPhone !== '') {
        params.append('has_phone', filterHasPhone)
      }
      
      api.get(`/users?${params.toString()}`)
        .then(response => setUsers(response.data))
        .catch(error => {
          console.error('Error fetching users:', error)
          toast.error('Erreur lors du chargement des clients')
        })
    }, 500) // Attendre 500ms après la dernière saisie

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filterCountry, filterHasPhone])

  useEffect(() => {
    // Le backend filtre déjà, donc on utilise directement les résultats
    setFilteredUsers(users)
  }, [users])

  useEffect(() => {
    setCurrentPage(1) // Reset à la page 1 quand les filtres changent
  }, [searchQuery, filterCountry, filterHasPhone])

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries')
      setCountries(response.data)
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }


  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterCountry('')
    setFilterHasPhone('')
  }

  const hasActiveFilters = searchQuery || filterCountry || filterHasPhone

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      await api.delete(`/users/${id}`)
      toast.success('Utilisateur supprimé')
      // Recharger les utilisateurs avec les filtres actuels
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filterCountry) params.append('target_country', filterCountry)
      if (filterHasPhone !== '') params.append('has_phone', filterHasPhone)
      
      const response = await api.get(`/users?${params.toString()}`)
      setUsers(response.data)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`/users/${id}`)
      setSelectedUser(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    }
  }

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
            Gestion des clients
          </h1>
          <p className="text-neutral-600">
            Gérez et consultez tous les clients inscrits sur la plateforme
          </p>
        </div>

        {/* Filtres et Recherche */}
        <Card padding="lg" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="text-primary-600 w-5 h-5" />
              <h2 className="text-lg font-bold text-neutral-900">Recherche et filtres</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Recherche */}
              <Input
                type="text"
                label="Rechercher"
                placeholder="Nom ou email..."
                value={searchQuery}
                onChange={handleSearch}
                icon={FiSearch}
              />

              {/* Filtre par pays */}
              <div className="form-group">
                <label className="form-label">Pays visé</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="input"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par téléphone */}
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <select
                  value={filterHasPhone}
                  onChange={(e) => setFilterHasPhone(e.target.value)}
                  className="input"
                >
                  <option value="">Tous</option>
                  <option value="yes">Avec téléphone</option>
                  <option value="no">Sans téléphone</option>
                </select>
              </div>
            </div>

            {/* Actions des filtres */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                {filteredUsers.length} client{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  icon={FiX}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tableau */}
        <Card padding="none" className="overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Pays visé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600 flex items-center">
                          <FiMail className="mr-2 text-neutral-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-600 flex items-center">
                          <FiPhone className="mr-2 text-neutral-400" />
                        {user.phone || '-'}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {user.target_country || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                            className="text-primary-500 hover:text-primary-700 transition-colors"
                            title="Voir les détails"
                        >
                            <FiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Supprimer"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-neutral-500">
                        <FiUsers className="mx-auto w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Aucun client trouvé</p>
                        <p className="text-sm mt-1">
                          {hasActiveFilters 
                            ? 'Essayez de modifier vos critères de recherche' 
                            : 'Aucun client inscrit pour le moment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card padding="md" className="mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Affichage de <span className="font-semibold">{startIndex + 1}</span> à{' '}
                <span className="font-semibold">
                  {Math.min(endIndex, filteredUsers.length)}
                </span>{' '}
                sur <span className="font-semibold">{filteredUsers.length}</span> client{filteredUsers.length > 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  icon={FiChevronLeft}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    // Afficher seulement quelques pages autour de la page actuelle
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-neutral-400">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
        </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  icon={FiChevronRight}
                  iconPosition="right"
                >
                  Suivant
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Modal Details */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card padding="lg" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Détails du client</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Nom</label>
                    <p className="text-base text-neutral-900 mt-1">{selectedUser.name}</p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Email</label>
                    <p className="text-base text-neutral-900 mt-1 flex items-center">
                      <FiMail className="mr-2 text-neutral-400" />
                      {selectedUser.email}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Téléphone</label>
                    <p className="text-base text-neutral-900 mt-1 flex items-center">
                      <FiPhone className="mr-2 text-neutral-400" />
                      {selectedUser.phone || '-'}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Pays visé</label>
                    <p className="text-base text-neutral-900 mt-1">{selectedUser.target_country || '-'}</p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Préinscriptions</label>
                    <p className="text-base text-neutral-900 mt-1">{selectedUser.inscriptions?.length || 0}</p>
                </div>
                <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Documents</label>
                    <p className="text-base text-neutral-900 mt-1">{selectedUser.documents?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                onClick={() => setSelectedUser(null)}
              >
                Fermer
                </Button>
            </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminUsers
