/**
 * Services Layer - Business Logic Services
 * 
 * This module exports all service classes and their singleton getters.
 * Services implement business logic and orchestrate operations between
 * adapters and the application layer.
 */

// Export all service classes
export { BaseService } from './BaseService';
export { RoomService, getRoomService } from './RoomService';
export { ThreadService, getThreadService } from './ThreadService';
export { MessageService, getMessageService } from './MessageService';
export { TabService, getTabService } from './TabService';
export { VoiceService, getVoiceService } from './VoiceService';
export { AgentService, getAgentService } from './AgentService';
export { IntegrationService, getIntegrationService } from './IntegrationService';
export { SubscriptionService, getSubscriptionService } from './SubscriptionService';
export { TemplateService, getTemplateService } from './TemplateService';
export { ConnectionService, getConnectionService } from './ConnectionService';
export { CloudService, getCloudService } from './CloudService';
export { CommitService, getCommitService } from './CommitService';
export { AltanerService, getAltanerService } from './AltanerService';
export { InterfaceService, getInterfaceService } from './InterfaceService';
export { MCPService, getMCPService } from './MCPService';
export { MediaService, getMediaService } from './MediaService';
export { MarketplaceService, getMarketplaceService } from './MarketplaceService';
export { TaskService, getTaskService } from './TaskService';
export { AccountService, getAccountService } from './AccountService';
export { UserService, getUserService } from './UserService';
export { RoleService, getRoleService } from './RoleService';
export { WebhookService, getWebhookService } from './WebhookService';
export { DeveloperAppService, getDeveloperAppService } from './DeveloperAppService';
export { WorkflowService, getWorkflowService } from './WorkflowService';
export { ApiKeyService, getApiKeyService } from './ApiKeyService';
export { SuperAdminService, getSuperAdminService } from './SuperAdminService';

// Export all types
export type {
  // Common types
  PaginationCursor,
  PaginatedResponse,
  NormalizedCollection,
  
  // Room types
  Room,
  RoomMember,
  RoomWithMembers,
  FetchRoomsOptions,
  RoomsResponse,
  
  // Thread types
  Thread,
  ThreadBatch,
  CreateThreadOptions,
  UpdateThreadData,
  
  // Message types
  Message,
  Attachment,
  MessageContent,
  UpdateMessageData,
  ProgressCallback,
  
  // Tab types
  Tab,
  TabsState,
  
  // Voice types
  VoiceConversation,
  VoiceConversationsState,
  
  // Agent types
  Agent,
  CreateAgentData,
  UpdateAgentData,
  AgentRetryData,
  Voice,
  ListVoicesOptions,
  ListVoicesResponse,
  AgentDMResponse,
  AgentRoomsResponse,
  FetchAgentResponse,
  
  // Integration types
  AuthorizationRequest,
  FetchAuthRequestsOptions,
  
  // Connection types
  Connection,
  ConnectionType,
  ConnectionsResponse,
  ConnectionTypesResponse,
  ConnectionGQQuery,
  CreateConnectionData,
  CreateToolData,
  CreateResourceData,
  ExternalApp,
  Tool,
  Resource,
  Webhook,
  
  // Other types
  Reaction,
  
  // Media types
  MediaData,
  MediaItem,
  Media3D,
  MediaListResponse,
  Media3DListResponse,
  CreateMediaResponse,
  CreateMedia3DData,
  
  // Commit types
  Commit,
  CommitDetails,
  CommitsState,
  
  // Template types
  Template,
  TemplateVersion,
  TemplatesListResponse,
  FetchTemplatesOptions,
  Account,
  
  // Marketplace types
  MarketplaceTemplate,
  MarketplaceTemplatesResponse,
  
  // Altaner types
  Altaner,
  AltanerComponent,
  AltanerTemplate,
  AltanerTemplateVersion,
  AltanerVariable,
  AltanersListResponse,
  FetchAltanersOptions,
  CreateAltanerData,
  UpdateAltanerData,
  UpdateAltanerComponentData,
  CreateAltanerComponentData,
  UpdateAltanerPositionsData,
  
  // Port interfaces
  IRoomPort,
  IAgentPort,
  IPlatformPort,
  IIntegrationPort,
  IPodsPort,
  ICloudPort,
  
  // Cloud types
  CloudInstance,
  CloudTable,
  CloudRecord,
  CloudUser,
  CloudBucket,
  CloudColumn,
  CloudField,
  CloudService as CloudServiceType,
  CloudSecret,
  CreateServiceData,
  CreateSecretData,
  FetchTablesOptions,
  FetchRecordsOptions,
  SQLFilters,
  
  // Task & Plan types
  Task,
  Plan,
  TaskStatus,
  PlanStatus,
  ITaskPort,
} from './types';

// Export Subscription types
export type {
  CreateSubscriptionData,
  CreateCustomerPortalData,
  Subscription,
} from './SubscriptionService';

// Export Altaner types
export type {
  FetchAltanerResponse,
} from './AltanerService';

// Export Interface types
export type {
  FileTreeNode,
  FileTreeResponse,
  FileContentResponse,
  CreateFileData,
  CreateDirectoryData,
  CommitData,
  DiffChangesResponse,
  AcceptChangesData,
} from './InterfaceService';

// Export MCP types
export type {
  MCPServer,
  MCPConnection,
  MCPServerTransport,
  MCPServerConfig,
  MCPServerMetaData,
  MCPToolPolicy,
  CreateMCPServerData,
  UpdateMCPServerData,
  ConnectAgentData,
  UpdateConnectionData,
  FetchServersResponse,
  FetchServerResponse,
  CreateServerResponse,
  UpdateServerResponse,
  ConnectionResponse,
  FetchServerAgentsResponse,
  DiscoverToolsResponse,
  ConfigureToolsResponse,
} from './MCPService';

// Export Marketplace types
export type {
  TemplateEntityType,
} from './MarketplaceService';

// Export Account types
export type {
  AccountData,
  CreateAccountData,
  OnboardAccountData,
  UpdateAccountMetaData,
  CompanyUpdateData,
  AddressData,
} from './AccountService';

// Export User types
export type {
  UserUpdateData,
} from './UserService';

// Export Role types
export type {
  Role,
  RolesStructure,
} from './RoleService';

// Export Webhook types
export type {
  WebhookData,
} from './WebhookService';

// Export Developer App types
export type {
  DeveloperAppData,
  CustomAppData,
  ConnectionTypeUpdate,
  ActionTypeData,
  ResourceTypeData,
} from './DeveloperAppService';

// Export Workflow types
export type {
  WorkflowExecution,
} from './WorkflowService';

// Export SuperAdmin types
export type {
  SearchAccountsParams,
  TransformedAccount,
} from './SuperAdminService';

