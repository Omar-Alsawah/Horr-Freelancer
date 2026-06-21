import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const disputesApi = {
  getAdminDisputes: (options = {}) => api.get(ENDPOINTS.DISPUTES.ADMIN_LIST, options),
  resolveDispute: (disputeId, payload, options = {}) => api.post(ENDPOINTS.DISPUTES.RESOLVE(disputeId), payload, options)
};
