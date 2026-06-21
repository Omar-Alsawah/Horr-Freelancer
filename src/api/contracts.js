import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const contractsApi = {
  getMyContracts: (params = {}) => api.get(ENDPOINTS.CONTRACTS.MY_CONTRACTS, { params }),
  getContract: (id) => api.get(ENDPOINTS.CONTRACTS.GET_CONTRACT(id)),
  acceptOffer: (contractId) => api.post(ENDPOINTS.CONTRACTS.ACCEPT_OFFER(contractId)),
  declineOffer: (contractId) => api.post(ENDPOINTS.CONTRACTS.DECLINE_OFFER(contractId)),
  deliverWork: (id, formData, config = {}) => api.post(ENDPOINTS.CONTRACTS.DELIVER_WORK(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  submitReview: (id, payload) => api.post(ENDPOINTS.CONTRACTS.SUBMIT_REVIEW(id), payload),
  submitDelivery: (payload) => api.post(ENDPOINTS.DELIVERIES.SUBMIT, payload),
  updateDelivery: (deliveryId, payload) => api.put(ENDPOINTS.DELIVERIES.BY_ID(deliveryId), payload),
  uploadFiles: (formData, config = {}) => api.post(ENDPOINTS.DELIVERIES.UPLOAD, formData, config),
  getDelivery: (contractId, deliveryId) => api.get(`/api/contracts/${contractId}/deliveries/${deliveryId}`),
  approveDelivery: (deliveryId) => api.post(ENDPOINTS.DELIVERIES.APPROVE(deliveryId)),
  requestDeliveryRevision: (deliveryId, payload) => api.post(ENDPOINTS.DELIVERIES.REVISION(deliveryId), payload),
  disputeDelivery: (deliveryId, payload) => api.post(ENDPOINTS.DELIVERIES.DISPUTE(deliveryId), payload),
  fundMilestone: (milestoneId) => api.post(ENDPOINTS.MILESTONES.FUND(milestoneId)),
  getEscrow: (contractId) => api.get(ENDPOINTS.CONTRACTS.ESCROW(contractId)),
  
  // Contract Delivery Portal Endpoints
  getDeliveries: (contractId) => api.get(ENDPOINTS.DELIVERIES.BASE, { params: { contractId } }),
  downloadAttachment: (attachmentId) => api.get(
    ENDPOINTS.DELIVERIES.DOWNLOAD(attachmentId),
    { responseType: 'blob' }
  ),
  completeContract: (contractId) => api.post(ENDPOINTS.CONTRACTS.COMPLETE(contractId))
};

