import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const walletApi = {
  getWalletBalance: () => api.get(ENDPOINTS.WALLET.BALANCE)
};
