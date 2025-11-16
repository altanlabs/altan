/**
 * Room Service - Business logic layer for room operations
 * Implements Single Responsibility Principle by handling room-specific business logic
 */
import type { AxiosRequestConfig } from 'axios';

import { BaseService } from './BaseService';
import type {
  IRoomPort,
  Room,
  RoomMember,
  Thread,
  Message,
  RoomWithMembers,
  FetchRoomsOptions,
  RoomsResponse,
  MessageContent,
  ProgressCallback,
  PaginatedResponse,
  ThreadBatch,
  Reaction,
  MediaData,
} from './types';
import { getRoomPort } from '../di';
import {
  paginateV2Collection,
  transformRoom,
  transformThread,
  transformRoomMember,
} from '../redux/slices/utils/v2Transformers';

/**
 * Room Service - Handles all room-related operations
 */
export class RoomService extends BaseService {
  public port: IRoomPort;

  constructor() {
    super();
    this.port = getRoomPort<IRoomPort>();
  }

  /**
   * Fetch user rooms with pagination support
   * @param options - Pagination options
   * @returns Rooms with pagination info
   */
  async fetchUserRooms(options: FetchRoomsOptions = {}): Promise<RoomsResponse> {
    return this.execute(async () => {
      const response = await this.port.fetchUserRooms(options);
      return this.normalizeRoomsResponse(response);
    }, 'Error fetching user rooms');
  }

  /**
   * Search rooms by query
   * @param query - Search query
   * @param options - Search options
   * @returns Matching rooms
   */
  async searchRooms(query: string, options: Record<string, unknown> = {}): Promise<Room[]> {
    if (!query?.trim()) {
      return [];
    }

    return this.execute(async () => {
      const response = await this.port.searchRooms(query, options);
      return response.rooms || [];
    }, 'Error searching rooms');
  }

  /**
   * Fetch complete room with members
   * @param roomId - Room ID
   * @returns Room data with members
   */
  async fetchRoomWithMembers(roomId: string): Promise<RoomWithMembers> {
    return this.execute(async () => {
      // Parallelize room and members fetch
      const [roomResponse, membersResponse] = await Promise.all([
        this.port.fetchRoom(roomId),
        this.port.fetchMembers(roomId, { limit: 100 }),
      ]);

      const room = transformRoom(roomResponse as never) as unknown as Room;
      const members = membersResponse.members.map((member) => 
        transformRoomMember(member as never)
      ) as unknown as RoomMember[];

      return {
        room,
        members: { items: members },
        ...(roomResponse.main_thread_id && { mainThreadId: roomResponse.main_thread_id }),
      };
    }, 'Error fetching room');
  }

  /**
   * Fetch room by external ID
   * @param externalId - External ID of the room
   * @param accountId - Account ID
   * @returns Room data
   */
  async fetchRoomByExternalId(externalId: string, accountId: string): Promise<{ room: Room }> {
    return this.execute(async () => {
      return await this.port.fetchRoomByExternalId(externalId, accountId);
    }, 'Error fetching room by external ID');
  }

  /**
   * Fetch thread with messages
   * @param threadId - Thread ID
   * @param options - Fetch options
   * @returns Thread with messages
   */
  async fetchThreadWithMessages(
    threadId: string,
    options: { limit?: number } = {}
  ): Promise<Thread> {
    return this.execute(async () => {
      const { limit = 25 } = options;

      // Parallelize thread and messages fetch
      const [threadResponse, messagesResponse] = await Promise.all([
        this.port.fetchThread(threadId),
        this.port.fetchMessages(threadId, { limit }),
      ]);

      const thread = transformThread(threadResponse as never) as unknown as Thread;
      const messages = paginateV2Collection(
        messagesResponse.messages,
        messagesResponse.pagination,
      ) as unknown as PaginatedResponse<Message>;

      return { ...thread, messages };
    }, 'Error fetching thread');
  }

