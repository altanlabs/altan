// Default adapter configuration for all services
export const DEFAULT_ADAPTER_CONFIG = {
  room: {
    baseURL: 'https://room-api.altan.ai',
    version: 'v2',
    type: 'http',
    withCredentials: true,
  },
  agent: {
    baseURL: 'https://ai.altan.ai',
    version: 'api/v1',
    type: 'http',
    withCredentials: false,
  },
  integration: {
    baseURL: 'https://integration.altan.ai',
    version: '',
    type: 'http',
    withCredentials: false,
  },
  platform: {
    baseURL: 'https://platform-api.altan.ai',
    version: '',
    type: 'http',
    withCredentials: true,
  },
  tables: {
    baseURL: 'https://database-api.altan.ai',
    version: 'v3',
    type: 'http',
    withCredentials: false,
  },
  tablesV4: {
    baseURL: 'https://database-api.altan.ai',
    version: 'v4',
    type: 'http',
    withCredentials: false,
  },
  database: {
    baseURL: 'https://database.altan.ai',
    version: '',
    type: 'http',
    withCredentials: false,
  },
  pgMeta: {
    baseURL: 'https://database-api.altan.ai',
    version: 'v4/pg-meta',
    type: 'http',
    withCredentials: false,
  },
  shop: {
    baseURL: 'https://pay.altan.ai',
    version: '',
    type: 'http',
    withCredentials: false,
  },
  galaxia: {
    baseURL: 'https://platform-api.altan.ai',
    version: 'galaxia',
    type: 'http',
    withCredentials: false,
  },
  root: {
    baseURL: 'https://platform-api.altan.ai',
    version: '',
    type: 'http',
    withCredentials: true,
  },
  auth: {
    baseURL: 'https://auth.altan.ai',
    version: '',
    type: 'http',
    withCredentials: true,
  },
  cloud: {
    baseURL: 'https://cloud.altan.ai',
    version: '',
    type: 'http',
    withCredentials: false,
  },
  pods: {
    baseURL: 'https://pods.altan.ai',
    version: '',
    type: 'http',
    withCredentials: false,
  },
};

/**
 * Get adapter configuration with runtime override support
 * Checks window.ALTAN_ADAPTER_CONFIG for runtime overrides
 * @returns {Object} Merged configuration
 */
export const getAdapterConfig = () => {
  if (typeof window !== 'undefined' && window.ALTAN_ADAPTER_CONFIG) {
    // Deep merge to allow partial overrides
    const merged = { ...DEFAULT_ADAPTER_CONFIG };
    Object.keys(window.ALTAN_ADAPTER_CONFIG).forEach((key) => {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...window.ALTAN_ADAPTER_CONFIG[key] };
      } else {
        merged[key] = window.ALTAN_ADAPTER_CONFIG[key];
      }
    });
    return merged;
  }
  return DEFAULT_ADAPTER_CONFIG;
};

/**
 * Get configuration for a specific service
 * @param {string} serviceName - Name of the service
 * @returns {Object} Service configuration
 */
export const getServiceConfig = (serviceName) => {
  const config = getAdapterConfig();
  if (!config[serviceName]) {
    throw new Error(`No configuration found for service: ${serviceName}`);
  }
  return config[serviceName];
};

