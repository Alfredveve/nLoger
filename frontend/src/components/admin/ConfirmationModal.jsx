import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmer', 
  cancelText = 'Annuler',
  type = 'warning', // 'warning', 'danger', 'success', 'info'
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-200'
    },
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200'
    },
    success: {
      icon: <CheckCircle2 className="text-emerald-500" size={24} />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-200'
    },
    info: {
      icon: <Info className="text-blue-500" size={24} />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200'
    }
  };

  const theme = themes[type] || themes.warning;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${theme.bg} ${theme.border} border shrink-0`}>
              {theme.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center justify-center min-w-[100px] ${theme.button}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
