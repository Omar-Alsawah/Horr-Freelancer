import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/UserProfile'),
  updateName: (fullName) => api.patch('/api/UserProfile/name', fullName, { 
    headers: { 'Content-Type': 'text/plain' } 
  }),
  updateEmail: (email) => api.patch('/api/UserProfile/email', email, { 
    headers: { 'Content-Type': 'text/plain' } 
  }),
  updateLocation: (data) => api.patch('/api/UserProfile/location', data),
  getPrivacy: () => api.get('/api/UserProfile/privacy'),
  updatePrivacy: (data) => api.patch('/api/UserProfile/privacy', data),
  addPaymentMethod: (data) => api.post('/api/UserProfile/payment-method', data)
};

