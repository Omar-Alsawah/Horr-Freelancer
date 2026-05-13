import api from './axios';

export const billingApi = {
  getWalletBalance: () => api.get('/api/Billing/wallet-balance'),
  submitDepositRequest: (formData) => api.post('/api/Billing/deposit-requests', formData),
  getMyDepositRequests: (params = {}) => api.get('/api/Billing/deposit-requests/my-requests', { params }),
};
