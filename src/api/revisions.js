import api from './axios';

export const revisionsApi = {
  getOpenRevisions: () => api.get('/api/revisions/open'),
  getMyCases: () => api.get('/api/revisions/my-cases'),
  acceptRevision: (revisionId) => api.post(`/api/revisions/${revisionId}/accept`),
  getSpecialistQueue: () => api.get('/api/revisions/specialist-queue'),
  submitSpecialistVerdict: (contractId, deliveryId, payload) =>
    api.post(
      `/api/contracts/${contractId}/deliveries/${deliveryId}/specialist-review/submit`,
      payload
    ),
  getSpecialistReviewStatus: (contractId, deliveryId) =>
    api.get(`/api/contracts/${contractId}/deliveries/${deliveryId}/specialist-review`)
};
