import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ClipboardList, CheckCircle2, XCircle, Clock, Phone } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const AdminMandates = () => {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

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

  const executeUpdateStatus = async (mandateId, status) => {
    setActionLoading(true);
    try {
      await api.patch(`admin/mandates/${mandateId}/`, { status });
      toast.success(`Mandat mis à jour : ${status}`);
      fetchMandates(pagination.currentPage);
      setConfirmation(prev => ({ ...prev, isOpen: false }));
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = (row, action) => {
    const isApprove = action === 'ACCEPTED';
    setConfirmation({
      isOpen: true,
      title: isApprove ? 'Accepter le mandat' : 'Rejeter le mandat',
      message: isApprove 
        ? `Voulez-vous vraiment accepter ce mandat de la part de ${row.owner_username} ?`
        : `Voulez-vous vraiment rejeter ce mandat de la part de ${row.owner_username} ?`,
      type: isApprove ? 'success' : 'danger',
      confirmText: isApprove ? 'Accepter' : 'Rejeter',
      onConfirm: () => executeUpdateStatus(row.id, action)
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => <span className="font-mono text-xs text-gray-400">#{row.id}</span>
    },
    {
      header: 'Propriétaire',
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                {row.owner_username?.[0]}
            </div>
            <div>
                <div className="font-semibold text-gray-900">{row.owner_username}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={10} /> {row.owner_phone}
                </div>
            </div>
        </div>
      )
    },
    {
      header: 'Détails du bien',
      render: (row) => (
        <div className="max-w-xs truncate text-xs">
          <div className="font-bold text-blue-600 uppercase mb-0.5">{row.property_type.replace('_', ' ')}</div>
          <div className="text-gray-500 line-clamp-1 italic">"{row.property_description}"</div>
        </div>
      )
    },
    {
      header: 'Agent assigné',
      render: (row) => (
        <div className="text-sm">
          {row.agent_username ? (
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-medium text-gray-700">{row.agent_username}</span>
              </div>
          ) : (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase font-bold">Non assigné</span>
          )}
        </div>
      )
    },
    {
      header: 'Statut',
      render: (row) => {
          const STYLES = {
              'ACCEPTED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
              'REJECTED': 'bg-rose-100 text-rose-700 border-rose-200',
              'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
              'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
              'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-200'
          };
          return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STYLES[row.status] || STYLES.CANCELLED}`}>
                {row.status}
            </span>
          );
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <>
              <button 
                onClick={() => handleAction(row, 'ACCEPTED')}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all active:scale-90"
                title="Accepter"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={() => handleAction(row, 'REJECTED')}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
                title="Rejeter"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          <button 
            onClick={() => {
              console.log('History button clicked for mandate:', row.id);
              toast('Historique bientôt disponible', { icon: '🕒' });
            }}
            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90" 
            title="Historique"
          >
            <Clock size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestion des Mandats</h1>
          <p className="text-gray-500 dark:text-gray-400">Suivez et validez les mandats de gestion immobilière</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un mandat..."
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
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
                <option value="">Tous les mandats</option>
                <option value="PENDING">En attente</option>
                <option value="ACCEPTED">Acceptés</option>
                <option value="REJECTED">Rejetés</option>
                <option value="COMPLETED">Terminés</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={mandates} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchMandates}
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

export default AdminMandates;
