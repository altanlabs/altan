/**
 * Connection Service - Business logic layer for connection operations
 */
import { getIntegrationPort, getPlatformPort } from '../di/index.ts';
import { BaseService } from './BaseService';
import type {
  IIntegrationPort,
  IPlatformPort,
  Connection,
  ConnectionType,
  ConnectionsResponse,
  ConnectionTypesResponse,
  ConnectionGQQuery,
  CreateConnectionData,
  CreateToolData,
  CreateResourceData,
  Tool,
  Resource,
} from './types';

/**
 * Connection Service - Handles connection operations across integration and platform APIs
 */
export class ConnectionService extends BaseService {
  private integrationPort: IIntegrationPort;
  private platformPort: IPlatformPort;

  constructor() {
    super();
    this.integrationPort = getIntegrationPort<IIntegrationPort>();
    this.platformPort = getPlatformPort<IPlatformPort>();
  }

  /**
   * Fetch user connections
   * @returns User connections
   */
  async fetchUserConnections(): Promise<Connection[]> {
    return this.execute(async () => {
      const response = await this.platformPort.fetchUserConnections();
      return response?.connections || [];
    }, 'Error fetching user connections');
  }

  /**
   * Fetch account connections using GraphQL query
   * @param accountId - Account ID
   * @param query - GraphQL query object
   * @returns Account connections with pagination
   */
  async fetchAccountConnections(
    accountId: string,
    query: ConnectionGQQuery
  ): Promise<ConnectionsResponse> {
    return this.execute(async () => {
      const response = await this.platformPort.fetchAccountConnectionsGQ(accountId, query);
      if (response.id !== accountId) {
        throw new Error('Invalid account ID in response');
      }
      return response.connections;
    }, 'Error fetching account connections');
  }

  /**
   * Fetch all connection types
   * @param isCompact - Whether to fetch compact version (default: false)
   * @returns Connection types
   */
  async fetchConnectionTypes(isCompact = false): Promise<ConnectionType[]> {
    return this.execute(async () => {
      const response = await this.integrationPort.fetchConnectionTypes(isCompact);
      return response?.items || [];
    }, 'Error fetching connection types');
  }

  /**
   * Fetch single connection type
   * @param connectionTypeId - Connection type ID
   * @returns Connection type
   */
  async fetchConnectionType(connectionTypeId: string): Promise<ConnectionType> {
    return this.execute(async () => {
      const response = await this.integrationPort.fetchConnectionType(connectionTypeId);
      return response.connection_type;
    }, 'Error fetching connection type');
  }

  /**
   * Fetch account-specific connection type
   * @param accountId - Account ID
   * @param connTypeId - Connection type ID
   * @returns Connection type
   */
  async fetchAccountConnectionType(
    accountId: string,
    connTypeId: string
  ): Promise<ConnectionType> {
    return this.execute(async () => {
      const response = await this.integrationPort.fetchAccountConnectionType(accountId, connTypeId);
      return response.connection_type;
    }, 'Error fetching account connection type');
  }

  /**
   * Create a new connection
   * @param accountId - Account ID
   * @param data - Connection data
   * @returns Created connection
   */
  async createConnection(accountId: string, data: CreateConnectionData): Promise<Connection> {
    return this.execute(async () => {
      const response = await this.integrationPort.createConnection(accountId, data);
      return response.connection;
    }, 'Error creating connection');
  }

  /**
   * Rename connection
   * @param connectionId - Connection ID
   * @param name - New connection name
   * @returns Updated connection
   */
  async renameConnection(connectionId: string, name: string): Promise<Connection> {
    return this.execute(async () => {
      const response = await this.integrationPort.renameConnection(connectionId, name);
      return response.connection;
    }, 'Error renaming connection');
  }

  /**
   * Update connection
   * @param connectionId - Connection ID
   * @param updates - Connection updates
   * @returns Updated connection
   */
  async updateConnection(connectionId: string, updates: Partial<Connection>): Promise<Connection> {
    return this.execute(async () => {
      const response = await this.integrationPort.updateConnection(connectionId, updates);
      return response.connection;
    }, 'Error updating connection');
  }

  /**
   * Delete connection
   * @param connectionId - Connection ID
   */
  async deleteConnection(connectionId: string): Promise<void> {
    return this.execute(async () => {
      await this.integrationPort.deleteConnection(connectionId);
    }, 'Error deleting connection');
  }

  /**
   * Test connection
   * @param connectionId - Connection ID
   * @returns Test result
   */
  async testConnection(connectionId: string): Promise<unknown> {
    return this.execute(async () => {
      return await this.integrationPort.testConnection(connectionId);
    }, 'Error testing connection');
  }

  /**
   * Create tool for a connection
   * @param connectionId - Connection ID
   * @param formData - Tool data
   * @returns Created tool
   */
  async createTool(connectionId: string, formData: CreateToolData): Promise<Tool> {
    return this.execute(async () => {
      const response = await this.integrationPort.createTool(connectionId, formData);
      return response.tool;
    }, 'Error creating tool');
  }

  /**
   * Update tool
   * @param toolId - Tool ID
   * @param formData - Tool data
   * @returns Updated tool
   */
  async updateTool(toolId: string, formData: unknown): Promise<Tool> {
    return this.execute(async () => {
      const response = await this.platformPort.updateTool(toolId, formData);
      return response.tool;
    }, 'Error updating tool');
  }

  /**
   * Create resource for a connection
   * @param connectionId - Connection ID
   * @param resourceTypeId - Resource type ID
   * @param data - Resource data
   * @returns Created resource
   */
  async createResource(
    connectionId: string,
    resourceTypeId: string,
    data: CreateResourceData
  ): Promise<Resource> {
    return this.execute(async () => {
      const response = await this.integrationPort.createResource(connectionId, resourceTypeId, data);
      return response.resource;
    }, 'Error creating resource');
  }

  /**
   * Execute action on a connection
   * @param connectionId - Connection ID
   * @param actionTypeId - Action type ID
   * @returns Action result
   */
  async executeAction(connectionId: string, actionTypeId: string): Promise<unknown> {
    return this.execute(async () => {
      return await this.integrationPort.executeAction(connectionId, actionTypeId);
    }, 'Error executing action');
  }
}

// Singleton instance
let connectionServiceInstance: ConnectionService | null = null;

/**
 * Get ConnectionService singleton instance
 * @returns ConnectionService instance
 */
export const getConnectionService = (): ConnectionService => {
  if (!connectionServiceInstance) {
    connectionServiceInstance = new ConnectionService();
  }
  return connectionServiceInstance;
};

