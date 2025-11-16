/**
 * Database Service - Business logic layer for database metadata operations
 * Implements Single Responsibility Principle by handling pg-meta and database schema operations
 */
import { BaseService } from './BaseService';
import { getDatabasePort } from '../di';
import type {
  BaseSchema,
  BaseTable,
  BaseField,
  PgMetaTable,
  PgMetaColumn,
  RLSPolicy,
  BaseRecord,
  BaseUser,
  BaseBucket,
} from '../types/database';

// ============================================================================
// INTERFACES
// ============================================================================

export interface IDatabasePort {
  // Schema operations
  fetchSchemas(baseId: string): Promise<BaseSchema[]>;
  createSchema(baseId: string, schemaData: Partial<BaseSchema>): Promise<BaseSchema>;
  deleteSchema(baseId: string, schemaId: number, cascade?: boolean): Promise<void>;

  // Table operations
  fetchTables(baseId: string, options?: FetchTablesOptions): Promise<PgMetaTable[]>;
  createTable(baseId: string, tableData: Partial<PgMetaTable>): Promise<PgMetaTable>;
  updateTable(baseId: string, tableId: number, changes: Partial<PgMetaTable>): Promise<PgMetaTable>;
  deleteTable(baseId: string, tableId: number, cascade?: boolean): Promise<void>;

  // Column operations
  fetchColumns(baseId: string, options?: { included_schemas?: string; exclude_system_schemas?: boolean }): Promise<PgMetaColumn[]>;
  createColumn(baseId: string, columnData: ColumnData): Promise<PgMetaColumn>;
  updateColumn(baseId: string, columnId: number, changes: Record<string, unknown>): Promise<PgMetaColumn>;
  deleteColumn(baseId: string, columnId: number, cascade?: boolean): Promise<void>;

  // RLS Policy operations
  fetchPolicies(baseId: string, tableName: string): Promise<RLSPolicy[]>;

  // SQL execution
  executeSQL(baseId: string, query: string): Promise<BaseRecord[]>;

  // Import/Export operations
  importCSV(baseId: string, tableName: string, file: File): Promise<unknown>;
  exportCSV(baseId: string, tableName?: string | null): Promise<Blob>;
  exportSQL(baseId: string, includeData?: boolean): Promise<Blob>;

  // Utility
  getAxiosInstance(): unknown;
}

export interface FetchTablesOptions {
  include_columns?: boolean;
  include_relationships?: boolean;
  excluded_schemas?: string;
  include_system_schemas?: boolean;
}

export interface ColumnData {
  table_id: number;
  name: string;
  type: string;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
  comment?: string;
}

// ============================================================================
// SQL HELPERS
// ============================================================================

const escapeSql = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL';
  return String(value).replace(/'/g, "''");
};

