import api from './axios';

export const portfolioApi = {
  getPortfolio: () => api.get('/api/portfolio'),
  addPortfolio: (formData) => api.post('/api/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePortfolio: (id, formData) => api.put(`/api/portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolio: (id) => api.delete(`/api/portfolio/${id}`)
};
