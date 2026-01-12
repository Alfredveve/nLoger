import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  property_type: z.enum(['CHAMBRE_SIMPLE', 'SALON_CHAMBRE', 'APPARTEMENT', 'VILLA', 'STUDIO', 'MAGASIN', 'BUREAU']),
  price: z.coerce.number().positive("Le prix doit être positif"),
  region: z.string().min(1, "La région est obligatoire"),
  prefecture: z.string().min(1, "La préfecture est obligatoire"),
  sous_prefecture: z.string().min(1, "La sous-préfecture est obligatoire"),
  ville: z.string().min(1, "La ville est obligatoire"),
  quartier: z.string().min(1, "Le quartier est obligatoire"),
  secteur: z.string().min(1, "Le secteur est obligatoire"),
  quartier_custom_name: z.string().optional(),
  secteur_custom_name: z.string().optional(),
  address_details: z.string().optional(),
  point_de_repere: z.string().min(5, "Veuillez donner un repère visuel (ex: à 50m de la mosquée)"),
  description_direction: z.string().optional(),
  religion_preference: z.string().default('Indifférent'),
  ethnic_preference: z.string().default('Indifférent'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine(data => {
  if (data.quartier === 'custom' && !data.quartier_custom_name) return false;
  return true;
}, { message: "Le nom du quartier est obligatoire", path: ['quartier_custom_name'] })
.refine(data => {
  if (data.secteur === 'custom' && !data.secteur_custom_name) return false;
  return true;
}, { message: "Le nom du secteur est obligatoire", path: ['secteur_custom_name'] });

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const DraggableMarker = ({ position, setPosition }) => {
  const map = useMap();
  
  const eventHandlers = React.useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
    />
  ) : null;
};

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [regions, setRegions] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [sousPrefectures, setSousPrefectures] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  
  const [markerPos, setMarkerPos] = useState({ lat: 9.6412, lng: -13.5784 }); // Conakry par défaut
  const [isGeocoding, setIsGeocoding] = useState(false);

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
  
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsPrecision, setGpsPrecision] = useState(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setMarkerPos({ lat: latitude, lng: longitude });
        setGpsPrecision(accuracy);
        setGpsLoading(false);
        
        if (accuracy > 20) {
          alert(`Précision faible (${Math.round(accuracy)}m). Essayez de sortir ou de vous rapprocher d'une fenêtre.`);
        }
      },
      (error) => {
        setGpsLoading(false);
        alert("Impossible de récupérer votre position.");
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectedRegion = watch('region');
  const selectedPrefecture = watch('prefecture');
  const selectedSousPrefecture = watch('sous_prefecture');
  const selectedVille = watch('ville');
  const selectedQuartier = watch('quartier');
  const selectedSecteur = watch('secteur');
  const quartierCustomName = watch('quartier_custom_name');
  const secteurCustomName = watch('secteur_custom_name');

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
    const fetchSousPrefectures = async () => {
      if (!selectedPrefecture) {
        setSousPrefectures([]);
        setValue('sous_prefecture', '');
        return;
      }
      try {
        const res = await api.get('sous-prefectures/', { params: { prefecture: selectedPrefecture } });
        setSousPrefectures(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des sous-préfectures:', err);
      }
    };
    fetchSousPrefectures();
  }, [selectedPrefecture, setValue]);

  useEffect(() => {
    const fetchVilles = async () => {
      if (!selectedSousPrefecture) {
        setVilles([]);
        setValue('ville', '');
        return;
      }
      try {
        const res = await api.get('villes/', { params: { sous_prefecture: selectedSousPrefecture } });
        setVilles(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des villes:', err);
      }
    };
    fetchVilles();
  }, [selectedSousPrefecture, setValue]);

  useEffect(() => {
    const fetchQuartiers = async () => {
      if (!selectedVille) {
        setQuartiers([]);
        setValue('quartier', '');
        return;
      }
      try {
        const res = await api.get('quartiers/', { params: { ville: selectedVille } });
        setQuartiers(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des quartiers:', err);
      }
    };
    fetchQuartiers();
  }, [selectedVille, setValue]);

  useEffect(() => {
    const fetchSecteurs = async () => {
      if (!selectedQuartier) {
        setSecteurs([]);
        setValue('secteur', '');
        return;
      }
      try {
        const res = await api.get('secteurs/', { params: { quartier: selectedQuartier } });
        setSecteurs(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des secteurs:', err);
      }
    };
    fetchSecteurs();
  }, [selectedQuartier, setValue]);

  const handleMapClick = async (latlng) => {
    setMarkerPos(latlng);
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const potentialCity = addr.city || addr.town || addr.municipality || addr.suburb || addr.village;
        const potentialQuartier = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
        
        console.log('Map Click Reverse Geocode:', addr);

        // Try to match with local DB
        // 1. Match Region (Guinée is always the same for now, but Conakry/Coyah/Dubreka are key)
        const conakryRegion = regions.find(r => r.name.toLowerCase().includes('conakry'));
        if (conakryRegion) {
          setValue('region', conakryRegion.id.toString());
          
          // 2. Fetch Prefectures and try to match
          const prefRes = await api.get('prefectures/', { params: { region: conakryRegion.id } });
          const matchPref = prefRes.data.find(p => 
            potentialCity?.toLowerCase().includes(p.name.toLowerCase()) || 
            addr.county?.toLowerCase().includes(p.name.toLowerCase())
          );
          
          if (matchPref) {
            setValue('prefecture', matchPref.id.toString());
            
            // 3. Fetch Sous-Prefectures
            const spRes = await api.get('sous-prefectures/', { params: { prefecture: matchPref.id } });
            // For Grand Conakry, SP often matches Prefecture or City
            const matchSP = spRes.data.find(sp => 
              potentialCity?.toLowerCase().includes(sp.name.toLowerCase()) || 
              addr.city_district?.toLowerCase().includes(sp.name.toLowerCase())
            ) || spRes.data[0];

            if (matchSP) {
              setValue('sous_prefecture', matchSP.id.toString());
              
              // 4. Fetch Villes
              const vRes = await api.get('villes/', { params: { sous_prefecture: matchSP.id } });
              const matchVille = vRes.data.find(v => 
                potentialCity?.toLowerCase().includes(v.name.toLowerCase()) || 
                addr.suburb?.toLowerCase().includes(v.name.toLowerCase())
              ) || vRes.data[0];

              if (matchVille) {
                setValue('ville', matchVille.id.toString());
                
                // 5. Fetch Quartiers and try to match
                const qRes = await api.get('quartiers/', { params: { ville: matchVille.id } });
                const matchQ = qRes.data.find(q => 
                  potentialQuartier?.toLowerCase().includes(q.name.toLowerCase()) ||
                  addr.road?.toLowerCase().includes(q.name.toLowerCase())
                );

                if (matchQ) {
                  setValue('quartier', matchQ.id.toString());
                  
                  // 6. Fetch Secteurs
                  const sRes = await api.get('secteurs/', { params: { quartier: matchQ.id } });
                  const matchS = sRes.data.find(s => 
                    addr.road?.toLowerCase().includes(s.name.toLowerCase())
                  );
                  if (matchS) {
                    setValue('secteur', matchS.id.toString());
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    // Geocode from typing (keep existing logic but with slight adjustment to not override manual map selection immediately)
    const geocodeAddress = async () => {
      if (isGeocoding) return; // Don't trigger if we are already geocoding from click
      const region = regions.find(r => r.id.toString() === selectedRegion?.toString())?.name;
      const pref = prefectures.find(p => p.id.toString() === selectedPrefecture?.toString())?.name;
      const ville = villes.find(v => v.id.toString() === selectedVille?.toString())?.name;
      const qSelected = quartiers.find(q => q.id.toString() === selectedQuartier?.toString())?.name;
      const sSelected = secteurs.find(s => s.id.toString() === selectedSecteur?.toString())?.name;

      const qName = selectedQuartier === 'custom' ? quartierCustomName : qSelected;
      const sName = selectedSecteur === 'custom' ? secteurCustomName : sSelected;

      if (!region) return;

      setIsGeocoding(true);
      try {
        const queryParts = [sName, qName, ville, pref, region, 'Guinea'].filter(Boolean);
        const query = queryParts.join(', ');
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const results = await response.json();

        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          setMarkerPos({ lat: parseFloat(lat), lng: parseFloat(lon) });
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsGeocoding(false);
      }
    };

    const timer = setTimeout(() => {
      if (selectedRegion || selectedPrefecture || selectedQuartier || quartierCustomName || secteurCustomName) {
        geocodeAddress();
      }
    }, 1500); // Slightly longer debounce for manual typing

    return () => clearTimeout(timer);
  }, [selectedRegion, selectedPrefecture, selectedVille, selectedQuartier, selectedSecteur, quartierCustomName, secteurCustomName, regions, prefectures, villes, quartiers, secteurs, isGeocoding]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...data,
        secteur: data.secteur === 'custom' ? null : parseInt(data.secteur),
        quartier: data.quartier === 'custom' ? null : parseInt(data.quartier),
        latitude: markerPos.lat,
        longitude: markerPos.lng,
      };
      
      // Add custom names if 'custom' was selected
      if (data.quartier === 'custom') {
        payload.quartier_custom_name = data.quartier_custom_name;
      }
      if (data.secteur === 'custom') {
        payload.secteur_custom_name = data.secteur_custom_name;
      }

      await api.post('properties/', payload);
      
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
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Publier un nouveau logement</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 md:p-8 bg-white shadow-xl rounded-2xl">
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
                      <option value="CHAMBRE_SIMPLE">Rentrée Couchée</option>
                      <option value="SALON_CHAMBRE">Salon Chambre</option>
                      <option value="APPARTEMENT">Appartement</option>
                      <option value="VILLA">Villa</option>
                      <option value="STUDIO">Studio</option>
                      <option value="MAGASIN">Magasin</option>
                      <option value="BUREAU">Bureau</option>
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
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.region ? 'border-red-500' : ''}`}
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
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.prefecture ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {prefectures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.prefecture && <p className="text-red-500 text-xs mt-1">{errors.prefecture.message}</p>}
                </div>
                <div>
                  <label htmlFor="sous_prefecture" className="block text-sm font-medium text-gray-700 mb-1">Sous-Préfecture</label>
                  <select
                    id="sous_prefecture"
                    {...register('sous_prefecture')}
                    disabled={!selectedPrefecture}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.sous_prefecture ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {sousPrefectures.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                  </select>
                  {errors.sous_prefecture && <p className="text-red-500 text-xs mt-1">{errors.sous_prefecture.message}</p>}
                </div>
                <div>
                  <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">Ville / Commune</label>
                  <select
                    id="ville"
                    {...register('ville')}
                    disabled={!selectedSousPrefecture}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.ville ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville.message}</p>}
                </div>
                <div>
                  <label htmlFor="quartier" className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <select
                    id="quartier"
                    {...register('quartier')}
                    disabled={!selectedVille}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.quartier ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {quartiers.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                    {selectedVille && <option value="custom">+ Autre (Saisie manuelle)</option>}
                  </select>
                  {errors.quartier && <p className="text-red-500 text-xs mt-1">{errors.quartier.message}</p>}
                  
                  {selectedQuartier === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register('quartier_custom_name')}
                        placeholder="Nom du quartier..."
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.quartier_custom_name ? 'border-red-500' : ''}`}
                      />
                      {errors.quartier_custom_name && <p className="text-red-500 text-xs mt-1">{errors.quartier_custom_name.message}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="secteur" className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                  <select
                    id="secteur"
                    {...register('secteur')}
                    disabled={!selectedQuartier}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 ${errors.secteur ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionner</option>
                    {secteurs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {selectedQuartier && <option value="custom">+ Autre (Saisie manuelle)</option>}
                  </select>
                  {errors.secteur && <p className="text-red-500 text-xs mt-1">{errors.secteur.message}</p>}
                  
                  {selectedSecteur === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        {...register('secteur_custom_name')}
                        placeholder="Nom du secteur..."
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.secteur_custom_name ? 'border-red-500' : ''}`}
                      />
                      {errors.secteur_custom_name && <p className="text-red-500 text-xs mt-1">{errors.secteur_custom_name.message}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position sur la carte {isGeocoding && <span className="text-primary-500 animate-pulse">(Recherche...)</span>}
                </label>
                <p className="text-xs text-gray-500 mb-2">La position est automatisée, mais vous pouvez déplacer le marqueur pour plus de précision.</p>
                <div className="h-[300px] rounded-xl overflow-hidden border-2 border-gray-100">
                  <MapContainer center={[markerPos.lat, markerPos.lng]} zoom={13} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onMapClick={handleMapClick} />
                    <DraggableMarker position={markerPos} setPosition={setMarkerPos} />
                  </MapContainer>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gpsLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-100 text-primary-700 font-bold py-3 px-4 rounded-xl hover:bg-primary-200 transition-all border-2 border-primary-200"
                  >
                    {gpsLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    Ma position actuelle
                  </button>
                  {gpsPrecision && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border">
                      Précision: <span className={`font-bold ml-1 ${gpsPrecision < 20 ? 'text-green-600' : 'text-amber-600'}`}>{Math.round(gpsPrecision)}m</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label htmlFor="point_de_repere" className="block text-sm font-medium text-gray-700 mb-1">Point de repère (Obligatoire)</label>
                  <input
                    id="point_de_repere"
                    type="text"
                    {...register('point_de_repere')}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.point_de_repere ? 'border-red-500' : ''}`}
                    placeholder="Ex: À 50m de la Mosquée de Dubréka"
                  />
                  {errors.point_de_repere && <p className="text-red-500 text-xs mt-1">{errors.point_de_repere.message}</p>}
                </div>
                <div>
                  <label htmlFor="description_direction" className="block text-sm font-medium text-gray-700 mb-1">Indications de direction</label>
                  <input
                    id="description_direction"
                    type="text"
                    {...register('description_direction')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Ex: Portail bleu, deuxième ruelle à droite"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="address_details" className="block text-sm font-medium text-gray-700 mb-1">Détails d'adresse complémentaires</label>
                <input
                  id="address_details"
                  type="text"
                  {...register('address_details')}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Rue 123, Porte 45..."
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
