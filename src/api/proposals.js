import api from './axios';

export const proposalsApi = {
  submitProposal: (data) => api.post('/api/proposals', data),
};
