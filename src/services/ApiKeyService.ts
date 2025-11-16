/**
 * API Key Service - Business logic layer for API key operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

/**
 * API Key Service - Handles all API key operations
 */
export class ApiKeyService extends BaseService {
  /**
   * Delete an API token
   * @param tokenId - Token ID
   * @returns Response
   */
  async deleteAPIToken(tokenId: string): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.delete(`/apikey/${tokenId}`);
      return response.data;
    }, 'Error deleting API token');
  }

  /**
   * Fetch an API token
   * @param tokenId - Token ID
   * @returns Token data
   */
  async fetchAPIToken(tokenId: string): Promise<string> {
    return this.execute(async () => {
      const response = await optimai.get(`/apikey/${tokenId}`);
      return response.data.token;
    }, 'Error fetching API token');
  }
}

// Singleton instance
let apiKeyServiceInstance: ApiKeyService | null = null;

/**
 * Get ApiKeyService singleton instance
 * @returns ApiKeyService instance
 */
export const getApiKeyService = (): ApiKeyService => {
  if (!apiKeyServiceInstance) {
    apiKeyServiceInstance = new ApiKeyService();
  }
  return apiKeyServiceInstance;
};

