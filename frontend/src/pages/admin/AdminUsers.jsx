import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, UserCheck, UserX, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ role: '', kyc: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchUsers = async (page = 1) => {
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
      // Gérer la pagination si l'API la fournit
      if (response.data.count) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10) // Supposons 10 par page
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filter]);

  const toggleUserActive = async (user) => {
    try {
      await api.patch(`admin/users/${user.id}/`, { is_active: !user.is_active });
      toast.success(`Utilisateur ${user.is_active ? 'désactivé' : 'activé'}`);
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const updateKycStatus = async (user, status) => {
    try {
      await api.patch(`admin/users/${user.id}/`, { kyc_status: status });
      toast.success(`Statut KYC mis à jour : ${status}`);
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour KYC');
    }
  };

  const columns = [
    {
      header: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
            {row.username[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{row.username}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rôle',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.is_demarcheur && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">DÉMARCHEUR</span>}
          {row.is_proprietaire && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold">PROPRIO</span>}
          {row.is_locataire && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-bold">LOCATAIRE</span>}
        </div>
      )
    },
    {
      header: 'Statut KYC',
      render: (row) => (
        <select 
          value={row.kyc_status}
          onChange={(e) => updateKycStatus(row, e.target.value)}
          className={`px-2 py-1 rounded text-xs font-medium border-none outline-none ${
            row.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
            row.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          <option value="PENDING">En attente</option>
          <option value="VERIFIED">Vérifié</option>
          <option value="REJECTED">Rejeté</option>
        </select>
      )
    },
    {
      header: 'État',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
            className={`p-2 rounded-lg transition-colors ${row.is_active ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
            title={row.is_active ? 'Désactiver' : 'Activer'}
          >
            {row.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Détails">
            <ExternalLink size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les comptes et les validations KYC</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="">Tous les rôles</option>
            <option value="is_demarcheur">Démarcheurs</option>
            <option value="is_proprietaire">Propriétaires</option>
            <option value="is_locataire">Locataires</option>
          </select>
          <select 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
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

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        pagination={pagination.totalPages > 1 ? pagination : null}
        onPageChange={fetchUsers}
      />
    </div>
  );
};

export default AdminUsers;
