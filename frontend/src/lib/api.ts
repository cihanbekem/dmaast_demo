import axios from 'axios';

// API base URL configuration
// - Development: Vite proxy forwards /api/* to localhost:8000
// - Production (Docker): nginx proxies /api/* to backend container
// - Fallback: Direct connection to localhost:8000
const getBaseUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production build, use /api (nginx proxy)
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Development fallback - direct connection
  return 'http://localhost:8000';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
