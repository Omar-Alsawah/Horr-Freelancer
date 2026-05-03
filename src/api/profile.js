import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data)
};
