import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';

const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  property_type: z.enum(['CHAMBRE_SIMPLE', 'SALON_CHAMBRE', 'APPARTEMENT']),
  price: z.coerce.number().positive("Le prix doit être positif"),
  region: z.string().min(1, "La région est obligatoire"),
  prefecture: z.string().min(1, "La préfecture est obligatoire"),
  secteur: z.string().min(1, "Le secteur est obligatoire"),
  address_details: z.string().optional(),
  religion_preference: z.string().default('Indifférent'),
  ethnic_preference: z.string().default('Indifférent'),
});

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [regions, setRegions] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'CHAMBRE_SIMPLE',
      religion_preference: 'Indifférent',
      ethnic_preference: 'Indifférent',
    },
  });

  const selectedRegion = watch('region');
  const selectedPrefecture = watch('prefecture');

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await api.get('regions/');
        setRegions(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des régions:', err);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchPrefectures = async () => {
      if (!selectedRegion) {
        setPrefectures([]);
        setValue('prefecture', '');
        return;
      }
      try {
        const res = await api.get('prefectures/', { params: { region: selectedRegion } });
        setPrefectures(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des préfectures:', err);
      }
    };
    fetchPrefectures();
  }, [selectedRegion, setValue]);

  useEffect(() => {
    const fetchSecteurs = async () => {
      if (!selectedPrefecture) {
        setSecteurs([]);
        setValue('secteur', '');
        return;
      }
      try {
        const res = await api.get('secteurs/', { params: { prefecture: selectedPrefecture } });
        setSecteurs(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des secteurs:', err);
      }
    };
    fetchSecteurs();
  }, [selectedPrefecture, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('properties/', {
        ...data,
        secteur: parseInt(data.secteur),
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/properties'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la publication.');
      console.error('Erreur de soumission:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="card max-w-lg mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Logement publié avec succès !</h2>
          <p className="text-gray-600">Vous allez être redirigé vers la liste des logements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Publier un nouveau logement</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 bg-white shadow-xl rounded-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Informations de base */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informations de base</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Ex: Bel appartement 3 pièces à Kaloum"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows="4"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Décrivez les caractéristiques du logement..."
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">Type de logement</label>
                    <select
                      id="property_type"
                      {...register('property_type')}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="CHAMBRE_SIMPLE">Rentrée couchée</option>
                      <option value="SALON_CHAMBRE">Salon chambre</option>
                      <option value="APPARTEMENT">Appartement</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
                    <input
                      id="price"
                      type="number"
                      {...register('price')}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="Ex: 1500000"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Localisation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <select
                    id="region"
                    {...register('region')}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.region ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                </div>
                <div>
                  <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">Préfecture</label>
                  <select
                    id="prefecture"
                    {...register('prefecture')}
                    disabled={!selectedRegion}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.prefecture ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {prefectures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.prefecture && <p className="text-red-500 text-xs mt-1">{errors.prefecture.message}</p>}
                </div>
                <div>
                  <label htmlFor="secteur" className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                  <select
                    id="secteur"
                    {...register('secteur')}
                    disabled={!selectedPrefecture}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.secteur ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {secteurs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.secteur && <p className="text-red-500 text-xs mt-1">{errors.secteur.message}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="address_details" className="block text-sm font-medium text-gray-700 mb-1">Détails d'adresse</label>
                <input
                  id="address_details"
                  type="text"
                  {...register('address_details')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Près de la mosquée, Rue 123..."
                />
              </div>
            </div>

            {/* Critères spécifiques */}
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Critères spécifiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="religion_preference" className="block text-sm font-medium text-gray-700 mb-1">Préférence religieuse</label>
                  <input
                    id="religion_preference"
                    type="text"
                    {...register('religion_preference')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Ex: Indifférent, Musulman, Chrétien"
                  />
                </div>
                <div>
                  <label htmlFor="ethnic_preference" className="block text-sm font-medium text-gray-700 mb-1">Préférence ethnique</label>
                  <input
                    id="ethnic_preference"
                    type="text"
                    {...register('ethnic_preference')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Ex: Indifférent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-bold shadow-lg transform transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publication en cours...
                </span>
              ) : 'Publier mon annonce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
