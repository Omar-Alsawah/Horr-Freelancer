import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/api/UserProfile'),
  getFreelancerDetails: () => api.get('/api/UserProfile/freelancer-details'),
  updateName: (fullName) => api.patch('/api/UserProfile/name', JSON.stringify(fullName)),
  updateEmail: (email) => api.patch('/api/UserProfile/email', JSON.stringify(email)),
  updateLocation: (data) => api.patch('/api/UserProfile/location', data),
  updateTitle: (title) => api.patch('/api/UserProfile/title', JSON.stringify(title)),
  updateBio: (bio) => api.patch('/api/UserProfile/bio', JSON.stringify(bio)),
  updateExperienceLevel: (level) => api.patch('/api/UserProfile/experience-level', level),
  getPrivacy: () => api.get('/api/UserProfile/privacy'),
  updatePrivacy: (data) => api.patch('/api/UserProfile/privacy', data),
  addPaymentMethod: (data) => api.post('/api/UserProfile/payment-method', data),
  getPublicProfile: (userIdHash) => api.get(`/api/UserProfile/public/${userIdHash}`),
  getPublicPortfolio: (userIdHash) => api.get(`/api/Portfolio/public/${userIdHash}`),
  updateFreelancerDetails: (data) => api.patch('/api/UserProfile/freelancer-details', data)
};