const buildWhereClause = (filters: Record<string, unknown>): string => {
  if (!filters || Object.keys(filters).length === 0) return '';

  const conditions: string[] = [];
  const sqlControlParams = ['limit', 'offset', 'order', 'select'];

  Object.entries(filters).forEach(([field, value]) => {
    if (sqlControlParams.includes(field)) return;

    if (field === 'or') {
      const orMatch = String(value).match(/\((.*)\)/);
      if (orMatch) {
        const orConditions = orMatch[1].split(',').map((cond) => {
          const [f, op] = cond.split('.');
          return buildCondition(f, `${op}`);
        });
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
      return;
    }

    conditions.push(buildCondition(field, value));
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

const buildCondition = (field: string, value: string | unknown): string => {
  if (typeof value === 'string') {
    if (value.startsWith('eq.')) {
      const val = value.substring(3);
      return `${field} = '${escapeSql(val)}'`;
    }
    if (value.startsWith('ilike.')) {
      const pattern = value.substring(6).replace(/\*/g, '%');
      return `${field} ILIKE '${escapeSql(pattern)}'`;
    }
    if (value.startsWith('in.')) {
      const vals = value.substring(4, value.length - 1).split(',');
      const quotedVals = vals.map((v) => `'${escapeSql(v)}'`).join(',');
      return `${field} IN (${quotedVals})`;
    }
    if (value.startsWith('gt.')) {
      return `${field} > '${escapeSql(value.substring(3))}'`;
    }
    if (value.startsWith('gte.')) {
      return `${field} >= '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('lt.')) {
      return `${field} < '${escapeSql(value.substring(3))}'`;
    }
    if (value.startsWith('lte.')) {
      return `${field} <= '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('neq.')) {
      return `${field} != '${escapeSql(value.substring(4))}'`;
    }
    if (value.startsWith('is.')) {
      const isVal = value.substring(3);
      return isVal.toLowerCase() === 'null' ? `${field} IS NULL` : `${field} IS ${isVal}`;
    }
  }

  return `${field} = '${escapeSql(String(value))}'`;
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

const buildInsertSQL = (tableName: string, data: Record<string, unknown>): string => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  const validFields: string[] = [];
  const validValues: unknown[] = [];
  fields.forEach((field, index) => {
    const value = values[index];
    if (value !== undefined && value !== '') {
      validFields.push(field);
      validValues.push(value);
    }
  });

  if (validFields.length === 0) {
    throw new Error('No valid fields to insert');
  }

  const fieldsList = validFields.join(', ');
  const valuesList = validValues
    .map((v) => {
      if (v === null) return 'NULL';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return v;

      if (typeof v === 'string') {
        let actualValue = v;
        if (v.startsWith('"') && v.endsWith('"')) {
          try {
            actualValue = JSON.parse(v) as string;
          } catch {
            actualValue = v;
          }
        }

        const isDateString = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(actualValue);
        if (isDateString) {
          return `'${escapeSql(actualValue)}'::timestamp`;
        }
        return `'${escapeSql(actualValue)}'`;
      }

      if (typeof v === 'object') return `'${escapeSql(JSON.stringify(v))}'::jsonb`;

      return `'${escapeSql(v)}'`;
    })
    .join(', ');

  return `INSERT INTO ${tableName} (${fieldsList}) VALUES (${valuesList}) RETURNING *;`;
};

const buildUpdateSQL = (tableName: string, recordId: string, changes: Record<string, unknown>): string => {
  const setClauses = Object.entries(changes)
    .map(([field, value]) => {
      if (value === null || value === undefined) return `${field} = NULL`;

      if (typeof value === 'boolean') {
        return `${field} = ${value ? 'TRUE' : 'FALSE'}`;
      }

      if (typeof value === 'number') {
        return `${field} = ${value}`;
      }

      if (typeof value === 'string') {
        let actualValue = value;
        if (value.startsWith('"') && value.endsWith('"')) {
          try {
            actualValue = JSON.parse(value) as string;
          } catch {
            actualValue = value;
          }
        }

        const isDateString = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(actualValue);
        if (isDateString) {
          return `${field} = '${escapeSql(actualValue)}'::timestamp`;
        }
        return `${field} = '${escapeSql(actualValue)}'`;
      }

      if (typeof value === 'object') {
        return `${field} = '${escapeSql(JSON.stringify(value))}'::jsonb`;
      }

      return `${field} = '${escapeSql(value)}'`;
    })
    .join(', ');

  return `UPDATE ${tableName} SET ${setClauses} WHERE id = '${escapeSql(recordId)}' RETURNING *;`;
};

const buildDeleteSQL = (tableName: string, recordIds: string | string[]): string => {
  const ids = Array.isArray(recordIds) ? recordIds : [recordIds];
  const idList = ids.map((id) => `'${escapeSql(id)}'`).join(',');
  return `DELETE FROM ${tableName} WHERE id IN (${idList});`;
};

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Database Service - Handles all database metadata operations
 */
export class DatabaseService extends BaseService {
  public port: IDatabasePort;

  constructor() {
    super();
    this.port = getDatabasePort<IDatabasePort>();
  }

  // ============================================================================
  // Schema Operations
  // ============================================================================

  async fetchSchemas(baseId: string): Promise<BaseSchema[]> {
    return this.execute(
      async () => await this.port.fetchSchemas(baseId),
      'Error fetching schemas',
    );
  }

  async createSchema(baseId: string, schemaData: Partial<BaseSchema>): Promise<BaseSchema> {
    return this.execute(
      async () => await this.port.createSchema(baseId, schemaData),
      'Error creating schema',
    );
  }

  async deleteSchema(baseId: string, schemaId: number, cascade = false): Promise<void> {
    return this.execute(
      async () => await this.port.deleteSchema(baseId, schemaId, cascade),
      'Error deleting schema',
    );
  }

  // ============================================================================
  // Table Operations
  // ============================================================================

  async fetchTables(baseId: string, options: FetchTablesOptions = {}): Promise<BaseTable[]> {
    return this.execute(async () => {
      const {
        include_columns = true,
        include_relationships = true,
        excluded_schemas = 'pg_catalog,information_schema',
        include_system_schemas = true,
      } = options;

      const tables = await this.port.fetchTables(baseId, {
        include_columns,
        include_relationships,
        excluded_schemas,
        include_system_schemas,
      });

      // Transform to BaseTable format
      return tables.map((table) => ({
        id: table.id,
        name: table.name,
        db_name: table.name,
        schema: table.schema,
        rls_enabled: table.rls_enabled,
        rls_forced: table.rls_forced,
        replica_identity: table.replica_identity,
        comment: table.comment,
        bytes: table.bytes,
        size: table.size,
        live_rows_estimate: table.live_rows_estimate,
        dead_rows_estimate: table.dead_rows_estimate,
        fields: {
          items: table.columns
            ? table.columns.map((col) => ({
                id: col.id,
                name: col.name,
                db_field_name: col.name,
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
              }))
            : [],
        },
        primary_keys: table.primary_keys || [],
        relationships: table.relationships || [],
      }));
    }, 'Error fetching tables');
  }

  async createTable(baseId: string, tableData: Partial<PgMetaTable>): Promise<BaseTable> {
    return this.execute(async () => {
      const tenantSchema = `tenant_${baseId.replace(/-/g, '_')}`;
      const tablePayload = {
        ...tableData,
        schema: tenantSchema,
      };

      const table = await this.port.createTable(baseId, tablePayload);

      return {
        id: table.id,
        name: table.name,
        db_name: table.name,
        schema: table.schema,
        comment: table.comment,
        rls_enabled: table.rls_enabled || false,
        rls_forced: table.rls_forced || false,
        replica_identity: table.replica_identity || 'DEFAULT',
        bytes: table.bytes || 0,
        size: table.size || '0 bytes',
        fields: { items: [] },
        primary_keys: table.primary_keys || [],
        relationships: table.relationships || [],
      };
    }, 'Error creating table');
  }

  async updateTable(baseId: string, tableId: number, changes: Partial<PgMetaTable>): Promise<BaseTable> {
    return this.execute(async () => {
      const table = await this.port.updateTable(baseId, tableId, changes);

      return {
        id: table.id,
        name: table.name,
        db_name: table.name,
        schema: table.schema,
        comment: table.comment,
        rls_enabled: table.rls_enabled,
        rls_forced: table.rls_forced,
        replica_identity: table.replica_identity,
        fields: { items: [] },
        primary_keys: table.primary_keys || [],
        relationships: table.relationships || [],
      };
    }, 'Error updating table');
  }

  async deleteTable(baseId: string, tableId: number, cascade = false): Promise<void> {
    return this.execute(
      async () => await this.port.deleteTable(baseId, tableId, cascade),
      'Error deleting table',
    );
  }

  // ============================================================================
  // Column/Field Operations
  // ============================================================================

  async fetchColumns(baseId: string, tableId: number): Promise<BaseField[]> {
    return this.execute(async () => {
      const tenantSchema = `tenant_${baseId.replace(/-/g, '_')}`;

      const allColumns = await this.port.fetchColumns(baseId, {
        included_schemas: tenantSchema,
        exclude_system_schemas: true,
      });

      const columns = allColumns.filter((col) => col.table_id === tableId);

      return columns.map((col) => ({
        id: col.id,
        name: col.name,
        db_field_name: col.name,
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
      }));
    }, 'Error fetching columns');
  }

  async createColumn(baseId: string, tableId: number, fieldData: FieldData): Promise<BaseField> {
    return this.execute(async () => {
      const columnData: ColumnData = {
        table_id: tableId,
        name: fieldData.db_field_name || fieldData.name,
        type: fieldData.type || 'text',
        is_nullable: fieldData.is_nullable !== false,
        is_unique: fieldData.is_unique || false,
        default_value: fieldData.default_value,
        comment: fieldData.description || fieldData.comment,
      };

      const column = await this.port.createColumn(baseId, columnData);

      return {
        id: column.id,
        name: column.name,
        db_field_name: column.name,
        data_type: column.data_type,
        format: column.format,
        is_nullable: column.is_nullable,
        is_unique: column.is_unique,
        is_identity: column.is_identity,
        identity_generation: column.identity_generation,
        is_generated: column.is_generated,
        is_updatable: column.is_updatable,
        default_value: column.default_value,
        comment: column.comment,
        ordinal_position: column.ordinal_position,
        enums: column.enums,
        check: column.check,
        table_id: column.table_id,
        schema: column.schema,
        table: column.table,
      };
    }, 'Error creating column');
  }

  async updateColumn(baseId: string, fieldId: number, changes: Partial<FieldData>): Promise<BaseField> {
    return this.execute(async () => {
      const columnChanges: Record<string, unknown> = {};
      if (changes.name) columnChanges.name = changes.name;
      if (changes.type) columnChanges.type = changes.type;
      if (changes.is_nullable !== undefined) columnChanges.is_nullable = changes.is_nullable;
      if (changes.is_unique !== undefined) columnChanges.is_unique = changes.is_unique;
      if (changes.default_value !== undefined) columnChanges.default_value = changes.default_value;
      if (changes.comment !== undefined) columnChanges.comment = changes.comment;

      const column = await this.port.updateColumn(baseId, fieldId, columnChanges);

      return {
        id: column.id,
        name: column.name,
        db_field_name: column.name,
        data_type: column.data_type,
        format: column.format,
        is_nullable: column.is_nullable,
        is_unique: column.is_unique,
        is_identity: column.is_identity,
        identity_generation: column.identity_generation,
        is_generated: column.is_generated,
        is_updatable: column.is_updatable,
        default_value: column.default_value,
        comment: column.comment,
        ordinal_position: column.ordinal_position,
        enums: column.enums,
        check: column.check,
        table_id: column.table_id,
        schema: column.schema,
        table: column.table,
      };
    }, 'Error updating column');
  }

  async deleteColumn(baseId: string, fieldId: number, cascade = false): Promise<void> {
    return this.execute(
      async () => await this.port.deleteColumn(baseId, fieldId, cascade),
      'Error deleting column',
    );
  }

  // ============================================================================
  // RLS Policy Operations
  // ============================================================================

  async fetchTablePolicies(baseId: string, tableName: string): Promise<RLSPolicy[]> {
    return this.execute(
      async () => await this.port.fetchPolicies(baseId, tableName),
      'Error fetching policies',
    );
  }

  // ============================================================================
  // Record Operations with SQL
  // ============================================================================

  async fetchRecords(
    baseId: string,
    tableName: string,
    options: FetchRecordsOptions = {},
  ): Promise<{ records: BaseRecord[]; total: number }> {
    return this.execute(async () => {
      const { limit = 50, offset = 0, order, filters, searchQuery, textFields } = options;

      const queryParams: Record<string, unknown> = {
        limit,
        offset,
      };

      if (order) {
        queryParams.order = order;
      }

      if (searchQuery && searchQuery.trim() && textFields && textFields.length > 0) {
        const searchConditions = textFields
          .map((field) => `${field}.ilike.*${searchQuery.trim()}*`)
          .join(',');
        queryParams.or = `(${searchConditions})`;
      }

      if (filters) {
        Object.assign(queryParams, filters);
      }

      const whereClause = buildWhereClause(queryParams);
      const orderClause = buildOrderClause(queryParams.order as string | undefined);
      const limitClause = `LIMIT ${limit}`;
      const offsetClause = offset > 0 ? `OFFSET ${offset}` : '';

      const queryParts = ['SELECT * FROM', tableName];
      if (whereClause) queryParts.push(whereClause);
      if (orderClause) queryParts.push(orderClause);
      if (limitClause) queryParts.push(limitClause);
      if (offsetClause) queryParts.push(offsetClause);
      const query = queryParts.join(' ') + ';';

      const records = await this.port.executeSQL(baseId, query);

      // Get total count
      let totalCount = 0;
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause};`;
        const countResult = await this.port.executeSQL(baseId, countQuery);
        totalCount = parseInt(String(countResult[0]?.count || 0), 10);
      } catch {
        totalCount = records.length < limit ? records.length : Math.max(records.length * 20, 1000);
      }

      return { records, total: totalCount };
    }, 'Error fetching records');
  }

  async getRecord(baseId: string, tableName: string, recordId: string): Promise<BaseRecord> {
    return this.execute(async () => {
      const query = `SELECT * FROM ${tableName} WHERE id = '${escapeSql(recordId)}' LIMIT 1;`;
      const records = await this.port.executeSQL(baseId, query);
      return records[0];
    }, 'Error fetching record');
  }

  async getRecordCount(baseId: string, tableName: string, schemaName?: string): Promise<number> {
    return this.execute(async () => {
      const fullTableName = schemaName ? `${schemaName}.${tableName}` : tableName;
      const query = `SELECT COUNT(*) as count FROM ${fullTableName};`;
      const result = await this.port.executeSQL(baseId, query);
      return parseInt(String(result[0]?.count || 0), 10);
    }, 'Error getting record count');
  }

  async createRecord(baseId: string, tableName: string, data: Record<string, unknown>): Promise<BaseRecord> {
    return this.execute(async () => {
      const query = buildInsertSQL(tableName, data);
      const records = await this.port.executeSQL(baseId, query);
      return records[0];
    }, 'Error creating record');
  }

  async updateRecord(
    baseId: string,
    tableName: string,
    recordId: string,
    changes: Record<string, unknown>,
  ): Promise<BaseRecord> {
    return this.execute(async () => {
      const query = buildUpdateSQL(tableName, recordId, changes);
      const records = await this.port.executeSQL(baseId, query);
      return records[0];
    }, 'Error updating record');
  }

  async deleteRecords(baseId: string, tableName: string, recordIds: string | string[]): Promise<void> {
    return this.execute(async () => {
      const ids = Array.isArray(recordIds) ? recordIds : [recordIds];
      const BATCH_SIZE = 50;
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        const query = buildDeleteSQL(tableName, batchIds);
        await this.port.executeSQL(baseId, query);
      }
    }, 'Error deleting records');
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  async fetchUsers(baseId: string): Promise<BaseUser[]> {
    return this.execute(async () => {
      const query = 'SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 10000;';
      const users = await this.port.executeSQL(baseId, query);
      return users as BaseUser[];
    }, 'Error fetching users');
  }

  async deleteUser(baseId: string, userId: string): Promise<void> {
    return this.execute(async () => {
      const query = `DELETE FROM auth.users WHERE id = '${escapeSql(userId)}';`;
      await this.port.executeSQL(baseId, query);
    }, 'Error deleting user');
  }

  // ============================================================================
  // Bucket Operations
  // ============================================================================

  async fetchBuckets(baseId: string): Promise<BaseBucket[]> {
    return this.execute(async () => {
      const query = 'SELECT * FROM storage.buckets ORDER BY created_at DESC;';
      const buckets = await this.port.executeSQL(baseId, query);
      return buckets as BaseBucket[];
    }, 'Error fetching buckets');
  }

  // ============================================================================
  // Import/Export Operations
  // ============================================================================

  async importCSV(baseId: string, tableName: string, file: File): Promise<unknown> {
    return this.execute(
      async () => await this.port.importCSV(baseId, tableName, file),
      'Error importing CSV',
    );
  }

  async exportCSV(baseId: string, tableName?: string | null): Promise<Blob> {
    return this.execute(
      async () => await this.port.exportCSV(baseId, tableName),
      'Error exporting CSV',
    );
  }

  async exportSQL(baseId: string, includeData = false): Promise<Blob> {
    return this.execute(
      async () => await this.port.exportSQL(baseId, includeData),
      'Error exporting SQL',
    );
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async executeSQL(baseId: string, query: string): Promise<BaseRecord[]> {
    return this.execute(
      async () => await this.port.executeSQL(baseId, query),
      'Error executing SQL',
    );
  }
}

// ============================================================================
// FIELD DATA INTERFACE
// ============================================================================

export interface FieldData {
  name: string;
  db_field_name?: string;
  type: string;
  is_nullable?: boolean;
  is_unique?: boolean;
  default_value?: string;
  description?: string;
  comment?: string;
}

export interface FetchRecordsOptions {
  limit?: number;
  offset?: number;
  order?: string;
  filters?: Record<string, unknown>;
  searchQuery?: string;
  textFields?: string[];
}

// ============================================================================
// SINGLETON
// ============================================================================

let databaseServiceInstance: DatabaseService | null = null;

/**
 * Get DatabaseService singleton instance
 * @returns DatabaseService instance
 */
export const getDatabaseService = (): DatabaseService => {
  if (!databaseServiceInstance) {
    databaseServiceInstance = new DatabaseService();
  }
  return databaseServiceInstance;
};

