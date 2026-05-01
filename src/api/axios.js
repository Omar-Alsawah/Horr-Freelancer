import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7070',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
