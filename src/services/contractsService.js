import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const contractsService = {
  getMyContracts: async (params, options = {}) => {
    const res = await apiClient.get(ENDPOINTS.CONTRACTS.MY_CONTRACTS, { params, ...options });
    return res.data?.data ?? res.data;
  },
  getContract: async (id, options = {}) => {
    const res = await apiClient.get(ENDPOINTS.CONTRACTS.GET_CONTRACT(id), options);
    return res.data?.data ?? res.data;
  },
  submitReview: async (id, payload) => {
    const res = await apiClient.post(ENDPOINTS.CONTRACTS.SUBMIT_REVIEW(id), payload);
    return res.data?.data ?? res.data;
  },
  getDeliveries: async (contractId, options = {}) => {
    const res = await apiClient.get(ENDPOINTS.DELIVERIES.GET_BY_CONTRACT, { params: { contractId }, ...options });
    return res.data?.data ?? res.data;
  },
  approveDelivery: async (deliveryId) => {
    const res = await apiClient.post(ENDPOINTS.DELIVERIES.APPROVE(deliveryId));
    return res.data?.data ?? res.data;
  },
  requestRevision: async (deliveryId, payload) => {
    const res = await apiClient.post(ENDPOINTS.DELIVERIES.REVISION(deliveryId), payload);
    return res.data?.data ?? res.data;
  },
  openDispute: async (deliveryId, payload) => {
    const res = await apiClient.post(ENDPOINTS.DELIVERIES.DISPUTE(deliveryId), payload);
    return res.data?.data ?? res.data;
  },
  downloadAttachment: async (attachmentId) => {
    const res = await apiClient.get(ENDPOINTS.DELIVERIES.DOWNLOAD(attachmentId), { responseType: 'blob' });
    return res.data?.data ?? res.data;
  },
  requestSpecialistReview: async (contractId, deliveryId, payload) => {
    const res = await apiClient.post(ENDPOINTS.DELIVERIES.SUBMIT_SPECIALIST_REVIEW(contractId, deliveryId), payload);
    return res.data?.data ?? res.data;
  },
  requestAdditionalRevisions: async (payload) => {
    const res = await apiClient.post(ENDPOINTS.REVISIONS.REQUEST_ADDITIONAL, payload);
    return res.data?.data ?? res.data;
  },
  downloadReceipt: async (requestId) => {
    const res = await apiClient.get(ENDPOINTS.BILLING.DOWNLOAD_RECEIPT(requestId), { responseType: 'blob' });
    return res.data?.data ?? res.data;
  }
};
