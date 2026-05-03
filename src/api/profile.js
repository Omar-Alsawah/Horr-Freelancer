import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data),
  updateName: (name) => api.patch('/api/profile/name', name),
  updateLocation: (data) => api.patch('/api/profile/location', data),
  getPrivacy: () => api.get('/api/profile/privacy'),
  updatePrivacy: (data) => api.patch('/api/profile/privacy', data)
};
