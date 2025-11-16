/**
 * Convenience re-exports for API services
 * Import ports from this file for cleaner imports
 * 
 * @example
 * import { getRoomPort, getAgentPort } from '../api';
 * 
 * Instead of:
 * import { getRoomPort, getAgentPort } from '../di/index.ts';
 */

// Re-export everything from DI container
export {
  // Port getters
  getRoomPort,
  getAgentPort,
  getPlatformPort,
  getIntegrationPort,
  getDatabasePort,
  getCloudPort,
  getPodsPort,
  getShopPort,
  
  // Configuration functions
  reconfigureService,
  getServiceConfig,
  resetAllServices,
  listServices,
  hasService,
  
  // Container (for advanced use)
  container,
} from '../di/index.ts';

// Re-export port interfaces for type checking
export { RoomPort } from '../ports/RoomPort';
export { AgentPort } from '../ports/AgentPort';
export { PlatformPort } from '../ports/PlatformPort';
export { IntegrationPort } from '../ports/IntegrationPort';
export { DatabasePort } from '../ports/DatabasePort';
export { CloudPort } from '../ports/CloudPort';
export { PodsPort } from '../ports/PodsPort';
export { ShopPort } from '../ports/ShopPort';

// Re-export environment helpers
export { 
  switchToEnvironment, 
  buildConfigForEnvironment,
  ENVIRONMENTS 
} from '../config/environments';

