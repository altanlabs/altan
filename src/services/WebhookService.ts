/**
 * Webhook Service - Business logic layer for webhook operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface WebhookData {
  name: string;
  url: string;
  [key: string]: any;
}

/**
 * Webhook Service - Handles all webhook-related operations
 */
export class WebhookService extends BaseService {
  /**
   * Create a webhook
   * @param accountId - Account ID
   * @param data - Webhook data
   * @returns Created webhook
   */
  async createWebhook(accountId: string, data: WebhookData): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.post(`/account/${accountId}/hook`, data);
      return response.data.hook;
    }, 'Error creating webhook');
  }

  /**
   * Delete a webhook
   * @param webhookId - Webhook ID
   * @returns Response
   */
  async deleteWebhook(webhookId: string): Promise<any> {
    return this.execute(async () => {
      const response = await optimai.delete(`/graph/webhook/${webhookId}`);
      return response.data;
    }, 'Error deleting webhook');
  }
}

// Singleton instance
let webhookServiceInstance: WebhookService | null = null;

/**
 * Get WebhookService singleton instance
 * @returns WebhookService instance
 */
export const getWebhookService = (): WebhookService => {
  if (!webhookServiceInstance) {
    webhookServiceInstance = new WebhookService();
  }
  return webhookServiceInstance;
};

