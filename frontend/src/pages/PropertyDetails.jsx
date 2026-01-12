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
          <div className="h-96 bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
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
                
                <button
                    onClick={() => {
                        const message = `Bonjour, je suis intéressé par ce logement : ${property.title}\n\nLocalisation sur Google Maps : https://www.google.com/maps?q=${property.latitude},${property.longitude}\nPlus Code : ${property.plus_code || 'N/A'}\nRepère : ${property.point_de_repere}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-lg px-8 py-3 rounded-xl hover:bg-green-600 transition-all shadow-md"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Partager via WhatsApp
                </button>
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
                <p className="text-gray-600">{property.secteur_name}, {property.quartier_name}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Indications pour trouver le logement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Point de repère</h4>
                  <p className="text-gray-800 font-medium">{property.point_de_repere || 'Non précisé'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Adresse Numérique (Plus Code)</h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded border text-primary-700 font-bold">{property.plus_code || 'Génération en cours...'}</code>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(property.plus_code);
                            toast.success("Code copié !");
                        }}
                        className="text-primary-600 hover:text-primary-700 underline text-xs"
                    >
                        Copier
                    </button>
                  </div>
                </div>
                {property.description_direction && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Directions détaillées</h4>
                    <p className="text-gray-800">{property.description_direction}</p>
                  </div>
                )}
                {property.address_details && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Détails d'adresse</h4>
                    <p className="text-gray-800 italic">{property.address_details}</p>
                  </div>
                )}
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
