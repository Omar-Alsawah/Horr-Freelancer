import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const profileApi = {
  getProfile: () => api.get(ENDPOINTS.USER_PROFILE.BASE),
  getFreelancerDetails: () => api.get(ENDPOINTS.USER_PROFILE.FREELANCER_DETAILS),
  updateName: (fullName) => api.patch(ENDPOINTS.USER_PROFILE.NAME, JSON.stringify(fullName)),
  updateEmail: (email) => api.patch(ENDPOINTS.USER_PROFILE.EMAIL, JSON.stringify(email)),
  updateLocation: (data) => api.patch(ENDPOINTS.USER_PROFILE.LOCATION, data),
  updateTitle: (title) => api.patch(ENDPOINTS.USER_PROFILE.TITLE, JSON.stringify(title)),
  updateBio: (bio) => api.patch(ENDPOINTS.USER_PROFILE.BIO, JSON.stringify(bio)),
  updateExperienceLevel: (level) => api.patch(ENDPOINTS.USER_PROFILE.EXPERIENCE_LEVEL, level),
  getPrivacy: () => api.get(ENDPOINTS.USER_PROFILE.PRIVACY),
  updatePrivacy: (data) => api.patch(ENDPOINTS.USER_PROFILE.PRIVACY, data),
  addPaymentMethod: (data) => api.post(ENDPOINTS.USER_PROFILE.PAYMENT_METHOD, data),
  getPublicProfile: (userIdHash) => api.get(ENDPOINTS.USER_PROFILE.PUBLIC(userIdHash)),
  updateFreelancerDetails: (data) => api.patch(ENDPOINTS.USER_PROFILE.FREELANCER_DETAILS, data),
  updatePreferredCurrency: (currency) => api.patch(ENDPOINTS.USER_PROFILE.PREFERRED_CURRENCY, JSON.stringify(currency))
};

