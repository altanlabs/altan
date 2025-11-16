/**
 * TypeScript Type Definitions for General State
 * Complete type definitions for the general state structure
 */

// ============================================================================
// Core Domain Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  xsup?: boolean;
  owned_accounts?: Account[];
  [key: string]: unknown;
}

export interface Account {
  id: string;
  name?: string;
  credit_balance?: number;
  stripe_id?: string;
  room_id?: string;
  logo_url?: string;
  organisation_id?: string;
  stripe_connect_id?: string;
  webhooks?: Webhook[];
  members?: Member[];
  rooms?: Room[];
  attributes?: Attribute[];
  subscriptions?: Subscription[];
  agents?: Agent[];
  altaners?: Altaner[];
  payments?: Payment[];
  developer_apps?: DeveloperApp[];
  connections?: Connection[];
  apps?: CustomApp[];
  interfaces?: Interface[];
  bases?: Base[];
  organisation?: Organisation;
  owner?: User;
  apikeys?: ApiKey[];
  workflows?: Workflow[];
  meta_data?: {
    nav?: string[];
    [key: string]: unknown;
  };
}

export interface Organisation {
  id: string;
  name?: string;
  members?: Member[];
  [key: string]: unknown;
}

export interface Member {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  date_creation?: string;
  events?: {
    items: WebhookEvent[];
  };
  [key: string]: unknown;
}

export interface WebhookEvent {
  id: string;
  [key: string]: unknown;
}

export interface Room {
  id: string;
  name?: string;
  external_id?: string;
  [key: string]: unknown;
}

export interface Attribute {
  id: string;
  [key: string]: unknown;
}

