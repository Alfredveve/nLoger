import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import PaymentForm from '../components/payments/PaymentForm';

const PaymentPage = () => {
  const { occupationId } = useParams();
  const navigate = useNavigate();
  const [occupation, setOccupation] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupationId]);

  const fetchOccupationDetails = async () => {
    try {
      const response = await api.get(`/occupations/${occupationId}/`);
      setOccupation(response.data);
      
      // Fetch property details
      if (response.data.property) {
        const propResponse = await api.get(`/properties/${response.data.property}/`);
        setProperty(propResponse.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Paiement effectué avec succès !');
    setTimeout(() => {
      navigate('/my-payments');
    }, 2000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!occupation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Demande d'occupation introuvable
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Finaliser votre paiement
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Paiement sécurisé avec système d'escrow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails de la propriété */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Détails de la réservation
              </h3>

              {property && (
                <>
                  {/* Image de la propriété */}
                  {property.images && property.images.length > 0 && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img
                        src={property.images[0].image}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Informations */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Home className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {property.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {property.property_type_display}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {property.secteur_name}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Loyer</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {property.price?.toLocaleString()} GNF
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Inclus
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-white">Total</span>
                          <span className="text-xl font-bold text-blue-600">
                            {occupation.payment_amount?.toLocaleString()} GNF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Note de sécurité */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-xs text-green-800 dark:text-green-300">
                  🔒 <strong>Paiement sécurisé</strong><br />
                  Vos fonds sont protégés par notre système d'escrow jusqu'à la validation de votre occupation.
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <PaymentForm
              occupationRequest={occupation}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
