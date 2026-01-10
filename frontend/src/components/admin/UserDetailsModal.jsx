import React from 'react';
import { X, User, Mail, Phone, Calendar, Shield, BadgeCheck, AlertCircle } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-32 bg-linear-to-r from-blue-600 to-blue-800 flex items-end p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-end gap-4 translate-y-8">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                {user.username}
                {user.kyc_status === 'VERIFIED' && <BadgeCheck size={20} className="text-blue-200" />}
              </h2>
              <div className="flex gap-2">
                {user.is_demarcheur && <span className="bg-blue-500/20 text-blue-50 backdrop-blur-md text-xs px-2 py-0.5 rounded border border-blue-400/30">Démarcheur</span>}
                {user.is_proprietaire && <span className="bg-purple-500/20 text-purple-50 backdrop-blur-md text-xs px-2 py-0.5 rounded border border-purple-400/30">Propriétaire</span>}
                {user.is_locataire && <span className="bg-green-500/20 text-green-50 backdrop-blur-md text-xs px-2 py-0.5 rounded border border-green-400/30">Locataire</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 p-6 overflow-y-auto space-y-8">
          
          {/* Identity & Contact */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                Informations Personnelles
              </h3>
              
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nom complet</p>
                  <p className="font-medium">{user.first_name || '-'} {user.last_name || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Téléphone</p>
                  <p className="font-medium">{user.phone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                Statut du compte
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">État du compte</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'ACTIF' : 'INACTIF'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Vérification KYC</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                    user.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                    user.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {user.kyc_status === 'VERIFIED' ? <BadgeCheck size={14} /> : 
                     user.kyc_status === 'REJECTED' ? <AlertCircle size={14} /> :
                     <Shield size={14} />}
                    <span>{user.kyc_status || 'PENDING'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Date d'inscription</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <section>
             <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Statistiques
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user.properties_owned_count || 0}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Propriétés</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.properties_managed_count || 0}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Gérées</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{user.mandates_given_count || 0}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Mandats (Émis)</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{user.mandates_received_count || 0}</p>
                  <p className="text-xs text-gray-500 uppercase mt-1">Mandats (Reçus)</p>
                </div>
              </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
