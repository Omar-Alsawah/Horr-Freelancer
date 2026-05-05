import api from './axios';

export const verificationApi = {
  getMyStatus: () => api.get('/api/verification/my-status'),
  submitVerification: (formData) => api.post('/api/verification/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
