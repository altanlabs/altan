/**
 * Database Port - Domain interface for database/table operations
 * Handles database instances, tables, records, and queries
 */

export interface CloudInstance {
  id: string;
  account_id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

export interface CloudInstanceData {
  name: string;
  account_id: string;
  region?: string;
  [key: string]: unknown;
}

export interface CloudInstanceUpdates {
  name?: string;
  status?: string;
  [key: string]: unknown;
}

export interface Table {
  id: string;
  cloud_id: string;
  name: string;
  schema: string;
  [key: string]: unknown;
}

export interface TableData {
  name: string;
  schema: string;
  columns?: ColumnDefinition[];
  [key: string]: unknown;
}

export interface TableUpdates {
  name?: string;
  [key: string]: unknown;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  default?: unknown;
  [key: string]: unknown;
}

export interface Record {
  id: string;
  [key: string]: unknown;
}

export interface RecordData {
  [key: string]: unknown;
}

export interface RecordUpdates {
  [key: string]: unknown;
}

export interface FetchRecordsOptions {
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  order_by?: string;
  ascending?: boolean;
  [key: string]: unknown;
}

export interface RecordsResponse {
  records: Record[];
  total?: number;
  has_more?: boolean;
  [key: string]: unknown;
}

export interface QueryOptions {
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface QueryResult {
  rows: unknown[];
  columns?: string[];
  row_count?: number;
  [key: string]: unknown;
}

export interface Schema {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface SchemaData {
  name: string;
  [key: string]: unknown;
}

export interface FetchTablesOptions {
  schema?: string;
  include_columns?: boolean;
  [key: string]: unknown;
}

export interface Column {
  id: number;
  name: string;
  type: string;
  table_id: number;
  [key: string]: unknown;
}

export interface ColumnData {
  name: string;
  type: string;
  table_id: number;
  nullable?: boolean;
  [key: string]: unknown;
}

export interface ColumnUpdates {
  name?: string;
  type?: string;
  nullable?: boolean;
  [key: string]: unknown;
}

export interface FetchColumnsOptions {
  table_id?: number;
  schema?: string;
  [key: string]: unknown;
}

export interface Policy {
  id: string;
  table_name: string;
  policy_name: string;
  definition: string;
  [key: string]: unknown;
}

export interface PostgRESTParams {
  select?: string;
  filter?: Record<string, unknown>;
  order?: string;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

/**
 * Abstract base class for database/table operations
 */
export abstract class DatabasePort {
  // ==================== Database/Cloud Instance Operations ====================

  /**
   * Fetch cloud instances
   * @param accountId - Account ID
   * @returns Cloud instances
   */
  abstract fetchCloudInstances(accountId: string): Promise<CloudInstance[]>;

  /**
   * Fetch cloud instance details
   * @param cloudId - Cloud instance ID
   * @returns Cloud instance data
   */
  abstract fetchCloudInstance(cloudId: string): Promise<CloudInstance>;

  /**
   * Create cloud instance
   * @param cloudData - Cloud instance configuration
   * @returns Created cloud instance
   */
  abstract createCloudInstance(cloudData: CloudInstanceData): Promise<CloudInstance>;

  /**
   * Update cloud instance
   * @param cloudId - Cloud instance ID
   * @param updates - Updates
   * @returns Updated cloud instance
   */
  abstract updateCloudInstance(cloudId: string, updates: CloudInstanceUpdates): Promise<CloudInstance>;

  /**
   * Delete cloud instance
   * @param cloudId - Cloud instance ID
   */
  abstract deleteCloudInstance(cloudId: string): Promise<void>;

  // ==================== Table Operations ====================

  /**
   * Fetch tables in a cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Tables
   */
  abstract fetchTables(cloudId: string): Promise<Table[]>;

  /**
   * Fetch table details
   * @param tableId - Table ID
   * @returns Table data
   */
  abstract fetchTable(tableId: string): Promise<Table>;

  /**
   * Create table
   * @param cloudId - Cloud instance ID
   * @param tableData - Table configuration
   * @returns Created table
   */
  abstract createTable(cloudId: string, tableData: TableData): Promise<Table>;

  /**
   * Update table
   * @param tableId - Table ID
   * @param updates - Table updates
   * @returns Updated table
   */
  abstract updateTable(tableId: string, updates: TableUpdates): Promise<Table>;

  /**
   * Delete table
   * @param tableId - Table ID
   */
  abstract deleteTable(tableId: string): Promise<void>;

  // ==================== Record Operations ====================

  /**
   * Fetch records from table
   * @param tableId - Table ID
   * @param options - Query options (filters, pagination)
   * @returns Records data
   */
  abstract fetchRecords(tableId: string, options?: FetchRecordsOptions): Promise<RecordsResponse>;

