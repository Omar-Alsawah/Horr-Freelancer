import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const profileApi = {
  getProfile: (options = {}) => api.get(ENDPOINTS.USER_PROFILE.BASE, options),
  getFreelancerDetails: (options = {}) => api.get(ENDPOINTS.USER_PROFILE.FREELANCER_DETAILS, options),
  updateName: (fullName, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.NAME, JSON.stringify(fullName), options),
  updateEmail: (email, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.EMAIL, JSON.stringify(email), options),
  updateLocation: (data, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.LOCATION, data, options),
  updateTitle: (title, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.TITLE, JSON.stringify(title), options),
  updateBio: (bio, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.BIO, JSON.stringify(bio), options),
  updateExperienceLevel: (level, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.EXPERIENCE_LEVEL, level, options),
  getPrivacy: (options = {}) => api.get(ENDPOINTS.USER_PROFILE.PRIVACY, options),
  updatePrivacy: (data, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.PRIVACY, data, options),
  addPaymentMethod: (data, options = {}) => api.post(ENDPOINTS.USER_PROFILE.PAYMENT_METHOD, data, options),
  getPublicProfile: (userIdHash, options = {}) => api.get(ENDPOINTS.USER_PROFILE.PUBLIC(userIdHash), options),
  updateFreelancerDetails: (data, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.FREELANCER_DETAILS, data, options),
  updatePreferredCurrency: (currency, options = {}) => api.patch(ENDPOINTS.USER_PROFILE.PREFERRED_CURRENCY, JSON.stringify(currency), options)
};