  /**
   * Fetch all threads for a room with pagination
   * @param roomId - Room ID
   * @returns Yields thread batches
   */
  async *fetchAllThreads(roomId: string): AsyncGenerator<ThreadBatch, void, unknown> {
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await this.port.fetchThreads(roomId, { limit: 100, cursor: cursor || null });

      const transformedThreads = response.threads.map((thread) => 
        transformThread(thread as never) as unknown as Thread
      );
      const threads = paginateV2Collection(transformedThreads, response.pagination);

      yield {
        threads: threads as unknown as import('./types').NormalizedCollection<Thread>,
        cursor: response.pagination.next_cursor,
        hasNextPage: response.pagination.has_next_page,
      };

      hasNextPage = response.pagination.has_next_page;
      cursor = response.pagination.next_cursor;
    }
  }

  /**
   * Fetch paginated messages for a thread
   * @param threadId - Thread ID
   * @param cursor - Pagination cursor
   * @returns Messages with pagination
   */
  async fetchMessages(
    threadId: string,
    cursor?: string | null
  ): Promise<PaginatedResponse<Message>> {
    return this.execute(async () => {
      const response = await this.port.fetchMessages(threadId, {
        limit: 25,
        cursor: cursor || null,
      });

      return {
        items: response.messages,
        has_next_page: response.pagination.has_next_page,
        next_cursor: response.pagination.next_cursor,
      };
    }, 'Error fetching messages');
  }

  /**
   * Create a new thread
   * @param roomId - Room ID
   * @param messageId - Optional message ID to create thread from
   * @param name - Thread name
   * @returns Created thread
   */
  async createThread(
    roomId: string,
    messageId?: string,
    name?: string
  ): Promise<Thread> {
    return this.execute(async () => {
      if (messageId) {
        return await this.port.createThreadFromMessage(messageId, name ? { name } : {});
      }
      return await this.port.createThread(roomId, name ? { name } : {});
    }, 'Error creating thread');
  }

  /**
   * Send a message with progress tracking
   * @param threadId - Thread ID
   * @param messageData - Message content and attachments
   * @param onProgress - Progress callback
   * @returns Sent message
   */
  async sendMessage(
    threadId: string,
    messageData: MessageContent,
    onProgress?: ProgressCallback
  ): Promise<Message> {
    const config: AxiosRequestConfig = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress?.(percentCompleted);
      },
    };

    return this.execute(
      async () => await this.port.sendMessage(threadId, messageData, config),
      'Error sending message',
    );
  }

  /**
   * Send agent-specific message
   * @param threadId - Thread ID
   * @param agentId - Agent ID
   * @param messageData - Message content
   * @param onProgress - Progress callback
   * @returns Sent message
   */
  async sendAgentMessage(
    threadId: string,
    agentId: string,
    messageData: MessageContent,
    onProgress?: ProgressCallback
  ): Promise<Message> {
    const config: AxiosRequestConfig = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress?.(percentCompleted);
      },
    };

    return this.execute(
      async () => await this.port.sendAgentMessage(threadId, agentId, messageData, config),
      'Error sending agent message',
    );
  }

  /**
   * Update room properties
   * @param roomId - Room ID
   * @param updates - Properties to update
   */
  async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    return this.execute(
      async () => await this.port.updateRoom(roomId, updates),
      'Error updating room',
    );
  }

  /**
   * Update thread properties
   * @param threadId - Thread ID
   * @param updates - Properties to update
   */
  async updateThread(threadId: string, updates: Record<string, unknown>): Promise<void> {
    return this.execute(
      async () => await this.port.updateThread(threadId, updates),
      'Error updating thread',
    );
  }

  /**
   * Update message content
   * @param messageId - Message ID
   * @param content - New content
   */
  async updateMessage(messageId: string, content: string): Promise<void> {
    return this.execute(
      async () => await this.port.updateMessage(messageId, { text: content }),
      'Error updating message',
    );
  }

  /**
   * Delete room, thread, or message
   * @param type - 'room' | 'thread' | 'message'
   * @param id - Entity ID
   */
  async delete(type: 'room' | 'thread' | 'message', id: string): Promise<void> {
    return this.execute(async () => {
      switch (type) {
        case 'room':
          return await this.port.deleteRoom(id);
        case 'thread':
          return await this.port.deleteThread(id);
        case 'message':
          return await this.port.deleteMessage(id);
      }
    }, `Error deleting ${type}`);
  }

  /**
   * Manage room members
   * @param roomId - Room ID
   * @param action - Member action
   * @param body - Action parameters
   */
  async manageMember(roomId: string, action: string, body: unknown): Promise<void> {
    return this.execute(
      async () => await this.port.updateMember(roomId, action, body),
      'Error managing member',
    );
  }

  /**
   * Invite members to room
   * @param roomId - Room ID
   * @param invitation - Invitation data
   */
  async inviteMembers(roomId: string, invitation: unknown): Promise<void> {
    return this.execute(
      async () => await this.port.inviteMembers(roomId, invitation),
      'Error inviting members',
    );
  }

  /**
   * Mark thread as read
   * @param threadId - Thread ID
   * @param timestamp - Read timestamp
   */
  async markThreadRead(threadId: string, timestamp: string): Promise<void> {
    return this.execute(
      async () => await this.port.markThreadRead(threadId, timestamp),
      'Error marking thread as read',
    );
  }

  /**
   * Add reaction to message
   * @param messageId - Message ID
   * @param reactionData - Reaction data
   */
  async addReaction(messageId: string, reactionData: Reaction): Promise<void> {
    return this.execute(
      async () => await this.port.addReaction(messageId, reactionData),
      'Error adding reaction',
    );
  }

  /**
   * Create room
   * @param roomData - Room configuration
   * @returns Created room with members
   */
  async createRoom(roomData: Partial<Room>): Promise<RoomWithMembers> {
    return this.execute(
      async () => await this.port.createRoom(roomData),
      'Error creating room',
    );
  }

  /**
   * Upload media to room
   * @param roomId - Room ID
   * @param mediaData - Media file data
   * @returns Media URL
   */
  async createMedia(roomId: string, mediaData: MediaData): Promise<string> {
    return this.execute(
      async () => await this.port.createMedia(roomId, mediaData),
      'Error uploading media',
    );
  }

  /**
   * Exit room
   * @param roomId - Room ID
   */
  async exitRoom(roomId: string): Promise<void> {
    return this.execute(
      async () => await this.port.exitRoom(roomId),
      'Error exiting room'
    );
  }

  // ==================== Private Helpers ====================

  /**
   * Normalize rooms response to consistent format
   * @private
   */
  private normalizeRoomsResponse(response: {
    rooms: Room[];
    has_next_page: boolean;
    next_cursor: string | null;
  }): RoomsResponse {
    return {
      rooms: response.rooms || [],
      hasNextPage: response.has_next_page || false,
      nextCursor: response.next_cursor || null,
    };
  }
}

// Singleton instance
let roomServiceInstance: RoomService | null = null;

/**
 * Get RoomService singleton instance
 * @returns RoomService instance
 */
export const getRoomService = (): RoomService => {
  if (!roomServiceInstance) {
    roomServiceInstance = new RoomService();
  }
  return roomServiceInstance;
};

