import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyMap from '../components/PropertyMap';
import SearchFilters from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import useGeolocation from '../hooks/useGeolocation';



const Home = () => {
  const [properties, setProperties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    prefecture: '',
    property_type: '',
  });
  const { 
    location: userLocation, 
    address: locationAddress, 
    loading: detectingLocation, 
    refreshLocation,
    clearLocation 
  } = useGeolocation();



  const fetchData = React.useCallback(async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.region) params.region = currentFilters.region;
      if (currentFilters.property_type) params.property_type = currentFilters.property_type;
      
      const [propertiesRes, regionsRes] = await Promise.all([
        api.get('properties/', { params }),
        api.get('regions/'),
      ]);
      setProperties(propertiesRes.data);
      setRegions(regionsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    fetchData();
  };

  const resetFilters = () => {
    const defaultFilters = {
      region: '',
      prefecture: '',
      property_type: '',
    };
    setFilters(defaultFilters);
    clearLocation();
    fetchData(defaultFilters);
  };




  const handleLocateMe = async () => {
    const coords = await refreshLocation();
    if (coords) {
      if (coords.accuracy > 1000) {
        alert("Attention : La précision de votre position est faible (localisation par défaut ou IP détectée). Veuillez vous assurer que le GPS de votre appareil est activé pour une localisation précise dans votre quartier.");
      }
      try {
        setLoading(true);
        const response = await api.get('properties/nearby/', {
          params: {
            lat: coords.latitude,
            lng: coords.longitude,
            dist: 10 // Rayon de 10km comme demandé
          }
        });
        setProperties(response.data);
      } catch (error) {
        console.error('Erreur lors de la recherche à proximité:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (


    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary-600 to-primary-800 text-white pt-8 pb-12 sm:pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trouvez votre logement idéal en Guinée
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Recherchez parmi des milliers de logements disponibles dans toutes les régions
          </p>
          <SearchFilters 
            regions={regions} 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={handleSearch}
            onLocationSearch={handleLocateMe}
            onReset={resetFilters}
          />

          {/* Premium Call to Action */}
          <div className="mt-12 group">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-linear-to-r from-primary-400 to-primary-200 rounded-2xl blur-sm opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <button
                onClick={handleLocateMe}
                disabled={detectingLocation}
                className="relative w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 sm:px-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-6">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${detectingLocation ? 'bg-white/20' : 'bg-primary-500 shadow-lg shadow-primary-500/50'}`}>
                    {detectingLocation ? (
                      <div className="w-8 h-8 border-3 border-transparent border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-white mb-0.5">Vous recherchez un logement ?</p>
                    <p className="text-primary-100">Voir les disponibilités dans votre quartier / secteur</p>
                  </div>

                </div>
                <div className="hidden sm:flex items-center gap-2 text-primary-200 font-semibold group-hover:text-white transition-colors">
                  <span>Démarrer</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Map Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Map - Full Width */}
          <div className="w-full">
            <div className="card p-4">
              <h2 className="text-2xl font-bold mb-4">Carte des logements</h2>
              <PropertyMap properties={properties} selectedRegion={regions.find(r => r.id.toString() === filters.region?.toString())} userLocation={userLocation} />

            </div>
          </div>

          {/* Property List - Responsive Grid Below Map */}
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold">
                {userLocation ? 'Logements dans votre secteur' : 'Logements disponibles'}
              </h2>

              {userLocation && (
                <div className="flex flex-wrap items-center bg-white shadow-sm border border-gray-100 px-5 py-3 rounded-2xl gap-3">
                  <div className="flex items-center text-primary-600 font-bold">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping mr-2"></div>
                    Secteur immédiat (2 km)
                  </div>


                  <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {locationAddress?.full || 'Position détectée'}
                    </span>
                  </div>
                  <button 
                    onClick={resetFilters}
                    className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                    title="Effacer la localisation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

            </div>
            {loading ? (

              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Chargement des logements...</p>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {userLocation ? 'Aucun logement à proximité immédiate' : 'Aucun logement trouvé'}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {userLocation 
                    ? `Nous n'avons trouvé aucun logement disponible dans un rayon de 10 km autour de votre position actuelle (${locationAddress?.full || 'Position détectée'}).`
                    : "Nous n'avons trouvé aucun logement correspondant à vos critères de recherche pour le moment."
                  }
                </p>
                {userLocation && (
                  <button 
                    onClick={resetFilters}
                    className="mt-6 text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    Voir tous les logements en Guinée
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
