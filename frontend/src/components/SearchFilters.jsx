import React from 'react';

const SearchFilters = ({ regions, filters, setFilters, onSearch, onReset }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Région
          </label>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-black font-medium"
          >
            <option value="">Toutes les régions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Type de logement
          </label>
          <select
            value={filters.property_type}
            onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-black font-medium"
          >
            <option value="">Tous les types</option>
            <option value="CHAMBRE_SIMPLE">Rentrée couchée</option>
            <option value="SALON_CHAMBRE">Selon chambre</option>
            <option value="APPARTEMENT">Appartement</option>
          </select>
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <button 
            onClick={onSearch}
            className="btn-primary flex-grow h-[42px] flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rechercher
          </button>
          <button 
            onClick={onReset}
            className="px-4 h-[42px] border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
            title="Réinitialiser"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
