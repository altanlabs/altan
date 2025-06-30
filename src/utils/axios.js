import axios from 'axios';

import { refreshToken, setSession } from './auth';
import { addResponseInterceptor } from './interceptors';

const OPTIMAI_BASE_URL = 'https://api.altan.ai';

const DEV_API_URL = 'https://api.dev.altan.ai';

const optimai_tables = axios.create({
  name: 'optimai_tables',
  baseURL: `${OPTIMAI_BASE_URL}/tables/v2`,
});

const optimai_tables_legacy = axios.create({
  name: 'optimai_tables_legacy',
  baseURL: `${OPTIMAI_BASE_URL}/tables`,
});

const optimai_root = axios.create({
  name: 'optimai_root',
  baseURL: OPTIMAI_BASE_URL,
});

const optimai = axios.create({
  name: 'optimai',
  baseURL: `${OPTIMAI_BASE_URL}/platform`,
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

const unauthorizeUser = () => {
  setSession(null, optimai);
  setSession(null, optimai_root);
  setSession(null, optimai_galaxia);
  setSession(null, optimai_shop);
  setSession(null, optimai_integration);
  setSession(null, optimai_room);
  setSession(null, optimai_tables);
  setSession(null, optimai_tables_legacy);
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

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};
