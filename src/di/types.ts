/**
 * Type definitions for Dependency Injection Container
 */

import type { AxiosInstance } from 'axios';

/**
 * Factory function that creates a service instance
 */
export type ServiceFactory<T = unknown> = (container: IContainer) => T;

/**
 * Container interface for dependency injection
 */
export interface IContainer {
  register<T = unknown>(name: string, factory: ServiceFactory<T>): void;
  get<T = unknown>(name: string): T;
  has(name: string): boolean;
  reset(name?: string): void;
  getRegisteredServices(): string[];
}

/**
 * Service port names
 */
export type PortName =
  | 'roomPort'
  | 'agentPort'
  | 'platformPort'
  | 'integrationPort'
  | 'databasePort'
  | 'cloudPort'
  | 'podsPort'
  | 'shopPort';

/**
 * Legacy axios instance names for backward compatibility
 */
export type LegacyInstanceName =
  | 'optimai_room'
  | 'optimai'
  | 'optimai_integration'
  | 'optimai_tables'
  | 'optimai_cloud'
  | 'optimai_pods'
  | 'optimai_shop';

/**
 * All registered service names
 */
export type ServiceName = PortName | LegacyInstanceName;

/**
 * Base port interface with axios instance
 */
export interface IBasePort {
  getAxiosInstance(): AxiosInstance;
}

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  type: string;
  baseURL?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * Complete adapter configuration object
 */
export interface AdapterConfigs {
  room: AdapterConfig;
  agent: AdapterConfig;
  platform: AdapterConfig;
  integration: AdapterConfig;
  tables: AdapterConfig;
  cloud: AdapterConfig;
  pods: AdapterConfig;
  shop: AdapterConfig;
  [key: string]: AdapterConfig;
}

