import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const proposalsApi = {
  submitProposal: (data, options = {}) => api.post(ENDPOINTS.PROPOSALS.BASE, data, options),
  getMyProposals: (options = {}) => api.get(ENDPOINTS.PROPOSALS.MY_PROPOSALS, options),
  getProposal: (id, options = {}) => api.get(ENDPOINTS.PROPOSALS.BY_ID(id), options),
  updateProposal: (id, data, options = {}) => api.put(ENDPOINTS.PROPOSALS.BY_ID(id), data, options),
  withdrawProposal: (id, options = {}) => api.delete(ENDPOINTS.PROPOSALS.WITHDRAW(id), options),
  getOffer: (id, options = {}) => api.get(ENDPOINTS.CONTRACTS.GET_CONTRACT(id), options),
};
