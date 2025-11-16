/**
 * Environment-specific URL configurations
 * Defines base URLs for different environments (production, staging, development, local)
 */
export const ENVIRONMENTS = {
  production: {
    room: 'https://room-api.altan.ai',
    agent: 'https://ai.altan.ai',
    integration: 'https://integration.altan.ai',
    platform: 'https://platform-api.altan.ai',
    tables: 'https://database-api.altan.ai',
    tablesV4: 'https://database-api.altan.ai',
    database: 'https://database.altan.ai',
    pgMeta: 'https://database-api.altan.ai',
    shop: 'https://pay.altan.ai',
    galaxia: 'https://platform-api.altan.ai',
    root: 'https://platform-api.altan.ai',
    auth: 'https://auth.altan.ai',
    cloud: 'https://cloud.altan.ai',
    pods: 'https://pods.altan.ai',
  },
  staging: {
    room: 'https://room-api-staging.altan.ai',
    agent: 'https://ai-staging.altan.ai',
    integration: 'https://integration-staging.altan.ai',
    platform: 'https://platform-api-staging.altan.ai',
    tables: 'https://database-api-staging.altan.ai',
    tablesV4: 'https://database-api-staging.altan.ai',
    database: 'https://database-staging.altan.ai',
    pgMeta: 'https://database-api-staging.altan.ai',
    shop: 'https://pay-staging.altan.ai',
    galaxia: 'https://platform-api-staging.altan.ai',
    root: 'https://platform-api-staging.altan.ai',
    auth: 'https://auth-staging.altan.ai',
    cloud: 'https://cloud-staging.altan.ai',
    pods: 'https://pods-staging.altan.ai',
  },
  development: {
    room: 'https://room-api-dev.altan.ai',
    agent: 'https://ai-dev.altan.ai',
    integration: 'https://integration-dev.altan.ai',
    platform: 'https://platform-api-dev.altan.ai',
    tables: 'https://database-api-dev.altan.ai',
    tablesV4: 'https://database-api-dev.altan.ai',
    database: 'https://database-dev.altan.ai',
    pgMeta: 'https://database-api-dev.altan.ai',
    shop: 'https://pay-dev.altan.ai',
    galaxia: 'https://platform-api-dev.altan.ai',
    root: 'https://platform-api-dev.altan.ai',
    auth: 'https://auth-dev.altan.ai',
    cloud: 'https://cloud-dev.altan.ai',
    pods: 'https://pods-dev.altan.ai',
  },
  local: {
    room: 'http://localhost:8001',
    agent: 'http://localhost:8002',
    integration: 'http://localhost:8003',
    platform: 'http://localhost:8000',
    tables: 'http://localhost:8004',
    tablesV4: 'http://localhost:8004',
    database: 'http://localhost:8005',
    pgMeta: 'http://localhost:8004',
    shop: 'http://localhost:8006',
    galaxia: 'http://localhost:8000',
    root: 'http://localhost:8000',
    auth: 'http://localhost:8007',
    cloud: 'http://localhost:8008',
    pods: 'http://localhost:8009',
  },
};

/**
 * Default API versions for each service
 */
const DEFAULT_VERSIONS = {
  room: 'v2',
  agent: 'api/v1',
  integration: '',
  platform: '',
  tables: 'v3',
  tablesV4: 'v4',
  database: '',
  pgMeta: 'v4/pg-meta',
  shop: '',
  galaxia: 'galaxia',
  root: '',
  auth: '',
  cloud: '',
  pods: '',
};

/**
 * Build adapter configuration for a specific environment
 * @param {string} env - Environment name (production, staging, development, local)
 * @param {Object} overrides - Per-service overrides { serviceName: { baseURL, version, etc } }
 * @returns {Object} Complete adapter configuration
 */
export const buildConfigForEnvironment = (env, overrides = {}) => {
  const envUrls = ENVIRONMENTS[env] || ENVIRONMENTS.production;
  const config = {};

  Object.keys(envUrls).forEach((serviceName) => {
    config[serviceName] = {
      baseURL: envUrls[serviceName],
      version: DEFAULT_VERSIONS[serviceName] || '',
      type: 'http',
      withCredentials: ['room', 'platform', 'root', 'auth'].includes(serviceName),
      ...overrides[serviceName],
    };
  });

  return config;
};

/**
 * Helper to quickly switch entire application to a different environment
 * @param {string} env - Environment name
 */
export const switchToEnvironment = (env) => {
  if (typeof window !== 'undefined') {
    window.ALTAN_ADAPTER_CONFIG = buildConfigForEnvironment(env);
    console.log(`✅ Switched all services to ${env} environment`);
  }
};

