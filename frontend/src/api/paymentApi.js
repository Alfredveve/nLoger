import api from './axios';

/**
 * API functions for payment management
 */

// Payment operations
export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/initiate/', paymentData);
  return response.data;
};

export const verifyPayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/verify/`);
  return response.data;
};

export const cancelPayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/cancel/`);
  return response.data;
};

export const getPayment = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}/`);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/');
  return response.data;
};

// Escrow operations
export const getEscrowAccount = async (escrowId) => {
  const response = await api.get(`/escrow/${escrowId}/`);
  return response.data;
};

export const requestRefund = async (escrowId, reason) => {
  const response = await api.post(`/escrow/${escrowId}/request-refund/`, { reason });
  return response.data;
};

export const releaseEscrow = async (escrowId) => {
  const response = await api.post(`/escrow/${escrowId}/release/`);
  return response.data;
};

// Transaction history
export const getTransactionHistory = async () => {
  const response = await api.get('/transactions/');
  return response.data;
};

export const getTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}/`);
  return response.data;
};

// Payment methods
export const getPaymentMethods = async () => {
  const response = await api.get('/payment-methods/');
  return response.data;
};

export const addPaymentMethod = async (methodData) => {
  const response = await api.post('/payment-methods/', methodData);
  return response.data;
};

export const deletePaymentMethod = async (methodId) => {
  const response = await api.delete(`/payment-methods/${methodId}/`);
  return response.data;
};

export const setDefaultPaymentMethod = async (methodId) => {
  const response = await api.post(`/payment-methods/${methodId}/set-default/`);
  return response.data;
};

// Disputes
export const createDispute = async (disputeData) => {
  const response = await api.post('/disputes/', disputeData);
  return response.data;
};

export const getMyDisputes = async () => {
  const response = await api.get('/disputes/');
  return response.data;
};

export const resolveDispute = async (disputeId, resolution, notes) => {
  const response = await api.post(`/disputes/${disputeId}/resolve/`, {
    resolution,
    notes
  });
  return response.data;
};
