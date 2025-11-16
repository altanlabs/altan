/**
 * TypeScript Type Definitions for Room State
 * Complete type definitions for the flattened room state structure
 */

// ============================================================================
// Core Domain Types
// ============================================================================

export interface Room {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string | null;
  is_dm: boolean;
  policy?: Record<string, unknown>;
  meta_data?: Record<string, unknown>;
  account_id?: string | null;
  external_id?: string | null;
}

export interface Account {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface Member {
  id: string;
  member_type: 'user' | 'agent';
  user?: User;
  agent?: Agent;
  agent_id?: string;
  [key: string]: unknown;
}

export interface RoomMember {
  id: string;
  member: Member;
  room_id: string;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  thread_id: string;
  member_id: string;
  date_creation: string;
  is_streaming?: boolean;
  error?: string;
  meta_data?: {
    loading?: boolean;
    status?: string;
    error_code?: string;
    error_message?: string;
    error_type?: string;
    failed_in?: string;
    total_attempts?: number;
    has_error?: boolean;
    [key: string]: unknown;
  };
  reactions?: {
    items: Reaction[];
  };
  media?: {
    items: Attachment[];
  };
  [key: string]: unknown;
}

export interface Reaction {
  id: string;
  message_id: string;
  member_id: string;
  reaction_type: string;
  [key: string]: unknown;
}

export interface Attachment {
  id: string;
  message_id: string;
  url: string;
  type?: string;
  [key: string]: unknown;
}

/**
 * Message Part
 * Represents a single part of a message (text, thinking, or tool use)
 */
export interface MessagePart {
  id: string;
  message_id: string;
  type: 'text' | 'thinking' | 'tool';
  part_type: 'text' | 'thinking' | 'tool';
  order: number;
  block_order?: number;
  is_done: boolean;
  text?: string;
  arguments?: string;
  result?: unknown;
  error?: unknown;
  status?: string;
  name?: string;
  finished_at?: string;
  created_at?: string;
  date_creation?: string;
  intent?: string;
  act_now?: string;
  act_done?: string;
  use_intent?: boolean;
  meta_data?: Record<string, unknown>;
  task_execution_id?: string;
  task_execution?: TaskExecution;
  execution?: unknown;
  input?: unknown;
  updateRevision?: number;
  is_streaming?: boolean;
  // Tool-specific fields
  tool_use_id?: string;
  tool_name?: string;
  content?: string;
  thinking?: string;
  call_id?: string;
  // Streaming helpers
  deltaBuffer?: Record<number, string>;
  receivedIndices?: Record<number, boolean>;
  lastProcessedIndex?: number;
  streamingChunks?: string[];
  argumentsDeltaBuffer?: Record<number, string>;
  argumentsReceivedIndices?: Record<number, boolean>;
  argumentsLastProcessedIndex?: number;
  textBuffer?: string;
}

export interface TaskExecution {
  id?: string;
  tool?: {
    name: string;
    action_type?: {
      connection_type?: {
        icon?: string;
      };
    };
  };
  arguments?: string;
  content?: unknown;
  error?: unknown;
  status?: string;
  finished_at?: string;
  input?: unknown;
  [key: string]: unknown;
}

export interface Thread {
  id: string;
  room_id: string;
  name?: string;
  is_main: boolean;
  status?: string;
  date_creation?: string;
  starter_message_id?: string;
  messages?: {
    allIds: string[];
    paginationInfo?: PaginationInfo;
  };
  events?: {
    items: unknown[];
  };
  media?: {
    items: unknown[];
  };
  read_state?: Record<string, string>; // member_id -> timestamp
  parent?: {
    id: string;
    thread_id?: string;
  };
  justPromoted?: boolean;
  [key: string]: unknown;
}

export interface PaginationInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor?: string;
  total?: number;
}

