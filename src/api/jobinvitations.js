import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const jobInvitationsApi = {
  getInvitations: () => api.get(ENDPOINTS.JOB_INVITATIONS.FREELANCER),
  declineInvitation: (id) => api.post(ENDPOINTS.JOB_INVITATIONS.DECLINE(id)),
};
