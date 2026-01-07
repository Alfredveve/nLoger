import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import { useAuth } from '../context/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleContactClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalOpen(true);
  };

  const fetchProperty = React.useCallback(async () => {
    try {
      const response = await api.get(`properties/${id}/`);
      setProperty(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du logement:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Chargement...</div>;
  }

  if (!property) {
    return <div className="container mx-auto px-4 py-8 text-center">Logement non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="card overflow-hidden">
          {/* Image placeholder */}
          <div className="h-96 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <svg className="w-32 h-32 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b gap-4">
              <span className="text-4xl font-bold text-primary-600">
                {parseInt(property.price).toLocaleString()} GNF
              </span>
              <button 
                onClick={handleContactClick}
                className="btn-primary text-lg px-8 w-full sm:w-auto py-3 sm:py-2"
              >
                Contacter le démarcheur
              </button>
            </div>

            <ContactModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              contact={{
                name: property.agent_name || property.owner_name,
                phone: property.agent_phone || property.owner_phone,
                role: property.agent_name ? 'Démarcheur' : 'Propriétaire'
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Type de logement</h3>
                <p className="text-gray-600">{property.property_type}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Localisation</h3>
                <p className="text-gray-600">{property.secteur_name}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {(property.religion_preference || property.ethnic_preference) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Critères spécifiques</h3>
                {property.religion_preference && (
                  <p className="text-sm text-gray-600">Religion: {property.religion_preference}</p>
                )}
                {property.ethnic_preference && (
                  <p className="text-sm text-gray-600">Ethnie: {property.ethnic_preference}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
