import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';

const AdvancedSearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

  // Location data
  const [regions, setRegions] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [sousPrefectures, setSousPrefectures] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    region: '',
    prefecture: '',
    sous_prefecture: '',
    ville: '',
    quartier: '',
    secteur: '',
    property_type: '',
    min_price: '',
    max_price: '',
    is_available: true,
    religion_preference: '',
    ethnic_preference: '',
  });

  // Load regions on mount
  useEffect(() => {
    loadRegions();
    // Load initial properties
    loadInitialProperties();
  }, []);

  const loadInitialProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('properties/');
      setProperties(response.data);
      setTotalCount(response.data.length);
    } catch (error) {
      console.error('Erreur lors du chargement initial:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const response = await api.get('regions/');
      setRegions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des régions:', error);
    }
  };

  // Cascade loading functions
  const loadPrefectures = async (regionId) => {
    if (!regionId) {
      setPrefectures([]);
      return;
    }
    try {
      const response = await api.get(`prefectures/?region=${regionId}`);
      setPrefectures(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des préfectures:', error);
    }
  };

  const loadSousPrefectures = async (prefectureId) => {
    if (!prefectureId) {
      setSousPrefectures([]);
      return;
    }
    try {
      const response = await api.get(`sous-prefectures/?prefecture=${prefectureId}`);
      setSousPrefectures(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-préfectures:', error);
    }
  };

  const loadVilles = async (sousPrefectureId) => {
    if (!sousPrefectureId) {
      setVilles([]);
      return;
    }
    try {
      const response = await api.get(`villes/?sous_prefecture=${sousPrefectureId}`);
      setVilles(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    }
  };

  const loadQuartiers = async (villeId) => {
    if (!villeId) {
      setQuartiers([]);
      return;
    }
    try {
      const response = await api.get(`quartiers/?ville=${villeId}`);
      setQuartiers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des quartiers:', error);
    }
  };

  const loadSecteurs = async (quartierId) => {
    if (!quartierId) {
      setSecteurs([]);
      return;
    }
    try {
      const response = await api.get(`secteurs/?quartier=${quartierId}`);
      setSecteurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des secteurs:', error);
    }
  };

  // Handle filter changes with cascade
  const handleRegionChange = (value) => {
    setFilters({
      ...filters,
      region: value,
      prefecture: '',
      sous_prefecture: '',
      ville: '',
      quartier: '',
      secteur: '',
    });
    setPrefectures([]);
    setSousPrefectures([]);
    setVilles([]);
    setQuartiers([]);
    setSecteurs([]);
    if (value) loadPrefectures(value);
  };

  const handlePrefectureChange = (value) => {
    setFilters({
      ...filters,
      prefecture: value,
      sous_prefecture: '',
      ville: '',
      quartier: '',
      secteur: '',
    });
    setSousPrefectures([]);
    setVilles([]);
    setQuartiers([]);
    setSecteurs([]);
    if (value) loadSousPrefectures(value);
  };

  const handleSousPrefectureChange = (value) => {
    setFilters({
      ...filters,
      sous_prefecture: value,
      ville: '',
      quartier: '',
      secteur: '',
    });
    setVilles([]);
    setQuartiers([]);
    setSecteurs([]);
    if (value) loadVilles(value);
  };

  const handleVilleChange = (value) => {
    setFilters({
      ...filters,
      ville: value,
      quartier: '',
      secteur: '',
    });
    setQuartiers([]);
    setSecteurs([]);
    if (value) loadQuartiers(value);
  };

  const handleQuartierChange = (value) => {
    setFilters({
      ...filters,
      quartier: value,
      secteur: '',
    });
    setSecteurs([]);
    if (value) loadSecteurs(value);
  };

  const handleSecteurChange = (value) => {
    setFilters({ ...filters, secteur: value });
  };

  // Search function
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      
      // Location filters
      if (filters.region) params.region = filters.region;
      if (filters.prefecture) params.prefecture = filters.prefecture;
      if (filters.sous_prefecture) params.sous_prefecture = filters.sous_prefecture;
      if (filters.ville) params.ville = filters.ville;
      if (filters.quartier) params.quartier = filters.quartier;
      if (filters.secteur) params.secteur = filters.secteur;
      
      // Property filters
      if (filters.property_type) params.property_type = filters.property_type;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.is_available) params.is_available = filters.is_available;
      
      // Preference filters
      if (filters.religion_preference) params.religion_preference = filters.religion_preference;
      if (filters.ethnic_preference) params.ethnic_preference = filters.ethnic_preference;

      const response = await api.get('properties/', { params });
      setProperties(response.data);
      setTotalCount(response.data.length);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      region: '',
      prefecture: '',
      sous_prefecture: '',
      ville: '',
      quartier: '',
      secteur: '',
      property_type: '',
      min_price: '',
      max_price: '',
      is_available: true,
      religion_preference: '',
      ethnic_preference: '',
    });
    setPrefectures([]);
    setSousPrefectures([]);
    setVilles([]);
    setQuartiers([]);
    setSecteurs([]);
    setProperties([]);
    setTotalCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Recherche Avancée de Logements
          </h1>
          <p className="text-gray-600">
            Trouvez le logement idéal avec nos filtres de recherche détaillés
          </p>
        </div>

        {/* Search Filters Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtres de Recherche
            <button 
              className="md:hidden ml-auto text-sm text-blue-600 font-semibold"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Masquer' : 'Afficher'}
            </button>
          </h2>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block transition-all duration-300`}>
          {/* Location Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Localisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Region */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                <select
                  value={filters.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name} ({region.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prefecture */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Préfecture</label>
                <select
                  value={filters.prefecture}
                  onChange={(e) => handlePrefectureChange(e.target.value)}
                  disabled={!filters.region}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Toutes les préfectures</option>
                  {prefectures.map((prefecture) => (
                    <option key={prefecture.id} value={prefecture.id}>
                      {prefecture.name} ({prefecture.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sous-Prefecture */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-Préfecture</label>
                <select
                  value={filters.sous_prefecture}
                  onChange={(e) => handleSousPrefectureChange(e.target.value)}
                  disabled={!filters.prefecture}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Toutes les sous-préfectures</option>
                  {sousPrefectures.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <select
                  value={filters.ville}
                  onChange={(e) => handleVilleChange(e.target.value)}
                  disabled={!filters.sous_prefecture}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Toutes les villes</option>
                  {villes.map((ville) => (
                    <option key={ville.id} value={ville.id}>
                      {ville.name} ({ville.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quartier */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                <select
                  value={filters.quartier}
                  onChange={(e) => handleQuartierChange(e.target.value)}
                  disabled={!filters.ville}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Tous les quartiers</option>
                  {quartiers.map((quartier) => (
                    <option key={quartier.id} value={quartier.id}>
                      {quartier.name} ({quartier.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Secteur */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Secteur</label>
                <select
                  value={filters.secteur}
                  onChange={(e) => handleSecteurChange(e.target.value)}
                  disabled={!filters.quartier}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Tous les secteurs</option>
                  {secteurs.map((secteur) => (
                    <option key={secteur.id} value={secteur.id}>
                      {secteur.name} ({secteur.property_count || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Property Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Caractéristiques du Logement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de logement</label>
                <select
                  value={filters.property_type}
                  onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium bg-white hover:border-purple-400"
                >
                  <option value="">Tous les types</option>
                  <option value="CHAMBRE_SIMPLE">Rentrée Couchée</option>
                  <option value="SALON_CHAMBRE">Salon Chambre</option>
                  <option value="APPARTEMENT">Appartement</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix minimum (GNF)</label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                  placeholder="Ex: 500000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium hover:border-purple-400"
                />
              </div>

              {/* Max Price */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix maximum (GNF)</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  placeholder="Ex: 2000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium hover:border-purple-400"
                />
              </div>

              {/* Availability */}
              <div className="form-group flex items-end">
                <label className="flex items-center cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-lg border border-green-200 hover:border-green-400 transition-all w-full">
                  <input
                    type="checkbox"
                    checked={filters.is_available}
                    onChange={(e) => setFilters({ ...filters, is_available: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">Disponibles uniquement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher
                </>
              )}
            </button>
            <button
              onClick={resetFilters}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
          </div> {/* End of collapsible section */}
        </div>

        {/* Results Section */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between">
              <p className="text-lg font-semibold">
                {totalCount} logement{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
              </p>
              
              {/* View Toggle Buttons */}
              <div className="flex gap-2 bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grille
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Carte
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Display */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Recherche en cours...</p>
          </div>
        ) : properties.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <PropertyMap 
                  properties={properties}
                  selectedRegion={regions.find(r => r.id === parseInt(filters.region))}
                />
              </div>
            )}
          </>
        ) : totalCount === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche pour voir plus de résultats.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdvancedSearch;
