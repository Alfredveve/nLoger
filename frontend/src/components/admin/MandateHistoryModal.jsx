import React from 'react';
import { X, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

const MandateHistoryModal = ({ isOpen, onClose, history, mandateId }) => {
  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'REJECTED':
        return <XCircle className="text-rose-500" size={18} />;
      case 'PENDING':
        return <Clock className="text-amber-500" size={18} />;
      case 'COMPLETED':
        return <CheckCircle2 className="text-blue-500" size={18} />;
      case 'CANCELLED':
        return <AlertCircle className="text-gray-500" size={18} />;
      default:
        return <FileText className="text-gray-400" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Clock size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Historique du mandat</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: #{mandateId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8">
                <Clock className="mx-auto text-gray-300 mb-2" size={40} />
                <p className="text-gray-500">Aucun historique disponible pour ce mandat.</p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
              {history.map((entry, index) => (
                <div key={entry.id || index} className="relative pl-10 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Timeline Point */}
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center z-10 shadow-sm">
                    {getStatusIcon(entry.status)}
                  </div>
                  
                  {/* Content Card */}
                  <div className={`p-4 rounded-xl border ${getStatusColor(entry.status)} transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-current opacity-70">
                            {entry.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(entry.created_at).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                        {entry.comment || "Aucun commentaire"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandateHistoryModal;
