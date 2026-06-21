import axios from './axios';
import { ENDPOINTS } from '../services/endpoints';

export const authApi = {
  changePassword: (data) => axios.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  closeAccount: () => axios.delete(ENDPOINTS.AUTH.CLOSE_ACCOUNT)
};
