import axios from './axios';

export const authApi = {
  changePassword: (data) => axios.post('/api/Auth/change-password', data),
  closeAccount: () => axios.delete('/api/Auth/close-account')
};
