import api from './axios';

export const disputesApi = {
  getAdminDisputes: () => api.get('/api/disputes?status=Open&status=UnderReview'),
  resolveDispute: (disputeId, payload) => api.post(`/api/disputes/${disputeId}/resolve`, payload)
};
