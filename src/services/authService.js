import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const register = async (userData) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};