export interface Tab {
  id: string;
  threadId: string;
  name: string;
  isMainThread: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface VoiceConversation {
  isActive: boolean;
  agentId: string | null;
  elevenlabsId: string | null;
  conversation: unknown;
  startedAt?: string;
}

export interface ActivationLifecycle {
  response_id: string;
  agent_id: string;
  thread_id: string;
  status: string;
  events: LifecycleEvent[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  discarded?: boolean;
  discarded_at?: string;
}

export interface ResponseLifecycle {
  response_id: string;
  agent_id: string;
  thread_id: string;
  status: string;
  events: LifecycleEvent[];
  message_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface LifecycleEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

export interface AuthorizationRequest {
  id: string;
  is_completed?: boolean;
  [key: string]: unknown;
}

// ============================================================================
// Normalized State Structures
// ============================================================================

export interface NormalizedById<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export type MessagesState = NormalizedById<Message>

export interface MessagePartsState {
  byId: Record<string, MessagePart>;
  allIds: string[];
  byMessageId: Record<string, string[]>;
}

export type ExecutionsState = NormalizedById<TaskExecution>

export type ThreadsState = NormalizedById<Thread>

export type MembersState = NormalizedById<RoomMember>

export interface TabsState {
  byId: Record<string, Tab>;
  allIds: string[];
  activeTabId: string | null;
  nextTabId: number;
}

export interface VoiceConversationsState {
  byThreadId: Record<string, VoiceConversation>;
  isConnecting: boolean;
}

export interface ActivationLifecyclesState {
  byId: Record<string, ActivationLifecycle>;
  activeByThread: Record<string, string[]>;
}

export interface ResponseLifecyclesState {
  byId: Record<string, ResponseLifecycle>;
  activeByThread: Record<string, string[]>;
}

// ============================================================================
// Navigation & UI State
// ============================================================================

export interface ThreadDrawer {
  navigation: string[];
  current: string | null;
  isCreation: boolean;
  messageId: string | null;
  display: boolean;
  threadName: string | null;
}

export interface ThreadMain {
  navigation: string[];
  current: string | null;
}

export interface ThreadState {
  drawer: ThreadDrawer;
  main: ThreadMain;
  respond: Record<string, string>; // threadId -> messageId
}

export interface TemporaryThread {
  id: string;
  roomId: string;
  isTemporary: true;
  created_at: string;
}

export interface UserRoomsPagination {
  hasNextPage: boolean;
  nextCursor: string | null;
  isLoadingMore: boolean;
}

export interface SearchRoomsState {
  results: Room[];
  isSearching: boolean;
  query: string;
  hasResults: boolean;
}

export interface InitializedState {
  room: boolean;
  mainThread: boolean;
  allThreads: boolean;
  userRooms: boolean;
}

export interface LoadingState {
  room: boolean;
  mainThread: boolean;
  allThreads: boolean;
  userRooms: boolean;
}

// ============================================================================
// Complete Room State (Nested Structure)
// ============================================================================

export interface RoomState {
  _room: {
    room: Room | null;
    userRooms: Room[];
    userRoomsPagination: UserRoomsPagination;
    searchRooms: SearchRoomsState;
    account: Account | null;
    roomContext: unknown;
    authorization_requests: AuthorizationRequest[];
  };

  _messages: {
    messages: MessagesState;
    messagesContent: Record<string, string>;
    messagesExecutions: Record<string, string[]>;
    executions: ExecutionsState;
  };

  _messageParts: {
    messageParts: MessagePartsState;
  };

  _threads: {
    threads: ThreadsState;
    mainThread: string | null;
    thread: ThreadState;
    temporaryThread: TemporaryThread | null;
  };

  _members: {
    members: MembersState;
    me: RoomMember | null;
  };

  _tabs: {
    tabs: TabsState;
  };

  _voice: {
    voiceConversations: VoiceConversationsState;
  };

  _lifecycle: {
    activationLifecycles: ActivationLifecyclesState;
    responseLifecycles: ResponseLifecyclesState;
    runningResponses: Record<string, string>;
  };

