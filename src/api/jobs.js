import api from './axios';

export const jobsApi = {
  getJobs: (params = {}) => api.get('/api/jobs/jobs', { params }),
  getSavedJobs: (params = {}) => api.get('/api/jobs/saved', { params }),
  getJob: (id) => api.get(`/api/jobs/jobs/${id}`),
  saveJob: (id) => api.post(`/api/jobs/${id}/save-job`),
  unsaveJob: (id) => api.delete(`/api/jobs/${id}/unsave-job`),
  getRecommendedJobs: () => api.get('/api/Recommendations/jobs'),
};
