import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/UserProfile'),
  updateProfile: (data) => api.patch('/api/UserProfile', data),
  updateName: (name) => api.patch('/api/UserProfile/name', name),
  updateLocation: (data) => api.patch('/api/UserProfile/location', data),
  getPrivacy: () => api.get('/api/UserProfile/privacy'),
  updatePrivacy: (data) => api.patch('/api/UserProfile/privacy', data)
};
