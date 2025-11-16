/**
 * Platform Port - Domain interface for main platform operations
 * Handles accounts, agents, templates, and core platform features
 */

export interface Agent {
  id: string;
  account_id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface AgentData {
  name: string;
  description?: string;
  instructions?: string;
  [key: string]: unknown;
}

export interface AgentUpdates {
  name?: string;
  description?: string;
  instructions?: string;
  [key: string]: unknown;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface AccountUpdates {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface Template {
  id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface TemplateData {
  name: string;
  type: string;
  source_id: string;
  [key: string]: unknown;
}

export interface Workspace {
  id: string;
  name: string;
  account_id: string;
  [key: string]: unknown;
}

export interface WorkspaceData {
  name: string;
  account_id: string;
  [key: string]: unknown;
}

export interface WorkspaceUpdates {
  name?: string;
  [key: string]: unknown;
}

export interface Tool {
  id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface ToolData {
  name: string;
  type: string;
  configuration?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ToolUpdates {
  name?: string;
  configuration?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Altaner {
  id: string;
  account_id: string;
  name: string;
  frontend_url?: string;
  [key: string]: unknown;
}

export interface AltanerData {
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface AltanerUpdates {
  name?: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AltanersListOptions {
  account_id?: string;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface AltanersListResponse {
  altaners: Altaner[];
  total?: number;
  has_more?: boolean;
  [key: string]: unknown;
}

export interface AltanerComponent {
  id: string;
  altaner_id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface ComponentData {
  name: string;
  type: string;
  configuration?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ComponentUpdates {
  name?: string;
  configuration?: Record<string, unknown>;
  position?: Position;
  [key: string]: unknown;
}

export interface Position {
  x: number;
  y: number;
  [key: string]: unknown;
}

export interface PositionsData {
  components: Record<string, Position>;
  [key: string]: unknown;
}

export interface UserConnections {
  connections: Connection[];
  [key: string]: unknown;
}

export interface Connection {
  id: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Media {
  id: string;
  account_id: string;
  file_name: string;
  mime_type: string;
  url: string;
  [key: string]: unknown;
}

export interface MediaData {
  file_name: string;
  mime_type: string;
  file_content: string | ArrayBuffer | Blob;
  [key: string]: unknown;
}

export interface Media3D {
  id: string;
  account_id: string;
  url: string;
  [key: string]: unknown;
}

export interface Media3DData {
  file: File | Blob;
  name: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for main platform operations
 */
export abstract class PlatformPort {
  // ==================== Agent Operations ====================

  /**
   * Fetch agent details
   * @param agentId - Agent ID
   * @returns Agent data
   */
  abstract fetchAgent(agentId: string): Promise<Agent>;

  /**
   * Fetch agent DM room
   * @param agentId - Agent ID
   * @param accountId - Account ID
   * @returns Room data
   */
  abstract fetchAgentDM(agentId: string, accountId: string): Promise<unknown>;

  /**
   * Create agent
   * @param accountId - Account ID
   * @param agentData - Agent configuration
   * @returns Created agent
   */
  abstract createAgent(accountId: string, agentData: AgentData): Promise<Agent>;

  /**
   * Update agent
   * @param agentId - Agent ID
   * @param updates - Agent updates
   * @returns Updated agent
   */
  abstract updateAgent(agentId: string, updates: AgentUpdates): Promise<Agent>;

  /**
   * Delete agent
   * @param agentId - Agent ID
   */
  abstract deleteAgent(agentId: string): Promise<void>;

  /**
   * Fetch agent rooms
   * @param agentId - Agent ID
   * @returns Rooms data
   */
  abstract fetchAgentRooms(agentId: string): Promise<unknown>;

  // ==================== Account Operations ====================

  /**
   * Fetch account details
   * @returns Account data
   */
  abstract fetchAccount(): Promise<Account>;

  /**
   * Update account
   * @param accountId - Account ID
   * @param updates - Account updates
   * @returns Updated account
   */
  abstract updateAccount(accountId: string, updates: AccountUpdates): Promise<Account>;

  // ==================== Template Operations ====================

  /**
   * Create template from entity
   * @param templateData - Template configuration
   * @returns Created template
   */
  abstract createTemplate(templateData: TemplateData): Promise<Template>;

  /**
   * Fetch template details
   * @param templateId - Template ID
   * @returns Template data
   */
  abstract fetchTemplate(templateId: string): Promise<Template>;

  // ==================== Space/Workspace Operations ====================

  /**
   * Fetch workspace details
   * @param workspaceId - Workspace ID
   * @returns Workspace data
   */
  abstract fetchWorkspace(workspaceId: string): Promise<Workspace>;

  /**
   * Create workspace
   * @param workspaceData - Workspace configuration
   * @returns Created workspace
   */
  abstract createWorkspace(workspaceData: WorkspaceData): Promise<Workspace>;

  /**
   * Update workspace
   * @param workspaceId - Workspace ID
   * @param updates - Workspace updates
   * @returns Updated workspace
   */
  abstract updateWorkspace(workspaceId: string, updates: WorkspaceUpdates): Promise<Workspace>;

  /**
   * Delete workspace
   * @param workspaceId - Workspace ID
   */
  abstract deleteWorkspace(workspaceId: string): Promise<void>;

  // ==================== Tool Operations ====================

  /**
   * Fetch tool details
   * @param toolId - Tool ID
   * @returns Tool data
   */
  abstract fetchTool(toolId: string): Promise<Tool>;

  /**
   * Create tool
   * @param toolData - Tool configuration
   * @returns Created tool
   */
  abstract createTool(toolData: ToolData): Promise<Tool>;

  /**
   * Update tool
   * @param toolId - Tool ID
   * @param updates - Tool updates
   * @returns Updated tool
   */
  abstract updateTool(toolId: string, updates: ToolUpdates): Promise<Tool>;

  /**
   * Delete tool
   * @param toolId - Tool ID
   */
  abstract deleteTool(toolId: string): Promise<void>;

  // ==================== Altaner/Project Operations ====================

  /**
   * Fetch altaner details
   * @param altanerId - Altaner ID
   * @returns Altaner data with frontend URLs
   */
  abstract fetchAltaner(altanerId: string): Promise<Altaner>;

  /**
   * Fetch list of altaners
   * @param options - Query options (account_id, limit, offset)
   * @returns Altaners list with pagination
   */
  abstract fetchAltanersList(options: AltanersListOptions): Promise<AltanersListResponse>;

  /**
   * Create altaner
   * @param accountId - Account ID
   * @param altanerData - Altaner configuration
   * @param idea - Optional idea parameter
   * @returns Created altaner
   */
  abstract createAltaner(accountId: string, altanerData: AltanerData, idea?: string): Promise<Altaner>;

  /**
   * Update altaner
   * @param altanerId - Altaner ID
   * @param updates - Altaner updates
   * @returns Updated altaner
   */
  abstract updateAltaner(altanerId: string, updates: AltanerUpdates): Promise<Altaner>;

  /**
   * Delete altaner
   * @param altanerId - Altaner ID
   */
  abstract deleteAltaner(altanerId: string): Promise<void>;

  /**
   * Update altaner positions
   * @param altanerId - Altaner ID
   * @param data - Positions update data
   * @returns Updated altaner
   */
  abstract updateAltanerPositions(altanerId: string, data: PositionsData): Promise<Altaner>;

  // ==================== Altaner Component Operations ====================

  /**
   * Create altaner component
   * @param altanerId - Altaner ID
   * @param componentData - Component configuration
   * @returns Created component
   */
  abstract createAltanerComponent(altanerId: string, componentData: ComponentData): Promise<AltanerComponent>;

  /**
   * Update altaner component
   * @param altanerId - Altaner ID
   * @param componentId - Component ID
   * @param updates - Component updates
   * @returns Updated component
   */
  abstract updateAltanerComponent(altanerId: string, componentId: string, updates: ComponentUpdates): Promise<AltanerComponent>;

  /**
   * Update altaner component by ID only
   * @param componentId - Component ID
   * @param updates - Component updates
   * @returns Updated component
   */
  abstract updateAltanerComponentById(componentId: string, updates: ComponentUpdates): Promise<AltanerComponent>;

  /**
   * Delete altaner component
   * @param componentId - Component ID
   */
  abstract deleteAltanerComponent(componentId: string): Promise<void>;

  // ==================== Connection Operations ====================

  /**
   * Fetch user connections
   * @returns User connections data
   */
  abstract fetchUserConnections(): Promise<UserConnections>;

  /**
   * Fetch account connections using GraphQL query
   * @param accountId - Account ID
   * @param query - GraphQL query object
   * @returns Account connections data
   */
  abstract fetchAccountConnectionsGQ(accountId: string, query: GraphQLQuery): Promise<unknown>;

  // ==================== Media Operations ====================

  /**
   * Fetch account media using GraphQL query
   * @param accountId - Account ID
   * @param query - GraphQL query object
   * @returns Account media data
   */
  abstract fetchAccountMedia(accountId: string, query: GraphQLQuery): Promise<unknown>;

  /**
   * Create media/upload file
   * @param accountId - Account ID
   * @param data - Media data {file_name, mime_type, file_content}
   * @returns Created media with URL
   */
  abstract createMedia(accountId: string, data: MediaData): Promise<Media>;

  /**
   * Delete media
   * @param mediaId - Media ID
   */
  abstract deleteMedia(mediaId: string): Promise<void>;

  /**
   * Create 3D model
   * @param accountId - Account ID
   * @param data - 3D model data
   * @returns Created 3D model
   */
  abstract createMedia3D(accountId: string, data: Media3DData): Promise<Media3D>;

  /**
   * Delete 3D model
   * @param modelId - Model ID
   */
  abstract deleteMedia3D(modelId: string): Promise<void>;
}

