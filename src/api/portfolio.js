import api from './axios';

export const portfolioApi = {
  getPortfolio: () => api.get('/api/Portfolio'),
  getPortfolioById: (id) => api.get(`/api/Portfolio/${id}`),
  addPortfolio: (formData) => api.post('/api/Portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePortfolio: (id, formData) => api.put(`/api/Portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolio: (id) => api.delete(`/api/Portfolio/${id}`)
};
