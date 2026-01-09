import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initiatePayment, verifyPayment } from '../../api/paymentApi';

const PaymentForm = ({ occupationRequest, onSuccess, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState('ORANGE_MONEY');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saveMethod, setSaveMethod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const paymentMethods = [
    {
      id: 'ORANGE_MONEY',
      name: 'Orange Money',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-orange-500',
      ussd: '*144*4*6#'
    },
    {
      id: 'MTN_MONEY',
      name: 'MTN Mobile Money',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-yellow-500',
      ussd: '*182*7*1#'
    },
    {
      id: 'WAVE',
      name: 'Wave',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-blue-500',
      ussd: null
    }
  ];

  const selectedMethodInfo = paymentMethods.find(m => m.id === selectedMethod);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);

    try {
      const result = await initiatePayment({
        occupation_request_id: occupationRequest.id,
        payment_method: selectedMethod,
        payment_phone: phoneNumber,
        save_payment_method: saveMethod
      });

      if (result.success) {
        setPaymentInitiated(true);
        setPaymentData(result);
        toast.success(result.message || 'Paiement initié avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'initiation du paiement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentData?.payment_id) return;

    setVerifying(true);

    try {
      const result = await verifyPayment(paymentData.payment_id);

      if (result.success && result.status === 'HELD_IN_ESCROW') {
        toast.success('Paiement confirmé ! Fonds placés en escrow.');
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result.success) {
        toast.info(`Statut: ${result.provider_status || result.status}`);
      } else {
        toast.error(result.message || 'Erreur de vérification');
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification');
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  // Auto-vérification toutes les 5 secondes si paiement initié
  useEffect(() => {
    if (paymentInitiated && paymentData?.payment_id) {
      const interval = setInterval(() => {
        handleVerifyPayment();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [paymentInitiated, paymentData]);

  if (paymentInitiated && paymentData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement Initié
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Finalisez votre paiement pour continuer
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Instructions de paiement
              </h4>
              {selectedMethodInfo?.ussd && (
                <div className="mb-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
                    Composez le code USSD :
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-lg font-bold text-center">
                    {selectedMethodInfo.ussd}
                  </div>
                </div>
              )}
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Suivez les instructions sur votre téléphone pour finaliser le paiement de{' '}
                <span className="font-bold">{occupationRequest.payment_amount?.toLocaleString()} GNF</span>
              </p>
              {paymentData.transaction_id && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ID de transaction: {paymentData.transaction_id}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleVerifyPayment}
            disabled={verifying}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                J'ai payé, vérifier
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Vérification automatique toutes les 5 secondes...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleInitiatePayment} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Paiement Sécurisé
      </h3>

      {/* Montant */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <p className="text-sm opacity-90 mb-1">Montant à payer</p>
        <p className="text-3xl font-bold">
          {occupationRequest.payment_amount?.toLocaleString()} GNF
        </p>
        <p className="text-xs opacity-75 mt-2">
          Fonds retenus en escrow jusqu'à validation
        </p>
      </div>

      {/* Sélection de la méthode */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Méthode de paiement
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${method.color} text-white mb-2`}>
                {method.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {method.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Numéro de téléphone */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Numéro de téléphone
        </label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ex: 622123456"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Le numéro associé à votre compte {selectedMethodInfo?.name}
        </p>
      </div>

      {/* Sauvegarder la méthode */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveMethod}
            onChange={(e) => setSaveMethod(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enregistrer cette méthode de paiement
          </span>
        </label>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer maintenant
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Annuler
        </button>
      </div>

      {/* Note de sécurité */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Vos fonds seront retenus en escrow (séquestre) jusqu'à la validation de votre occupation par le propriétaire. 
            Vous pouvez demander un remboursement en cas de problème.
          </p>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
