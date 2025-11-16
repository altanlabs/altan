import { Container } from './Container';
import { registerAdapters } from './registerAdapters';
import type { AxiosInstance } from 'axios';
import type { AdapterConfig, IBasePort } from './types';

// Re-export types
export type { IContainer, ServiceFactory, PortName, ServiceName, AdapterConfig } from './types';
export { Container } from './Container';
export { registerAdapters } from './registerAdapters';

/**
 * Global singleton DI container
 * Manages all service adapters and their dependencies
 */
export const container = new Container();

// Initialize container with all adapters
registerAdapters(container);

// ==================== Port Getters ====================
// Convenience functions to access domain ports

/**
 * Get Room port for room/chat operations
 * @returns RoomPort instance
 */
export const getRoomPort = <T = IBasePort>(): T => container.get<T>('roomPort');

/**
 * Get Agent port for AI agent operations
 * @returns AgentPort instance
 */
export const getAgentPort = <T = IBasePort>(): T => container.get<T>('agentPort');

/**
 * Get Platform port for platform operations (accounts, agents, templates)
 * @returns PlatformPort instance
 */
export const getPlatformPort = <T = IBasePort>(): T => container.get<T>('platformPort');

/**
 * Get Integration port for connection/integration operations
 * @returns IntegrationPort instance
 */
export const getIntegrationPort = <T = IBasePort>(): T => container.get<T>('integrationPort');

/**
 * Get Database port for database/table operations
 * @returns DatabasePort instance
 */
export const getDatabasePort = <T = IBasePort>(): T => container.get<T>('databasePort');

/**
 * Get Cloud port for cloud infrastructure operations
 * @returns CloudPort instance
 */
export const getCloudPort = <T = IBasePort>(): T => container.get<T>('cloudPort');

/**
 * Get Pods port for interface/deployment operations
 * @returns PodsPort instance
 */
export const getPodsPort = <T = IBasePort>(): T => container.get<T>('podsPort');

/**
 * Get Shop port for payment/subscription operations
 * @returns ShopPort instance
 */
export const getShopPort = <T = IBasePort>(): T => container.get<T>('shopPort');

/**
 * Get Task port for plan and task operations
 * @returns TaskPort instance
 */
export const getTaskPort = <T = IBasePort>(): T => container.get<T>('taskPort');

// ==================== Service Getters ====================
// Business logic services

/**
 * Get MessageService for message operations
 * @returns MessageService instance
 */
export const getMessageService = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getMessageService: getService } = require('../services/MessageService');
  return getService();
};

/**
 * Get ThreadService for thread operations
 * @returns ThreadService instance
 */
export const getThreadService = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getThreadService: getService } = require('../services/ThreadService');
  return getService();
};

/**
 * Get TabService for tab management
 * @returns TabService instance
 */
export const getTabService = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getTabService: getService } = require('../services/TabService');
  return getService();
};

/**
 * Get VoiceService for voice conversation management
 * @returns VoiceService instance
 */
export const getVoiceService = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getVoiceService: getService } = require('../services/VoiceService');
  return getService();
};

/**
 * Get DatabaseService for database metadata operations
 * @returns DatabaseService instance
 */
export const getDatabaseService = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getDatabaseService: getService } = require('../services/DatabaseService');
  return getService();
};

// ==================== Configuration Functions ====================

/**
 * Reconfigure a specific service
 * Forces re-instantiation with new configuration
 * @param serviceName - Service name (room, agent, platform, etc.)
 * @param config - New configuration
 * @example
 * reconfigureService('room', {
 *   baseURL: 'http://localhost:8001',
 *   version: 'v2'
 * });
 */
export const reconfigureService = (serviceName: string, config: AdapterConfig): void => {
  if (typeof window === 'undefined') {
    console.warn('reconfigureService only works in browser environment');
    return;
  }

  // Update global config
  (window as Window & { ALTAN_ADAPTER_CONFIG?: Record<string, AdapterConfig> }).ALTAN_ADAPTER_CONFIG = {
    ...((window as Window & { ALTAN_ADAPTER_CONFIG?: Record<string, AdapterConfig> }).ALTAN_ADAPTER_CONFIG || {}),
    [serviceName]: config,
  };

  // Reset service to force re-instantiation with new config
  const portName = `${serviceName}Port`;
  container.reset(portName);

  // Also reset legacy axios instance if it exists
  const legacyName = `optimai_${serviceName}`;
  if (container.has(legacyName)) {
    container.reset(legacyName);
  }

  console.log(`✅ Reconfigured ${serviceName} service:`, config);
};

/**
 * Get current configuration for a service
 * @param serviceName - Service name
 * @returns Current configuration
 */
export const getServiceConfig = (serviceName: string): AdapterConfig => {
  if (
    typeof window !== 'undefined' &&
    (window as Window & { ALTAN_ADAPTER_CONFIG?: Record<string, AdapterConfig> }).ALTAN_ADAPTER_CONFIG?.[serviceName]
  ) {
    return (window as Window & { ALTAN_ADAPTER_CONFIG?: Record<string, AdapterConfig> }).ALTAN_ADAPTER_CONFIG![serviceName];
  }

  // Get from default config
  const { getAdapterConfig } = require('../config/adapter-config');
  const config = getAdapterConfig();
  return config[serviceName];
};

/**
 * Reset all services to force re-instantiation
 * Useful for testing or when switching environments
 */
export const resetAllServices = (): void => {
  container.reset();
  console.log('✅ Reset all services');
};

// ==================== Legacy Axios Instance Getters ====================
// For backward compatibility during migration

/**
 * Get legacy axios instance for optimai (platform)
 * @deprecated Use getPlatformPort() instead
 * @returns AxiosInstance
 */
export const getOptimai = (): AxiosInstance => container.get<AxiosInstance>('optimai');

/**
 * Get legacy axios instance for optimai_integration
 * @deprecated Use getIntegrationPort() instead
 * @returns AxiosInstance
 */
export const getOptimaiIntegration = (): AxiosInstance => container.get<AxiosInstance>('optimai_integration');

/**
 * Get legacy axios instance for optimai_tables
 * @deprecated Use getDatabasePort() instead
 * @returns AxiosInstance
 */
export const getOptimaiTables = (): AxiosInstance => container.get<AxiosInstance>('optimai_tables');

/**
 * Get legacy axios instance for optimai_cloud
 * @deprecated Use getCloudPort() instead
 * @returns AxiosInstance
 */
export const getOptimaiCloud = (): AxiosInstance => container.get<AxiosInstance>('optimai_cloud');

/**
 * Get legacy axios instance for optimai_pods
 * @deprecated Use getPodsPort() instead
 * @returns AxiosInstance
 */
export const getOptimaiPods = (): AxiosInstance => container.get<AxiosInstance>('optimai_pods');

/**
 * Get legacy axios instance for optimai_shop
 * @deprecated Use getShopPort() instead
 * @returns AxiosInstance
 */
export const getOptimaiShop = (): AxiosInstance => container.get<AxiosInstance>('optimai_shop');

// ==================== Dev Tools ====================

/**
 * Get list of all registered services
 * Useful for debugging
 * @returns Array of service names
 */
export const listServices = (): string[] => {
  return container.getRegisteredServices();
};

/**
 * Check if a service is registered
 * @param serviceName - Service name
 * @returns True if service exists
 */
export const hasService = (serviceName: string): boolean => {
  return container.has(`${serviceName}Port`);
};

