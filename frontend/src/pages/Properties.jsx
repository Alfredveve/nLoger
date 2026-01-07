import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';

const Properties = () => {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-gray-900 tracking-tight">Tous les logements</h1>
      
      <div className="mb-12">
        <SearchFilters 
          regions={regions} 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={handleSearch}
          onReset={resetFilters}
        />
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
