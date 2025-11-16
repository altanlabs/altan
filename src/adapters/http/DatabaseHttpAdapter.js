import { BaseHttpAdapter } from './BaseHttpAdapter';
import { DatabasePort } from '../../ports/DatabasePort';

/**
 * Database HTTP Adapter
 * Implements DatabasePort using HTTP/REST API
 * Note: This adapter combines multiple database-related services
 */
export class DatabaseHttpAdapter extends DatabasePort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_database',
    });
  }

  // ==================== Database/Cloud Instance Operations ====================

  async fetchCloudInstances(accountId) {
    return this.adapter.get(`account/${accountId}/bases`);
  }

  async fetchCloudInstance(cloudId) {
    return this.adapter.get(`bases/${cloudId}`);
  }

  async createCloudInstance(cloudData) {
    return this.adapter.post('bases', cloudData);
  }

  async updateCloudInstance(cloudId, updates) {
    return this.adapter.patch(`bases/${cloudId}`, updates);
  }

  async deleteCloudInstance(cloudId) {
    return this.adapter.delete(`bases/${cloudId}`);
  }

  // ==================== Table Operations ====================

  async fetchTables(cloudId) {
    return this.adapter.get(`bases/${cloudId}/tables`);
  }

  async fetchTable(tableId) {
    return this.adapter.get(`tables/${tableId}`);
  }

  async createTable(cloudId, tableData) {
    return this.adapter.post(`bases/${cloudId}/tables`, tableData);
  }

  async updateTable(tableId, updates) {
    return this.adapter.patch(`tables/${tableId}`, updates);
  }

  async deleteTable(tableId) {
    return this.adapter.delete(`tables/${tableId}`);
  }

  // ==================== Record Operations ====================

  async fetchRecords(tableId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.filter) params.append('filter', options.filter);

    const queryString = params.toString();
    const url = queryString ? `tables/${tableId}/records?${queryString}` : `tables/${tableId}/records`;
    return this.adapter.get(url);
  }

  async fetchRecord(tableId, recordId) {
    return this.adapter.get(`tables/${tableId}/records/${recordId}`);
  }

  async createRecord(tableId, recordData) {
    return this.adapter.post(`tables/${tableId}/records`, recordData);
  }

  async updateRecord(tableId, recordId, updates) {
    return this.adapter.patch(`tables/${tableId}/records/${recordId}`, updates);
  }

  async deleteRecord(tableId, recordId) {
    return this.adapter.delete(`tables/${tableId}/records/${recordId}`);
  }

  // ==================== Query Operations ====================

  async executeQuery(cloudId, query, options = {}) {
    return this.adapter.post(`bases/${cloudId}/query`, { query, ...options });
  }

  async executePostgRESTQuery(cloudId, table, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `bases/${cloudId}/postgrest/${table}?${queryString}` : `bases/${cloudId}/postgrest/${table}`;
    return this.adapter.get(url);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }

  // ==================== PG-Meta Schema Operations ====================

  async fetchSchemas(baseId) {
    return this.adapter.get(`/v1/pg-meta/${baseId}/schemas/`);
  }

  async createSchema(baseId, schemaData) {
    return this.adapter.post(`/v1/pg-meta/${baseId}/schemas/`, schemaData);
  }

  async deleteSchema(baseId, schemaId, cascade = false) {
    return this.adapter.delete(`/v1/pg-meta/${baseId}/schemas/${schemaId}`, {
      params: { cascade },
    });
  }

  // ==================== PG-Meta Table Operations ====================

  async fetchTables(baseId, options = {}) {
    return this.adapter.get(`/v1/pg-meta/${baseId}/tables/`, { params: options });
  }

  async createTable(baseId, tableData) {
    return this.adapter.post(`/v1/pg-meta/${baseId}/tables/`, tableData);
  }

  async updateTable(baseId, tableId, changes) {
    return this.adapter.patch(`/v1/pg-meta/${baseId}/tables/${tableId}`, changes);
  }

  async deleteTable(baseId, tableId, cascade = false) {
    return this.adapter.delete(`/v1/pg-meta/${baseId}/tables/${tableId}`, {
      params: { cascade },
    });
  }

  // ==================== PG-Meta Column Operations ====================

  async fetchColumns(baseId, options = {}) {
    return this.adapter.get(`/v1/pg-meta/${baseId}/columns/`, { params: options });
  }

  async createColumn(baseId, columnData) {
    return this.adapter.post(`/v1/pg-meta/${baseId}/columns/`, columnData);
  }

  async updateColumn(baseId, columnId, changes) {
    return this.adapter.patch(`/v1/pg-meta/${baseId}/columns/${columnId}`, changes);
  }

  async deleteColumn(baseId, columnId, cascade = false) {
    return this.adapter.delete(`/v1/pg-meta/${baseId}/columns/${columnId}`, {
      params: { cascade },
    });
  }

  // ==================== RLS Policy Operations ====================

  async fetchPolicies(baseId, tableName) {
    return this.adapter.get(`/v1/pg-meta/${baseId}/policies/`, {
      params: { table_name: tableName },
    });
  }

  // ==================== Import/Export Operations ====================

  async importCSV(baseId, tableName, file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.adapter.post(`/v1/instances/${baseId}/upload-csv`, formData, {
      params: { table_name: tableName },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async exportCSV(baseId, tableName = null) {
    return this.adapter.post(
      `/v1/instances/${baseId}/export-csv`,
      { table_name: tableName },
      { responseType: 'blob' },
    );
  }

  async exportSQL(baseId, includeData = false) {
    const params = includeData ? { include_data: true } : {};
    return this.adapter.get(`/v1/pg-meta/${baseId}/export/schema`, {
      params,
      responseType: 'blob',
    });
  }

  // ==================== SQL Execution ====================

  async executeSQL(baseId, query) {
    return this.adapter.post(`/v1/pg-meta/${baseId}/query`, { query });
  }
}
