import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Home, MapPin, Tag, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', available: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

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
    try {
      await api.patch(`admin/properties/${property.id}/`, { is_available: !property.is_available });
      toast.success(`Propriété ${property.is_available ? 'masquée' : 'rendue disponible'}`);
      fetchProperties(pagination.currentPage);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const columns = [
    {
      header: 'Propriété',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {row.images && row.images.length > 0 ? (
              <img src={row.images[0].image} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <Home className="text-gray-400" size={20} />
            )}
          </div>
          <div>
            <div className="font-semibold">{row.title}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={10} /> {row.secteur_name}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[10px] font-bold">
          {row.property_type.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Prix (GNF)',
      render: (row) => (
        <div className="font-medium text-blue-600">
          {parseFloat(row.price).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Propriétaire',
      render: (row) => (
        <div className="text-sm font-medium">{row.owner_username}</div>
      )
    },
    {
      header: 'Statut',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_available ? 'Disponible' : 'Occupé/Masqué'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleAvailability(row)}
            className={`p-2 rounded-lg transition-colors ${row.is_available ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
            title={row.is_available ? 'Marquer comme occupé' : 'Rendre disponible'}
          >
            {row.is_available ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          </button>
          <a 
            href={`/property/${row.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Propriétés</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les annonces et leur disponibilité</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une propriété..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Tous types</option>
            <option value="CHAMBRE_SIMPLE">Rentrée Couchée</option>
            <option value="SALON_CHAMBRE">Salon Chambre</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="VILLA">Villa</option>
            <option value="STUDIO">Studio</option>
            <option value="MAGASIN">Magasin</option>
            <option value="BUREAU">Bureau</option>
          </select>
          <select 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
            value={filter.available}
            onChange={(e) => setFilter({ ...filter, available: e.target.value })}
          >
            <option value="">Tout statut</option>
            <option value="true">Disponible</option>
            <option value="false">Occupé/Masqué</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={properties} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchProperties}
      />
    </div>
  );
};

export default AdminProperties;
