export const API_BASE = `${!!import.meta.env.VITE_BACKEND_DEV ? 'dev-' : ''}api.altan.ai`;
export const API_BASE_URL = `https://${API_BASE}`;
export const AUTH_API = `${API_BASE_URL}/auth`;
