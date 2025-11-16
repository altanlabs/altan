/**
 * Message Service - Business logic layer for message operations
 * Implements Single Responsibility Principle by handling message-specific business logic
 */
import { getRoomPort } from '../di/index.ts';
import { BaseService } from './BaseService';
import type {
  IRoomPort,
  Message,
  MessageContent,
  ProgressCallback,
  Reaction,
} from './types';
import type { AxiosRequestConfig } from 'axios';

/**
 * Message Service - Handles all message-related operations
 */
export class MessageService extends BaseService {
  private port: IRoomPort;

  constructor() {
    super();
    this.port = getRoomPort<IRoomPort>();
  }

  /**
   * Send a message to a thread
   * @param threadId - Thread ID
   * @param content - Message content {text, attachments, replied_id}
   * @param onProgress - Progress callback for attachments
   * @returns Created message
   */
  async sendMessage(
    threadId: string,
    content: MessageContent,
    onProgress: ProgressCallback | null = null
  ): Promise<Message> {
    return this.execute(async () => {
      const config: AxiosRequestConfig | undefined = onProgress
        ? {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              onProgress(percentCompleted);
            },
          }
        : undefined;

      return await this.port.sendMessage(threadId, content, config);
    }, 'Error sending message');
  }

  /**
   * Send a message as an agent
   * @param threadId - Thread ID
   * @param agentId - Agent ID
   * @param content - Message content {text, attachments, replied_id}
   * @param onProgress - Progress callback for attachments
   * @returns Created message
   */
  async sendAgentMessage(
    threadId: string,
    agentId: string,
    content: MessageContent,
    onProgress: ProgressCallback | null = null
  ): Promise<Message> {
    return this.execute(async () => {
      const config: AxiosRequestConfig | undefined = onProgress
        ? {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              onProgress(percentCompleted);
            },
          }
        : undefined;

      return await this.port.sendAgentMessage(threadId, agentId, content, config);
    }, 'Error sending agent message');
  }

  /**
   * Update message content
   * @param messageId - Message ID
   * @param content - New content
   */
  async updateMessage(messageId: string, content: string): Promise<void> {
    return this.execute(async () => {
      await this.port.updateMessage(messageId, { text: content });
    }, 'Error updating message');
  }

  /**
   * Delete a message
   * @param messageId - Message ID
   */
  async deleteMessage(messageId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.deleteMessage(messageId);
    }, 'Error deleting message');
  }

  /**
   * Add a reaction to a message
   * @param messageId - Message ID
   * @param reaction - Reaction data {reaction_type, emoji}
   */
  async addReaction(messageId: string, reaction: Reaction): Promise<void> {
    return this.execute(async () => {
      await this.port.addReaction(messageId, reaction);
    }, 'Error adding reaction');
  }

  /**
   * Copy message content to clipboard
   * @param content - Message content
   * @returns Success status
   */
  copyMessageContent(content: string): boolean {
    try {
      navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Fallback to postMessage for iframe contexts
      try {
        window.parent.postMessage({ type: 'COPY_TO_CLIPBOARD', text: content }, '*');
        return true;
      } catch {
        return false;
      }
    }
  }
}

// Singleton instance
let messageServiceInstance: MessageService | null = null;

/**
 * Get or create MessageService instance
 * @returns MessageService instance
 */
export const getMessageService = (): MessageService => {
  if (!messageServiceInstance) {
    messageServiceInstance = new MessageService();
  }
  return messageServiceInstance;
};

