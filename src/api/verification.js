import { ENDPOINTS } from '@/services/endpoints';
import api from './axios';

export const verificationApi = {
  getMyStatus: () => api.get(ENDPOINTS.VERIFICATION.MY_STATUS),
  submitVerification: (formData) => api.post(ENDPOINTS.VERIFICATION.SUBMIT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
