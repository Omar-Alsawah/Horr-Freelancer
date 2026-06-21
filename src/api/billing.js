import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const billingApi = {
  getWalletBalance: (options = {}) => api.get(ENDPOINTS.BILLING.WALLET_BALANCE, options),
  submitDepositRequest: (formData, options = {}) => api.post(ENDPOINTS.BILLING.DEPOSIT_REQUESTS, formData, options),
  getMyDepositRequests: (params = {}, options = {}) => api.get(ENDPOINTS.BILLING.MY_DEPOSIT_REQUESTS, { params, ...options }),
  
  submitWithdrawalRequest: (payload, options = {}) => api.post(ENDPOINTS.BILLING.WITHDRAWAL_REQUESTS, payload, options),
  getMyWithdrawalRequests: (params = {}, options = {}) => api.get(ENDPOINTS.BILLING.MY_WITHDRAWAL_REQUESTS, { params, ...options }),
};
