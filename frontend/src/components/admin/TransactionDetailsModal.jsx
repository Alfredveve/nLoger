import React from 'react';
import { X, Building2, User, CreditCard, Calendar, MessageSquare } from 'lucide-react';

const TransactionDetailsModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const STATUS_STYLES = {
    'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
    'VALIDATED': 'bg-green-100 text-green-700 border-green-200',
    'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
    'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
    'EXPIRED': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const PAYMENT_STYLES = {
    'PAID': 'bg-green-100 text-green-700',
    'UNPAID': 'bg-amber-100 text-amber-700',
    'REFUNDED': 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de la transaction</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLES[transaction.status] || 'bg-gray-100 text-gray-700'}`}>
                {transaction.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: #{transaction.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Property Details */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Logement
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Titre</label>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.property_title}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">ID Propriété</label>
                  <p className="font-mono text-sm text-gray-600 dark:text-gray-300">#{transaction.property}</p>
                </div>
              </div>
            </div>
          </section>

          {/* User Details */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} className="text-purple-500" />
              Client
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                  {transaction.user_username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.user_username}</p>
                  <p className="text-xs text-gray-500">ID Client: #{transaction.user}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Details */}
          {transaction.requires_payment && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-green-500" />
                Paiement
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">Montant</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {transaction.payment_amount ? `${transaction.payment_amount.toLocaleString()} GNF` : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">État</label>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${PAYMENT_STYLES[transaction.payment_status] || 'bg-gray-100'}`}>
                    {transaction.payment_status}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">Date limite</label>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {transaction.payment_deadline ? new Date(transaction.payment_deadline).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Créé le: {new Date(transaction.created_at).toLocaleString()}</span>
            </div>
            {transaction.updated_at && (
               <div className="flex items-center gap-2">
               <Calendar size={14} />
               <span>Mis à jour le: {new Date(transaction.updated_at).toLocaleString()}</span>
             </div>
            )}
          </div>

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

export default TransactionDetailsModal;
