import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, DollarSign, CheckCircle2, XCircle, Clock, Eye, Download, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';
import { releaseEscrow } from '../../api/paymentApi';

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('payments/', {
        params: {
          page,
          search,
          status: filter.status
        }
      });
      setPayments(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchPayments();
  }, [search, filter, fetchPayments]);

  const handleReleaseEscrow = async (payment) => {
    if (!payment.escrow || payment.escrow.status !== 'HOLDING') {
      toast.error('Cet escrow ne peut pas être libéré');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir libérer les fonds ?')) {
      return;
    }

    try {
      await releaseEscrow(payment.escrow.id);
      toast.success('Fonds libérés avec succès');
      fetchPayments(pagination.currentPage);
    } catch {
      toast.error('Erreur lors de la libération des fonds');
    }
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      render: (row) => <span className="font-mono text-xs text-gray-400">#{row.id?.substring(0, 8)}</span>
    },
    { 
      header: 'Payeur', 
      accessor: 'payer_username',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {row.payer_username?.[0].toUpperCase()}
          </div>
          <span className="text-sm">{row.payer_username}</span>
        </div>
      )
    },
    { 
      header: 'Propriété', 
      accessor: 'property_title',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.property_title}</span>
          <span className="text-xs text-gray-500">ID: {row.property_id}</span>
        </div>
      )
    },
    { 
      header: 'Montant', 
      accessor: 'amount',
      render: (row) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-bold text-gray-900 dark:text-gray-100">{row.amount?.toLocaleString()} GNF</span>
        </div>
      )
    },
    { 
      header: 'Méthode', 
      accessor: 'payment_method_display',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{row.payment_method_display}</span>
      )
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (row) => {
        const styles = {
          'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
          'PROCESSING': 'bg-blue-100 text-blue-700 border-blue-200',
          'HELD_IN_ESCROW': 'bg-purple-100 text-purple-700 border-purple-200',
          'RELEASED': 'bg-green-100 text-green-700 border-green-200',
          'REFUNDED': 'bg-red-100 text-red-700 border-red-200',
          'FAILED': 'bg-red-100 text-red-700 border-red-200',
          'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border text-center ${styles[row.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {row.status_display}
            </span>
            {row.status === 'HELD_IN_ESCROW' && row.disputes?.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 animate-pulse">
                <ShieldAlert size={10} /> LITIGE ACTIF
              </span>
            )}
          </div>
        );
      }
    },
    { 
      header: 'Escrow', 
      accessor: 'escrow',
      render: (row) => {
        if (!row.escrow) return <span className="text-xs text-gray-400">N/A</span>;
        
        const escrowStyles = {
          'HOLDING': 'bg-yellow-100 text-yellow-700',
          'RELEASED': 'bg-green-100 text-green-700',
          'REFUNDED': 'bg-red-100 text-red-700'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${escrowStyles[row.escrow.status]}`}>
            {row.escrow.status_display}
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
          {row.escrow && row.escrow.status === 'HOLDING' && (
            <button 
              onClick={() => handleReleaseEscrow(row)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Libérer les fonds"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
          <button 
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Voir détails"
          >
            <Eye size={18} />
          </button>
          {row.disputes?.length > 0 && (
            <button 
              onClick={() => navigate('/admin/disputes')}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Voir les litiges"
            >
              <ShieldAlert size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  // Statistiques
  const stats = {
    total: payments.length,
    inEscrow: payments.filter(p => p.status === 'HELD_IN_ESCROW').length,
    released: payments.filter(p => p.status === 'RELEASED').length,
    totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paiements</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérer tous les paiements et escrows</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/disputes')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-lg shadow-red-100"
          >
            <ShieldAlert className="w-4 h-4" />
            Gérer les litiges
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total paiements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En escrow</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inEscrow}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Libérés</p>
              <p className="text-2xl font-bold text-green-600">{stats.released}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalAmount.toLocaleString()} GNF
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par payeur ou propriété..." 
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
            <option value="PROCESSING">En traitement</option>
            <option value="HELD_IN_ESCROW">En escrow</option>
            <option value="RELEASED">Libéré</option>
            <option value="REFUNDED">Remboursé</option>
            <option value="FAILED">Échoué</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Table des paiements */}
      <DataTable 
        columns={columns} 
        data={payments} 
        loading={loading}
        pagination={pagination}
        onPageChange={fetchPayments}
      />
    </div>
  );
};

export default AdminPayments;
