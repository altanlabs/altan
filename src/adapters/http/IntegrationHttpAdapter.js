import { IntegrationPort } from '../../ports/IntegrationPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Integration HTTP Adapter
 * Implements IntegrationPort using HTTP/REST API
 */
export class IntegrationHttpAdapter extends IntegrationPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_integration',
    });
  }

  // ==================== Connection Operations ====================

  async fetchConnections(options = {}) {
    const params = new URLSearchParams();
    if (options.accountId) params.append('account_id', options.accountId);
    if (options.limit) params.append('limit', options.limit);
    if (options.cursor) params.append('cursor', options.cursor);
    
    const queryString = params.toString();
    const url = queryString ? `connection?${queryString}` : 'connection';
    return this.adapter.get(url);
  }

  async fetchConnectionTypes(isCompact = false) {
    return this.adapter.get(`connection-type/all?is_compact=${isCompact}`);
  }

  async fetchConnectionType(connectionTypeId) {
    return this.adapter.get(`connection-type/${connectionTypeId}`);
  }

  async fetchAccountConnectionType(accountId, connTypeId) {
    return this.adapter.get(`account/${accountId}/connection_type/${connTypeId}`);
  }

  async createConnection(accountId, connectionData) {
    return this.adapter.post(`account/${accountId}/standard-connection`, connectionData);
  }

  async renameConnection(connectionId, name) {
    return this.adapter.patch(`connection/${connectionId}/rename`, { name });
  }

  async updateConnection(connectionId, updates) {
    return this.adapter.patch(`connection/${connectionId}`, updates);
  }

  async deleteConnection(connectionId) {
    return this.adapter.delete(`connections/${connectionId}`);
  }

  async testConnection(connectionId) {
    return this.adapter.post(`connection/${connectionId}/test`);
  }

  async createTool(connectionId, formData) {
    return this.adapter.post(`connection/${connectionId}/tool`, formData);
  }

  async createResource(connectionId, resourceTypeId, data) {
    return this.adapter.post(`connection/${connectionId}/resource/${resourceTypeId}/create`, data);
  }

  async executeAction(connectionId, actionTypeId) {
    return this.adapter.get(`connection/${connectionId}/${actionTypeId}/execute`);
  }

  // ==================== Authorization Request Operations ====================

  async fetchAuthorizationRequests(options = {}) {
    const params = new URLSearchParams();
    if (options.roomId) params.append('room_id', options.roomId);
    if (options.isCompleted !== undefined) params.append('is_completed', options.isCompleted);
    
    const queryString = params.toString();
    const url = queryString ? `authorization-request?${queryString}` : 'authorization-request';
    return this.adapter.get(url);
  }

  async updateAuthorizationRequest(requestId, updates) {
    return this.adapter.patch(`authorization-request/${requestId}`, updates);
  }

  // ==================== Webhook Operations ====================

  async fetchWebhooks(options = {}) {
    const params = new URLSearchParams();
    if (options.accountId) params.append('account_id', options.accountId);
    
    const queryString = params.toString();
    const url = queryString ? `webhook?${queryString}` : 'webhook';
    return this.adapter.get(url);
  }

  async createWebhook(webhookData) {
    return this.adapter.post('webhook', webhookData);
  }

  async updateWebhook(webhookId, updates) {
    return this.adapter.patch(`webhook/${webhookId}`, updates);
  }

  async deleteWebhook(webhookId) {
    return this.adapter.delete(`webhook/${webhookId}`);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

