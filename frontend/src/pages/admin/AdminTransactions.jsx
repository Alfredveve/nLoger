import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MessageSquare, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';

const AdminTransactions = () => {
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchOccupations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('admin/occupations/', {
        params: {
          page,
          search,
          status: filter.status
        }
      });
      setOccupations(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchOccupations();
  }, [search, filter, fetchOccupations]);

  const updateStatus = async (occupationId, status) => {
    try {
      await api.patch(`admin/occupations/${occupationId}/`, { status });
      toast.success(`Statut mis à jour : ${status}`);
      fetchOccupations(pagination.currentPage);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      render: (row) => <span className="font-mono text-xs text-gray-400">#{row.id}</span>
    },
    { 
      header: 'Logement', 
      accessor: 'property_title',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.property_title}</span>
          <span className="text-xs text-gray-500">#{row.property}</span>
        </div>
      )
    },
    { 
      header: 'Client', 
      accessor: 'user_username',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {row.user_username?.[0].toUpperCase()}
          </div>
          <span className="text-sm">{row.user_username}</span>
        </div>
      )
    },
    { 
      header: 'Message', 
      accessor: 'message',
      render: (row) => (
        <p className="text-sm text-gray-500 max-w-xs truncate" title={row.message}>
          {row.message || 'Aucun message'}
        </p>
      )
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (row) => {
        const styles = {
          'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
          'APPROVED': 'bg-green-100 text-green-700 border-green-200',
          'REJECTED': 'bg-red-100 text-red-700 border-red-200',
          'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[row.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Date', 
      accessor: 'created_at',
      render: (row) => <span className="text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <>
              <button 
                onClick={() => updateStatus(row.id, 'APPROVED')}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Approuver"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={() => updateStatus(row.id, 'REJECTED')}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Rejeter"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          <button className="p-1 text-gray-400 hover:bg-gray-50 rounded">
            <ExternalLink size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérer les demandes d'occupation et réservations</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par logement ou client..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Filter className="text-gray-400" size={18} />
          <select 
            className="flex-1 md:w-48 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Rejeté</option>
            <option value="COMPLETED">Terminé</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={occupations} 
        loading={loading}
        pagination={pagination}
        onPageChange={fetchOccupations}
      />
    </div>
  );
};

export default AdminTransactions;
