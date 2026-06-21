import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const disputesApi = {
  getAdminDisputes: () => api.get(ENDPOINTS.DISPUTES.ADMIN_LIST),
  resolveDispute: (disputeId, payload) => api.post(ENDPOINTS.DISPUTES.RESOLVE(disputeId), payload)
};
