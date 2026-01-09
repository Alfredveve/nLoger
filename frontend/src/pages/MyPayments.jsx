import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMyPayments } from '../api/paymentApi';
import EscrowStatus from '../components/payments/EscrowStatus';
import TransactionHistory from '../components/payments/TransactionHistory';

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');

  const fetchPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await getMyPayments();
      const paymentsList = Array.isArray(data) ? data : data.results || [];
      setPayments(paymentsList);
      
      // Update selected payment if it exists
      if (selectedPayment) {
        const updated = paymentsList.find(p => p.id === selectedPayment.id);
        if (updated) setSelectedPayment(updated);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des paiements');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPayment]);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'HELD_IN_ESCROW':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'RELEASED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'REFUNDED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'FAILED':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HELD_IN_ESCROW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mes Paiements
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos paiements et consultez votre historique
            </p>
          </div>
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Paiements
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'payments' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des paiements */}
            <div className="lg:col-span-2">
              {payments.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Aucun paiement
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vos paiements apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 cursor-pointer ${
                        selectedPayment?.id === payment.id ? 'border-blue-500 scale-[1.01]' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${
                            payment.status === 'RELEASED' ? 'bg-green-100 dark:bg-green-900/30' : 
                            payment.status === 'HELD_IN_ESCROW' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {getStatusIcon(payment.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg truncate mb-1">
                              {payment.property_title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {payment.payment_method_display}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                                #{payment.id.substring(0, 8)}
                              </span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                              {payment.status_display}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                            {payment.amount?.toLocaleString()} GNF
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>

                      {payment.escrow && (
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              payment.escrow.status === 'HOLDING' ? 'bg-yellow-500 animate-pulse' : 
                              payment.escrow.status === 'RELEASED' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Escrow: {payment.escrow.status_display}
                            </span>
                          </div>
                          <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm">
                            <Eye className="w-4 h-4" />
                            Gérer
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Détails du paiement sélectionné */}
            <div className="lg:col-span-1">
              {selectedPayment && selectedPayment.escrow ? (
                <EscrowStatus
                  escrow={selectedPayment.escrow}
                  payment={selectedPayment}
                  onUpdate={() => fetchPayments(true)}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700 text-center sticky top-8">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    💳
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Détails du paiement</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez un paiement dans la liste pour voir les détails de la transaction et le statut du séquestre.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <TransactionHistory />
        )}
      </div>
    </div>
  );
};

export default MyPayments;
