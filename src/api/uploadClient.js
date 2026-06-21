import axios from 'axios';

const uploadClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:5200',
});

uploadClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('horr_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // ⚠️ DO NOT set Content-Type here — ever.
  // The browser must set it automatically with the correct multipart boundary.
  return config;
});

export default uploadClient;
