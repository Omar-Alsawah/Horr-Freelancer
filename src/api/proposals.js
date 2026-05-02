import api from './axios';

export const proposalsApi = {
  submitProposal: (data) => api.post('/api/proposals', data),
  getMyProposals: () => api.get('/api/proposals/my'),
  getProposal: (id) => api.get(`/api/proposals/${id}`),
  withdrawProposal: (id) => api.delete(`/api/proposals/${id}`),
  getOffer: (id) => api.get(`/api/offers/${id}`),
  acceptOffer: (id) => api.post(`/api/offers/${id}/accept`),
  declineOffer: (id, reason) => api.post(`/api/offers/${id}/decline`, { reason }),
};
