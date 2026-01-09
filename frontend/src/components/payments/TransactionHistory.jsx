import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowUpDown, Calendar, DollarSign } from 'lucide-react';
import { getTransactionHistory } from '../../api/paymentApi';
import { toast } from 'react-hot-toast';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactionHistory();
      setTransactions(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'PAYMENT':
        return '💳';
      case 'REFUND':
        return '↩️';
      case 'COMMISSION':
        return '💰';
      case 'TRANSFER':
        return '➡️';
      case 'FEE':
        return '📊';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.transaction_type === filter;
    const matchesSearch = search === '' || 
      transaction.description?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement des transactions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Historique des Transactions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} transaction(s)
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une transaction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="PAYMENT">Paiements</option>
            <option value="REFUND">Remboursements</option>
            <option value="COMMISSION">Commissions</option>
            <option value="TRANSFER">Transferts</option>
            <option value="FEE">Frais</option>
          </select>
        </div>
      </div>

      {/* Liste des transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune transaction trouvée</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Vos transactions apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {transaction.transaction_type_display}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status_display}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {transaction.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(transaction.created_at)}
                      </span>
                      <span className="font-mono">
                        ID: {transaction.id.substring(0, 8)}...
                      </span>
                    </div>
                    {transaction.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        ⚠️ {transaction.error_message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${
                    transaction.transaction_type === 'REFUND' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {transaction.transaction_type === 'REFUND' ? '+' : ''}
                    {transaction.amount?.toLocaleString()} GNF
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
