/**
 * Developer App Service - Business logic layer for developer app operations
 */
import { BaseService } from './BaseService';
import { optimai_integration } from '../utils/axios';

export interface DeveloperAppData {
  name: string;
  [key: string]: any;
}

export interface CustomAppData {
  name: string;
  [key: string]: any;
}

export interface ConnectionTypeUpdate {
  [key: string]: any;
}

export interface ActionTypeData {
  connection_type_id: string;
  name: string;
  [key: string]: any;
}

export interface ResourceTypeData {
  connection_type_id: string;
  name: string;
  [key: string]: any;
}

/**
 * Developer App Service - Handles all developer app and custom app operations
 */
export class DeveloperAppService extends BaseService {
  /**
   * Create a custom app
   * @param accountId - Account ID
   * @param payload - App data
   * @returns Created app
   */
  async createCustomApp(accountId: string, payload: CustomAppData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.post(`/account/${accountId}/custom-app`, payload);
      return response.data.app;
    }, 'Error creating custom app');
  }

  /**
   * Remove an app
   * @param appId - App ID
   * @returns Response
   */
  async removeApp(appId: string): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.delete(`/app/${appId}`);
      return response.data;
    }, 'Error removing app');
  }

  /**
   * Update connection type
   * @param connectionTypeId - Connection type ID
   * @param payload - Update data
   * @returns Updated connection type
   */
  async updateConnectionType(connectionTypeId: string, payload: ConnectionTypeUpdate): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.patch(`/connection-type/${connectionTypeId}`, payload);
      return response.data.connection_type;
    }, 'Error updating connection type');
  }

  /**
   * Create action type
   * @param payload - Action type data
   * @returns Created action type
   */
  async createActionType(payload: ActionTypeData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.post('/action/', payload);
      return response.data.action_type;
    }, 'Error creating action type');
  }

  /**
   * Patch action type
   * @param actionTypeId - Action type ID
   * @param payload - Update data
   * @returns Updated action type
   */
  async patchActionType(actionTypeId: string, payload: any): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.patch(`/action/${actionTypeId}`, payload);
      return response.data.action_type;
    }, 'Error patching action type');
  }

  /**
   * Remove action type
   * @param actionTypeId - Action type ID
   * @returns Response
   */
  async removeActionType(actionTypeId: string): Promise<void> {
    return this.execute(async () => {
      await optimai_integration.delete(`/action/${actionTypeId}`);
    }, 'Error removing action type');
  }

  /**
   * Create resource type
   * @param payload - Resource type data
   * @returns Created resource type
   */
  async createResourceType(payload: ResourceTypeData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.post('/resource-type/', payload);
      return response.data.resource_type;
    }, 'Error creating resource type');
  }

  /**
   * Patch resource type
   * @param resourceTypeId - Resource type ID
   * @param payload - Update data
   * @returns Updated resource type
   */
  async patchResourceType(resourceTypeId: string, payload: any): Promise<any> {
    return this.execute(async () => {
      const response = await optimai_integration.patch(`/resource-type/${resourceTypeId}`, payload);
      return response.data.resource_type;
    }, 'Error patching resource type');
  }

  /**
   * Remove resource type
   * @param resourceTypeId - Resource type ID
   * @returns Response
   */
  async removeResourceType(resourceTypeId: string): Promise<void> {
    return this.execute(async () => {
      await optimai_integration.delete(`/resource-type/${resourceTypeId}`);
    }, 'Error removing resource type');
  }
}

// Singleton instance
let developerAppServiceInstance: DeveloperAppService | null = null;

/**
 * Get DeveloperAppService singleton instance
 * @returns DeveloperAppService instance
 */
export const getDeveloperAppService = (): DeveloperAppService => {
  if (!developerAppServiceInstance) {
    developerAppServiceInstance = new DeveloperAppService();
  }
  return developerAppServiceInstance;
};

