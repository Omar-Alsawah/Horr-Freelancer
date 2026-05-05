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
    if (error.response?.status === 401) {
      localStorage.removeItem('horr_token');
      window.location.href = '/login';
      return Promise.reject({ title: 'Session expired. Please log in again.', status: 401 });
    }

    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.status && data.title) {
        return Promise.reject({
          title: data.title,
          status: data.status,
          errors: data.errors || null
        });
      }
    }

    return Promise.reject({
      title: error.message || 'Network error',
      status: 0,
      errors: null
    });
  }
);

export default api;
