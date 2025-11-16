/**
 * Cloud Port - Domain interface for cloud infrastructure operations
 * Handles cloud instance management, metrics, and operations
 */

export interface CloudMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  [key: string]: unknown;
}

export interface MetricsOptions {
  timeRange?: string;
  interval?: string;
  [key: string]: unknown;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  [key: string]: unknown;
}

export interface OperationResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface Bucket {
  id: string;
  name: string;
  created_at: string;
  [key: string]: unknown;
}

export interface BucketData {
  name: string;
  public?: boolean;
  [key: string]: unknown;
}

export interface FileListOptions {
  prefix?: string;
  limit?: number;
  [key: string]: unknown;
}

export interface CloudFile {
  name: string;
  size: number;
  created_at: string;
  [key: string]: unknown;
}

export interface FileUploadData {
  file: File | Blob;
  path: string;
  [key: string]: unknown;
}

export interface UploadResult {
  url: string;
  path: string;
  [key: string]: unknown;
}

export interface LogsOptions {
  level?: string;
  limit?: number;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

export interface LogsResponse {
  logs: LogEntry[];
  total?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

export interface CloudInstance {
  id: string;
  name: string;
  status: string;
  region: string;
  [key: string]: unknown;
}

export interface Table {
  id: string;
  name: string;
  schema: string;
  columns?: Column[];
  [key: string]: unknown;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface TableData {
  name: string;
  schema: string;
  columns: ColumnDefinition[];
  [key: string]: unknown;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  [key: string]: unknown;
}

export interface TablesOptions {
  schema?: string;
  include_columns?: boolean;
  [key: string]: unknown;
}

export interface Service {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

export interface ServiceDetails extends Service {
  code?: string;
  environment?: Record<string, string>;
  [key: string]: unknown;
}

export interface ServiceData {
  name: string;
  code?: string;
  environment?: Record<string, string>;
  [key: string]: unknown;
}

export interface Secret {
  key: string;
  created_at: string;
  [key: string]: unknown;
}

export interface SecretData {
  key: string;
  value: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for cloud infrastructure operations
 */
export abstract class CloudPort {
  // ==================== Instance Operations ====================

  /**
   * Fetch cloud instance metrics
   * @param cloudId - Cloud instance ID
   * @param options - Query options
   * @returns Metrics data
   */
  abstract fetchMetrics(cloudId: string, options?: MetricsOptions): Promise<CloudMetrics>;

  /**
   * Fetch metrics history
   * @param cloudId - Cloud instance ID
   * @param options - Query options (timeRange, etc.)
   * @returns Historical metrics
   */
  abstract fetchMetricsHistory(cloudId: string, options?: MetricsOptions): Promise<MetricDataPoint[]>;

  /**
   * Start cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Operation result
   */
  abstract startInstance(cloudId: string): Promise<OperationResult>;

  /**
   * Stop cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Operation result
   */
  abstract stopInstance(cloudId: string): Promise<OperationResult>;

  /**
   * Restart cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Operation result
   */
  abstract restartInstance(cloudId: string): Promise<OperationResult>;

  /**
   * Pause cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Operation result
   */
  abstract pauseInstance(cloudId: string): Promise<OperationResult>;

  /**
   * Resume cloud instance
   * @param cloudId - Cloud instance ID
   * @returns Operation result
   */
  abstract resumeInstance(cloudId: string): Promise<OperationResult>;

  // ==================== Storage Operations ====================

  /**
   * List storage buckets
   * @param cloudId - Cloud instance ID
   * @returns Buckets
   */
  abstract listBuckets(cloudId: string): Promise<Bucket[]>;

  /**
   * Create storage bucket
   * @param cloudId - Cloud instance ID
   * @param bucketData - Bucket configuration
   * @returns Created bucket
   */
  abstract createBucket(cloudId: string, bucketData: BucketData): Promise<Bucket>;

  /**
   * Delete storage bucket
   * @param cloudId - Cloud instance ID
   * @param bucketId - Bucket ID
   */
  abstract deleteBucket(cloudId: string, bucketId: string): Promise<void>;