  /**
   * Fetch single record
   * @param tableId - Table ID
   * @param recordId - Record ID
   * @returns Record data
   */
  abstract fetchRecord(tableId: string, recordId: string): Promise<Record>;

  /**
   * Create record
   * @param tableId - Table ID
   * @param recordData - Record data
   * @returns Created record
   */
  abstract createRecord(tableId: string, recordData: RecordData): Promise<Record>;

  /**
   * Update record
   * @param tableId - Table ID
   * @param recordId - Record ID
   * @param updates - Record updates
   * @returns Updated record
   */
  abstract updateRecord(tableId: string, recordId: string, updates: RecordUpdates): Promise<Record>;

  /**
   * Delete record
   * @param tableId - Table ID
   * @param recordId - Record ID
   */
  abstract deleteRecord(tableId: string, recordId: string): Promise<void>;

  // ==================== Query Operations ====================

  /**
   * Execute SQL query
   * @param cloudId - Cloud instance ID
   * @param query - SQL query
   * @param options - Query options
   * @returns Query results
   */
  abstract executeQuery(cloudId: string, query: string, options?: QueryOptions): Promise<QueryResult>;

  /**
   * Execute PostgREST query
   * @param cloudId - Cloud instance ID
   * @param table - Table name
   * @param params - PostgREST query parameters
   * @returns Query results
   */
  abstract executePostgRESTQuery(cloudId: string, table: string, params?: PostgRESTParams): Promise<QueryResult>;

  // ==================== PG-Meta Schema Operations ====================

  /**
   * Fetch schemas
   * @param baseId - Base/Cloud instance ID
   * @returns Schemas
   */
  abstract fetchSchemas(baseId: string): Promise<Schema[]>;

  /**
   * Create schema
   * @param baseId - Base/Cloud instance ID
   * @param schemaData - Schema configuration
   * @returns Created schema
   */
  abstract createSchema(baseId: string, schemaData: SchemaData): Promise<Schema>;

  /**
   * Delete schema
   * @param baseId - Base/Cloud instance ID
   * @param schemaId - Schema ID
   * @param cascade - Cascade delete
   */
  abstract deleteSchema(baseId: string, schemaId: number, cascade: boolean): Promise<void>;

  // ==================== PG-Meta Column Operations ====================

  /**
   * Fetch columns with pg-meta
   * @param baseId - Base/Cloud instance ID
   * @param options - Query options
   * @returns Columns
   */
  abstract fetchColumns(baseId: string, options: FetchColumnsOptions): Promise<Column[]>;

  /**
   * Create column with pg-meta
   * @param baseId - Base/Cloud instance ID
   * @param columnData - Column configuration
   * @returns Created column
   */
  abstract createColumn(baseId: string, columnData: ColumnData): Promise<Column>;

  /**
   * Update column with pg-meta
   * @param baseId - Base/Cloud instance ID
   * @param columnId - Column ID
   * @param changes - Column updates
   * @returns Updated column
   */
  abstract updateColumn(baseId: string, columnId: number, changes: ColumnUpdates): Promise<Column>;

  /**
   * Delete column with pg-meta
   * @param baseId - Base/Cloud instance ID
   * @param columnId - Column ID
   * @param cascade - Cascade delete
   */
  abstract deleteColumn(baseId: string, columnId: number, cascade: boolean): Promise<void>;

  // ==================== RLS Policy Operations ====================

  /**
   * Fetch RLS policies
   * @param baseId - Base/Cloud instance ID
   * @param tableName - Table name
   * @returns Policies
   */
  abstract fetchPolicies(baseId: string, tableName: string): Promise<Policy[]>;

  // ==================== Import/Export Operations ====================

  /**
   * Import CSV to table
   * @param baseId - Base/Cloud instance ID
   * @param tableName - Table name
   * @param file - CSV file
   * @returns Import result
   */
  abstract importCSV(baseId: string, tableName: string, file: File | Blob): Promise<{ success: boolean; rows_imported?: number }>;

  /**
   * Export database to CSV
   * @param baseId - Base/Cloud instance ID
   * @param tableName - Optional table name
   * @returns CSV data
   */
  abstract exportCSV(baseId: string, tableName: string | null): Promise<Blob>;

  /**
   * Export database to SQL
   * @param baseId - Base/Cloud instance ID
   * @param includeData - Include data in export
   * @returns SQL data
   */
  abstract exportSQL(baseId: string, includeData: boolean): Promise<Blob>;

  // ==================== SQL Execution ====================

  /**
   * Execute raw SQL query
   * @param baseId - Base/Cloud instance ID
   * @param query - SQL query
   * @returns Query results
   */
  abstract executeSQL(baseId: string, query: string): Promise<unknown[]>;
}

