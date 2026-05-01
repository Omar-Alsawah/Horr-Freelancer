import api from './axios';

export const jobsApi = {
  getJobs: (params = {}) => api.get('/api/jobs', { params }),
  saveJob: (id) => api.post(`/api/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/api/jobs/${id}/save`),
};
