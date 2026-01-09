import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle, Clock, Eye, MessageSquare, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';
import { resolveDispute } from '../../api/paymentApi';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchDisputes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('disputes/', {
        params: {
          page,
          search,
          status: filter.status
        }
      });
      setDisputes(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des litiges');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchDisputes();
  }, [search, filter, fetchDisputes]);

  const handleResolve = async (disputeId, resolution) => {
    if (!resolutionNote.trim()) {
      toast.error('Veuillez ajouter une note de résolution');
      return;
    }

    try {
      await resolveDispute(disputeId, resolution, resolutionNote);
      toast.success('Litige résolu avec succès');
      setSelectedDispute(null);
      setResolutionNote('');
      fetchDisputes(pagination.currentPage);
    } catch (error) {
      toast.error('Erreur lors de la résolution du litige');
      console.error(error);
    }
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      render: (row) => <span className="font-mono text-xs text-gray-400">#{row.id?.substring(0, 8)}</span>
    },
    { 
      header: 'Demandeur', 
      accessor: 'raised_by_username',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs">
            {row.raised_by_username?.[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium">{row.raised_by_username}</span>
        </div>
      )
    },
    { 
      header: 'Paiement', 
      accessor: 'payment_id',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-mono">#{row.payment?.substring(0, 8)}</span>
          <span className="text-sm font-bold text-gray-900">{row.payment_amount?.toLocaleString()} GNF</span>
        </div>
      )
    },
    { 
      header: 'Motif', 
      accessor: 'reason',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      )
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (row) => {
        const styles = {
          'OPEN': 'bg-red-100 text-red-700 border-red-200',
          'INVESTIGATING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
          'RESOLVED': 'bg-green-100 text-green-700 border-green-200',
          'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[row.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {row.status === 'OPEN' ? 'OUVERT' : row.status_display}
          </span>
        );
      }
    },
    { 
      header: 'Date', 
      accessor: 'created_at',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {new Date(row.created_at).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedDispute(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="S'occuper du litige"
          >
            <ShieldAlert size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gestion des Litiges</h1>
          <p className="text-gray-500 dark:text-gray-400">Résoudre les différends de paiement entre utilisateurs</p>
        </div>
      </div>

      {/* Widgets de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Litiges Ouverts</p>
              <p className="text-2xl font-black">{disputes.filter(d => d.status === 'OPEN').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Investigation</p>
              <p className="text-2xl font-black">{disputes.filter(d => d.status === 'INVESTIGATING').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Résolus ce mois</p>
              <p className="text-2xl font-black">{disputes.filter(d => d.status === 'RESOLVED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par demandeur ou ID..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
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
            <option value="OPEN">Ouverts</option>
            <option value="INVESTIGATING">En cours</option>
            <option value="RESOLVED">Résolus</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={disputes} 
        loading={loading}
        pagination={pagination}
        onPageChange={fetchDisputes}
      />

      {/* Modal de résolution */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-black">Résoudre le litige #{selectedDispute.id?.substring(0, 8)}</h3>
              <button 
                onClick={() => setSelectedDispute(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                <p className="text-sm font-bold text-red-900 dark:text-red-300 mb-1">Motif du litige :</p>
                <p className="text-gray-700 dark:text-gray-400 italic">"{selectedDispute.reason}"</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Note de résolution (Requis)</label>
                <textarea 
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Expliquez la décision prise..."
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleResolve(selectedDispute.id, 'REFUND_FULL')}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 dark:shadow-none"
                >
                  Remboursement Total
                </button>
                <button 
                  onClick={() => handleResolve(selectedDispute.id, 'REFUND_PARTIAL')}
                  className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-yellow-200 dark:shadow-none"
                >
                  Remboursement Partiel
                </button>
                <button 
                  onClick={() => handleResolve(selectedDispute.id, 'NO_REFUND')}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
