import { CloudPort } from '../../ports/CloudPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Cloud HTTP Adapter
 * Implements CloudPort using HTTP/REST API
 */
export class CloudHttpAdapter extends CloudPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_cloud',
    });
  }

  // ==================== Instance Operations ====================

  async fetchMetrics(cloudId, options = {}) {
    return this.adapter.get(`${cloudId}/metrics`);
  }

  async fetchMetricsHistory(cloudId, options = {}) {
    const params = new URLSearchParams();
    if (options.timeRange) params.append('time_range', options.timeRange);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${cloudId}/metrics/history?${queryString}` 
      : `${cloudId}/metrics/history`;
    return this.adapter.get(url);
  }

  async startInstance(cloudId) {
    return this.adapter.post(`${cloudId}/start`);
  }

  async stopInstance(cloudId) {
    return this.adapter.post(`${cloudId}/stop`);
  }

  async restartInstance(cloudId) {
    return this.adapter.post(`${cloudId}/restart`);
  }

  async pauseInstance(cloudId) {
    return this.adapter.post(`${cloudId}/pause`);
  }

  async resumeInstance(cloudId) {
    return this.adapter.post(`${cloudId}/resume`);
  }

  // ==================== Storage Operations ====================

  async listBuckets(cloudId) {
    return this.adapter.get(`${cloudId}/storage/buckets`);
  }

  async createBucket(cloudId, bucketData) {
    return this.adapter.post(`${cloudId}/storage/buckets`, bucketData);
  }

  async deleteBucket(cloudId, bucketId) {
    return this.adapter.delete(`${cloudId}/storage/buckets/${bucketId}`);
  }

  async listFiles(cloudId, bucketId, options = {}) {
    const params = new URLSearchParams();
    if (options.prefix) params.append('prefix', options.prefix);
    if (options.limit) params.append('limit', options.limit);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${cloudId}/storage/buckets/${bucketId}/files?${queryString}`
      : `${cloudId}/storage/buckets/${bucketId}/files`;
    return this.adapter.get(url);
  }

  async uploadFile(cloudId, bucketId, fileData) {
    return this.adapter.post(`${cloudId}/storage/buckets/${bucketId}/files`, fileData);
  }

  async deleteFile(cloudId, bucketId, fileName) {
    return this.adapter.delete(`${cloudId}/storage/buckets/${bucketId}/files/${fileName}`);
  }

  // ==================== Logs Operations ====================

  async fetchLogs(cloudId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.level) params.append('level', options.level);
    
    const queryString = params.toString();
    const url = queryString ? `${cloudId}/logs?${queryString}` : `${cloudId}/logs`;
    return this.adapter.get(url);
  }

  async streamLogs(cloudId, callback) {
    // WebSocket or SSE implementation would go here
    // For now, return a no-op unsubscribe function
    console.warn('streamLogs not yet implemented');
    return () => {};
  }

  // ==================== Database Operations ====================

  async fetchInstance(cloudId) {
    return this.adapter.get(`/v1/instances/${cloudId}`);
  }

  async executeSQL(cloudId, query) {
    return this.adapter.post(`/v1/pg-meta/${cloudId}/query`, { query });
  }

  async fetchTables(cloudId, options = {}) {
    const params = new URLSearchParams();
    if (options.include_columns) params.append('include_columns', 'true');
    if (options.excluded_schemas) params.append('excluded_schemas', options.excluded_schemas);
    if (options.include_system_schemas) params.append('include_system_schemas', 'true');
    
    const queryString = params.toString();
    const url = queryString 
      ? `/v1/pg-meta/${cloudId}/tables/?${queryString}`
      : `/v1/pg-meta/${cloudId}/tables/`;
    return this.adapter.get(url);
  }

  async createTable(cloudId, tableData) {
    return this.adapter.post(`/v1/pg-meta/${cloudId}/tables/`, tableData);
  }

  async deleteTable(cloudId, tableId) {
    return this.adapter.delete(`/v1/pg-meta/${cloudId}/tables/${tableId}`);
  }

  // ==================== Services Operations ====================

  async fetchServices(baseId) {
    const response = await this.adapter.get(`/v1/instances/${baseId}/services/services`);
    return response.services || response || [];
  }

  async fetchServiceDetails(baseId, serviceName) {
    return this.adapter.get(`/v1/instances/${baseId}/services/services/${serviceName}`);
  }

  async createService(baseId, serviceData) {
    return this.adapter.post(`/v1/instances/${baseId}/services/services`, serviceData);
  }

  async updateService(baseId, serviceName, serviceData) {
    return this.adapter.post(`/v1/instances/${baseId}/services/services`, {
      name: serviceName,
      ...serviceData,
    });
  }

  async deleteService(baseId, serviceName) {
    return this.adapter.delete(`/v1/instances/${baseId}/services/services/${serviceName}`);
  }

  // ==================== Secrets Operations ====================

  async fetchSecrets(baseId) {
    const response = await this.adapter.get(`/v1/instances/${baseId}/services/secrets`);
    return response.secrets || response || [];
  }

  async createSecret(baseId, secretData) {
    return this.adapter.post(`/v1/instances/${baseId}/services/secrets`, secretData);
  }

  async deleteSecret(baseId, secretKey) {
    return this.adapter.delete(`/v1/instances/${baseId}/services/secrets/${secretKey}`);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

