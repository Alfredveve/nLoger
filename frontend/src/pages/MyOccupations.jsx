import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Home, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  User, 
  ArrowRight,
  Loader2,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';

const MyOccupations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      const response = await api.get('occupations/');
      setOccupations(response.data);
    } catch (error) {
      console.error('Error fetching occupations:', error);
      toast.error('Impossible de charger les réservations.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    if (paymentStatus === 'PAID') {
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Confirmé & Payé</span>;
    }
    
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">En attente de validation</span>;
      case 'VALIDATED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Validé</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Annulé</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 mr-3 text-blue-600" />
            Mes Réservations & Occupations
          </h1>
          <p className="text-slate-500 mt-2">
            {user?.is_demarcheur 
              ? "Gérez les dossiers des futurs locataires pour vos biens." 
              : "Suivez l'état de vos demandes de logement et finalisez vos paiements."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : occupations.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aucune réservation en cours</h3>
            <p className="text-slate-500 mt-2">Parcourez nos logements pour soumettre votre premier dossier.</p>
            <button 
              onClick={() => navigate('/properties')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Voir les logements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {occupations.map((occ) => (
              <div 
                key={occ.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusBadge(occ.status, occ.payment_status)}
                      <span className="text-xs text-slate-400 font-medium flex items-center">
                        <Clock size={12} className="mr-1" />
                        Soumis le {new Date(occ.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2">{occ.property_title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center text-sm text-slate-600">
                            <User size={16} className="mr-2 text-slate-400" />
                            <span className="font-bold mr-1">Locataire:</span> {occ.user_username}
                        </div>
                        {occ.payment_amount && (
                            <div className="flex items-center text-sm text-slate-600">
                                <CreditCard size={16} className="mr-2 text-slate-400" />
                                <span className="font-bold mr-1">Montant:</span> {Number(occ.payment_amount).toLocaleString()} GNF
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-end min-w-[200px] border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                    {/* Actions pour le Locataire */}
                    {!user.is_demarcheur && (
                      <>
                        {occ.status === 'VALIDATED' && occ.payment_status === 'UNPAID' && (
                          <button 
                            onClick={() => navigate(`/payment/${occ.id}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center transition-all group-hover:-translate-y-0.5"
                          >
                            Payer & Réserver
                            <ArrowRight size={18} className="ml-2" />
                          </button>
                        )}

                        {occ.status === 'PENDING' && (
                            <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-xs font-bold border border-amber-100 text-center w-full">
                                <Clock size={16} className="mx-auto mb-1" />
                                En attente de validation par le démarcheur
                            </div>
                        )}
                      </>
                    )}

                    {/* Actions pour le Démarcheur */}
                    {user.is_demarcheur && occ.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 w-full">
                            <button 
                                onClick={async () => {
                                    if(!window.confirm('Valider ce dossier ? Le locataire pourra procéder au paiement.')) return;
                                    try {
                                        await api.post(`occupations/${occ.id}/validate_occupation/`);
                                        toast.success('Dossier validé !');
                                        fetchOccupations();
                                    } catch { toast.error('Erreur technique'); }
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-bold text-sm shadow-md transition-all"
                            >
                                <CheckCircle2 size={16} className="inline mr-2" />
                                Valider le Dossier
                            </button>
                            <button 
                                onClick={async () => {
                                    if(!window.confirm('Refuser ce dossier ?')) return;
                                    try {
                                        await api.post(`occupations/${occ.id}/cancel_occupation/`);
                                        toast.success('Dossier refusé.');
                                        fetchOccupations();
                                    } catch { toast.error('Erreur technique'); }
                                }}
                                className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 py-2 px-4 rounded-xl font-bold text-sm transition-all"
                            >
                                Refuser
                            </button>
                        </div>
                    )}

                    {/* Status finaux */}
                    {occ.payment_status === 'PAID' && (
                       <div className="flex flex-col items-center text-green-600 font-bold">
                           <ShieldCheck size={32} className="mb-1" />
                           <span className="text-xs uppercase tracking-widest">Paiement Sécurisé</span>
                       </div>
                    )}

                    {occ.status === 'CANCELLED' && (
                        <div className="text-red-500 font-bold text-sm flex items-center">
                            <XCircle size={16} className="mr-2" />
                            Dossier annulé
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOccupations;
