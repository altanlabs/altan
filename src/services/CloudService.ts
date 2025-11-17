/**
 * Cloud Service - Business logic layer for cloud operations
 * Implements Single Responsibility Principle by handling cloud-specific business logic
 */
import { BaseService } from './BaseService';
import type {
  ICloudPort,
  CloudInstance,
  CloudTable,
  CloudRecord,
  CloudUser,
  CloudBucket,
  CloudService as CloudServiceType,
  CloudSecret,
  CreateServiceData,
  CreateSecretData,
  FetchTablesOptions,
  FetchRecordsOptions,
} from './types';
import { getCloudPort } from '../di';

// ============================================================================
// SQL HELPERS
// ============================================================================

const escapeSql = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL';
  return String(value).replace(/'/g, "''");
};

const buildWhereClause = (filters?: Record<string, unknown>): string => {
  if (!filters || Object.keys(filters).length === 0) return '';

  const conditions: string[] = [];
  const sqlControlParams = ['limit', 'offset', 'order', 'select'];

  Object.entries(filters).forEach(([field, value]) => {
    if (sqlControlParams.includes(field)) return;

    if (typeof value === 'string') {
      if (value.startsWith('eq.')) {
        const val = value.substring(3);
        conditions.push(`${field} = '${escapeSql(val)}'`);
      } else if (value.startsWith('in.(') && value.endsWith(')')) {
        // Handle IN operator: in.(val1,val2,val3)
        const vals = value.substring(4, value.length - 1).split(',');
        const quotedVals = vals.map((v) => `'${escapeSql(v.trim())}'`).join(',');
        conditions.push(`${field} IN (${quotedVals})`);
      } else {
        conditions.push(`${field} = '${escapeSql(String(value))}'`);
      }
    } else {
      conditions.push(`${field} = '${escapeSql(String(value))}'`);
    }
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

const buildOrderClause = (order?: string): string => {
  if (!order) return '';
  const parts = order.split(',').map((part) => {
    const [field, direction] = part.split('.');
    const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return `${field} ${dir}`;
  });
  return `ORDER BY ${parts.join(', ')}`;
};

/**
 * Cloud Service - Handles all cloud-related operations
 */
export class CloudService extends BaseService {
  public port: ICloudPort;

  constructor() {
    super();
    this.port = getCloudPort<ICloudPort>();
  }

  // ============================================================================
  // Cloud Instance Operations
  // ============================================================================

  /**
   * Fetch cloud instance with tables
   * @param cloudId - Cloud instance ID
   * @returns Cloud instance with tables
   */
  async fetchCloud(cloudId: string): Promise<CloudInstance> {
    return this.execute(async () => {
      // Fetch cloud metadata
      const cloud = await this.port.fetchInstance(cloudId);

      // Try to fetch tables - if this fails (e.g., cloud is stopped), return empty array
      let tables: any[] = [];
      try {
        tables = await this.port.fetchTables(cloudId, {
          include_columns: true,
          excluded_schemas: 'pg_catalog,information_schema',
          include_system_schemas: true,
        });
      } catch (error) {
        // Tables fetch failed - cloud is likely stopped/paused
        // Continue with empty tables array
      }

      // Normalize cloud data
      const cloudId_normalized = cloud.cloud_id || cloud.id;
      return {
        ...cloud,
        id: cloudId_normalized,
        tables: {
          items: tables.map((table) => ({
            id: table.id,
            name: table.name,
            schema: table.schema,
            rls_enabled: table.rls_enabled ?? false,
            relationships: table.relationships ?? [],
            fields: table.columns
              ? {
                  items: table.columns.map((col) => ({
                    id: col.id,
                    name: col.name,
                    db_field_name: col.name, // Map name to db_field_name for consistency
                    data_type: col.data_type,
                    format: col.format,
                    is_nullable: col.is_nullable,
                    is_unique: col.is_unique,
                    is_identity: col.is_identity,
                    identity_generation: col.identity_generation,
                    is_generated: col.is_generated,
                    is_updatable: col.is_updatable,
                    default_value: col.default_value,
                    comment: col.comment,
                    ordinal_position: col.ordinal_position,
                    enums: col.enums,
                    check: col.check,
                    table_id: col.table_id,
                    schema: col.schema,
                    table: col.table,
                  })),
                }
              : { items: [] },
          })),
        },
      };
    }, 'Error fetching cloud');
  }

  /**
   * Create a new table
   * @param cloudId - Cloud instance ID
   * @param tableData - Table configuration
   * @returns Created table
   */
  async createTable(cloudId: string, tableData: Partial<CloudTable>): Promise<CloudTable> {
    return this.execute(async () => {
      const tenantSchema = `tenant_${cloudId.replace(/-/g, '_')}`;
      return await this.port.createTable(cloudId, {
        ...tableData,
        schema: tenantSchema,
      });
    }, 'Error creating table');
  }

  /**
   * Delete a table
   * @param cloudId - Cloud instance ID
   * @param tableId - Table ID
   */
  async deleteTable(cloudId: string, tableId: string): Promise<void> {
    return this.execute(
      async () => await this.port.deleteTable(cloudId, tableId),
      'Error deleting table',
    );
  }

  // ============================================================================
  // Record Operations
  // ============================================================================

  /**
   * Fetch records from a table
   * @param cloudId - Cloud instance ID
   * @param tableName - Table name
   * @param options - Query options
   * @returns Records and total count
   */
  async fetchRecords(
    cloudId: string,
    tableName: string,
    options: FetchRecordsOptions = {},
  ): Promise<{ records: CloudRecord[]; total: number }> {
    return this.execute(async () => {
      const { limit = 50, offset = 0, order, filters } = options;

      const whereClause = buildWhereClause(filters);
      const orderClause = buildOrderClause(order || 'created_at.desc');

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
      const countResult = await this.port.executeSQL(cloudId, countQuery);
      const totalCount = parseInt(countResult[0]?.count as string || '0', 10);

      // Get records
      const query = `
        SELECT * FROM ${tableName}
        ${whereClause}
        ${orderClause}
        LIMIT ${limit}
        ${offset > 0 ? `OFFSET ${offset}` : ''}
      `
        .trim()
        .replace(/\s+/g, ' ');

      const records = await this.port.executeSQL(cloudId, query);

      return {
        records,
        total: totalCount,
      };
    }, 'Error fetching records');
  }

  /**
   * Create a new record
   * @param cloudId - Cloud instance ID
   * @param tableName - Table name
   * @param data - Record data
   * @returns Created record
   */
  async createRecord(
    cloudId: string,
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<CloudRecord> {
    return this.execute(async () => {
      const fields = Object.keys(data).filter((k) => data[k] !== undefined && data[k] !== '');
      const values = fields.map((f) => {
        const value = data[f];
        if (value === null) return 'NULL';
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        if (typeof value === 'number') return value;
        if (typeof value === 'object') return `'${escapeSql(JSON.stringify(value))}'::jsonb`;
        return `'${escapeSql(value)}'`;
      });

      const query = `
        INSERT INTO ${tableName} (${fields.join(', ')})
        VALUES (${values.join(', ')})
        RETURNING *;
      `;

      const results = await this.port.executeSQL(cloudId, query);
      return results[0];
    }, 'Error creating record');
  }

  /**
   * Update a record by ID
   * @param cloudId - Cloud instance ID
   * @param tableName - Table name
   * @param recordId - Record ID
   * @param changes - Fields to update
   * @returns Updated record
   */
  async updateRecord(
    cloudId: string,
    tableName: string,
    recordId: string,
    changes: Record<string, unknown>,
  ): Promise<CloudRecord> {
    return this.execute(async () => {
      const setClauses = Object.entries(changes).map(([field, value]) => {
        if (value === null || value === undefined) return `${field} = NULL`;
        if (typeof value === 'boolean') return `${field} = ${value ? 'TRUE' : 'FALSE'}`;
        if (typeof value === 'number') return `${field} = ${value}`;
        if (typeof value === 'object')
          return `${field} = '${escapeSql(JSON.stringify(value))}'::jsonb`;
        return `${field} = '${escapeSql(value)}'`;
      });

      const query = `
        UPDATE ${tableName}
        SET ${setClauses.join(', ')}
        WHERE id = '${escapeSql(recordId)}'
        RETURNING *;
      `;

      const results = await this.port.executeSQL(cloudId, query);
      return results[0];
    }, 'Error updating record');
  }

  /**
   * Delete a record by ID
   * @param cloudId - Cloud instance ID
   * @param tableName - Table name
   * @param recordId - Record ID
   */
  async deleteRecord(cloudId: string, tableName: string, recordId: string): Promise<void> {
    return this.execute(async () => {
      const query = `DELETE FROM ${tableName} WHERE id = '${escapeSql(recordId)}';`;
      await this.port.executeSQL(cloudId, query);
    }, 'Error deleting record');
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  /**
   * Fetch users from auth.users table
   * @param cloudId - Cloud instance ID
   * @returns List of users
   */
  async fetchUsers(cloudId: string): Promise<CloudUser[]> {
    return this.execute(async () => {
      const query = 'SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 10000;';
      const users = await this.port.executeSQL(cloudId, query);
      return users as CloudUser[];
    }, 'Error fetching users');
  }

  /**
   * Delete a user by ID
   * @param cloudId - Cloud instance ID
   * @param userId - User ID
   */
  async deleteUser(cloudId: string, userId: string): Promise<void> {
    return this.execute(async () => {
      const query = `DELETE FROM auth.users WHERE id = '${escapeSql(userId)}';`;
      await this.port.executeSQL(cloudId, query);
    }, 'Error deleting user');
  }

  // ============================================================================
  // Bucket Operations
  // ============================================================================

  /**
   * Fetch storage buckets
   * @param cloudId - Cloud instance ID
   * @returns List of buckets
   */
  async fetchBuckets(cloudId: string): Promise<CloudBucket[]> {
    return this.execute(async () => {
      const query = 'SELECT * FROM storage.buckets ORDER BY created_at DESC;';
      const buckets = await this.port.executeSQL(cloudId, query);
      return buckets as CloudBucket[];
    }, 'Error fetching buckets');
  }

  // ============================================================================
  // Search Operations
  // ============================================================================

  /**
   * Search records in a table
   * @param cloudId - Cloud instance ID
   * @param tableName - Table name
   * @param searchQuery - Search query string
   * @param textFields - Text field names to search in
   * @returns Search results and count
   */
  async searchRecords(
    cloudId: string,
    tableName: string,
    searchQuery: string,
    textFields: string[],
  ): Promise<{ records: CloudRecord[]; total: number }> {
    return this.execute(async () => {
      if (!searchQuery || !searchQuery.trim() || textFields.length === 0) {
        return { records: [], total: 0 };
      }

      const query_escaped = escapeSql(searchQuery.trim());

      // Build SQL WHERE clause with ILIKE for search
      const searchConditions = textFields
        .map((field) => `${field} ILIKE '%${query_escaped}%'`)
        .join(' OR ');

      // Get total count of search results
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${searchConditions};`;
      const countResult = await this.port.executeSQL(cloudId, countQuery);
      const searchTotalCount = parseInt(countResult[0]?.count as string || '0', 10);

      // Build SQL query
      const sqlQuery = `SELECT * FROM ${tableName} WHERE ${searchConditions} ORDER BY created_at DESC LIMIT 500;`;

      const searchRecords = await this.port.executeSQL(cloudId, sqlQuery);

      return {
        records: searchRecords,
        total: searchTotalCount,
      };
    }, 'Error searching records');
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  /**
   * Execute raw SQL query
   * @param cloudId - Cloud instance ID
   * @param query - SQL query string
   * @returns Query results
   */
  async executeSQL(cloudId: string, query: string): Promise<CloudRecord[]> {
    return this.execute(
      async () => await this.port.executeSQL(cloudId, query),
      'Error executing SQL',
    );
  }

  // ============================================================================
  // Services Operations
  // ============================================================================

  /**
   * Fetch all services for a base
   * @param baseId - Base/Cloud instance ID
   * @returns List of services
   */
  async fetchServices(baseId: string): Promise<CloudServiceType[]> {
    return this.execute(
      async () => await this.port.fetchServices(baseId),
      'Error fetching services',
    );
  }

  /**
   * Fetch service details including code
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   * @returns Service details
   */
  async fetchServiceDetails(baseId: string, serviceName: string): Promise<CloudServiceType> {
    return this.execute(
      async () => await this.port.fetchServiceDetails(baseId, serviceName),
      'Error fetching service details',
    );
  }

  /**
   * Create a new service
   * @param baseId - Base/Cloud instance ID
   * @param serviceData - Service configuration
   * @returns Created service
   */
  async createService(baseId: string, serviceData: CreateServiceData): Promise<CloudServiceType> {
    return this.execute(
      async () => await this.port.createService(baseId, serviceData),
      'Error creating service',
    );
  }

  /**
   * Update an existing service
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   * @param serviceData - Service configuration
   * @returns Updated service
   */
  async updateService(
    baseId: string,
    serviceName: string,
    serviceData: CreateServiceData,
  ): Promise<CloudServiceType> {
    return this.execute(
      async () => await this.port.updateService(baseId, serviceName, serviceData),
      'Error updating service',
    );
  }

  /**
   * Delete a service
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   */
  async deleteService(baseId: string, serviceName: string): Promise<void> {
    return this.execute(
      async () => await this.port.deleteService(baseId, serviceName),
      'Error deleting service',
    );
  }

  // ============================================================================
  // Secrets Operations
  // ============================================================================

  /**
   * Fetch all secrets for a base
   * @param baseId - Base/Cloud instance ID
   * @returns List of secrets
   */
  async fetchSecrets(baseId: string): Promise<CloudSecret[]> {
    return this.execute(
      async () => await this.port.fetchSecrets(baseId),
      'Error fetching secrets',
    );
  }

  /**
   * Create or update a secret
   * @param baseId - Base/Cloud instance ID
   * @param secretData - Secret data (key, value)
   * @returns Created/updated secret
   */
  async createSecret(baseId: string, secretData: CreateSecretData): Promise<CloudSecret> {
    return this.execute(
      async () => await this.port.createSecret(baseId, secretData),
      'Error creating secret',
    );
  }

  /**
   * Delete a secret
   * @param baseId - Base/Cloud instance ID
   * @param secretKey - Secret key
   */
  async deleteSecret(baseId: string, secretKey: string): Promise<void> {
    return this.execute(
      async () => await this.port.deleteSecret(baseId, secretKey),
      'Error deleting secret',
    );
  }
}

// Singleton instance
let cloudServiceInstance: CloudService | null = null;

/**
 * Get CloudService singleton instance
 * @returns CloudService instance
 */
export const getCloudService = (): CloudService => {
  if (!cloudServiceInstance) {
    cloudServiceInstance = new CloudService();
  }
  return cloudServiceInstance;
};

