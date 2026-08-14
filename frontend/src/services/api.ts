import axios from 'axios';
import { handleMockApiRequest } from './mock-adapter';

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor adding stored JWT token
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('edumatrix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If on static hosting (GitHub Pages), handle via client-side mock adapter
  if (isGitHubPages) {
    const mockData = handleMockApiRequest(config.url || '', config.method?.toUpperCase() || 'GET', config.data);
    config.adapter = async () => ({
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for fallback on static hosting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.config && !error.response) {
      // Fallback for static demo environments if local backend is unreachable
      const mockData = handleMockApiRequest(error.config.url || '', error.config.method?.toUpperCase() || 'GET', error.config.data);
      return {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      };
    }
    const message = error.response?.data?.message || error.message || 'Network communication error. Please try again.';
    console.error('API Error Response:', message);
    return Promise.reject(new Error(message));
  }
);
