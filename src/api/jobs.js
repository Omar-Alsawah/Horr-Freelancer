import api from './axios';

export const jobsApi = {
  getJobs: (params = {}, options = {}) => api.get('/api/jobs/jobs', { params, ...options }),
  getSavedJobs: (params = {}, options = {}) => api.get('/api/jobs/saved', { params, ...options }),
  getJob: (id, options = {}) => api.get(`/api/jobs/jobs/${id}`, options),
  saveJob: (id, options = {}) => api.post(`/api/jobs/${id}/save-job`, null, options),
  unsaveJob: (id, options = {}) => api.delete(`/api/jobs/${id}/unsave-job`, options),
  getRecommendedJobs: (options = {}) => api.get('/api/Recommendations/jobs', options),
};