  _ui: {
    drawerOpen: boolean;
    isRealtimeCall: boolean;
    contextMenu: unknown;
    uploadProgress: unknown;
    isUploading: boolean;
    initialized: InitializedState;
    loading: LoadingState;
  };
}

// ============================================================================
// Root State (for selectors)
// ============================================================================

/**
 * Root application state
 * Contains the room state and potentially other slices
 */
export interface RootState {
  room: RoomState;
  [key: string]: unknown;
}

/**
 * Type helper to safely cast state.room to RoomState
 */
export type SafeRoomState = (state: { room: unknown }) => RoomState;

// ============================================================================
// Action Payload Types
// ============================================================================

export interface AddMessagePayload extends Partial<Message> {
  id: string;
  thread_id: string;
}

export interface UpdateMessagePayload {
  ids: string[];
  changes: Partial<Message>;
}

export interface AddMemberPayload {
  roomMember?: RoomMember;
  currentUserId?: string;
  // Support old format
  id?: string;
  member?: Member;
}

export interface AddThreadPayload extends Partial<Thread> {
  id: string;
}

export interface ThreadUpdatePayload {
  ids?: string | string[];
  changes?: Partial<Thread>;
  // Support new format
  id?: string;
  [key: string]: unknown;
}

export interface AddMessagePartPayload extends Partial<MessagePart> {
  id: string;
  message_id: string;
}

/**
 * Payload for updating message parts
 * Supports both streaming updates (delta, index) and direct field updates
 */
export interface UpdateMessagePartPayload {
  id: string;
  delta?: string;
  index?: number;
  order?: number;
  block_order?: number;
  type?: 'text' | 'thinking' | 'tool';
  part_type?: 'text' | 'thinking' | 'tool';
  text?: string;
  arguments?: string;
  is_done?: boolean;
  is_streaming?: boolean;
  tool_use_id?: string;
  tool_name?: string;
  content?: string;
  thinking?: string;
  status?: string;
  name?: string;
  call_id?: string;
  meta_data?: Record<string, unknown>;
  // Tool execution fields
  result?: unknown;
  error?: unknown;
  task_execution?: TaskExecution;
  task_execution_id?: string;
  execution?: unknown;
  input?: unknown;
  finished_at?: string;
  created_at?: string;
  // Tool intent fields
  intent?: string;
  act_now?: string;
  act_done?: string;
  use_intent?: boolean;
}

/**
 * Payload for removing message parts
 * Can specify either a single id or multiple ids
 */
export interface RemoveMessagePartPayload {
  id?: string;
  ids?: string[];
  message_id?: string;
}

export interface CreateTabPayload {
  threadId: string;
  threadName?: string;
  isMainThread?: boolean;
}

export interface SwitchTabPayload {
  tabId: string;
}

export interface LifecycleEventPayload {
  response_id: string;
  agent_id: string;
  thread_id: string;
  event_type: string;
  event_data: unknown;
  timestamp?: string;
}

export interface StartVoiceConversationPayload {
  threadId: string;
  agentId: string;
  elevenlabsId: string;
  conversation: unknown;
}

export interface SetLoadingPayload {
  key: keyof LoadingState;
  value: boolean;
}

export interface SetInitializedPayload {
  key: keyof InitializedState;
  value: boolean;
}

export interface SetRoomPayload {
  room: Room & { account?: Account; [key: string]: unknown };
  user: User;
  members?: RoomMember[];
}

export interface SetUserRoomsPayload {
  rooms: Room[];
  hasNextPage: boolean;
  nextCursor: string | null;
  isLoadMore?: boolean;
}

export interface RoomUpdatePayload {
  changes: Partial<Room>;
}

export interface UpdateAuthorizationRequestPayload {
  id: string;
  changes: Partial<AuthorizationRequest>;
}

export interface UpdateMessageExecutionPayload {
  ids: string[];
  changes: Partial<TaskExecution>;
}

export interface AddMessagesFromThreadPayload {
  messages: Message[];
}

export interface RemoveMessagePayload {
  ids: string[];
}

export interface AddMessagesPayload {
  threadId: string;
  messageIds: string[];
  paginationInfo?: PaginationInfo;
}

export interface PromoteTemporaryThreadPayload {
  tempId: string;
  realThreadId: string;
  threadData: Partial<Thread>;
}

export interface SetMergeThreadBatchPayload {
  threads: ThreadsState;
  cursor?: string | null;
}

