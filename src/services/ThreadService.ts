/**
 * Thread Service - Business logic layer for thread operations
 * Implements Single Responsibility Principle by handling thread-specific business logic
 */
import { getRoomPort } from '../di/index.ts';
import { transformThread } from '../redux/slices/utils/v2Transformers';
import { BaseService } from './BaseService';
import type {
  IRoomPort,
  Thread,
  CreateThreadOptions,
  UpdateThreadData,
  NormalizedCollection,
  PaginatedResponse,
  Message,
} from './types';

/**
 * Thread Service - Handles all thread-related operations
 */
export class ThreadService extends BaseService {
  private port: IRoomPort;

  constructor() {
    super();
    this.port = getRoomPort<IRoomPort>();
  }

  /**
   * Create a new thread
   * @param roomId - Room ID
   * @param messageId - Parent message ID (optional)
   * @param name - Thread name
   * @returns Created thread
   */
  async createThread(
    roomId: string,
    messageId?: string,
    name?: string
  ): Promise<Thread> {
    return this.execute(async () => {
      const response = await this.port.createThread(roomId, {
        starter_message_id: messageId,
        name,
      });
      return transformThread(response);
    }, 'Error creating thread');
  }

  /**
   * Fetch a single thread with its messages
   * @param threadId - Thread ID
   * @param options - Fetch options
   * @returns Thread with messages
   */
  async fetchThread(threadId: string, options: Record<string, unknown> = {}): Promise<Thread> {
    return this.execute(async () => {
      const response = await this.port.fetchThread(threadId, options);
      return transformThread(response);
    }, 'Error fetching thread');
  }

  /**
   * Fetch thread messages with pagination
   * @param threadId - Thread ID
   * @param cursor - Pagination cursor
   * @returns Messages with pagination info
   */
  async fetchThreadMessages(
    threadId: string,
    cursor: string | null = null
  ): Promise<PaginatedResponse<Message>> {
    return this.execute(async () => {
      const response = await this.port.fetchMessages(threadId, { cursor });
      return {
        items: response.messages,
        has_next_page: response.pagination.has_next_page,
        next_cursor: response.pagination.next_cursor,
      };
    }, 'Error fetching thread messages');
  }

  /**
   * Update thread properties
   * @param threadId - Thread ID
   * @param updates - Updates to apply {name, description, status}
   */
  async updateThread(threadId: string, updates: UpdateThreadData): Promise<void> {
    return this.execute(async () => {
      await this.port.updateThread(threadId, updates);
    }, 'Error updating thread');
  }

  /**
   * Delete a thread
   * @param threadId - Thread ID
   */
  async deleteThread(threadId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.deleteThread(threadId);
    }, 'Error deleting thread');
  }

  /**
   * Mark thread as read
   * @param threadId - Thread ID
   * @param timestamp - Read timestamp
   */
  async markThreadAsRead(threadId: string, timestamp: string): Promise<void> {
    return this.execute(async () => {
      await this.port.markThreadRead(threadId, timestamp);
    }, 'Error marking thread as read');
  }

  /**
   * Archive main thread
   * @param threadId - Thread ID
   */
  async archiveMainThread(threadId: string): Promise<void> {
    return this.execute(async () => {
      const axios = this.port.getAxiosInstance() as any;
      await axios.post(`/thread/${threadId}/archive-main`, {});
    }, 'Error archiving main thread');
  }

  /**
   * Fetch all threads for a room (generator for batching)
   * @param roomId - Room ID
   * @returns Yields thread batches
   */
  async *fetchAllThreads(
    roomId: string
  ): AsyncGenerator<{ threads: NormalizedCollection<Thread>; cursor: string | null }, void, unknown> {
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const response = await this.execute(async () => {
        return await this.port.fetchThreads(roomId, { cursor, limit: 50 });
      }, 'Error fetching threads batch');

      const threads = response.threads.map(transformThread) as Thread[];

      yield {
        threads: this.normalizeThreadsBatch(threads),
        cursor: response.pagination.next_cursor,
      };

      hasMore = response.pagination.has_next_page;
      cursor = response.pagination.next_cursor;
    }
  }

  /**
   * Normalize a batch of threads into byId/allIds structure
   * @param threads - Array of threads
   * @returns Normalized {byId, allIds}
   */
  private normalizeThreadsBatch(threads: Thread[]): NormalizedCollection<Thread> {
    const byId: Record<string, Thread> = {};
    const allIds: string[] = [];

    threads.forEach((thread) => {
      byId[thread.id] = thread;
      allIds.push(thread.id);
    });

    return { byId, allIds };
  }
}

// Singleton instance
let threadServiceInstance: ThreadService | null = null;

/**
 * Get or create ThreadService instance
 * @returns ThreadService instance
 */
export const getThreadService = (): ThreadService => {
  if (!threadServiceInstance) {
    threadServiceInstance = new ThreadService();
  }
  return threadServiceInstance;
};

