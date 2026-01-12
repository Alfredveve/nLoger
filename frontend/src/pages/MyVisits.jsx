import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Calendar,
  Lock,
  CheckCircle2,
  MapPin,
  User,
  Star,
  QrCode,
  ShieldCheck,
  Clock,
  Loader2
} from 'lucide-react';

const MyVisits = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationCode, setValidationCode] = useState('');
  const [validatingId, setValidatingId] = useState(null);
  
  // Rating State
  const [ratingId, setRatingId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await api.get('visits/');
      // Sort: REQUESTED first, then by date desc
      const sortedVisits = response.data.sort((a, b) => {
        if (a.status === 'REQUESTED' && b.status !== 'REQUESTED') return -1;
        if (a.status !== 'REQUESTED' && b.status === 'REQUESTED') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setVisits(sortedVisits);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Impossible de charger les visites.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (visitId) => {
    try {
      await api.post(`visits/${visitId}/validate_visit/`, { code: validationCode });
      toast.success('Visite validée avec succès !');
      setValidatingId(null);
      setValidationCode('');
      fetchVisits();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Code invalide.');
    }
  };

  const handleAction = async (visitId, action) => {
    try {
      await api.post(`visits/${visitId}/${action}/`);
      toast.success('Action effectuée avec succès');
      fetchVisits();
    } catch {
      toast.error('Erreur lors de l’action');
    }
  };

  const handleRate = async (visitId) => {
    try {
      await api.post(`visits/${visitId}/rate_visit/`, { 
        rating: ratingValue, 
        comment: ratingComment 
      });
      toast.success('Note enregistrée !');
      setRatingId(null);
      fetchVisits();
    } catch {
      toast.error('Erreur lors de la notation.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-blue-600" />
            Visites Sécurisées
          </h1>
          <p className="text-slate-500 mt-2">
            {user?.is_demarcheur 
              ? "Validez les codes des visiteurs pour confirmer votre travail." 
              : "Retrouvez vos codes secrets à présenter lors des visites."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aucune visite programmée</h3>
            <p className="text-slate-500 mt-2">Demandez une visite sur une fiche logement pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {visits.map((visit) => {
              const isAgent = user?.id === visit.agent;
              const isVisitor = user?.id === visit.visitor;
              const isExpired = visit.scheduled_at && new Date(visit.scheduled_at) < new Date();
              
              return (
              <div 
                key={visit.id} 
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                    visit.status === 'VALIDATED' ? 'border-green-100 ring-1 ring-green-50' : 'border-slate-100 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  {/* Info Block */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isExpired && !['VALIDATED', 'CANCELLED', 'REJECTED'].includes(visit.status) ? 'bg-slate-100 text-slate-500' :
                        visit.status === 'REQUESTED' ? 'bg-blue-50 text-blue-600' :
                        visit.status === 'ACCEPTED' ? 'bg-orange-50 text-orange-600' : 
                        visit.status === 'VALIDATED' ? 'bg-green-50 text-green-600' : 
                        visit.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                        visit.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {isExpired && !['VALIDATED', 'CANCELLED', 'REJECTED'].includes(visit.status)
                          ? 'Visite Expirée / Non Honorée'
                          : visit.status === 'REQUESTED' 
                              ? (isAgent ? 'Nouvelle Demande' : 'Demande Envoyée') 
                              : visit.status_display}
                        {isAgent && visit.status === 'REQUESTED' && !isExpired && (
                          <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(visit.created_at).toLocaleDateString()}
                      </span>
                      {visit.scheduled_at && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold flex items-center ${
                          new Date(visit.scheduled_at) < new Date() && visit.status !== 'VALIDATED'
                          ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Calendar size={12} className="mr-1" />
                          {new Date(visit.scheduled_at).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {new Date(visit.scheduled_at) < new Date() && visit.status !== 'VALIDATED' && (
                            <span className="ml-1 italic opacity-75">(Expiré)</span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{visit.property_title}</h3>
                    
                    <div className="flex items-center text-sm text-slate-500 mb-4">
                       {isAgent ? (
                           <>
                            <User size={14} className="mr-1" />
                            Visiteur : <span className="font-bold ml-1 text-slate-700">{visit.visitor_username}</span>
                           </>
                       ) : (
                           <>
                            <User size={14} className="mr-1" />
                            Agent : <span className="font-bold ml-1 text-slate-700">{visit.agent_username}</span>
                           </>
                       )}
                    </div>
                  </div>

                  {/* Action Block */}
                  <div className="w-full md:w-auto flex flex-col items-center min-w-[200px]">
                    
                    {/* CASE 1: VISITOR VIEW - SHOW CODE OR STATUS */}
                    {isVisitor && (
                        visit.status === 'ACCEPTED' ? (
                            <div className="bg-slate-900 text-white p-4 rounded-2xl w-full text-center shadow-lg">
                                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Code Secret</p>
                                <p className="text-3xl font-black font-mono tracking-widest">{visit.validation_code}</p>
                                <p className="text-[10px] text-slate-400 mt-2 mb-3">Présentez ce code à l'agent sur place</p>
                                
                                {visit.location_link && (
                                    <a 
                                        href={visit.location_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-colors gap-2"
                                    >
                                        <MapPin size={14} />
                                        Localisation du bien
                                    </a>
                                )}
                            </div>
                        ) : visit.status === 'REQUESTED' ? (
                            <>
                                <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl w-full text-center border border-blue-100 italic text-sm">
                                    <Clock size={16} className="mx-auto mb-1" />
                                    En attente de confirmation par le démarcheur
                                </div>
                                <button 
                                    onClick={() => handleAction(visit.id, 'cancel_visit')}
                                    className="text-[10px] text-red-500 hover:underline mt-2"
                                >
                                    Annuler ma demande
                                </button>
                            </>
                        ) : null
                    )}

                    {/* CASE 2: AGENT VIEW - ACCEPT/REJECT OR VALIDATE */}
                    {isAgent && (
                        visit.status === 'REQUESTED' ? (
                            <div className="flex flex-col gap-2 w-full">
                                <button 
                                    onClick={() => handleAction(visit.id, 'accept_visit')}
                                    className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold text-sm shadow-md"
                                >
                                    Accepter la visite
                                </button>
                                <button 
                                    onClick={() => handleAction(visit.id, 'reject_visit')}
                                    className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-xl font-bold text-sm"
                                >
                                    Refuser
                                </button>
                            </div>
                        ) : visit.status === 'ACCEPTED' ? (
                            <div className="w-full">
                                {isExpired ? (
                                    <button 
                                        disabled
                                        className="w-full bg-slate-100 text-slate-400 border border-slate-200 py-3 rounded-xl font-bold flex items-center justify-center cursor-not-allowed"
                                    >
                                        <Clock size={18} className="mr-2" />
                                        Date dépassée
                                    </button>
                                ) : validatingId === visit.id ? (
                                    <div className="space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Code à 6 chiffres..." 
                                            className="w-full p-2 text-center text-lg font-bold border rounded-xl"
                                            maxLength={6}
                                            value={validationCode}
                                            onChange={(e) => setValidationCode(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleValidate(visit.id)}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm"
                                            >
                                                Valider
                                            </button>
                                            <button 
                                                onClick={() => setValidatingId(null)}
                                                className="px-4 bg-slate-100 text-slate-600 py-2 rounded-xl font-bold text-sm"
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 w-full text-center">
                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Code Attendu</p>
                                         <button 
                                            onClick={() => setValidatingId(visit.id)}
                                            className="w-full bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl font-black flex items-center justify-center shadow-sm"
                                        >
                                            <QrCode size={18} className="mr-2" />
                                            Saisir le Code
                                        </button>
                                        <button 
                                            onClick={() => handleAction(visit.id, 'cancel_visit')}
                                            className="text-[10px] text-red-500 hover:underline mt-1"
                                        >
                                            Annuler le rendez-vous
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null
                    )}

                    {/* CASE 3: RATING (Visitor Only, after Validation) */}
                    {isVisitor && visit.status === 'VALIDATED' && !visit.rating && (
                        <div className="w-full">
                             {ratingId === visit.id ? (
                                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                     <p className="text-sm font-bold mb-2">Noter l'agent</p>
                                     <div className="flex justify-center space-x-2 mb-3">
                                         {[1,2,3,4,5].map(star => (
                                             <button key={star} onClick={() => setRatingValue(star)}>
                                                 <Star className={`w-6 h-6 ${star <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                             </button>
                                         ))}
                                     </div>
                                     <textarea 
                                        className="w-full text-sm p-2 rounded-lg border mb-2" 
                                        placeholder="Commentaire..."
                                        value={ratingComment}
                                        onChange={e => setRatingComment(e.target.value)}
                                     />
                                     <button 
                                        onClick={() => handleRate(visit.id)}
                                        className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg"
                                     >
                                         Envoyer
                                     </button>
                                 </div>
                             ) : (
                                <button 
                                    onClick={() => setRatingId(visit.id)}
                                    className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 py-3 rounded-xl font-bold flex items-center justify-center"
                                >
                                    <Star size={18} className="mr-2" />
                                    Noter la visite
                                </button>
                             )}
                        </div>
                    )}
                    
                    {/* COMPLETED STATE */}
                    {visit.status === 'VALIDATED' && (
                        <div className="mt-2 text-green-600 font-bold flex items-center text-sm">
                            <CheckCircle2 size={16} className="mr-1" />
                            Visite effectuée
                            {visit.rating && <span className="ml-2 text-slate-400 text-xs">({visit.rating}/5)</span>}
                        </div>
                    )}

                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisits;
