import { PlatformPort } from '../../ports/PlatformPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Platform HTTP Adapter
 * Implements PlatformPort using HTTP/REST API
 */
export class PlatformHttpAdapter extends PlatformPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai',
    });
  }

  // ==================== Agent Operations ====================

  async fetchAgent(agentId) {
    return this.adapter.get(`agent/${agentId}`);
  }

  async fetchAgentDM(agentId, accountId) {
    return this.adapter.get(`agent/${agentId}/dm?account_id=${accountId}`);
  }

  async createAgent(accountId, agentData) {
    return this.adapter.post(`account/${accountId}/agent`, agentData);
  }

  async updateAgent(agentId, updates) {
    return this.adapter.patch(`agent/${agentId}`, updates);
  }

  async deleteAgent(agentId) {
    return this.adapter.delete(`agent/${agentId}`);
  }

  async fetchAgentRooms(agentId) {
    return this.adapter.get(`agent/${agentId}/rooms`);
  }

  // ==================== Account Operations ====================

  async fetchAccount() {
    return this.adapter.get('account');
  }

  async updateAccount(accountId, updates) {
    return this.adapter.patch(`account/${accountId}`, updates);
  }

  // ==================== Template Operations ====================

  async createTemplate(templateData) {
    return this.adapter.post('template', templateData);
  }

  async fetchTemplate(templateId) {
    return this.adapter.get(`template/${templateId}`);
  }

  // ==================== Space/Workspace Operations ====================

  async fetchWorkspace(workspaceId) {
    return this.adapter.get(`workspace/${workspaceId}`);
  }

  async createWorkspace(workspaceData) {
    return this.adapter.post('workspace', workspaceData);
  }

  async updateWorkspace(workspaceId, updates) {
    return this.adapter.patch(`workspace/${workspaceId}`, updates);
  }

  async deleteWorkspace(workspaceId) {
    return this.adapter.delete(`workspace/${workspaceId}`);
  }

  // ==================== Tool Operations ====================

  async fetchTool(toolId) {
    return this.adapter.get(`tool/${toolId}`);
  }

  async createTool(toolData) {
    return this.adapter.post('tool', toolData);
  }

  async updateTool(toolId, updates) {
    return this.adapter.patch(`tool/${toolId}`, updates);
  }

  async deleteTool(toolId) {
    return this.adapter.delete(`tool/${toolId}`);
  }

  // ==================== Altaner/Project Operations ====================

  async fetchAltaner(altanerId) {
    return this.adapter.get(`altaner/${altanerId}`);
  }

  async fetchAltanersList(options) {
    return this.adapter.get('altaner/list', { params: options });
  }

  async createAltaner(accountId, altanerData, idea) {
    let url = `account/v3/${accountId}/project`;
    if (idea) {
      url += `?idea=${encodeURIComponent(idea)}`;
    }
    return this.adapter.post(url, altanerData);
  }

  async updateAltaner(altanerId, updates) {
    return this.adapter.patch(`altaner/${altanerId}`, updates);
  }

  async deleteAltaner(altanerId) {
    return this.adapter.delete(`altaner/${altanerId}`);
  }

  async updateAltanerPositions(altanerId, data) {
    return this.adapter.patch(`altaner/${altanerId}/positions`, data);
  }

  // ==================== Altaner Component Operations ====================

  async createAltanerComponent(altanerId, componentData) {
    return this.adapter.post(`altaner/${altanerId}/component`, componentData);
  }

  async updateAltanerComponent(altanerId, componentId, updates) {
    return this.adapter.patch(`altaner/${altanerId}/component/${componentId}`, updates);
  }

  async updateAltanerComponentById(componentId, updates) {
    return this.adapter.patch(`altaner/components/${componentId}`, updates);
  }

  async deleteAltanerComponent(componentId) {
    return this.adapter.delete(`altaner/components/${componentId}`);
  }

  // ==================== Connection Operations ====================

  async fetchUserConnections() {
    return this.adapter.get('user/me/connections');
  }

  async fetchAccountConnectionsGQ(accountId, query) {
    return this.adapter.post(`account/${accountId}/gq`, query);
  }

  // ==================== Media Operations ====================

  async fetchAccountMedia(accountId, query) {
    return this.adapter.post(`account/${accountId}/gq`, query);
  }

  async createMedia(accountId, data) {
    return this.adapter.post(`account/${accountId}/media`, data);
  }

  async deleteMedia(mediaId) {
    return this.adapter.delete(`media/${mediaId}`);
  }

  async createMedia3D(accountId, data) {
    return this.adapter.post(`media/${accountId}/models`, data);
  }

  async deleteMedia3D(modelId) {
    return this.adapter.delete(`media/3d/${modelId}`);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

