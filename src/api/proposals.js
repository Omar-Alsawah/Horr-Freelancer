import api from './axios';

export const proposalsApi = {
  submitProposal: (data) => api.post('/api/proposals', data),
  getMyProposals: () => api.get('/api/proposals/my-proposals'),
  getProposal: (id) => api.get(`/api/proposals/${id}`),
  withdrawProposal: (id) => api.delete(`/api/proposals/${id}/withdraw`),
  getOffer: (id) => api.get(`/api/contracts/${id}`),
};
