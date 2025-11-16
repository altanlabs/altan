import axios from 'axios';

import { refreshToken, setSession } from './auth';
import { setupAxiosErrorTracking } from './errorTracking';
import { addResponseInterceptor } from './interceptors';

const OPTIMAI_BASE_URL = 'https://platform-api.altan.ai';
const AUTH_BASE_URL = 'https://auth.altan.ai';

const optimai_tables = axios.create({
  name: 'optimai_tables',
  baseURL: 'https://database-api.altan.ai/v3',
});

const optimai_tables_v4 = axios.create({
  name: 'optimai_tables_v4',
  baseURL: 'https://database-api.altan.ai/v4',
});

const optimai_database = axios.create({
  name: 'optimai_database',
  baseURL: 'https://database.altan.ai',
});

// pg-meta API for schema management (tables, columns, views, etc.)
const optimai_pg_meta = axios.create({
  name: 'optimai_pg_meta',
  baseURL: 'https://database-api.altan.ai/v4/pg-meta',
});

const optimai_root = axios.create({
  name: 'optimai_root',
  baseURL: OPTIMAI_BASE_URL,
  withCredentials: true,
});

const optimai = axios.create({
  name: 'optimai',
  baseURL: OPTIMAI_BASE_URL,
  withCredentials: true,
});

const optimai_integration = axios.create({
  name: 'optimai_integration',
  baseURL: 'https://integration.altan.ai',
});

const optimai_shop = axios.create({
  name: 'optimai_shop',
  baseURL: 'https://pay.altan.ai',
});

const optimai_room = axios.create({
  name: 'optimai_room',
  baseURL: 'https://room-api.altan.ai',
  withCredentials: true,
});

const optimai_galaxia = axios.create({
  name: 'optimai_galaxia',
  baseURL: `${OPTIMAI_BASE_URL}/galaxia`,
});

const optimai_auth = axios.create({
  name: 'optimai_auth',
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

const optimai_cloud = axios.create({
  name: 'optimai_cloud',
  baseURL: 'https://cloud.altan.ai',
});

const optimai_pods = axios.create({
  name: 'optimai_pods',
  baseURL: 'https://pods.altan.ai',
});

// Note: Response interceptors run in reverse order (last added runs first)
// We add auth refresh interceptors first so error tracking runs first,
// then auth refresh interceptor handles 401s
addResponseInterceptor(optimai);
addResponseInterceptor(optimai_integration);
addResponseInterceptor(optimai_shop);
addResponseInterceptor(optimai_room);
addResponseInterceptor(optimai_galaxia);
addResponseInterceptor(optimai_root);
addResponseInterceptor(optimai_tables);
addResponseInterceptor(optimai_tables_v4);
addResponseInterceptor(optimai_database);
addResponseInterceptor(optimai_pg_meta);
addResponseInterceptor(optimai_auth);
addResponseInterceptor(optimai_cloud);
addResponseInterceptor(optimai_pods);

// Helper to set session for all port adapters
const setSessionForPorts = async (accessToken) => {
  try {
    // Import lazily to avoid circular dependencies
    const { container } = await import('../di/index.ts');

    // Get all port services and update their auth tokens
    const portNames = ['roomPort', 'agentPort', 'platformPort', 'integrationPort',
      'cloudPort', 'podsPort', 'shopPort'];

    portNames.forEach((portName) => {
      try {
        if (container.has(portName)) {
          const port = container.get(portName);
          if (port.adapter && typeof port.adapter.setAuthToken === 'function') {
            port.adapter.setAuthToken(accessToken);
          }
        }
      } catch {
        // Port may not be instantiated yet, that's okay
      }
    });
  } catch (err) {
    // Container may not be initialized yet, that's okay
    // eslint-disable-next-line no-console
    console.debug('Ports not yet initialized for auth:', err.message);
  }
};

const authorizeUser = async () => {
  try {
    const { accessToken } = await refreshToken(optimai);
    setSession(accessToken, optimai);
    setSession(accessToken, optimai_root);
    setSession(accessToken, optimai_galaxia);
    setSession(accessToken, optimai_shop);
    setSession(accessToken, optimai_integration);
    setSession(accessToken, optimai_tables);
    setSession(accessToken, optimai_tables_v4);
    setSession(accessToken, optimai_database);
    setSession(accessToken, optimai_pg_meta);
    setSession(accessToken, optimai_auth);
    setSession(accessToken, optimai_cloud);
    setSession(accessToken, optimai_pods);

    // Also set session for new adapter-based ports
    await setSessionForPorts(accessToken);

    return { accessToken };
  } catch (error) {
    throw error;
  }
};

// Helper function to set session for all axios instances
export const setSessionForAllInstances = async (accessToken, originalRequest = null) => {
  setSession(accessToken, optimai, originalRequest);
  setSession(accessToken, optimai_root, originalRequest);
  setSession(accessToken, optimai_galaxia, originalRequest);
  setSession(accessToken, optimai_shop, originalRequest);
  setSession(accessToken, optimai_integration, originalRequest);
  setSession(accessToken, optimai_room, originalRequest);
  setSession(accessToken, optimai_tables, originalRequest);
  setSession(accessToken, optimai_tables_v4, originalRequest);
  setSession(accessToken, optimai_database, originalRequest);
  setSession(accessToken, optimai_pg_meta, originalRequest);
  setSession(accessToken, optimai_auth, originalRequest);
  setSession(accessToken, optimai_cloud, originalRequest);
  setSession(accessToken, optimai_pods, originalRequest);

  // Also set session for new adapter-based ports
  await setSessionForPorts(accessToken);
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
  optimai_tables_v4,
  optimai_database,
  optimai_pg_meta,
  optimai_auth,
  optimai_cloud,
  optimai_pods,
};

export const getAltanAxiosInstance = (instanceName) => {
  if (!instanceName) {
    return axios;
  }
  return axiosInstances[instanceName] || axios;
};

export {
  OPTIMAI_BASE_URL,
  AUTH_BASE_URL,
  optimai_root,
  optimai,
  optimai_room,
  optimai_integration,
  optimai_galaxia,
  optimai_shop,
  optimai_tables,
  optimai_tables_v4,
  optimai_database,
  optimai_pg_meta,
  optimai_auth,
  optimai_cloud,
  optimai_pods,
  authorizeUser,
  unauthorizeUser,
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
setupAxiosErrorTracking(optimai_tables_v4, 'optimai_tables_v4');
setupAxiosErrorTracking(optimai_database, 'optimai_database');
setupAxiosErrorTracking(optimai_pg_meta, 'optimai_pg_meta');
setupAxiosErrorTracking(optimai_cloud, 'optimai_cloud');
setupAxiosErrorTracking(optimai_pods, 'optimai_pods');

// ==================== NEW: Port-Based API (Hexagonal Architecture) ====================
// Export domain ports for new code - these provide a cleaner, more testable interface

export {
  getRoomPort,
  getAgentPort,
  getPlatformPort,
  getIntegrationPort,
  getDatabasePort,
  getCloudPort,
  getPodsPort,
  getShopPort,
  reconfigureService,
  getServiceConfig,
  resetAllServices,
  container,
} from '../di/index.ts';

// Export ports directly for convenience
export { RoomPort } from '../ports/RoomPort';
export { AgentPort } from '../ports/AgentPort';
export { PlatformPort } from '../ports/PlatformPort';
export { IntegrationPort } from '../ports/IntegrationPort';
export { DatabasePort } from '../ports/DatabasePort';
export { CloudPort } from '../ports/CloudPort';
export { PodsPort } from '../ports/PodsPort';
export { ShopPort } from '../ports/ShopPort';
