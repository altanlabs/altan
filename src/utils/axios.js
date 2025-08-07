import axios from 'axios';

import { refreshToken, setSession } from './auth';
import { addResponseInterceptor } from './interceptors';

const OPTIMAI_BASE_URL = 'https://api.altan.ai';

const optimai_tables = axios.create({
  name: 'optimai_tables',
  baseURL: "https://database-api.altan.ai/v3",
});

const optimai_tables_legacy = axios.create({
  name: 'optimai_tables_legacy',
  baseURL: "https://database-api.altan.ai/v3",
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
  baseURL: `${OPTIMAI_BASE_URL}/integration`,
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

const unauthorizeUser = () => {
  setSession(null, optimai);
  setSession(null, optimai_root);
  setSession(null, optimai_galaxia);
  setSession(null, optimai_shop);
  setSession(null, optimai_integration);
  setSession(null, optimai_room);
  setSession(null, optimai_tables);
  setSession(null, optimai_tables_legacy);
  setSession(null, optimai_agent);
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
