/**
 * Room Port - Domain interface for room/chat operations
 * Defines all room-related operations without implementation details
 */

export interface Room {
  id: string;
  name: string;
  account_id: string;
  external_id?: string;
  [key: string]: unknown;
}

export interface RoomData {
  name: string;
  account_id: string;
  external_id?: string;
  type?: string;
  [key: string]: unknown;
}

export interface RoomUpdates {
  name?: string;
  memory?: string;
  [key: string]: unknown;
}

export interface RoomQueryOptions {
  cursor?: string;
  limit?: number;
  [key: string]: unknown;
}

export interface RoomsResponse {
  rooms: Room[];
  cursor?: string;
  has_more?: boolean;
  [key: string]: unknown;
}

export interface SearchOptions {
  limit?: number;
  [key: string]: unknown;
}

export interface Thread {
  id: string;
  room_id: string;
  name?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface ThreadData {
  name?: string;
  initial_message?: string;
  [key: string]: unknown;
}

export interface ThreadUpdates {
  name?: string;
  voice_status?: VoiceStatus;
  [key: string]: unknown;
}

export interface VoiceStatus {
  is_active: boolean;
  [key: string]: unknown;
}

export interface ThreadsOptions {
  cursor?: string;
  limit?: number;
  [key: string]: unknown;
}

export interface ThreadsResponse {
  threads: Thread[];
  cursor?: string;
  has_more?: boolean;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MessageData {
  text: string;
  attachments?: Attachment[];
  replied_id?: string;
  [key: string]: unknown;
}

export interface Attachment {
  type: string;
  url: string;
  [key: string]: unknown;
}

export interface MessageUpdates {
  text?: string;
  [key: string]: unknown;
}

export interface MessagesOptions {
  cursor?: string;
  limit?: number;
  before?: string;
  after?: string;
  [key: string]: unknown;
}

export interface MessagesResponse {
  messages: Message[];
  cursor?: string;
  has_more?: boolean;
  [key: string]: unknown;
}

export interface RequestConfig {
  onUploadProgress?: (progressEvent: unknown) => void;
  [key: string]: unknown;
}

export interface ReactionData {
  emoji: string;
  [key: string]: unknown;
}

export interface Member {
  id: string;
  room_id: string;
  account_id: string;
  role: string;
  [key: string]: unknown;
}

export interface MembersOptions {
  limit?: number;
  [key: string]: unknown;
}

export interface MembersResponse {
  members: Member[];
  total?: number;
  [key: string]: unknown;
}

export interface InvitationData {
  account_ids?: string[];
  emails?: string[];
  [key: string]: unknown;
}

export interface MediaData {
  file: File | Blob;
  file_name: string;
  mime_type: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for room/chat operations
 */
export abstract class RoomPort {
  // ==================== Room Operations ====================

  /**
   * Fetch room details
   * @param roomId - Room ID
   * @returns Room data
   */
  abstract fetchRoom(roomId: string): Promise<Room>;

  /**
   * Fetch room by external ID
   * @param externalId - External ID
   * @param accountId - Account ID
   * @returns Room data
   */
  abstract fetchRoomByExternalId(externalId: string, accountId: string): Promise<Room>;

  /**
   * Create a new room
   * @param roomData - Room creation data
   * @returns Created room
   */
  abstract createRoom(roomData: RoomData): Promise<Room>;

  /**
   * Update room details
   * @param roomId - Room ID
   * @param updates - Room updates
   * @returns Updated room
   */
  abstract updateRoom(roomId: string, updates: RoomUpdates): Promise<Room>;

  /**
   * Delete a room
   * @param roomId - Room ID
   */
  abstract deleteRoom(roomId: string): Promise<void>;

  /**
   * Join a room
   * @param roomId - Room ID
   * @returns Join result
   */
  abstract joinRoom(roomId: string): Promise<Room>;

  /**
   * Update room memory
   * @param roomId - Room ID
   * @param updateMemory - Memory update instruction
   */
  abstract updateRoomMemory(roomId: string, updateMemory: string): Promise<void>;

  /**
   * Fetch user's rooms
   * @param options - Query options (cursor, limit)
   * @returns Rooms data with pagination
   */
  abstract fetchUserRooms(options?: RoomQueryOptions): Promise<RoomsResponse>;

