import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ClipboardList, CheckCircle2, XCircle, Clock, Phone } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';

const AdminMandates = () => {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchMandates = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('admin/mandates/', {
        params: {
          page,
          search,
          status: filter.status
        }
      });
      setMandates(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des mandats');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchMandates();
  }, [search, filter, fetchMandates]);

  const updateMandateStatus = async (mandate, status) => {
    try {
      await api.patch(`admin/mandates/${mandate.id}/`, { status });
      toast.success(`Mandat mis à jour : ${status}`);
      fetchMandates(pagination.currentPage);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id'
    },
    {
      header: 'Propriétaire',
      render: (row) => (
        <div>
          <div className="font-semibold">{row.owner_username}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone size={10} /> {row.owner_phone}
          </div>
        </div>
      )
    },
    {
      header: 'Détails du bien',
      render: (row) => (
        <div className="max-w-xs truncate text-xs">
          <div className="font-bold uppercase mb-0.5">{row.property_type.replace('_', ' ')}</div>
          <div className="text-gray-500 line-clamp-1">{row.property_description}</div>
        </div>
      )
    },
    {
      header: 'Agent assigné',
      render: (row) => (
        <div className="text-sm">
          {row.agent_username ? row.agent_username : <span className="text-gray-400 italic">Non assigné</span>}
        </div>
      )
    },
    {
      header: 'Statut',
      render: (row) => (
        <select 
          value={row.status}
          onChange={(e) => updateMandateStatus(row, e.target.value)}
          className={`px-2 py-1 rounded text-xs font-medium border-none outline-none ${
            row.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 
            row.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
            row.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <option value="PENDING">En attente</option>
          <option value="ACCEPTED">Accepté</option>
          <option value="REJECTED">Rejeté</option>
          <option value="COMPLETED">Terminé</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <>
              <button 
                onClick={() => updateMandateStatus(row, 'ACCEPTED')}
                className="p-2 hover:bg-green-50 text-green-600 rounded-lg"
                title="Accepter"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={() => updateMandateStatus(row, 'REJECTED')}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                title="Rejeter"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Historique">
            <Clock size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Mandats</h1>
          <p className="text-gray-500 dark:text-gray-400">Suivi et validation des mandats de gestion</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un mandat..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ACCEPTED">Acceptés</option>
            <option value="REJECTED">Rejetés</option>
            <option value="COMPLETED">Terminés</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={mandates} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchMandates}
      />
    </div>
  );
};

export default AdminMandates;
