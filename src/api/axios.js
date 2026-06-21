import axios from 'axios';
import i18n from '../i18n';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200';

const api = axios.create({
  baseURL: BASE_URL,
});



export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('horr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status || 0;
    
    if (status === 401) {
      localStorage.removeItem('horr_token');
      window.location.href = '/login';
      return Promise.reject({ title: 'Session expired. Please log in again.', status: 401 });
    }

    let title = error.message || 'Network error';
    let errors = null;
    let errorCode = null;

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        title = data;
      } else {
        errorCode = data.code || data.errorCode || null;
        if (data.title) {
          title = data.title;
          errors = data.errors || null;
        } else if (data.message) {
          title = data.message;
        }
      }
    }

    if (errorCode && i18n.exists(`errors.${errorCode}`)) {
      title = i18n.t(`errors.${errorCode}`);
    } else if (i18n.exists(`errors.${title}`)) {
      title = i18n.t(`errors.${title}`);
    }

    return Promise.reject({
      title,
      status,
      errors,
      errorCode
    });
  }
);

export default api;
