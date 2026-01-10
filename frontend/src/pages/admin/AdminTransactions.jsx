import React, {useState, useEffect, useCallback} from 'react';
import {
    Search,
    Filter,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink
} from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import TransactionDetailsModal from '../../components/admin/TransactionDetailsModal';
import {toast} from 'react-hot-toast';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const AdminTransactions = () => {
        const [occupations, setOccupations] = useState([]);
        const [loading, setLoading] = useState(true);
        const [actionLoading, setActionLoading] = useState(false);
        const [search, setSearch] = useState('');
        const [filter, setFilter] = useState({status: ''});
        const [pagination, setPagination] = useState({currentPage: 1, totalPages: 1});
        const [selectedTransaction, setSelectedTransaction] = useState(null);
        const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
        
        const [confirmation, setConfirmation] = useState({
            isOpen: false,
            title: '',
            message: '',
            type: 'warning',
            onConfirm: null
        });

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
            },
        [search, filter]
    );

    useEffect(() => {
        fetchOccupations();
    }, [search, filter, fetchOccupations]);

    const executeUpdateStatus = async (occupationId, status) => {
        setActionLoading(true);
        try {
            await api.patch(`admin/occupations/${occupationId}/`, {status});
            toast.success(`Statut mis à jour : ${status}`);
            fetchOccupations(pagination.currentPage);
            setConfirmation(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erreur lors de la modification');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAction = (row, action) => {
        const isApprove = action === 'VALIDATED';
        setConfirmation({
            isOpen: true,
            title: isApprove ? 'Confirmer la validation' : 'Confirmer le rejet',
            message: isApprove 
                ? `Êtes-vous sûr de vouloir valider la demande pour "${row.property_title}" ?`
                : `Êtes-vous sûr de vouloir rejeter la demande pour "${row.property_title}" ?`,
            type: isApprove ? 'success' : 'danger',
            confirmText: isApprove ? 'Valider' : 'Rejeter',
            onConfirm: () => executeUpdateStatus(row.id, action)
        });
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row) => <span className="font-mono text-xs text-gray-400">#{
                row.id
            }</span>
        },
        {
            header: 'Logement',
            accessor: 'property_title',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {
                        row.property_title
                    }</span>
                    <span className="text-xs text-gray-500">#{
                        row.property
                    }</span>
                </div>
            )
        },
        {
            header: 'Client',
            accessor: 'user_username',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {
                        row.user_username ?. [0].toUpperCase()
                    } </div>
                    <span className="text-sm">
                        {
                        row.user_username
                    }</span>
                </div>
            )
        },
        {
            header: 'Message',
            accessor: 'message',
            render: (row) => (
                <p className="text-sm text-gray-500 max-w-xs truncate"
                    title={
                        row.message
                }>
                    {
                    row.message || 'Aucun message'
                } </p>
            )
        }, {
            header: 'Statut',
            accessor: 'status',
            render: (row) => {
        const styles = {
          'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
          'VALIDATED': 'bg-green-100 text-green-700 border-green-200',
          'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
          'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
          'EXPIRED': 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[row.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {row.status}
          </span>
        );
      }
        }, {
            header: 'Date',
            accessor: 'created_at',
            render: (row) => <span className="text-sm text-gray-500">
                {
                new Date(row.created_at).toLocaleDateString()
            }</span>
        }, {
            header: 'Actions',
            accessor: 'id',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.status === 'PENDING' && (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(row, 'VALIDATED');
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all active:scale-90"
                                title="Approuver"
                                type="button"
                            >
                                <CheckCircle2 size={18} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(row, 'CANCELLED');
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
                                title="Rejeter"
                                type="button"
                            >
                                <XCircle size={18} />
                            </button>
                        </>
                    )}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(row);
                            setIsDetailsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-90"
                        type="button"
                        title="Voir les détails"
                    >
                        <ExternalLink size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérer les demandes d'occupation et réservations avec précision</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Rechercher par logement ou client..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Filter className="text-gray-400" size={18}/>
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="VALIDATED">Validé</option>
                            <option value="CANCELLED">Annulé</option>
                            <option value="COMPLETED">Terminé</option>
                            <option value="EXPIRED">Expiré</option>
                        </select>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={occupations} 
                loading={loading}
                pagination={pagination}
                onPageChange={fetchOccupations}
            />

            <TransactionDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
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

export default AdminTransactions;

