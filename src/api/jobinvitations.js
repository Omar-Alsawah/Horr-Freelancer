import api from './axios';

export const jobInvitationsApi = {
  getInvitations: () => api.get('/api/jobinvitations/freelancer'),
  declineInvitation: (id) => api.post(`/api/jobinvitations/${id}/decline`),
};
