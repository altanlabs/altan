import { AgentHttpAdapter } from '../adapters/http/AgentHttpAdapter';
import { CloudHttpAdapter } from '../adapters/http/CloudHttpAdapter';
import { DatabaseHttpAdapter } from '../adapters/http/DatabaseHttpAdapter';
import { IntegrationHttpAdapter } from '../adapters/http/IntegrationHttpAdapter';
import { PlatformHttpAdapter } from '../adapters/http/PlatformHttpAdapter';
import { PodsHttpAdapter } from '../adapters/http/PodsHttpAdapter';
import { RoomHttpAdapter } from '../adapters/http/RoomHttpAdapter';
import { ShopHttpAdapter } from '../adapters/http/ShopHttpAdapter';
import { TaskHttpAdapter } from '../adapters/http/TaskHttpAdapter';
import { getAdapterConfig } from '../config/adapter-config';
import type { IContainer, IBasePort } from './types';

/**
 * Register all service adapters in the DI container
 * @param container - DI container instance
 * @returns Configured container
 */
export const registerAdapters = (container: IContainer): IContainer => {
  const config = getAdapterConfig();

  // Register Room adapter
  container.register('roomPort', () => {
    const cfg = config.room;
    if (cfg.type === 'http') {
      return new RoomHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for room: ${cfg.type}`);
  });

  // Register Agent adapter
  container.register('agentPort', () => {
    const cfg = config.agent;
    if (cfg.type === 'http') {
      return new AgentHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for agent: ${cfg.type}`);
  });

  // Register Platform adapter
  container.register('platformPort', () => {
    const cfg = config.platform;
    if (cfg.type === 'http') {
      return new PlatformHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for platform: ${cfg.type}`);
  });

  // Register Integration adapter
  container.register('integrationPort', () => {
    const cfg = config.integration;
    if (cfg.type === 'http') {
      return new IntegrationHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for integration: ${cfg.type}`);
  });

  // Register Database adapter (combines tables, tablesV4, database, pgMeta)
  container.register('databasePort', () => {
    const cfg = config.tables; // Use tables config as primary
    if (cfg.type === 'http') {
      return new DatabaseHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for database: ${cfg.type}`);
  });

  // Register Cloud adapter
  container.register('cloudPort', () => {
    const cfg = config.cloud;
    if (cfg.type === 'http') {
      return new CloudHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for cloud: ${cfg.type}`);
  });

  // Register Pods adapter
  container.register('podsPort', () => {
    const cfg = config.pods;
    if (cfg.type === 'http') {
      return new PodsHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for pods: ${cfg.type}`);
  });

  // Register Shop adapter
  container.register('shopPort', () => {
    const cfg = config.shop;
    if (cfg.type === 'http') {
      return new ShopHttpAdapter(cfg);
    }
    throw new Error(`Unknown adapter type for shop: ${cfg.type}`);
  });

  // Register Task adapter (for CAGI plans and tasks)
  container.register('taskPort', () => {
    // Task adapter uses hardcoded CAGI URL, no config needed
    return new TaskHttpAdapter({});
  });

  // Register legacy axios-compatible instances for backward compatibility
  // These provide direct axios instance access for gradual migration
  container.register('optimai_room', () => {
    const roomPort = container.get<IBasePort>('roomPort');
    return roomPort.getAxiosInstance();
  });

  container.register('optimai', () => {
    const platformPort = container.get<IBasePort>('platformPort');
    return platformPort.getAxiosInstance();
  });

  container.register('optimai_integration', () => {
    const integrationPort = container.get<IBasePort>('integrationPort');
    return integrationPort.getAxiosInstance();
  });

  container.register('optimai_tables', () => {
    const databasePort = container.get<IBasePort>('databasePort');
    return databasePort.getAxiosInstance();
  });

  container.register('optimai_cloud', () => {
    const cloudPort = container.get<IBasePort>('cloudPort');
    return cloudPort.getAxiosInstance();
  });

  container.register('optimai_pods', () => {
    const podsPort = container.get<IBasePort>('podsPort');
    return podsPort.getAxiosInstance();
  });

  container.register('optimai_shop', () => {
    const shopPort = container.get<IBasePort>('shopPort');
    return shopPort.getAxiosInstance();
  });

  return container;
};

