import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Phone,
  Home,
  User,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';

const MandateDashboard = () => {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING or ACCEPTED

  useEffect(() => {
    fetchMandates();
  }, [filter]);

  const fetchMandates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/mandates/');
      setMandates(response.data);
    } catch (error) {
      console.error('Error fetching mandates:', error);
      toast.error('Impossible de charger les mandats.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.post(`/api/mandates/${id}/accept/`);
      toast.success('Mandat accepté ! Vous êtes maintenant en charge de ce bien.');
      fetchMandates();
    } catch (error) {
      console.error('Error accepting mandate:', error);
      toast.error('Une erreur est survenue.');
    }
  };

  const filteredMandates = mandates.filter(m => {
    if (filter === 'PENDING') return m.status === 'PENDING';
    if (filter === 'ACCEPTED') return m.status === 'ACCEPTED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto text-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
              <Briefcase className="w-8 h-8 mr-3 text-blue-600" />
              Tableau de bord des Mandats
            </h1>
            <p className="text-slate-500 mt-1">Gérez les demandes de gestion locative confiées par les propriétaires.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'PENDING' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Nouveaux (En attente)
            </button>
            <button
              onClick={() => setFilter('ACCEPTED')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'ACCEPTED' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mes Mandats (Acceptés)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : filteredMandates.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aucun mandat trouvé</h3>
            <p className="text-slate-500 mt-2">Revenez plus tard pour voir de nouvelles opportunités.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMandates.map((mandate) => (
              <div 
                key={mandate.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                      <Home size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{mandate.property_type_display}</h3>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <Calendar size={12} className="mr-1" />
                        Publié le {new Date(mandate.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    mandate.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                    {mandate.status_display}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start text-slate-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Emplacement</p>
                      <p className="text-sm font-medium">{mandate.location_description}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-slate-600">
                    <Clock className="w-5 h-5 mr-3 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Détails du bien</p>
                      <p className="text-sm font-medium line-clamp-2">{mandate.property_description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Prix espéré</p>
                      <p className="text-lg font-black text-blue-700">
                        {mandate.expected_price ? `${Number(mandate.expected_price).toLocaleString()} GNF` : 'À discuter'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Propriétaire</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center">
                        <User size={14} className="mr-1.5" />
                        {mandate.owner_username}
                      </p>
                    </div>
                  </div>

                  {mandate.status === 'ACCEPTED' && (
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                      <div className="flex items-center text-green-700 font-bold">
                        <Phone size={18} className="mr-2" />
                        {mandate.owner_phone}
                      </div>
                      <a 
                        href={`https://wa.me/${mandate.owner_phone.replace(/\s/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-all shadow-md"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  )}
                </div>

                {mandate.status === 'PENDING' && (
                  <button
                    onClick={() => handleAccept(mandate.id)}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Accepter la gestion</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MandateDashboard;
