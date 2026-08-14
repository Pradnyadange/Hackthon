import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor adding stored JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edumatrix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network communication error. Please try again.';
    console.error('API Error Response:', message);
    return Promise.reject(new Error(message));
  }
);
