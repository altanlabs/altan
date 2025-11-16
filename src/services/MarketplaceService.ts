/**
 * Marketplace Service - Business logic layer for marketplace operations
 */
import { BaseService } from './BaseService';
import type { MarketplaceTemplate, MarketplaceTemplatesResponse } from './types';
import { optimai } from '../utils/axios';

/**
 * Valid template entity types in the marketplace
 */
export type TemplateEntityType = 'altaner' | 'workflow' | 'agent' | 'form' | 'interface' | 'database';

/**
 * Marketplace Service - Handles all marketplace-related operations
 */
export class MarketplaceService extends BaseService {
  /**
   * Fetch marketplace templates by type
   * @param templateType - Type of templates to fetch
   * @returns Marketplace templates response
   */
  async fetchMarketplaceTemplates(templateType: TemplateEntityType): Promise<MarketplaceTemplatesResponse> {
    return this.execute(async () => {
      const response = await optimai.get(`/marketplace/templates/${templateType}`);
      return {
        templates: response.data.templates || [],
      };
    }, `Error fetching marketplace templates for ${templateType}`);
  }
}

// Singleton instance
let marketplaceServiceInstance: MarketplaceService | null = null;

/**
 * Get MarketplaceService singleton instance
 * @returns MarketplaceService instance
 */
export const getMarketplaceService = (): MarketplaceService => {
  if (!marketplaceServiceInstance) {
    marketplaceServiceInstance = new MarketplaceService();
  }
  return marketplaceServiceInstance;
};

