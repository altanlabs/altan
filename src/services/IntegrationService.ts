/**
 * Integration Service - Business logic layer for integration operations
 */
import { getIntegrationPort } from '../di/index.ts';
import { BaseService } from './BaseService';
import type {
  IIntegrationPort,
  AuthorizationRequest,
  FetchAuthRequestsOptions,
} from './types';

/**
 * Integration Service - Handles integration/connection operations
 */
export class IntegrationService extends BaseService {
  private port: IIntegrationPort;

  constructor() {
    super();
    this.port = getIntegrationPort<IIntegrationPort>();
  }

  /**
   * Fetch authorization requests
   * @param options - Filter options
   * @returns Authorization requests
   */
  async fetchAuthorizationRequests(
    options: FetchAuthRequestsOptions = {}
  ): Promise<AuthorizationRequest[]> {
    return this.execute(async () => {
      const { roomId, isCompleted = 'false' } = options;
      const response = await this.port.fetchAuthorizationRequests({
        roomId,
        isCompleted: String(isCompleted),
      });
      return response?.authorization_requests || [];
    }, 'Error fetching authorization requests');
  }
}

// Singleton instance
let integrationServiceInstance: IntegrationService | null = null;

/**
 * Get IntegrationService singleton instance
 * @returns IntegrationService instance
 */
export const getIntegrationService = (): IntegrationService => {
  if (!integrationServiceInstance) {
    integrationServiceInstance = new IntegrationService();
  }
  return integrationServiceInstance;
};

