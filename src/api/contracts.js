import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const contractsApi = {
  getMyContracts: (params = {}, options = {}) => api.get(ENDPOINTS.CONTRACTS.MY_CONTRACTS, { params, ...options }),
  getContract: (id, options = {}) => api.get(ENDPOINTS.CONTRACTS.GET_CONTRACT(id), options),
  acceptOffer: (contractId, options = {}) => api.post(ENDPOINTS.CONTRACTS.ACCEPT_OFFER(contractId), undefined, options),
  declineOffer: (contractId, options = {}) => api.post(ENDPOINTS.CONTRACTS.DECLINE_OFFER(contractId), undefined, options),
  deliverWork: (id, formData, config = {}) => api.post(ENDPOINTS.CONTRACTS.DELIVER_WORK(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  submitReview: (id, payload, options = {}) => api.post(ENDPOINTS.CONTRACTS.SUBMIT_REVIEW(id), payload, options),
  submitDelivery: (payload, options = {}) => api.post(ENDPOINTS.DELIVERIES.SUBMIT, payload, options),
  updateDelivery: (deliveryId, payload, options = {}) => api.put(ENDPOINTS.DELIVERIES.BY_ID(deliveryId), payload, options),
  uploadFiles: (formData, config = {}) => api.post(ENDPOINTS.DELIVERIES.UPLOAD, formData, config),
  getDelivery: (contractId, deliveryId, options = {}) => api.get(`/api/contracts/${contractId}/deliveries/${deliveryId}`, options),
  approveDelivery: (deliveryId, options = {}) => api.post(ENDPOINTS.DELIVERIES.APPROVE(deliveryId), undefined, options),
  requestDeliveryRevision: (deliveryId, payload, options = {}) => api.post(ENDPOINTS.DELIVERIES.REVISION(deliveryId), payload, options),
  disputeDelivery: (deliveryId, payload, options = {}) => api.post(ENDPOINTS.DELIVERIES.DISPUTE(deliveryId), payload, options),
  fundMilestone: (milestoneId, options = {}) => api.post(ENDPOINTS.MILESTONES.FUND(milestoneId), undefined, options),
  getEscrow: (contractId, options = {}) => api.get(ENDPOINTS.CONTRACTS.ESCROW(contractId), options),
  
  // Contract Delivery Portal Endpoints
  getDeliveries: (contractId, options = {}) => api.get(ENDPOINTS.DELIVERIES.BASE, { params: { contractId }, ...options }),
  downloadAttachment: (attachmentId, options = {}) => api.get(
    ENDPOINTS.DELIVERIES.DOWNLOAD(attachmentId),
    { responseType: 'blob', ...options }
  ),
  completeContract: (contractId, options = {}) => api.post(ENDPOINTS.CONTRACTS.COMPLETE(contractId), undefined, options)
};
