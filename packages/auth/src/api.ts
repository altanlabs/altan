import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AUTH_BASE_URL } from './constants';

export const createAuthenticatedApi = (tableId: string, storageKey: string = 'auth_user'): AxiosInstance => {
  const api = axios.create({
    baseURL: AUTH_BASE_URL,
    withCredentials: true,
  });

  // Add request interceptor to inject the auth token
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Always try localStorage first
    const token = localStorage.getItem(`${storageKey}_token`);
    
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  });

  // Add response interceptor to handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_token`);
      }
      return Promise.reject(error);
    }
  );

  return api;
}; 