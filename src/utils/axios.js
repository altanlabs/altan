import axios from 'axios';

import { refreshToken, setSession } from './auth';
import { setupAxiosErrorTracking } from './errorTracking';
import { addResponseInterceptor } from './interceptors';

const OPTIMAI_BASE_URL = 'https://api.altan.ai';

const optimai_tables = axios.create({
  name: 'optimai_tables',
  baseURL: 'https://database-api.altan.ai/v3',
});

const optimai_tables_legacy = axios.create({
  name: 'optimai_tables_legacy',
  baseURL: 'https://database-api.altan.ai/v3',
});

const optimai_database = axios.create({
  name: 'optimai_database',
  baseURL: 'https://database.altan.ai',
});

const optimai_root = axios.create({
  name: 'optimai_root',
  baseURL: OPTIMAI_BASE_URL,
  withCredentials: true,
});

const optimai = axios.create({
  name: 'optimai',
  baseURL: `${OPTIMAI_BASE_URL}/platform`,
  withCredentials: true,
});

const optimai_integration = axios.create({
  name: 'optimai_integration',
  baseURL: 'https://integration.altan.ai',
});

const optimai_agent = axios.create({
  name: 'optimai_agent',
  baseURL: `${OPTIMAI_BASE_URL}/agent`,
});

const optimai_shop = axios.create({
  name: 'optimai_shop',
  baseURL: `${OPTIMAI_BASE_URL}/shop`,
});

const optimai_room = axios.create({
  name: 'optimai_room',
  baseURL: `${OPTIMAI_BASE_URL}/room`,
  withCredentials: true,
});

const optimai_galaxia = axios.create({
  name: 'optimai_galaxia',
  baseURL: `${OPTIMAI_BASE_URL}/galaxia`,
});

addResponseInterceptor(optimai);
addResponseInterceptor(optimai_integration);
addResponseInterceptor(optimai_shop);
addResponseInterceptor(optimai_room);
addResponseInterceptor(optimai_galaxia);
addResponseInterceptor(optimai_root);
addResponseInterceptor(optimai_tables);
addResponseInterceptor(optimai_agent);
addResponseInterceptor(optimai_tables_legacy);
addResponseInterceptor(optimai_database);

const authorizeUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { accessToken } = await refreshToken(optimai);
      setSession(accessToken, optimai);
      setSession(accessToken, optimai_root);
      setSession(accessToken, optimai_galaxia);
      setSession(accessToken, optimai_shop);
      setSession(accessToken, optimai_integration);
      setSession(accessToken, optimai_tables);
      setSession(accessToken, optimai_agent);
      setSession(accessToken, optimai_tables_legacy);
      setSession(accessToken, optimai_database);
      resolve({ accessToken });
    } catch (error) {
      reject(error);
    }
  });
};

const authorizeGuest = async (guestToken) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔑 authorizeGuest called with token:', guestToken);

      // For guest authentication, we rely on cookies set by the parent widget
      // The axios instances should use withCredentials: true to include cookies
      console.log('🔑 Setting up guest authentication for axios instances');

      // If a guest token is provided, set it as authorization header
      if (guestToken) {
        // Extract actual token string if it's an object
        let tokenString = guestToken;
        if (typeof guestToken === 'object' && guestToken !== null) {
          tokenString = guestToken.access_token || guestToken.token || null;
          console.log('🔑 Extracted token string from object:', tokenString);
        }

        if (tokenString) {
          console.log('✅ Setting authorization headers with guest token string');
          setSession(tokenString, optimai_room);
          setSession(tokenString, optimai);
          setSession(tokenString, optimai_root);
          setSession(tokenString, optimai_tables);
          setSession(tokenString, optimai_tables_legacy);
          setSession(tokenString, optimai_galaxia);
          setSession(tokenString, optimai_shop);
          setSession(tokenString, optimai_integration);
          setSession(tokenString, optimai_agent);
          setSession(tokenString, optimai_database);
        } else {
          console.warn('⚠️ Could not extract token string from:', guestToken);
        }
      } else {
        console.warn('⚠️ No guest token provided, relying on cookies only');
      }

      resolve({ guestAuthenticated: true });
    } catch (error) {
      console.error('❌ Error in authorizeGuest:', error);
      reject(error);
    }
  });
};

// Helper function to set session for all axios instances
export const setSessionForAllInstances = (accessToken, originalRequest = null) => {
  setSession(accessToken, optimai, originalRequest);
  setSession(accessToken, optimai_root, originalRequest);
  setSession(accessToken, optimai_galaxia, originalRequest);
  setSession(accessToken, optimai_shop, originalRequest);
  setSession(accessToken, optimai_integration, originalRequest);
  setSession(accessToken, optimai_room, originalRequest);
  setSession(accessToken, optimai_tables, originalRequest);
  setSession(accessToken, optimai_tables_legacy, originalRequest);
  setSession(accessToken, optimai_agent, originalRequest);
  setSession(accessToken, optimai_database, originalRequest);
};

const unauthorizeUser = () => {
  setSessionForAllInstances(null);
};

const axiosInstances = {
  optimai_root,
  optimai,
  optimai_room,
  optimai_integration,
  optimai_galaxia,
  optimai_shop,
  optimai_tables,
  optimai_agent,
  optimai_tables_legacy,
  optimai_database,
};

export const getAltanAxiosInstance = (instanceName) => {
  if (!instanceName) {
    return axios;
  }
  return axiosInstances[instanceName] || axios;
};

export {
  OPTIMAI_BASE_URL,
  optimai_root,
  optimai,
  optimai_room,
  optimai_integration,
  optimai_galaxia,
  optimai_shop,
  optimai_tables,
  optimai_agent,
  optimai_tables_legacy,
  optimai_database,
  authorizeUser,
  authorizeGuest,
  unauthorizeUser,
};

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await optimai.get(url, { ...config });

  return res.data;
};

// Set up error tracking for all axios instances (imported at top)
// Add error tracking to all axios instances
setupAxiosErrorTracking(optimai, 'optimai');
setupAxiosErrorTracking(optimai_integration, 'optimai_integration');
setupAxiosErrorTracking(optimai_shop, 'optimai_shop');
setupAxiosErrorTracking(optimai_room, 'optimai_room');
setupAxiosErrorTracking(optimai_galaxia, 'optimai_galaxia');
setupAxiosErrorTracking(optimai_root, 'optimai_root');
setupAxiosErrorTracking(optimai_tables, 'optimai_tables');
setupAxiosErrorTracking(optimai_agent, 'optimai_agent');
setupAxiosErrorTracking(optimai_tables_legacy, 'optimai_tables_legacy');
setupAxiosErrorTracking(optimai_database, 'optimai_database');