  /**
   * List files in bucket
   * @param cloudId - Cloud instance ID
   * @param bucketId - Bucket ID
   * @param options - Query options
   * @returns Files
   */
  abstract listFiles(cloudId: string, bucketId: string, options?: FileListOptions): Promise<CloudFile[]>;

  /**
   * Upload file to bucket
   * @param cloudId - Cloud instance ID
   * @param bucketId - Bucket ID
   * @param fileData - File data
   * @returns Upload result
   */
  abstract uploadFile(cloudId: string, bucketId: string, fileData: FileUploadData): Promise<UploadResult>;

  /**
   * Delete file from bucket
   * @param cloudId - Cloud instance ID
   * @param bucketId - Bucket ID
   * @param fileName - File name
   */
  abstract deleteFile(cloudId: string, bucketId: string, fileName: string): Promise<void>;

  // ==================== Logs Operations ====================

  /**
   * Fetch logs
   * @param cloudId - Cloud instance ID
   * @param options - Query options (filters, pagination)
   * @returns Logs data
   */
  abstract fetchLogs(cloudId: string, options?: LogsOptions): Promise<LogsResponse>;

  /**
   * Stream logs
   * @param cloudId - Cloud instance ID
   * @param callback - Callback for log entries
   * @returns Unsubscribe function
   */
  abstract streamLogs(cloudId: string, callback: (log: LogEntry) => void): Promise<() => void>;

  // ==================== Database Operations ====================

  /**
   * Fetch cloud instance metadata
   * @param cloudId - Cloud instance ID
   * @returns Cloud instance data
   */
  abstract fetchInstance(cloudId: string): Promise<CloudInstance>;

  /**
   * Execute raw SQL query
   * @param cloudId - Cloud instance ID
   * @param query - SQL query string
   * @returns Query results
   */
  abstract executeSQL(cloudId: string, query: string): Promise<unknown[]>;

  /**
   * Fetch database tables with optional column information
   * @param cloudId - Cloud instance ID
   * @param options - Query options
   * @returns Tables list
   */
  abstract fetchTables(cloudId: string, options?: TablesOptions): Promise<Table[]>;

  /**
   * Create a new table
   * @param cloudId - Cloud instance ID
   * @param tableData - Table configuration
   * @returns Created table
   */
  abstract createTable(cloudId: string, tableData: TableData): Promise<Table>;

  /**
   * Delete a table
   * @param cloudId - Cloud instance ID
   * @param tableId - Table ID
   */
  abstract deleteTable(cloudId: string, tableId: string): Promise<void>;

  // ==================== Services Operations ====================

  /**
   * Fetch all services for a base
   * @param baseId - Base/Cloud instance ID
   * @returns Services list
   */
  abstract fetchServices(baseId: string): Promise<Service[]>;

  /**
   * Fetch service details including code
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   * @returns Service details
   */
  abstract fetchServiceDetails(baseId: string, serviceName: string): Promise<ServiceDetails>;

  /**
   * Create a new service
   * @param baseId - Base/Cloud instance ID
   * @param serviceData - Service configuration
   * @returns Created service
   */
  abstract createService(baseId: string, serviceData: ServiceData): Promise<Service>;

  /**
   * Update an existing service
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   * @param serviceData - Service configuration
   * @returns Updated service
   */
  abstract updateService(baseId: string, serviceName: string, serviceData: ServiceData): Promise<Service>;

  /**
   * Delete a service
   * @param baseId - Base/Cloud instance ID
   * @param serviceName - Service name
   */
  abstract deleteService(baseId: string, serviceName: string): Promise<void>;

  // ==================== Secrets Operations ====================

  /**
   * Fetch all secrets for a base
   * @param baseId - Base/Cloud instance ID
   * @returns Secrets list
   */
  abstract fetchSecrets(baseId: string): Promise<Secret[]>;

  /**
   * Create or update a secret
   * @param baseId - Base/Cloud instance ID
   * @param secretData - Secret data (key, value)
   * @returns Created/updated secret
   */
  abstract createSecret(baseId: string, secretData: SecretData): Promise<Secret>;

  /**
   * Delete a secret
   * @param baseId - Base/Cloud instance ID
   * @param secretKey - Secret key
   */
  abstract deleteSecret(baseId: string, secretKey: string): Promise<void>;
}

