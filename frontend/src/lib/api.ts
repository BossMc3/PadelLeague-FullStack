import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const requestUrl = config.url ?? '';
    const isAuthEndpoint = requestUrl.startsWith('/auth/');

    // Never attach bearer token to auth endpoints; stale tokens can trigger 403 on some backends.
    if (isAuthEndpoint && config.headers) {
      delete config.headers.Authorization;
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
