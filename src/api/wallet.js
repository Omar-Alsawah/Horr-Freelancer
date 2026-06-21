import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const walletApi = {
  getWalletBalance: (options = {}) => api.get(ENDPOINTS.WALLET.BALANCE, options)
};
