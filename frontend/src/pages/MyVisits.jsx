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
      setVisits(response.data);
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

  const handleRate = async (visitId) => {
    try {
      await api.post(`visits/${visitId}/rate_visit/`, { 
        rating: ratingValue, 
        comment: ratingComment 
      });
      toast.success('Note enregistrée !');
      setRatingId(null);
      fetchVisits();
    } catch (error) {
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
            {visits.map((visit) => (
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
                        visit.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 
                        visit.status === 'VALIDATED' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {visit.status_display}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(visit.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{visit.property_title}</h3>
                    
                    <div className="flex items-center text-sm text-slate-500 mb-4">
                       {user.is_demarcheur ? (
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
                    
                    {/* CASE 1: VISITOR VIEW - SHOW CODE */}
                    {!user.is_demarcheur && visit.status === 'PENDING' && (
                        <div className="bg-slate-900 text-white p-4 rounded-2xl w-full text-center">
                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Code Secret</p>
                            <p className="text-3xl font-black font-mono tracking-widest">{visit.validation_code}</p>
                            <p className="text-[10px] text-slate-400 mt-2">Présentez ce code à l'agent sur place</p>
                        </div>
                    )}

                    {/* CASE 2: AGENT VIEW - VALIDATE CODE */}
                    {user.is_demarcheur && visit.status === 'PENDING' && (
                        <div className="w-full">
                            {validatingId === visit.id ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        placeholder="Entrez le code..." 
                                        className="w-full p-2 text-center text-lg font-bold border rounded-xl"
                                        maxLength={6}
                                        value={validationCode}
                                        onChange={(e) => setValidationCode(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => handleValidate(visit.id)}
                                        className="w-full bg-green-600 text-white py-2 rounded-xl font-bold text-sm"
                                    >
                                        Valider
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setValidatingId(visit.id)}
                                    className="w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-bold shadow-lg flex items-center justify-center"
                                >
                                    <QrCode size={18} className="mr-2" />
                                    Valider la visite
                                </button>
                            )}
                        </div>
                    )}

                    {/* CASE 3: RATING (Visitor Only, after Validation) */}
                    {!user.is_demarcheur && visit.status === 'VALIDATED' && !visit.rating && (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisits;
