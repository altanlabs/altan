/**
 * Integration Port - Domain interface for integration/connection operations
 * Handles OAuth connections, webhooks, and external service integrations
 */

export interface Connection {
  id: string;
  account_id: string;
  connection_type_id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

export interface ConnectionType {
  id: string;
  name: string;
  category: string;
  [key: string]: unknown;
}

export interface ConnectionData {
  connection_type_id: string;
  name: string;
  credentials?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConnectionUpdates {
  name?: string;
  status?: string;
  credentials?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface Tool {
  id: string;
  connection_id: string;
  name: string;
  [key: string]: unknown;
}

export interface Resource {
  id: string;
  connection_id: string;
  resource_type_id: string;
  [key: string]: unknown;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  [key: string]: unknown;
}

export interface AuthorizationRequest {
  id: string;
  room_id?: string;
  is_completed: boolean;
  [key: string]: unknown;
}

export interface AuthorizationRequestUpdates {
  is_completed?: boolean;
  [key: string]: unknown;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: string;
  [key: string]: unknown;
}

export interface WebhookData {
  url: string;
  events: string[];
  [key: string]: unknown;
}

export interface WebhookUpdates {
  url?: string;
  events?: string[];
  status?: string;
  [key: string]: unknown;
}

export interface FetchConnectionsOptions {
  account_id?: string;
  connection_type_id?: string;
  [key: string]: unknown;
}

export interface ConnectionsResponse {
  connections: Connection[];
  total?: number;
  [key: string]: unknown;
}

export interface ConnectionTypesResponse {
  connection_types: ConnectionType[];
  [key: string]: unknown;
}

export interface AuthorizationRequestsOptions {
  room_id?: string;
  is_completed?: boolean;
  [key: string]: unknown;
}

export interface AuthorizationRequestsResponse {
  requests: AuthorizationRequest[];
  total?: number;
  [key: string]: unknown;
}

export interface FetchWebhooksOptions {
  account_id?: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for integration/connection operations
 */
export abstract class IntegrationPort {
  // ==================== Connection Operations ====================

  /**
   * Fetch connections for an account
   * @param options - Query options
   * @returns Connections data
   */
  abstract fetchConnections(options?: FetchConnectionsOptions): Promise<ConnectionsResponse>;

  /**
   * Fetch connection types
   * @param isCompact - Whether to fetch compact version
   * @returns Connection types response
   */
  abstract fetchConnectionTypes(isCompact?: boolean): Promise<ConnectionTypesResponse>;

  /**
   * Fetch single connection type
   * @param connectionTypeId - Connection type ID
   * @returns Connection type data
   */
  abstract fetchConnectionType(connectionTypeId: string): Promise<ConnectionType>;

  /**
   * Fetch account-specific connection type
   * @param accountId - Account ID
   * @param connTypeId - Connection type ID
   * @returns Connection type data
   */
  abstract fetchAccountConnectionType(accountId: string, connTypeId: string): Promise<ConnectionType>;

  /**
   * Create connection
   * @param accountId - Account ID
   * @param connectionData - Connection configuration
   * @returns Created connection
   */
  abstract createConnection(accountId: string, connectionData: ConnectionData): Promise<Connection>;

  /**
   * Rename connection
   * @param connectionId - Connection ID
   * @param name - New connection name
   * @returns Updated connection
   */
  abstract renameConnection(connectionId: string, name: string): Promise<Connection>;

  /**
   * Update connection
   * @param connectionId - Connection ID
   * @param updates - Connection updates
   * @returns Updated connection
   */
  abstract updateConnection(connectionId: string, updates: ConnectionUpdates): Promise<Connection>;

  /**
   * Delete connection
   * @param connectionId - Connection ID
   */
  abstract deleteConnection(connectionId: string): Promise<void>;

  /**
   * Test connection
   * @param connectionId - Connection ID
   * @returns Test result
   */
  abstract testConnection(connectionId: string): Promise<ConnectionTestResult>;

  /**
   * Create tool for a connection
   * @param connectionId - Connection ID
   * @param formData - Tool data
   * @returns Created tool
   */
  abstract createTool(connectionId: string, formData: Record<string, unknown>): Promise<Tool>;

  /**
   * Create resource for a connection
   * @param connectionId - Connection ID
   * @param resourceTypeId - Resource type ID
   * @param data - Resource data
   * @returns Created resource
   */
  abstract createResource(connectionId: string, resourceTypeId: string, data: Record<string, unknown>): Promise<Resource>;

  /**
   * Execute action on a connection
   * @param connectionId - Connection ID
   * @param actionTypeId - Action type ID
   * @returns Action result
   */
  abstract executeAction(connectionId: string, actionTypeId: string): Promise<ActionResult>;

  // ==================== Authorization Request Operations ====================

  /**
   * Fetch authorization requests
   * @param options - Query options (room_id, is_completed)
   * @returns Authorization requests
   */
  abstract fetchAuthorizationRequests(options?: AuthorizationRequestsOptions): Promise<AuthorizationRequestsResponse>;

  /**
   * Update authorization request
   * @param requestId - Request ID
   * @param updates - Request updates
   * @returns Updated request
   */
  abstract updateAuthorizationRequest(requestId: string, updates: AuthorizationRequestUpdates): Promise<AuthorizationRequest>;

  // ==================== Webhook Operations ====================

  /**
   * Fetch webhooks
   * @param options - Query options
   * @returns Webhooks
   */
  abstract fetchWebhooks(options?: FetchWebhooksOptions): Promise<Webhook[]>;

  /**
   * Create webhook
   * @param webhookData - Webhook configuration
   * @returns Created webhook
   */
  abstract createWebhook(webhookData: WebhookData): Promise<Webhook>;

  /**
   * Update webhook
   * @param webhookId - Webhook ID
   * @param updates - Webhook updates
   * @returns Updated webhook
   */
  abstract updateWebhook(webhookId: string, updates: WebhookUpdates): Promise<Webhook>;

  /**
   * Delete webhook
   * @param webhookId - Webhook ID
   */
  abstract deleteWebhook(webhookId: string): Promise<void>;
}

