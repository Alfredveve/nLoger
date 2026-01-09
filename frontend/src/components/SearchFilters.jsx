import React from 'react';

const SearchFilters = ({
    regions,
    filters,
    setFilters,
    onSearch,
    onReset,
    onLocationSearch
}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Région
                    </label>
                    <select value={
                            filters.region
                        }
                        onChange={
                            (e) => setFilters({
                                ...filters,
                                region: e.target.value
                            })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-700 font-medium bg-gray-50/50 hover:bg-white appearance-none cursor-pointer shadow-sm"
                        style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem`}}
                        >
                        <option value="">Toutes les régions</option>
                        {
                        regions.map((region) => (
                            <option key={
                                    region.id
                                }
                                value={
                                    region.id
                            }>
                                {
                                region.name
                            }
                                ({
                                region.property_count || 0
                            })
                            </option>
                        ))
                    } </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-black mb-2">
                        Type de logement
                    </label>
                    <select value={
                            filters.property_type
                        }
                        onChange={
                            (e) => setFilters({
                                ...filters,
                                property_type: e.target.value
                            })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-700 font-medium bg-gray-50/50 hover:bg-white appearance-none cursor-pointer shadow-sm"
                        style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem`}}
                        >
                        <option value="">Tous les types</option>
                        <option value="CHAMBRE_SIMPLE">Rentrée Couchée</option>
                        <option value="SALON_CHAMBRE">Salon Chambre</option>
                        <option value="APPARTEMENT">Appartement</option>
                        <option value="VILLA">Villa</option>
                        <option value="STUDIO">Studio</option>
                        <option value="MAGASIN">Magasin</option>
                        <option value="BUREAU">Bureau</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 md:col-span-2">
                    <button onClick={onSearch}
                        className="flex-1 h-[56px] sm:h-[50px] flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-95 text-lg sm:text-base">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        Rechercher
                    </button>
                    
                    <div className="flex gap-2 h-[56px] sm:h-[50px]">
                        <button onClick={onReset}
                            className="flex-1 sm:flex-initial px-6 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center shadow-sm"
                            title="Réinitialiser">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            <span className="ml-2 sm:hidden font-medium">Reset</span>
                        </button>
                        
                        <button onClick={onLocationSearch}
                            className="flex-[2] sm:flex-initial px-6 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center shadow-sm font-bold"
                            title="Autour de moi">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="sm:inline">Prop de moi</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;
