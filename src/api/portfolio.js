import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const portfolioApi = {
  getPortfolio: () => api.get(ENDPOINTS.PORTFOLIO.BASE),
  getPortfolioById: (id) => api.get(ENDPOINTS.PORTFOLIO.BY_ID(id)),
  addPortfolio: (formData) => api.post(ENDPOINTS.PORTFOLIO.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePortfolio: (id, formData) => api.put(ENDPOINTS.PORTFOLIO.BY_ID(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolio: (id) => api.delete(ENDPOINTS.PORTFOLIO.BY_ID(id))
};
