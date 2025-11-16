import { PodsPort } from '../../ports/PodsPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Pods HTTP Adapter
 * Implements PodsPort using HTTP/REST API
 */
export class PodsHttpAdapter extends PodsPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_pods',
    });
  }

  // ==================== Interface Operations ====================

  async fetchInterface(interfaceId) {
    return this.adapter.get(`interfaces/${interfaceId}`);
  }

  async createInterface(interfaceData) {
    return this.adapter.post('interfaces', interfaceData);
  }

  async updateInterface(interfaceId, updates) {
    return this.adapter.patch(`interfaces/${interfaceId}`, updates);
  }

  async deleteInterface(interfaceId) {
    return this.adapter.delete(`interfaces/${interfaceId}`);
  }

  // ==================== Domain Operations ====================

  async addDomain(interfaceId, domainData) {
    return this.adapter.post(`interfaces/${interfaceId}/domains`, domainData);
  }

  async removeDomain(interfaceId, domain) {
    return this.adapter.delete(`interfaces/${interfaceId}/domains/${domain}`);
  }

  // ==================== Repository Operations ====================

  async addCollaborator(interfaceId, collaboratorData) {
    return this.adapter.post(`interfaces/${interfaceId}/collaborators`, collaboratorData);
  }

  async commitChanges(interfaceId, commitData) {
    return this.adapter.post(`interfaces/dev/${interfaceId}/repo/commit`, commitData);
  }

  async restoreDevToMain(interfaceId) {
    return this.adapter.get(`interfaces/dev/${interfaceId}/repo/restore-main`);
  }

  async clearCacheAndRestart(interfaceId) {
    return this.adapter.post(`interfaces/dev/${interfaceId}/clear-cache-restart`);
  }

  async searchReplaceFiles(interfaceId, searchReplaceData) {
    return this.adapter.post(`interfaces/dev/${interfaceId}/files/search-replace`, searchReplaceData);
  }

  // ==================== Commit Operations ====================

  async fetchCommitDetails(interfaceId, hash) {
    return this.adapter.get(`interfaces/dev/${interfaceId}/repo/commits/${hash}`);
  }

  async restoreCommit(interfaceId, hash) {
    return this.adapter.post(`interfaces/dev/${interfaceId}/repo/commits/${hash}/restore`);
  }

  // ==================== Deployment Operations ====================

  async deploy(interfaceId, deployOptions = {}) {
    return this.adapter.post(`interfaces/${interfaceId}/deploy`, deployOptions);
  }

  async getDeploymentStatus(interfaceId) {
    return this.adapter.get(`interfaces/${interfaceId}/deployment/status`);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

