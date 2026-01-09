import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { Toaster, toast } from 'react-hot-toast';
import { Home, MapPin, FileText, DollarSign, Phone, Send, Loader2 } from 'lucide-react';

const mandateSchema = z.object({
  property_type: z.enum(['CHAMBRE_SIMPLE', 'SALON_CHAMBRE', 'APPARTEMENT', 'VILLA', 'STUDIO', 'MAGASIN', 'BUREAU']),
  location_description: z.string().min(10, "Veuillez donner plus de détails sur l'emplacement"),
  property_description: z.string().min(20, "Veuillez décrire le bien plus en détail"),
  expected_price: z.coerce.number().positive("Le prix doit être positif").optional(),
  owner_phone: z.string().min(8, "Numéro de téléphone invalide"),
  mandate_type: z.enum(['SIMPLE', 'EXCLUSIVE']).default('SIMPLE'),
  commission_percentage: z.coerce.number().min(0).max(100).default(10),
});

const DelegateManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      property_type: 'CHAMBRE_SIMPLE',
      mandate_type: 'SIMPLE',
      commission_percentage: 10,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('mandates/', data);
      toast.success('Votre demande de mandat a été envoyée avec succès !');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error submitting mandate:', error);
      toast.error("Une erreur est survenue lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold">Confier la gestion de mon bien</h1>
            <p className="mt-2 text-blue-100 italic">
              Vous êtes à l'étranger ou occupé ? Laissez un démarcheur vérifié s'occuper de tout pour vous.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type de bien */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <Home className="w-4 h-4 mr-2 text-blue-600" />
                  Type de bien
                </label>
                <select
                  {...register('property_type')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
                >
                  <option value="CHAMBRE_SIMPLE">Chambre Simple</option>
                  <option value="SALON_CHAMBRE">Salon + Chambre</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="MAGASIN">Magasin</option>
                  <option value="BUREAU">Bureau</option>
                </select>
                {errors.property_type && <p className="text-red-500 text-xs mt-1">{errors.property_type.message}</p>}
              </div>

              {/* Prix espéré */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                  Loyer mensuel espéré (GNF)
                </label>
                <input
                  type="number"
                  {...register('expected_price')}
                  placeholder="Ex: 1500000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
                />
                {errors.expected_price && <p className="text-red-500 text-xs mt-1">{errors.expected_price.message}</p>}
              </div>

              {/* Type de mandat */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Type de mandat
                </label>
                <select
                  {...register('mandate_type')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
                >
                  <option value="SIMPLE">Simple (Non-exclusif)</option>
                  <option value="EXCLUSIVE">Exclusif</option>
                </select>
                <p className="text-xs text-slate-500">
                  Exclusif = seul le démarcheur peut louer votre bien
                </p>
              </div>

              {/* Commission */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                  Commission proposée (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  {...register('commission_percentage')}
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
                />
                {errors.commission_percentage && <p className="text-red-500 text-xs mt-1">{errors.commission_percentage.message}</p>}
              </div>
            </div>

            {/* Emplacement */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                Emplacement précis
              </label>
              <textarea
                {...register('location_description')}
                rows="2"
                placeholder="Ex: Kipé, près de l'école française, deuxième ruelle à gauche..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 resize-none"
              ></textarea>
              {errors.location_description && <p className="text-red-500 text-xs mt-1">{errors.location_description.message}</p>}
            </div>

            {/* Description du bien */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Détails sur le bien
              </label>
              <textarea
                {...register('property_description')}
                rows="4"
                placeholder="Décrivez l'état du bien, le nombre de salles de bain, commodités, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 resize-none"
              ></textarea>
              {errors.property_description && <p className="text-red-500 text-xs mt-1">{errors.property_description.message}</p>}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                Numéro WhatsApp / Contact
              </label>
              <input
                type="text"
                {...register('owner_phone')}
                placeholder="Ex: +224 6XX XX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
              />
              {errors.owner_phone && <p className="text-red-500 text-xs mt-1">{errors.owner_phone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:bg-slate-400"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Envoyer ma demande</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DelegateManagement;
