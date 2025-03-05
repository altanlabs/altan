import axios from 'axios';
import { AUTH_BASE_URL } from './constants';
export const createAuthenticatedApi = (tableId, storageKey = 'auth_user') => {
    const api = axios.create({
        baseURL: AUTH_BASE_URL,
        withCredentials: true,
    });
    // Add request interceptor to inject the auth token
    api.interceptors.request.use((config) => {
        // Always try localStorage first
        const token = localStorage.getItem(`${storageKey}_token`);
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    });
    // Add response interceptor to handle errors
    api.interceptors.response.use((response) => response, (error) => {
        var _a;
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}_token`);
        }
        return Promise.reject(error);
    });
    return api;
};
//# sourceMappingURL=api.js.map