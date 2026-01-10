import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import ContactModal from '../components/ContactModal';
import { useAuth } from '../context/AuthContext';
import VisitModal from '../components/VisitModal';
import { toast, Toaster } from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleContactClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // Create occupation request before showing modal
    try {
      await api.post('occupations/', { property: property.id });
      // We don't necessarily need to wait or block if it fails, 
      // but logically it should be created.
    } catch (error) {
      console.error('Erreur lors de la création de la demande doccupation:', error);
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
    <div className="container mx-auto px-4 pt-8 pb-12">
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
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-primary-600">
                  {parseInt(property.price).toLocaleString()} GNF
                </span>
                {property.is_under_validation && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-2 w-fit">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Validation en cours
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleContactClick}
                  disabled={property.is_under_validation && user?.kyc_status !== 'VERIFIED'}
                  className={`btn-primary text-lg px-8 py-3 ${property.is_under_validation && user?.kyc_status !== 'VERIFIED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {property.is_under_validation && user?.kyc_status !== 'VERIFIED' ? 'Réservé temporairement' : 'Contacter le démarcheur'}
                </button>
                
                {(!property.is_under_validation || user?.kyc_status === 'VERIFIED') && (
                    <button
                        onClick={() => {
                            if (!user) {
                                navigate('/login', { state: { from: location } });
                                return;
                            }
                            setIsVisitModalOpen(true);
                        }}
                        className="bg-white text-slate-900 border-2 border-slate-900 font-bold text-lg px-8 py-3 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Demander une visite
                    </button>
                )}
              </div>
            </div>

            <Toaster position="top-right" />
            
            <VisitModal 
              isOpen={isVisitModalOpen}
              onClose={() => setIsVisitModalOpen(false)}
              propertyTitle={property.title}
              onConfirm={async (scheduledAt) => {
                try {
                  await api.post('visits/', { 
                    property: property.id,
                    scheduled_at: scheduledAt
                  });
                  toast.success("Demande de visite envoyée !");
                  setTimeout(() => navigate('/visits'), 1500);
                } catch (e) {
                  console.error(e);
                  toast.error("Erreur lors de la demande.");
                }
              }}
            />

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
