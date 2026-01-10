import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Shield, UserCheck, UserX, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import UserDetailsModal from '../../components/admin/UserDetailsModal';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ role: '', kyc: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('admin/users/', {
        params: {
          page,
          search,
          ...filter
        }
      });
      setUsers(response.data.results || response.data);
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10)
        });
      }
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserActive = async (user) => {
    setConfirmation({
        isOpen: true,
        title: user.is_active ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir ${user.is_active ? 'désactiver' : 'activer'} le compte de ${user.username} ?`,
        type: user.is_active ? 'danger' : 'success',
        confirmText: user.is_active ? 'Désactiver' : 'Activer',
        onConfirm: async () => {
            setActionLoading(true);
            try {
                await api.patch(`admin/users/${user.id}/`, { is_active: !user.is_active });
                toast.success(`Utilisateur ${user.is_active ? 'désactivé' : 'activé'}`);
                fetchUsers(pagination.currentPage);
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            } catch (error) {
                toast.error('Erreur lors de la modification');
            } finally {
                setActionLoading(false);
            }
        }
    });
  };

  const updateKycStatus = async (user, status) => {
    try {
      await api.patch(`admin/users/${user.id}/`, { kyc_status: status });
      toast.success(`Statut KYC mis à jour : ${status}`);
      fetchUsers(pagination.currentPage);
    } catch {
      toast.error('Erreur lors de la mise à jour KYC');
    }
  };

  const columns = [
    {
      header: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-sm border border-blue-200 uppercase">
            {row.username[0]}
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-tight">{row.username}</div>
            <div className="text-xs text-gray-500 font-medium">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rôle',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_demarcheur && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[10px] font-bold tracking-wider uppercase">DÉMARCHEUR</span>}
          {row.is_proprietaire && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 text-[10px] font-bold tracking-wider uppercase">PROPRIO</span>}
          {row.is_locataire && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 text-[10px] font-bold tracking-wider uppercase">LOCATAIRE</span>}
        </div>
      )
    },
    {
      header: 'Statut KYC',
      render: (row) => (
        <div className="flex items-center">
            <select 
              value={row.kyc_status}
              onChange={(e) => updateKycStatus(row, e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-none outline-none ring-1 ring-inset transition-all cursor-pointer ${
                row.kyc_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 
                row.kyc_status === 'REJECTED' ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
              }`}
            >
              <option value="PENDING">EN ATTENTE</option>
              <option value="VERIFIED">VÉRIFIÉ</option>
              <option value="REJECTED">REJETÉ</option>
            </select>
        </div>
      )
    },
    {
      header: 'État',
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wider uppercase ${row.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
          {row.is_active ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleUserActive(row)}
            className={`p-1.5 rounded-xl transition-all active:scale-90 border ${row.is_active ? 'hover:bg-rose-50 text-rose-600 border-rose-100' : 'hover:bg-emerald-50 text-emerald-600 border-emerald-100'}`}
            title={row.is_active ? 'Désactiver' : 'Activer'}
          >
            {row.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
          </button>
          <button 
            onClick={() => {
              setSelectedUser(row);
              setIsDetailsModalOpen(true);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all active:scale-90" 
            title="Détails"
          >
            <ExternalLink size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les comptes, les accès et les validations KYC</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <Filter className="text-gray-400" size={18}/>
            <select 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            >
                <option value="">Tous les rôles</option>
                <option value="is_demarcheur">Démarcheurs</option>
                <option value="is_proprietaire">Propriétaires</option>
                <option value="is_locataire">Locataires</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <Shield className="text-gray-400" size={18}/>
            <select 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
                value={filter.kyc}
                onChange={(e) => setFilter({ ...filter, kyc: e.target.value })}
            >
                <option value="">Tous KYC</option>
                <option value="PENDING">En attente</option>
                <option value="VERIFIED">Vérifiés</option>
                <option value="REJECTED">Rejetés</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchUsers}
      />

      <UserDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
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

export default AdminUsers;

