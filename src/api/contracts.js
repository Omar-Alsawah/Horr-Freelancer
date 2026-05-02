import api from './axios';

export const contractsApi = {
  acceptOffer: (id) => api.post(`/api/contracts/${id}/accept-offer`),
  declineOffer: (id) => api.post(`/api/contracts/${id}/decline-offer`),
};
