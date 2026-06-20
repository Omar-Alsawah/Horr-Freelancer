import api from './axios';

export const revisionsApi = {
  getOpenRevisions: () => api.get('/api/revisions/open'),
  getMyCases: () => api.get('/api/revisions/my-cases'),
  acceptRevision: (revisionId) => api.post(`/api/revisions/${revisionId}/accept`),
  getFreelancerRevisions: (contractId) => api.get('/api/revisions/freelancer', { params: contractId ? { contractId } : undefined }),
  getPendingAdditionalRevisions: () => api.get('/api/revisions/additional/pending'),
  respondToAdditionalRevision: (requestId, accept) => api.post(`/api/revisions/additional/${requestId}/respond`, { accept }),
  getSpecialistQueue: () => api.get('/api/revisions/specialist-queue'),
  submitSpecialistVerdict: (contractId, deliveryId, payload) =>
    api.post(
      `/api/contracts/${contractId}/deliveries/${deliveryId}/specialist-review/submit`,
      payload
    ),
  getSpecialistReviewStatus: (contractId, deliveryId) =>
    api.get(`/api/contracts/${contractId}/deliveries/${deliveryId}/specialist-review`)
};
