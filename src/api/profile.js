import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/UserProfile'),
  updateProfile: (data) => api.patch('/api/UserProfile', data),
  updateName: (data) => api.patch('/api/UserProfile/name', data),
  updateLocation: (data) => api.patch('/api/UserProfile/location', data),
  getPrivacy: () => api.get('/api/UserProfile/privacy'),
  updatePrivacy: (data) => api.patch('/api/UserProfile/privacy', data)
};