export interface Subscription {
  id: string;
  status: string;
  billing_option_id?: string;
  billing_option?: {
    price?: number;
    currency?: string;
    billing_frequency?: string;
    billing_cycle?: string;
    plan?: {
      id: string;
      name: string;
      group?: {
        name: string;
      };
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  date_creation?: string;
  avatar_url?: string;
  cloned_template_id?: string;
  is_pinned?: boolean;
  meta_data?: Record<string, unknown>;
  type?: string;
  voice_enabled?: boolean;
  voice_settings?: unknown;
  template_id?: string;
  cloned_from?: {
    id: string;
    version?: {
      template_id: string;
    };
  };
  [key: string]: unknown;
}

export interface Altaner {
  id: string;
  name?: string;
  is_deleted?: boolean;
  components?: {
    items: AltanerComponent[];
  };
  [key: string]: unknown;
}

export interface AltanerComponent {
  id: string;
  [key: string]: unknown;
}

export interface Payment {
  id: string;
  [key: string]: unknown;
}

export interface DeveloperApp {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface Connection {
  id: string;
  connection_type?: {
    id: string;
    name: string;
  };
  [key: string]: unknown;
}

export interface CustomApp {
  id: string;
  name?: string;
  connection_types?: {
    items: ConnectionType[];
  };
  [key: string]: unknown;
}

export interface ConnectionType {
  id: string;
  name: string;
  app_id?: string;
  icon?: string;
  actions?: ActionType[];
  resources?: {
    items: ResourceType[];
  };
  webhooks?: {
    items: unknown[];
  };
  event_types?: {
    items: unknown[];
  };
  [key: string]: unknown;
}

export interface ActionType {
  id: string;
  name: string;
  connection_type_id: string;
  connection_type?: ConnectionType;
  [key: string]: unknown;
}

export interface ResourceType {
  id: string;
  name: string;
  connection_type_id: string;
  connection_type?: ConnectionType;
  [key: string]: unknown;
}

export interface Interface {
  id: string;
  name?: string;
  meta_data?: {
    current_commit?: {
      sha: string;
    };
    [key: string]: unknown;
  };
  deployments?: {
    items: InterfaceDeployment[];
  };
  commits?: {
    items: InterfaceCommit[];
  };
  [key: string]: unknown;
}

export interface InterfaceDeployment {
  id: string;
  interface_id: string;
  deployment_id?: string;
  meta_data?: {
    deployment_info?: {
      id: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface InterfaceCommit {
  id: string;
  interface_id: string;
  commit_hash?: string;
  message?: string;
  date_creation?: string;
  [key: string]: unknown;
}

export interface Base {
  id: string;
  name?: string;
  tables?: {
    items: Table[];
  };
  [key: string]: unknown;
}

export interface Table {
  id: string;
  name?: string;
  base_id?: string;
  [key: string]: unknown;
}

export interface ApiKey {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface Workflow {
  id: string;
  name?: string;
  date_creation?: string;
  executions?: {
    items: WorkflowExecution[];
  };
  [key: string]: unknown;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status?: string;
  [key: string]: unknown;
}

export interface Role {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface RolesState {
  byName: Record<string, string>;
  byId: Record<string, Role>;
}

// ============================================================================
// State Structures
// ============================================================================

export interface GlobalVarsState {
  open: boolean;
  position: unknown;
  context: unknown;
}

export interface GeneralLoadingState {
  account: boolean;
  roles: boolean;
}

export interface GeneralInitializedState {
  account: boolean;
  roles: boolean;
}

export interface AccountAssetsLoadingState {
  altaners: boolean;
  rooms: boolean;
  workflows: boolean;
  payments: boolean;
  webhooks: boolean;
  subscriptions: boolean;
  apikeys: boolean;
  agents: boolean;
  members: boolean;
  developer_apps: boolean;
  connections: boolean;
  apps: boolean;
  interfaces: boolean;
  bases: boolean;
}

export interface AccountAssetsInitializedState {
  altaners: boolean;
  rooms: boolean;
  workflows: boolean;
  payments: boolean;
  webhooks: boolean;
  subscriptions: boolean;
  apikeys: boolean;
  agents: boolean;
  members: boolean;
  developer_apps: boolean;
  connections: boolean;
  apps: boolean;
  interfaces: boolean;
  bases: boolean;
}

export interface AccountAssetsErrorsState {
  altaners: string | null;
  rooms: string | null;
  workflows: string | null;
  payments: string | null;
  webhooks: string | null;
  subscriptions: string | null;
  apikeys: string | null;
  agents: string | null;
  members: string | null;
  developer_apps: string | null;
  connections: string | null;
  apps: string | null;
  interfaces: string | null;
  bases: string | null;
}

export interface WebSocketEvent {
  [key: string]: unknown;
}

// ============================================================================
// Complete General State
// ============================================================================

export interface GeneralState {
  initialized: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  permissionDialogOpen: boolean;
  createAltaner: boolean;
  globalVars: GlobalVarsState;
  generalLoading: GeneralLoadingState;
  generalInitialized: GeneralInitializedState;
  roles: RolesState;
  account: Account;
  accountAssetsLoading: AccountAssetsLoadingState;
  accountAssetsInitialized: AccountAssetsInitializedState;
  accountAssetsErrors: AccountAssetsErrorsState;
  webSocketEvents: WebSocketEvent[];
  accounts: Account[];
  fileInViewer: unknown;
  fileViewerOpen: boolean;
  stripeDashboard: string | null;
  stripeActivation: string | null;
  stripeAccount: unknown;
  headerVisible: boolean;
  workflowExecutions: Record<string, WorkflowExecution[]>;
  workflowExecutionsInitialized: boolean;
  agentsUsageData: Record<string, unknown>;
}

// ============================================================================
// Action Payload Types
// ============================================================================

export interface GlobalVarsPayload {
  position: unknown;
  context: unknown;
}

export interface SetAccountAttributePayload {
  key: string;
  value: unknown;
}

export interface SetAccountAttributeErrorPayload {
  key: string;
  error: string;
}

export interface UpdateAccountAltanerPayload {
  ids: string[];
  changes: Partial<Altaner>;
}

export interface UpdateDeveloperAppPayload {
  id: string;
  [key: string]: unknown;
}

export interface UpdateAppPayload {
  id: string;
  [key: string]: unknown;
}

export interface AddActionTypePayload {
  action_type: ActionType;
}

export interface UpdateActionTypePayload {
  connection_type_id: string;
  actionTypeId: string;
  changes: Partial<ActionType>;
}

export interface DeleteActionTypePayload {
  connection_type_id: string;
  actionTypeId: string;
}

export interface AddResourceTypePayload {
  resource_type: ResourceType;
}

export interface UpdateResourceTypePayload {
  connection_type_id: string;
  resourceTypeId: string;
  changes: Partial<ResourceType>;
}

export interface DeleteResourceTypePayload {
  connection_type_id: string;
  resourceTypeId: string;
}

export interface UpdateConnectionTypePayload {
  connectionTypeId: string;
  connectionType: ConnectionType;
}

export interface UpdateInterfacePayload {
  id: string;
  [key: string]: unknown;
}

export interface AddInterfaceDeploymentPayload {
  id: string;
  interface_id: string;
  [key: string]: unknown;
}

export interface UpdateInterfaceDeploymentPayload {
  id: string;
  interface_id?: string;
  vercel_deployment_id?: string;
  search_all_interfaces?: boolean;
  [key: string]: unknown;
}

export interface AddInterfaceCommitPayload {
  id: string;
  interface_id: string;
  [key: string]: unknown;
}

export interface UpdateInterfaceCommitPayload {
  id: string;
  interface_id: string;
  [key: string]: unknown;
}

export interface UpdateWorkflowExecutionPayload {
  id: string;
  changes: Partial<WorkflowExecution>;
}

export interface SetWebhookEventsPayload {
  webhookId: string;
  events: WebhookEvent[];
}

export interface UpdateSubscriptionPayload {
  id: string;
  [key: string]: unknown;
}

// ============================================================================
// Root State (for selectors)
// ============================================================================

export interface RootState {
  general: GeneralState;
  [key: string]: unknown;
}

