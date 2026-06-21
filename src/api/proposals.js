import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const proposalsApi = {
  submitProposal: (data) => api.post(ENDPOINTS.PROPOSALS.BASE, data),
  getMyProposals: () => api.get(ENDPOINTS.PROPOSALS.MY_PROPOSALS),
  getProposal: (id) => api.get(ENDPOINTS.PROPOSALS.BY_ID(id)),
  updateProposal: (id, data) => api.put(ENDPOINTS.PROPOSALS.BY_ID(id), data),
  withdrawProposal: (id) => api.delete(ENDPOINTS.PROPOSALS.WITHDRAW(id)),
  getOffer: (id) => api.get(ENDPOINTS.CONTRACTS.GET_CONTRACT(id)),
};
