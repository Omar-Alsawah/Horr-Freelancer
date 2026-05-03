import api from './axios';

export const contractsApi = {
  getMyContracts: (params = {}) => api.get('/api/contracts/my-contracts', { params }),
  getContract: (id) => api.get(`/api/contracts/${id}`),
  acceptOffer: (proposalId) => api.post(`/api/contracts/${proposalId}/accept-offer`),
  declineOffer: (proposalId) => api.post(`/api/contracts/${proposalId}/decline-offer`),
  deliverWork: (id, formData) => api.post(`/api/contracts/${id}/deliver-work`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submitReview: (id, payload) => api.post(`/api/contracts/${id}/reviews`, payload)
};
