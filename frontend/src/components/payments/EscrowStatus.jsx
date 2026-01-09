import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, DollarSign, Send, Loader2 } from 'lucide-react';
import { requestRefund } from '../../api/paymentApi';
import { toast } from 'react-hot-toast';

const EscrowStatus = ({ escrow, payment, onUpdate }) => {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusIcon = () => {
    switch (escrow.status) {
      case 'HOLDING':
        return <Clock className="w-8 h-8 text-yellow-600" />;
      case 'RELEASED':
        return <CheckCircle2 className="w-8 h-8 text-green-600" />;
      case 'REFUNDED':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (escrow.status) {
      case 'HOLDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      toast.error('Veuillez fournir un motif pour le remboursement');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestRefund(escrow.id, refundReason);
      if (result.success) {
        toast.success('Demande de remboursement envoyée avec succès');
        setShowRefundForm(false);
        setRefundReason('');
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.message || 'Erreur lors de la demande de remboursement');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* En-tête avec statut */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Statut Escrow
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Suivi de vos fonds en séquestre
          </p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full">
          {getStatusIcon()}
        </div>
      </div>

      {/* Statut actuel */}
      <div className={`px-4 py-3 rounded-xl border-2 ${getStatusColor()} mb-6`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">{escrow.status_display}</span>
          {escrow.status === 'HOLDING' && (
            <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
              En attente
            </span>
          )}
        </div>
      </div>

      {/* Montant retenu */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-xl p-5 mb-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5" />
          <span className="text-sm opacity-90">Montant retenu</span>
        </div>
        <p className="text-3xl font-bold">
          {escrow.held_amount?.toLocaleString()} GNF
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Fonds placés en escrow</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 inline mr-1" />
              {formatDate(escrow.held_at)}
            </p>
          </div>
        </div>

        {escrow.release_scheduled_date && escrow.status === 'HOLDING' && (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Libération prévue</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(escrow.release_scheduled_date)}
              </p>
            </div>
          </div>
        )}

        {escrow.released_at && (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {escrow.status === 'RELEASED' ? 'Fonds libérés' : 'Fonds remboursés'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(escrow.released_at)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Raison de remboursement si applicable */}
      {escrow.refund_reason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
            Raison du remboursement
          </p>
          <p className="text-sm text-red-800 dark:text-red-400">
            {escrow.refund_reason}
          </p>
        </div>
      )}

      {/* Formulaire de demande de remboursement */}
      {escrow.status === 'HOLDING' && !showRefundForm && (
        <button
          onClick={() => setShowRefundForm(true)}
          className="w-full mb-6 px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Demander un remboursement
        </button>
      )}

      {showRefundForm && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <h4 className="font-bold text-red-900 dark:text-red-300 mb-2 text-sm">Motif de la demande</h4>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            className="w-full p-3 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 mb-3 text-sm dark:bg-gray-800 dark:text-white"
            placeholder="Expliquez pourquoi vous demandez un remboursement..."
            rows="3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRequestRefund}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer
            </button>
            <button
              onClick={() => setShowRefundForm(false)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
          Informations du paiement
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">ID de paiement</span>
            <span className="font-mono text-gray-900 dark:text-white">
              {payment?.id?.substring(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Méthode</span>
            <span className="text-gray-900 dark:text-white">
              {payment?.payment_method_display}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Statut paiement</span>
            <span className="text-gray-900 dark:text-white">
              {payment?.status_display}
            </span>
          </div>
        </div>
      </div>

      {/* Note d'information */}
      {escrow.status === 'HOLDING' && !showRefundForm && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-[10px] text-blue-800 dark:text-blue-300">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Vos fonds sont en sécurité. Ils seront automatiquement libérés au propriétaire une fois votre occupation validée.
          </p>
        </div>
      )}
    </div>
  );
};

export default EscrowStatus;
