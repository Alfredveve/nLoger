import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Home, MapPin, Tag, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', available: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('admin/properties/', {
        params: {
          page,
          search,
          property_type: filter.type,
          is_available: filter.available
        }
      });
      setProperties(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchProperties();
  }, [search, filter, fetchProperties]);

  const toggleAvailability = async (property) => {
    setConfirmation({
        isOpen: true,
        title: property.is_available ? 'Désactiver l\'annonce' : 'Activer l\'annonce',
        message: `Voulez-vous vraiment changer la visibilité de "${property.title}" ?`,
        type: property.is_available ? 'warning' : 'success',
        confirmText: property.is_available ? 'Masquer' : 'Afficher',
        onConfirm: async () => {
            setActionLoading(true);
            try {
                await api.patch(`admin/properties/${property.id}/`, { is_available: !property.is_available });
                toast.success(`Propriété ${property.is_available ? 'masquée' : 'rendue disponible'}`);
                fetchProperties(pagination.currentPage);
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            } catch {
                toast.error('Erreur lors de la modification');
            } finally {
                setActionLoading(false);
            }
        }
    });
  };

  const columns = [
    {
      header: 'Propriété',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {row.images && row.images.length > 0 ? (
              <img src={row.images[0].image} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <Home className="text-gray-400" size={20} />
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-tight">{row.title}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
              <MapPin size={10} className="text-blue-500" /> {row.secteur_name}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
          {row.property_type.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Prix (GNF)',
      render: (row) => (
        <div className="font-bold text-emerald-600 tabular-nums">
          {parseFloat(row.price).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Propriétaire',
      render: (row) => (
        <div className="text-sm font-semibold text-gray-700">{row.owner_username}</div>
      )
    },
    {
      header: 'Statut',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-widest ${row.is_available ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {row.is_available ? 'Disponible' : 'Occupé'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleAvailability(row)}
            className={`p-1.5 rounded-xl transition-all active:scale-90 border ${row.is_available ? 'hover:bg-rose-50 text-rose-600 border-rose-100' : 'hover:bg-emerald-50 text-emerald-600 border-emerald-100'}`}
            title={row.is_available ? 'Marquer comme occupé' : 'Rendre disponible'}
          >
            {row.is_available ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          </button>
          <a 
            href={`/property/${row.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all active:scale-90"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestion des Propriétés</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les annonces et leur visibilité sur la plateforme</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une propriété..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
             <Filter className="text-gray-400" size={18}/>
             <select 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="">Tous les types</option>
                <option value="CHAMBRE_SIMPLE">Rentrée Couchée</option>
                <option value="SALON_CHAMBRE">Salon Chambre</option>
                <option value="APPARTEMENT">Appartement</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="MAGASIN">Magasin</option>
                <option value="BUREAU">Bureau</option>
              </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
              <Tag className="text-gray-400" size={18}/>
              <select 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
                value={filter.available}
                onChange={(e) => setFilter({ ...filter, available: e.target.value })}
              >
                <option value="">Tous statuts</option>
                <option value="true">Disponible</option>
                <option value="false">Occupé</option>
              </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={properties} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchProperties}
      />

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        type={confirmation.type}
        confirmText={confirmation.confirmText}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminProperties;

