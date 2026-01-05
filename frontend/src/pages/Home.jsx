import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyMap from '../components/PropertyMap';
import SearchFilters from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    prefecture: '',
    property_type: '',
  });

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
    fetchData(defaultFilters);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
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
            onReset={resetFilters}
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Map - Full Width */}
          <div className="w-full">
            <div className="card p-4">
              <h2 className="text-2xl font-bold mb-4">Carte des logements</h2>
              <PropertyMap properties={properties} />
            </div>
          </div>

          {/* Property List - Responsive Grid Below Map */}
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">Logements disponibles</h2>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun logement trouvé</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Nous n'avons trouvé aucun logement correspondant à vos critères de recherche pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
