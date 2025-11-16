/**
 * Type definitions for Service layer
 */

import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

// ==================== Common Types ====================

/**
 * Pagination cursor for API responses
 */
export interface PaginationCursor {
  has_next_page: boolean;
  next_cursor: string | null;
  prev_cursor?: string | null;
}

/**
 * Paginated response with items
 */
export interface PaginatedResponse<T> {
  items: T[];
  has_next_page: boolean;
  next_cursor: string | null;
}

/**
 * Normalized collection with byId and allIds
 */
export interface NormalizedCollection<T> {
  byId: Record<string, T>;
  allIds: string[];
}

// ==================== Room Types ====================

/**
 * Room data structure
 */
export interface Room {
  id: string;
  name: string;
  description?: string;
  type?: string;
  main_thread_id?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Room member data structure
 */
export interface RoomMember {
  id: string;
  user_id: string;
  room_id: string;
  role: string;
  joined_at: string;
  [key: string]: unknown;
}

/**
 * Room with members response
 */
export interface RoomWithMembers {
  room: Room;
  members: { items: RoomMember[] };
  mainThreadId?: string;
}

/**
 * Rooms fetch options
 */
export interface FetchRoomsOptions {
  limit?: number;
  cursor?: string | null;
  [key: string]: unknown;
}

/**
 * Rooms response
 */
export interface RoomsResponse {
  rooms: Room[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

// ==================== Thread Types ====================

/**
 * Thread data structure
 */
export interface Thread {
  id: string;
  room_id: string;
  name: string;
  status?: string;
  created_at: string;
  updated_at: string;
  messages?: PaginatedResponse<Message>;
  [key: string]: unknown;
}

/**
 * Thread batch result from generator
 */
export interface ThreadBatch {
  threads: NormalizedCollection<Thread> | Thread[];
  cursor: string | null;
  hasNextPage?: boolean;
}

/**
 * Thread creation options
 */
export interface CreateThreadOptions {
  name?: string;
  starter_message_id?: string;
}

/**
 * Thread update data
 */
export interface UpdateThreadData {
  name?: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
}

// ==================== Message Types ====================

/**
 * Message data structure
 */
export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  attachments?: Attachment[];
  replied_to?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Message attachment
 */
export interface Attachment {
  id: string;
  type: string;
  url: string;
  name?: string;
  size?: number;
  [key: string]: unknown;
}

/**
 * Message content for sending
 */
export interface MessageContent {
  text: string;
  attachments?: Attachment[];
  replied_id?: string;
  [key: string]: unknown;
}

/**
 * Message update data
 */
export interface UpdateMessageData {
  text: string;
  [key: string]: unknown;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (percentCompleted: number) => void;

// ==================== Tab Types ====================

/**
 * Tab data structure
 */
export interface Tab {
  id: string | number;
  threadId: string;
  name: string;
  isMainThread: boolean;
  createdAt: string;
}

/**
 * Tabs state structure
 */
export interface TabsState {
  byId: Record<string | number, Tab>;
  allIds: (string | number)[];
  activeTabId: string | number | null;
  nextTabId: number;
}

// ==================== Voice Types ====================

/**
 * Voice conversation data structure
 */
export interface VoiceConversation {
  isActive: boolean;
  agentId: string;
  elevenlabsId: string;
  conversation: unknown; // ElevenLabs conversation object
  startedAt: string;
  threadId: string;
}

/**
 * Voice conversations state
 */
export interface VoiceConversationsState {
  byThreadId: Record<string, VoiceConversation>;
}

// ==================== Agent Types ====================

/**
 * Agent data structure
 */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  account_id: string;
  voice?: string;
  meta_data?: {
    agent_type?: string;
    goal?: string;
    industry?: string;
    created_from?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Agent creation data
 */
export interface CreateAgentData {
  name: string;
  description?: string;
  voice?: string;
  meta_data?: {
    agent_type?: string;
    goal?: string;
    industry?: string;
    created_from?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Agent update data
 */
export interface UpdateAgentData {
  name?: string;
  description?: string;
  voice?: string;
  meta_data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Agent response retry data
 */
export interface AgentRetryData {
  response_id: string;
  [key: string]: unknown;
}

/**
 * Voice data structure
 */
export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  [key: string]: unknown;
}

/**
 * List voices options
 */
export interface ListVoicesOptions {
  search?: string;
  next_page_token?: string;
  [key: string]: unknown;
}

/**
 * List voices response
 */
export interface ListVoicesResponse {
  voices: Voice[];
  has_more: boolean;
  next_page_token: string | null;
}

/**
 * Agent DM room response
 */
export interface AgentDMResponse {
  id: string;
  [key: string]: unknown;
}

/**
 * Agent rooms response
 */
export interface AgentRoomsResponse {
  rooms: Room[];
  [key: string]: unknown;
}

/**
 * Fetch agent response
 */
export interface FetchAgentResponse {
  agent: Agent;
  [key: string]: unknown;
}

// ==================== Integration Types ====================

/**
 * Authorization request
 */
export interface AuthorizationRequest {
  id: string;
  room_id: string;
  is_completed: boolean;
  [key: string]: unknown;
}

/**
 * Authorization requests fetch options
 */
export interface FetchAuthRequestsOptions {
  roomId?: string;
  isCompleted?: string | boolean;
}

// ==================== Reaction Types ====================

/**
 * Reaction data
 */
export interface Reaction {
  reaction_type: string;
  emoji: string;
  [key: string]: unknown;
}

// ==================== Media Types ====================

/**
 * Media upload data
 */
export interface MediaData {
  file?: File | Blob;
  file_name?: string;
  mime_type?: string;
  file_content?: string;
  [key: string]: unknown;
}

/**
 * Media item data structure
 */
export interface MediaItem {
  id: string;
  file_name: string;
  mime_type: string;
  name: string;
  type: string;
  media_url?: string;
  is_chat?: boolean;
  date_creation?: string;
  meta_data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * 3D Model data structure
 */
export interface Media3D {
  id: string;
  name?: string;
  url?: string;
  date_creation?: string;
  [key: string]: unknown;
}

/**
 * Media list response
 */
export interface MediaListResponse {
  items: MediaItem[];
  has_next_page: boolean;
  next_cursor: string | null;
}

/**
 * 3D Models list response
 */
export interface Media3DListResponse {
  items: Media3D[];
  has_next_page: boolean;
  next_cursor: string | null;
}

/**
 * Create media response
 */
export interface CreateMediaResponse {
  media: MediaItem;
  media_url: string;
}

/**
 * Create 3D model data
 */
export interface CreateMedia3DData {
  [key: string]: unknown;
}

// ==================== Template Types ====================

/**
 * Account data structure
 */
export interface Account {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

/**
 * Template selected version
 */
export interface TemplateVersion {
  id?: string;
  cover_url?: string;
  build_metadata?: {
    meta_data?: {
      cover_url?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Template data structure
 */
export interface Template {
  id: string;
  name?: string;
  description?: string;
  template_type?: string;
  account_id?: string;
  account?: Account;
  selected_version?: TemplateVersion;
  meta_data?: {
    cover_url?: string;
    [key: string]: unknown;
  };
  cover_url?: string;
  has_cover?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Templates list response
 */
export interface TemplatesListResponse {
  templates: Template[];
  total_count: number;
}

/**
 * Fetch templates options
 */
export interface FetchTemplatesOptions {
  limit?: number;
  offset?: number;
  template_type?: string;
  account_id?: string;
  name?: string;
}

// ==================== Marketplace Types ====================

/**
 * Marketplace template data structure
 */
export interface MarketplaceTemplate {
  id: string;
  name?: string;
  description?: string;
  entity_type: 'altaner' | 'workflow' | 'agent' | 'form' | 'interface' | 'database';
  account_id?: string;
  account?: Account;
  meta_data?: {
    cover_url?: string;
    [key: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Marketplace templates response
 */
export interface MarketplaceTemplatesResponse {
  templates: MarketplaceTemplate[];
}

// ==================== Altaner/Project Types ====================

/**
 * Altaner component data structure
 */
export interface AltanerComponent {
  id: string;
  altaner_id: string;
  type: string;
  position: number;
  params?: {
    url?: string;
    [key: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Altaner template version data structure
 */
export interface AltanerTemplateVersion {
  id: string;
  template_id: string;
  version: string;
  [key: string]: unknown;
}

/**
 * Altaner template data structure
 */
export interface AltanerTemplate {
  id: string;
  altaner_id: string;
  versions?: {
    items: AltanerTemplateVersion[];
  };
  [key: string]: unknown;
}

/**
 * Altaner variable data structure
 */
export interface AltanerVariable {
  name: string;
  value: unknown;
  [key: string]: unknown;
}

/**
 * Altaner data structure
 */
export interface Altaner {
  id: string;
  name: string;
  description?: string;
  account_id: string;
  template?: AltanerTemplate;
  components?: {
    items: AltanerComponent[];
  };
  meta_data?: {
    variables?: AltanerVariable[];
    [key: string]: unknown;
  };
  frontend_preview_url?: string;
  frontend_live_url?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Altaners list response
 */
export interface AltanersListResponse {
  altaners: Altaner[];
  total_count?: number;
  has_next_page?: boolean;
  next_cursor?: string | null;
}

/**
 * Fetch altaners options
 */
export interface FetchAltanersOptions {
  account_id: string;
  limit?: number;
  offset?: number;
}

/**
 * Create altaner data
 */
export interface CreateAltanerData {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Update altaner data
 */
export interface UpdateAltanerData {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Update altaner component data
 */
export interface UpdateAltanerComponentData {
  type?: string;
  position?: number;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Create altaner component data
 */
export interface CreateAltanerComponentData {
  type: string;
  position: number;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Update altaner positions data
 */
export interface UpdateAltanerPositionsData {
  positions: Array<{
    id: string;
    position: number;
  }>;
}

// ==================== Commit Types ====================

/**
 * Commit data structure
 */
export interface Commit {
  hash: string;
  author?: string;
  date?: string;
  message?: string;
  files_changed?: number;
  insertions?: number;
  deletions?: number;
  [key: string]: unknown;
}

/**
 * Commit details with cache metadata
 */
export interface CommitDetails {
  data: Commit | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

/**
 * Commits state structure
 */
export interface CommitsState {
  commits: Record<string, CommitDetails>;
  restoring: Record<string, boolean>;
}

// ==================== Port Interfaces ====================

/**
 * Pods port interface
 */
export interface IPodsPort {
  fetchCommitDetails(interfaceId: string, hash: string): Promise<Commit>;
  restoreCommit(interfaceId: string, hash: string): Promise<void>;
  getAxiosInstance(): unknown;
}

/**
 * Room port interface
 */
export interface IRoomPort {
  fetchUserRooms(options?: FetchRoomsOptions): Promise<{ rooms: Room[]; has_next_page: boolean; next_cursor: string | null }>;
  searchRooms(query: string, options?: unknown): Promise<{ rooms: Room[] }>;
  fetchRoom(roomId: string): Promise<Room & { main_thread_id?: string }>;
  fetchMembers(roomId: string, options?: { limit?: number }): Promise<{ members: RoomMember[] }>;
  fetchThread(threadId: string, options?: unknown): Promise<Thread>;
  fetchThreads(roomId: string, options?: { limit?: number; cursor?: string | null }): Promise<{ threads: Thread[]; pagination: PaginationCursor }>;
  fetchMessages(threadId: string, options?: { limit?: number; cursor?: string | null }): Promise<{ messages: Message[]; pagination: PaginationCursor }>;
  createThread(roomId: string, options?: CreateThreadOptions): Promise<Thread>;
  createThreadFromMessage(messageId: string, options?: { name?: string }): Promise<Thread>;
  sendMessage(threadId: string, content: MessageContent, config?: AxiosRequestConfig): Promise<Message>;
  sendAgentMessage(threadId: string, agentId: string, content: MessageContent, config?: AxiosRequestConfig): Promise<Message>;
  updateRoom(roomId: string, updates: Partial<Room>): Promise<void>;
  updateThread(threadId: string, updates: UpdateThreadData): Promise<void>;
  updateMessage(messageId: string, updates: UpdateMessageData): Promise<void>;
  deleteRoom(roomId: string): Promise<void>;
  deleteThread(threadId: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  updateMember(roomId: string, action: string, body: unknown): Promise<void>;
  inviteMembers(roomId: string, invitation: unknown): Promise<void>;
  markThreadRead(threadId: string, timestamp: string): Promise<void>;
  addReaction(messageId: string, reaction: Reaction): Promise<void>;
  createRoom(roomData: Partial<Room>): Promise<RoomWithMembers>;
  createMedia(roomId: string, mediaData: MediaData): Promise<string>;
  exitRoom(roomId: string): Promise<void>;
  fetchRoomByExternalId(externalId: string, accountId: string): Promise<{ room: Room }>;
  getAxiosInstance(): unknown;
}

/**
 * Agent port interface
 */
export interface IAgentPort {
  stopAgentResponse(responseId: string): Promise<unknown>;
  stopThreadGeneration(threadId: string): Promise<unknown>;
  retryResponse(retryData: AgentRetryData): Promise<unknown>;
  listVoices(options?: ListVoicesOptions): Promise<ListVoicesResponse>;
}

/**
 * Platform port interface
 */
export interface IPlatformPort {
  fetchAgent(agentId: string): Promise<FetchAgentResponse>;
  fetchAgentDM(agentId: string, accountId: string): Promise<AgentDMResponse>;
  createAgent(accountId: string, agentData: CreateAgentData): Promise<{ agent: Agent }>;
  updateAgent(agentId: string, updates: UpdateAgentData): Promise<{ agent: Agent }>;
  deleteAgent(agentId: string): Promise<void>;
  fetchAgentRooms(agentId: string): Promise<AgentRoomsResponse>;
  fetchAccount(): Promise<unknown>;
  updateAccount(accountId: string, updates: unknown): Promise<unknown>;
  getAxiosInstance(): unknown;
  [key: string]: unknown;
}

// ==================== Connection Types ====================

/**
 * External app data structure
 */
export interface ExternalApp {
  id: string;
  name: string;
  icon?: string;
  [key: string]: unknown;
}

/**
 * Connection type data structure
 */
export interface ConnectionType {
  id: string;
  name: string;
  icon?: string;
  external_app?: ExternalApp;
  webhooks?: {
    items: Webhook[];
  };
  [key: string]: unknown;
}

/**
 * Connection data structure
 */
export interface Connection {
  id: string;
  name: string;
  account_id: string;
  user_id?: string;
  connection_type?: ConnectionType;
  connection_type_id?: string;
  details?: Record<string, unknown>;
  tools?: {
    items: Tool[];
  };
  resources?: {
    items: Resource[];
  };
  date_creation?: string;
  [key: string]: unknown;
}

/**
 * Tool data structure
 */
export interface Tool {
  id: string;
  name: string;
  description?: string;
  connection_id?: string;
  [key: string]: unknown;
}

/**
 * Resource data structure
 */
export interface Resource {
  id: string;
  name: string;
  url?: string;
  connection_id?: string;
  resource_type_id?: string;
  [key: string]: unknown;
}

/**
 * Webhook data structure
 */
export interface Webhook {
  id: string;
  name: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * Connections response with pagination
 */
export interface ConnectionsResponse {
  items: Connection[];
  has_next_page: boolean;
  next_cursor: string | null;
}

/**
 * Connection types response
 */
export interface ConnectionTypesResponse {
  items: ConnectionType[];
}

/**
 * GraphQL query for connections
 */
export interface ConnectionGQQuery {
  '@fields': string[];
  connections?: {
    '@fields': string[];
    connection_type?: {
      '@fields': string[];
      external_app?: {
        '@fields': string[];
      };
    };
    tools?: {
      '@fields': string;
    };
    resources?: {
      '@fields': string;
    };
  };
}

/**
 * Create connection data
 */
export interface CreateConnectionData {
  connection_type_id: string;
  name?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Create tool data
 */
export interface CreateToolData {
  name: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Create resource data
 */
export interface CreateResourceData {
  url: string;
  [key: string]: unknown;
}

/**
 * Integration port interface
 */
export interface IIntegrationPort {
  fetchAuthorizationRequests(options: { roomId?: string; isCompleted?: string }): Promise<{ authorization_requests?: AuthorizationRequest[] }>;
  
  // Connection operations
  fetchConnectionTypes(isCompact?: boolean): Promise<ConnectionTypesResponse>;
  fetchConnectionType(connectionTypeId: string): Promise<{ connection_type: ConnectionType }>;
  fetchAccountConnectionType(accountId: string, connTypeId: string): Promise<{ connection_type: ConnectionType }>;
  createConnection(accountId: string, data: CreateConnectionData): Promise<{ connection: Connection }>;
  renameConnection(connectionId: string, name: string): Promise<{ connection: Connection }>;
  deleteConnection(connectionId: string): Promise<void>;
  
  // Tool operations
  createTool(connectionId: string, formData: CreateToolData): Promise<{ tool: Tool }>;
  
  // Resource operations
  createResource(connectionId: string, resourceTypeId: string, data: CreateResourceData): Promise<{ resource: Resource }>;
  
  // Action operations
  executeAction(connectionId: string, actionTypeId: string): Promise<unknown>;
}

/**
 * Platform port interface
 */
export interface IPlatformPort {
  // Altaner operations
  fetchAltaner(altanerId: string): Promise<{ altaner: Altaner; frontend_preview_url?: string; frontend_live_url?: string }>;
  fetchAltanersList(options: FetchAltanersOptions): Promise<AltanersListResponse>;
  createAltaner(accountId: string, data: CreateAltanerData, idea?: string): Promise<Altaner>;
  updateAltaner(altanerId: string, data: UpdateAltanerData): Promise<Altaner>;
  deleteAltaner(altanerId: string): Promise<void>;
  
  // Altaner positions
  updateAltanerPositions(altanerId: string, data: UpdateAltanerPositionsData): Promise<{ altaner: Altaner }>;
  
  // Altaner components
  createAltanerComponent(altanerId: string, data: CreateAltanerComponentData): Promise<{ component: AltanerComponent }>;
  updateAltanerComponent(altanerId: string, componentId: string, data: UpdateAltanerComponentData): Promise<{ component: AltanerComponent }>;
  updateAltanerComponentById(componentId: string, data: UpdateAltanerComponentData): Promise<{ component: AltanerComponent }>;
  deleteAltanerComponent(componentId: string): Promise<void>;
  
  // Connection operations
  fetchUserConnections(): Promise<{ connections: Connection[] }>;
  fetchAccountConnectionsGQ(accountId: string, query: ConnectionGQQuery): Promise<{ id: string; connections: ConnectionsResponse }>;
  
  // Tool operations
  updateTool(toolId: string, formData: unknown): Promise<{ tool: Tool }>;
  
  // Media operations
  fetchAccountMedia(accountId: string, query: unknown): Promise<{ id: string; media: MediaListResponse; media3D: Media3DListResponse }>;
  createMedia(accountId: string, data: { file_name: string; mime_type: string; file_content: string }): Promise<CreateMediaResponse>;
  deleteMedia(mediaId: string): Promise<void>;
  createMedia3D(accountId: string, data: CreateMedia3DData): Promise<{ media: Media3D }>;
  deleteMedia3D(modelId: string): Promise<void>;
  
  // Get axios instance for advanced use
  getAxiosInstance?(): unknown;
}

// ==================== Task & Plan Types ====================

/**
 * Task status type
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * Plan status type
 */
export type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * Task data structure
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  plan_id?: string;
  mainthread_id?: string;
  thread_id?: string;
  order?: number;
  created_at: string;
  updated_at: string;
  finished_at?: string;
  [key: string]: unknown;
}

/**
 * Plan data structure
 */
export interface Plan {
  id: string;
  title: string;
  description?: string;
  status: PlanStatus;
  is_approved: boolean;
  estimated_minutes?: number;
  room_id: string;
  tasks: Task[];
  created_at: string;
  updated_at: string;
  finished_at?: string;
  [key: string]: unknown;
}

/**
 * Fetch plans options
 */
export interface FetchPlansOptions {
  include_tasks?: boolean;
  order_by?: string;
  ascending?: boolean;
}

/**
 * Task port interface
 */
export interface ITaskPort {
  fetchPlan(planId: string, options?: { include_tasks?: boolean }): Promise<{ data: Plan }>;
  fetchPlansByRoom(roomId: string, options?: FetchPlansOptions): Promise<{ data: Plan[] }>;
  approvePlan(planId: string): Promise<void>;
  fetchTasksByThread(threadId: string): Promise<{ data: Task[] }>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<{ data: Task }>;
  deleteTask(taskId: string): Promise<void>;
  getAxiosInstance?(): unknown;
}

// ==================== Cloud Types ====================

/**
 * Cloud service (function) data structure
 */
export interface CloudService {
  name: string;
  description?: string;
  code?: string;
  status?: string;
  runtime?: string;
  memory?: number;
  timeout?: number;
  env?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Cloud secret data structure
 */
export interface CloudSecret {
  key: string;
  value?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Create or update cloud service data
 */
export interface CreateServiceData {
  name: string;
  description?: string;
  code?: string;
  runtime?: string;
  memory?: number;
  timeout?: number;
  env?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Create or update cloud secret data
 */
export interface CreateSecretData {
  key: string;
  value: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Cloud instance data structure
 */
export interface CloudInstance {
  id: string;
  cloud_id?: string;
  name?: string;
  status?: string;
  tables?: CloudTablesData;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Cloud tables data structure
 */
export interface CloudTablesData {
  items: CloudTable[];
}

/**
 * Cloud table data structure
 */
export interface CloudTable {
  id: number;
  name: string;
  schema: string;
  rls_enabled?: boolean;
  relationships?: unknown[];
  columns?: CloudColumn[];
  fields?: {
    items: CloudField[];
  };
  [key: string]: unknown;
}

/**
 * Cloud table column structure
 */
export interface CloudColumn {
  id: string | number;
  name: string;
  data_type: string;
  format?: string;
  is_nullable?: boolean;
  is_unique?: boolean;
  is_identity?: boolean;
  identity_generation?: string;
  is_generated?: boolean;
  is_updatable?: boolean;
  default_value?: string;
  comment?: string;
  ordinal_position?: number;
  enums?: string[];
  check?: string;
  table_id?: number;
  schema?: string;
  table?: string;
  [key: string]: unknown;
}

/**
 * Cloud table field structure (normalized)
 */
export interface CloudField {
  id: string | number;
  name: string;
  db_field_name?: string;
  data_type: string;
  format?: string;
  is_nullable?: boolean;
  is_unique?: boolean;
  is_identity?: boolean;
  identity_generation?: string;
  is_generated?: boolean;
  is_updatable?: boolean;
  is_primary?: boolean;
  default_value?: string;
  comment?: string;
  ordinal_position?: number;
  enums?: string[];
  check?: string;
  table_id?: number;
  schema?: string;
  table?: string;
  [key: string]: unknown;
}

/**
 * Cloud table record (generic)
 */
export interface CloudRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Cloud user from auth.users table
 */
export interface CloudUser {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Cloud storage bucket
 */
export interface CloudBucket {
  id: string;
  name?: string;
  public?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Options for fetching cloud tables
 */
export interface FetchTablesOptions {
  include_columns?: boolean;
  excluded_schemas?: string;
  include_system_schemas?: boolean;
}

/**
 * Options for fetching records
 */
export interface FetchRecordsOptions {
  limit?: number;
  offset?: number;
  order?: string;
  filters?: Record<string, unknown>;
}

/**
 * SQL filter conditions
 */
export interface SQLFilters {
  [field: string]: string | number | boolean;
}

/**
 * Cloud port interface
 */
export interface ICloudPort {
  // Instance operations
  fetchInstance(cloudId: string): Promise<CloudInstance>;
  fetchMetrics(cloudId: string, options?: Record<string, unknown>): Promise<unknown>;
  fetchMetricsHistory(cloudId: string, options?: Record<string, unknown>): Promise<unknown>;
  startInstance(cloudId: string): Promise<unknown>;
  stopInstance(cloudId: string): Promise<unknown>;
  restartInstance(cloudId: string): Promise<unknown>;
  pauseInstance(cloudId: string): Promise<unknown>;
  resumeInstance(cloudId: string): Promise<unknown>;
  
  // Storage operations
  listBuckets(cloudId: string): Promise<unknown>;
  createBucket(cloudId: string, bucketData: unknown): Promise<unknown>;
  deleteBucket(cloudId: string, bucketId: string): Promise<void>;
  listFiles(cloudId: string, bucketId: string, options?: Record<string, unknown>): Promise<unknown>;
  uploadFile(cloudId: string, bucketId: string, fileData: unknown): Promise<unknown>;
  deleteFile(cloudId: string, bucketId: string, fileName: string): Promise<void>;
  
  // Logs operations
  fetchLogs(cloudId: string, options?: Record<string, unknown>): Promise<unknown>;
  streamLogs(cloudId: string, callback: (log: unknown) => void): Promise<() => void>;
  
  // Database operations
  executeSQL(cloudId: string, query: string): Promise<CloudRecord[]>;
  fetchTables(cloudId: string, options?: FetchTablesOptions): Promise<CloudTable[]>;
  createTable(cloudId: string, tableData: Partial<CloudTable>): Promise<CloudTable>;
  deleteTable(cloudId: string, tableId: string): Promise<void>;
  
  // Services operations
  fetchServices(baseId: string): Promise<CloudService[]>;
  fetchServiceDetails(baseId: string, serviceName: string): Promise<CloudService>;
  createService(baseId: string, serviceData: CreateServiceData): Promise<CloudService>;
  updateService(baseId: string, serviceName: string, serviceData: CreateServiceData): Promise<CloudService>;
  deleteService(baseId: string, serviceName: string): Promise<void>;
  
  // Secrets operations
  fetchSecrets(baseId: string): Promise<CloudSecret[]>;
  createSecret(baseId: string, secretData: CreateSecretData): Promise<CloudSecret>;
  deleteSecret(baseId: string, secretKey: string): Promise<void>;
  
  // Utility
  getAxiosInstance(): unknown;
}