  /**
   * Search rooms
   * @param query - Search query
   * @param options - Query options
   * @returns Search results
   */
  abstract searchRooms(query: string, options?: SearchOptions): Promise<RoomsResponse>;

  // ==================== Thread Operations ====================

  /**
   * Fetch thread details
   * @param threadId - Thread ID
   * @returns Thread data
   */
  abstract fetchThread(threadId: string): Promise<Thread>;

  /**
   * Fetch all threads in a room
   * @param roomId - Room ID
   * @param options - Pagination options
   * @returns Threads data
   */
  abstract fetchThreads(roomId: string, options?: ThreadsOptions): Promise<ThreadsResponse>;

  /**
   * Create a new thread
   * @param roomId - Room ID
   * @param threadData - Thread creation data
   * @returns Created thread
   */
  abstract createThread(roomId: string, threadData: ThreadData): Promise<Thread>;

  /**
   * Create thread from message
   * @param messageId - Message ID
   * @param threadData - Thread creation data
   * @returns Created thread
   */
  abstract createThreadFromMessage(messageId: string, threadData: ThreadData): Promise<Thread>;

  /**
   * Update thread details
   * @param threadId - Thread ID
   * @param updates - Thread updates
   */
  abstract updateThread(threadId: string, updates: ThreadUpdates): Promise<void>;

  /**
   * Delete a thread
   * @param threadId - Thread ID
   */
  abstract deleteThread(threadId: string): Promise<void>;

  /**
   * Mark thread as read
   * @param threadId - Thread ID
   * @param timestamp - Read timestamp
   */
  abstract markThreadRead(threadId: string, timestamp: string): Promise<void>;

  /**
   * Update thread voice status
   * @param threadId - Thread ID
   * @param voiceStatus - Voice status data
   */
  abstract updateThreadVoiceStatus(threadId: string, voiceStatus: VoiceStatus): Promise<void>;

  // ==================== Message Operations ====================

  /**
   * Fetch messages in a thread
   * @param threadId - Thread ID
   * @param options - Pagination options
   * @returns Messages data
   */
  abstract fetchMessages(threadId: string, options?: MessagesOptions): Promise<MessagesResponse>;

  /**
   * Send a message
   * @param threadId - Thread ID
   * @param messageData - Message data (text, attachments, replied_id)
   * @param config - Request config (for upload progress)
   * @returns Created message
   */
  abstract sendMessage(threadId: string, messageData: MessageData, config?: RequestConfig): Promise<Message>;

  /**
   * Send message as agent
   * @param threadId - Thread ID
   * @param agentId - Agent ID
   * @param messageData - Message data
   * @param config - Request config
   * @returns Created message
   */
  abstract sendAgentMessage(threadId: string, agentId: string, messageData: MessageData, config?: RequestConfig): Promise<Message>;

  /**
   * Update a message
   * @param messageId - Message ID
   * @param updates - Message updates
   */
  abstract updateMessage(messageId: string, updates: MessageUpdates): Promise<void>;

  /**
   * Delete a message
   * @param messageId - Message ID
   */
  abstract deleteMessage(messageId: string): Promise<void>;

  /**
   * Add reaction to message
   * @param messageId - Message ID
   * @param reactionData - Reaction data
   */
  abstract addReaction(messageId: string, reactionData: ReactionData): Promise<void>;

  // ==================== Member Operations ====================

  /**
   * Fetch room members
   * @param roomId - Room ID
   * @param options - Query options
   * @returns Members data
   */
  abstract fetchMembers(roomId: string, options?: MembersOptions): Promise<MembersResponse>;

  /**
   * Update member
   * @param roomId - Room ID
   * @param action - Action type
   * @param body - Update data
   */
  abstract updateMember(roomId: string, action: string, body: Record<string, unknown>): Promise<void>;

  /**
   * Invite members
   * @param roomId - Room ID
   * @param invitation - Invitation data
   */
  abstract inviteMembers(roomId: string, invitation: InvitationData): Promise<void>;

  /**
   * Exit room
   * @param roomId - Room ID
   */
  abstract exitRoom(roomId: string): Promise<void>;

  // ==================== Media Operations ====================

  /**
   * Create media/upload file
   * @param roomId - Room ID
   * @param mediaData - Media data
   * @returns Media URL
   */
  abstract createMedia(roomId: string, mediaData: MediaData): Promise<string>;
}

