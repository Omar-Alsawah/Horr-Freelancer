import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const billingApi = {
  getWalletBalance: () => api.get(ENDPOINTS.BILLING.WALLET_BALANCE),
  submitDepositRequest: (formData) => api.post(ENDPOINTS.BILLING.DEPOSIT_REQUESTS, formData),
  getMyDepositRequests: (params = {}) => api.get(ENDPOINTS.BILLING.MY_DEPOSIT_REQUESTS, { params }),
  
  submitWithdrawalRequest: (payload) => api.post(ENDPOINTS.BILLING.WITHDRAWAL_REQUESTS, payload),
  getMyWithdrawalRequests: (params = {}) => api.get(ENDPOINTS.BILLING.MY_WITHDRAWAL_REQUESTS, { params }),
};
