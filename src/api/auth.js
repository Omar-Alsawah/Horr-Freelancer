import axios from './axios';

export const authApi = {
  changePassword: (data) => axios.put('/api/auth/change-password', data)
};
