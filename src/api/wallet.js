import api from './axios';

export const walletApi = {
  getWalletBalance: () => api.get('/api/wallet/balance')
};
