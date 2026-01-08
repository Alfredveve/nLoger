import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import PropertyMap from '../components/PropertyMap';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');
  
  const [filters, setFilters] = useState({
    region: searchParams.get('region') || '',
    prefecture: '',
    property_type: '',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : undefined,
  });

  const fetchData = React.useCallback(async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      let endpoint = 'properties/';

      if (currentFilters.lat && currentFilters.lng) {
        endpoint = 'properties/nearby/';
        params.lat = currentFilters.lat;
        params.lng = currentFilters.lng;
        params.dist = searchParams.get('dist') || 10;
      } else {
        if (currentFilters.region) params.region = currentFilters.region;
      }
      
      if (currentFilters.property_type) params.property_type = currentFilters.property_type;
      
      const [propertiesRes, regionsRes] = await Promise.all([
        api.get(endpoint, { params }),
        api.get('regions/'),
      ]);
      setProperties(propertiesRes.data);
      setRegions(regionsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update URL when filters or view mode change
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (filters.lat) params.set('lat', filters.lat);
    if (filters.lng) params.set('lng', filters.lng);
    if (filters.region) params.set('region', filters.region);
    setSearchParams(params, { replace: true });
  }, [viewMode, filters.lat, filters.lng, filters.region, setSearchParams]);

  const handleSearch = () => {
    // If searching by region, we should clear location specific filtering
    if (filters.region) {
        const newFilters = { ...filters };
        delete newFilters.lat;
        delete newFilters.lng;
        setFilters(newFilters);
        fetchData(newFilters);
    } else {
        fetchData();
    }
  };

  const handleLocationSearch = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          const newFilters = {
            ...filters,
            region: '', // Clear region when searching nearby
            lat: latitude,
            lng: longitude
          };
          setFilters(newFilters);
          setViewMode('map'); // Switch to map view specifically for location search
          fetchData(newFilters);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          alert("Impossible de récupérer votre position. Veuillez vérifier vos paramètres GPS.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      region: '',
      prefecture: '',
      property_type: '',
    };
    setViewMode('grid');
    setSearchParams({});
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Tous les logements</h1>
        
        {/* View Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grille
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-all ${
              viewMode === 'map' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Carte
          </button>
        </div>
      </div>
      
      <div className="mb-12">
        <SearchFilters 
          regions={regions} 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
          onReset={resetFilters}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Chargement des logements...</p>
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
            <div className="h-[600px] w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
               <PropertyMap 
                  properties={properties} 
                  selectedRegion={regions.find(r => r.id.toString() === filters.region?.toString())}
                  userLocation={filters.lat && filters.lng ? { latitude: filters.lat, longitude: filters.lng } : null}
               />
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun logement trouvé</h3>
          <p className="text-gray-500">
            Essayez de modifier vos filtres pour voir plus de résultats.
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;
