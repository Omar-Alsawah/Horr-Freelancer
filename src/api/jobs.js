import api from './axios';

export const jobsApi = {
  getJobs: (params = {}) => api.get('/api/jobs', { params }),
  getJob: (id) => api.get(`/api/jobs/${id}`),
  saveJob: (id) => api.post(`/api/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/api/jobs/${id}/save`),
};
