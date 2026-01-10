import React, { useState } from 'react';
import { Calendar, Clock, X, Info } from 'lucide-react';

const VisitModal = ({ isOpen, onClose, onConfirm, propertyTitle }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return;

    setLoading(true);
    // Combine date and time for ISO format
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    await onConfirm(scheduledAt);
    setLoading(false);
  };

  // Prevent past dates
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Planifier une visite</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
            <Info className="text-blue-600 shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-700 leading-relaxed">
              Vous proposez un créneau pour visiter le logement <strong>{propertyTitle}</strong>. 
              Le démarcheur devra confirmer sa disponibilité.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Calendar size={16} className="mr-2 text-primary-600" />
                Date de visite
              </label>
              <input 
                type="date" 
                min={today}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Clock size={16} className="mr-2 text-primary-600" />
                Heure souhaitée
              </label>
              <input 
                type="time" 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading || !date || !time}
              className="flex-1 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? 'Envoi...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitModal;
