import axios from 'axios';

export const BASE_URL = 'https://localhost:7070';

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
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 0;
    
    if (status === 401) {
      localStorage.removeItem('horr_token');
      window.location.href = '/login';
      return Promise.reject({ title: 'Session expired. Please log in again.', status: 401 });
    }

    let title = error.message || 'Network error';
    let errors = null;

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        title = data;
      } else if (data.title) {
        title = data.title;
        errors = data.errors || null;
      }
    }

    return Promise.reject({
      title,
      status,
      errors
    });
  }
);

export default api;
