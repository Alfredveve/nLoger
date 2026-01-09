import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
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
  Calendar,
  FileSignature,
  Percent,
  Plus
} from 'lucide-react';

const MandateDashboard = () => {
  const { user } = useAuth();
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, ACCEPTED
  
  // Modal State for Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    property_type: 'APPARTEMENT',
    location_description: '',
    property_description: '',
    expected_price: '',
    owner_phone: user?.phone || '',
    mandate_type: 'SIMPLE',
    commission_percentage: '10.00'
  });

  useEffect(() => {
    fetchMandates();
  }, [filter]);

  const fetchMandates = async () => {
    setLoading(true);
    try {
      const response = await api.get('mandates/');
      setMandates(response.data);
    } catch (error) {
      console.error('Error fetching mandates:', error);
      toast.error('Impossible de charger les mandats.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOwner = async (id) => {
    if (!window.confirm("En signant, vous validez ce mandat et autorisez le démarcheur à publier votre bien.")) return;
    try {
      await api.post(`mandates/${id}/sign_owner/`);
      toast.success('Mandat validé et signé avec succès !');
      fetchMandates();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la signature.');
    }
  };

  const handleSignAgent = async (id) => {
    if (!window.confirm("Confirmez-vous accepter cette mission de gestion ?")) return;
    try {
      await api.post(`mandates/${id}/sign_agent/`);
      toast.success('Mandat accepté et signé !');
      fetchMandates();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la signature.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('mandates/', formData);
      toast.success('Demande de mandat créée !');
      setShowCreateModal(false);
      fetchMandates();
    } catch {
      toast.error('Erreur lors de la création.');
    }
  };

  const filteredMandates = mandates.filter(m => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <Toaster position="top-right" />
      
        {/* Create Modal */}
        {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nouveau Mandat de Gestion</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de Bien</label>
                <select 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={formData.property_type}
                  onChange={e => setFormData({...formData, property_type: e.target.value})}
                >
                  <option value="CHAMBRE_SIMPLE">Chambre Simple</option>
                  <option value="SALON_CHAMBRE">Salon Chambre</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="MAGASIN">Magasin</option>
                  <option value="BUREAU">Bureau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de Mandat</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, mandate_type: 'SIMPLE'})}
                    className={`p-3 rounded-xl border text-center text-sm font-bold ${formData.mandate_type === 'SIMPLE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}
                  >
                    Simple
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, mandate_type: 'EXCLUSIVE'})}
                    className={`p-3 rounded-xl border text-center text-sm font-bold ${formData.mandate_type === 'EXCLUSIVE' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600'}`}
                  >
                    Exclusif
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.mandate_type === 'EXCLUSIVE' 
                    ? "Seul ce démarcheur pourra louer votre bien. Engagement plus fort." 
                    : "Vous pouvez louer par vous-même ou via d'autres agents."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commission Proposée (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={formData.commission_percentage}
                  onChange={e => setFormData({...formData, commission_percentage: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description Emplacement</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={formData.location_description}
                  onChange={e => setFormData({...formData, location_description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description du Bien</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={formData.property_description}
                  onChange={e => setFormData({...formData, property_description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prix Espéré (GNF)</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={formData.expected_price}
                  onChange={e => setFormData({...formData, expected_price: e.target.value})}
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone Propriétaire</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                    value={formData.owner_phone}
                    onChange={e => setFormData({...formData, owner_phone: e.target.value})}
                    required
                  />
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-white font-bold bg-slate-900 rounded-xl hover:bg-slate-800"
                >
                  Créer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="max-w-6xl mx-auto text-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
              <Briefcase className="w-8 h-8 mr-3 text-blue-600" />
              Vos Mandats
            </h1>
            <p className="text-slate-500 mt-1">Gérez vos contrats et relations {user?.is_proprietaire ? 'avec vos démarcheurs' : 'avec vos propriétaires'}.</p>
          </div>
          
          <div className="flex items-center space-x-3">
             {/* Only Owners can initiate a mandate request in this simple UI for now */}
             <button
                onClick={() => setShowCreateModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg transition-all"
              >
                <Plus size={18} className="mr-2" />
                Nouveau Mandat
              </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            {['ALL', 'PENDING', 'ACCEPTED'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        filter === status 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En attente' : 'Actifs'}
                </button>
            ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : filteredMandates.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileSignature className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aucun mandat</h3>
            <p className="text-slate-500 mt-2">Créez une nouvelle demande pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMandates.map((mandate) => (
              <div 
                key={mandate.id} 
                className={`bg-white rounded-3xl p-6 shadow-sm border transaction-all group relative overflow-hidden ${
                    mandate.mandate_type === 'EXCLUSIVE' ? 'border-purple-100 ring-1 ring-purple-50' : 'border-slate-100'
                }`}
              >
                {/* Mandate Type Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                    mandate.mandate_type === 'EXCLUSIVE' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                    {mandate.mandate_type_display}
                </div>

                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl transition-colors ${
                        mandate.mandate_type === 'EXCLUSIVE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Home size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{mandate.property_type_display}</h3>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <Percent size={12} className="mr-1" />
                        Commission: {mandate.commission_percentage}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                    {/* Signatures Status */}
                    <div className="flex items-center space-x-2 text-xs font-bold mb-4 bg-slate-50 p-2 rounded-lg">
                        <div className={`flex items-center ${mandate.signature_owner ? 'text-green-600' : 'text-slate-400'}`}>
                            <CheckCircle2 size={14} className="mr-1" />
                            Proprio
                        </div>
                        <div className="text-slate-300">|</div>
                        <div className={`flex items-center ${mandate.signature_agent ? 'text-green-600' : 'text-slate-400'}`}>
                            <CheckCircle2 size={14} className="mr-1" />
                            Démarcheur
                        </div>
                    </div>
                    
                  <div className="flex items-start text-slate-600">
                    <MapPin className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Emplacement</p>
                      <p className="text-sm font-medium">{mandate.location_description}</p>
                    </div>
                  </div>

                  <div className="flex items-start text-slate-600">
                    <Clock className="w-5 h-5 mr-3 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Détails</p>
                      <p className="text-sm font-medium line-clamp-2">{mandate.property_description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Prix</p>
                      <p className="text-base font-black text-slate-800">
                        {mandate.expected_price ? Number(mandate.expected_price).toLocaleString() : '-'} GNF
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       {user.is_demarcheur ? (
                           <>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Propriétaire</p>
                             <p className="text-xs font-bold text-slate-700">{mandate.owner_username}</p>
                           </>
                       ) : (
                           <>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Démarcheur</p>
                             <p className="text-xs font-bold text-slate-700">{mandate.agent_username || 'En attente...'}</p>
                           </>
                       )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                    {/* Owner Actions */}
                    {user?.id === mandate.owner && !mandate.signature_owner && (
                        <button
                            onClick={() => handleSignOwner(mandate.id)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
                        >
                            <FileSignature className="w-4 h-4 mr-2" />
                            Signer & Valider ({mandate.mandate_type_display})
                        </button>
                    )}

                    {/* Agent Actions */}
                    {user?.is_demarcheur && !mandate.signature_agent && (
                         <button
                            onClick={() => handleSignAgent(mandate.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
                        >
                            <FileSignature className="w-4 h-4 mr-2" />
                            Accepter & Signer
                        </button>
                    )}
                    
                    {/* Completed State */}
                    {mandate.signature_owner && mandate.signature_agent && (
                         <div className="w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center border border-green-100">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Contrat Actif
                        </div>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MandateDashboard;
