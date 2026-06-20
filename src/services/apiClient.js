import axios from 'axios';
import { setupInterceptors } from './interceptors';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export default apiClient;
