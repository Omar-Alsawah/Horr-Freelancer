import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const jobsApi = {
  getJobs: (params = {}, options = {}) => api.get(ENDPOINTS.JOBS.LIST, { params, ...options }),
  getSavedJobs: (params = {}, options = {}) => api.get(ENDPOINTS.JOBS.SAVED, { params, ...options }),
  getJob: (id, options = {}) => api.get(ENDPOINTS.JOBS.DETAILS(id), options),
  saveJob: (id, options = {}) => api.post(ENDPOINTS.JOBS.SAVE(id), null, options),
  unsaveJob: (id, options = {}) => api.delete(ENDPOINTS.JOBS.UNSAVE(id), options),
  getRecommendedJobs: (options = {}) => api.get(ENDPOINTS.JOBS.RECOMMENDED, options),
};
