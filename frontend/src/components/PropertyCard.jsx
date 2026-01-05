import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const getPropertyTypeLabel = (type) => {
    const labels = {
      'CHAMBRE_SIMPLE': 'Rentrée couchée',
      'SALON_CHAMBRE': 'Selon chambre',
      'APPARTEMENT': 'Appartement',
    };
    return labels[type] || type;
  };

  return (
    <Link to={`/property/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
        {/* Image placeholder with overlay for premium feel */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <svg className="w-16 h-16 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="absolute top-3 left-3">
            <span className="text-[10px] uppercase tracking-wider font-bold bg-white/90 backdrop-blur-sm text-primary-700 px-3 py-1 rounded-full shadow-sm">
              {getPropertyTypeLabel(property.property_type)}
            </span>
          </div>
          {property.is_available ? (
             <div className="absolute top-3 right-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
             </div>
          ) : null}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {property.title}
            </h3>
          </div>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          <div className="flex items-center text-sm text-gray-400 mb-4">
            <div className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{property.secteur_name || 'Non spécifié'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <div>
              <span className="text-2xl font-black text-primary-600">
                {parseInt(property.price).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-400 ml-1">GNF</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
