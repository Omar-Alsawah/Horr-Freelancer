import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const revisionsApi = {
  getOpenRevisions: () => api.get(ENDPOINTS.REVISIONS.OPEN),
  getMyCases: () => api.get(ENDPOINTS.REVISIONS.MY_CASES),
  acceptRevision: (revisionId) => api.post(ENDPOINTS.REVISIONS.ACCEPT(revisionId)),
  getFreelancerRevisions: (contractId) => api.get(ENDPOINTS.REVISIONS.FREELANCER, { params: contractId ? { contractId } : undefined }),
  getPendingAdditionalRevisions: () => api.get(ENDPOINTS.REVISIONS.PENDING),
  respondToAdditionalRevision: (requestId, accept) => api.post(ENDPOINTS.REVISIONS.RESPOND(requestId), { accept }),
  getSpecialistQueue: () => api.get(ENDPOINTS.REVISIONS.SPECIALIST_QUEUE),
  submitSpecialistVerdict: (contractId, deliveryId, payload) =>
    api.post(
      ENDPOINTS.DELIVERIES.SUBMIT_SPECIALIST_REVIEW(contractId, deliveryId),
      payload
    ),
  getSpecialistReviewStatus: (contractId, deliveryId) =>
    api.get(ENDPOINTS.DELIVERIES.SPECIALIST_REVIEW(contractId, deliveryId))
};
