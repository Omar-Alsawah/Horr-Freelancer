import api from './axios';

export const contractsApi = {
  getMyContracts: (params = {}) => api.get('/api/contracts/my-contracts', { params }),
  getContract: (id) => api.get(`/api/contracts/${id}`),
  acceptOffer: (contractId) => api.post(`/api/contracts/${contractId}/accept-offer`),
  declineOffer: (contractId) => api.post(`/api/contracts/${contractId}/decline-offer`),
  deliverWork: (id, formData, config = {}) => api.post(`/api/contracts/${id}/deliver-work`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  submitReview: (id, payload) => api.post(`/api/contracts/${id}/reviews`, payload),
  submitDelivery: (payload) => api.post('/api/deliveries/submit', payload),
  uploadFiles: (formData, config = {}) => api.post('/api/deliveries/upload', formData, config),
  getDelivery: (contractId, deliveryId) => api.get(`/api/contracts/${contractId}/deliveries/${deliveryId}`),
  approveDelivery: (deliveryId) => api.post(`/api/deliveries/${deliveryId}/approve`),
  requestDeliveryRevision: (deliveryId, payload) => api.post(`/api/deliveries/${deliveryId}/revision`, payload),
  disputeDelivery: (deliveryId, payload) => api.post(`/api/deliveries/${deliveryId}/dispute`, payload),
  fundMilestone: (milestoneId) => api.post(`/api/milestones/${milestoneId}/fund`),
  getEscrow: (contractId) => api.get(`/api/contracts/${contractId}/escrow`),
  
  // Contract Delivery Portal Endpoints
  getDeliveries: (contractId) => api.get('/api/deliveries', { params: { contractId } }),
  downloadAttachment: (attachmentId) => api.get(
    `/api/deliveries/attachments/${attachmentId}/download`,
    { responseType: 'blob' }
  ),
  completeContract: (contractId) => api.post(`/api/contracts/${contractId}/complete`)
};

