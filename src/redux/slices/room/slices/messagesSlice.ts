/**
 * Messages Slice
 * Manages messages, message content, executions, and reactions
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Object_assign } from '../helpers/collections';
import type {
  Message,
  MessagesState,
  ExecutionsState,
  TaskExecution,
  Reaction,
  Attachment,
  UpdateMessageExecutionPayload,
  AddMessagesFromThreadPayload,
  RemoveMessagePayload,
} from '../types/state';

// ============================================================================
// Types
// ============================================================================

interface MessagesSliceState {
  messages: MessagesState;
  messagesContent: Record<string, string>;
  messagesExecutions: Record<string, string[]>;
  executions: ExecutionsState;
}

interface NormalizedMessage extends Message {
  reactions?: { items: Reaction[] };
  media?: { items: Attachment[] };
}

interface MessageData {
  content: string;
  messageData: NormalizedMessage;
}

type ErrorFields = 'error_code' | 'error_message' | 'error_type' | 'failed_in' | 'total_attempts' | 'has_error';

// ============================================================================
// Helper Functions (Single Responsibility Principle)
// ============================================================================

/**
 * Checks if a message has error-related fields cleared
 */
function hasErrorCleared(message: Message): boolean {
  return !message.error &&
    !message.meta_data?.error_code &&
    !message.meta_data?.error_message &&
    !message.meta_data?.error_type &&
    !message.meta_data?.has_error;
}

/**
 * Removes error-related fields from metadata
 */
function cleanErrorFieldsFromMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;

  const errorFields: ErrorFields[] = [
    'error_code',
    'error_message',
    'error_type',
    'failed_in',
    'total_attempts',
    'has_error',
  ];

  const cleaned = { ...metadata };
  errorFields.forEach(field => {
    delete cleaned[field];
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * Normalizes array fields (reactions, media) to object format with items property
 */
function normalizeArrayFields<T extends { reactions?: unknown; media?: unknown }>(
  obj: T
): T & { reactions?: { items: Reaction[] }; media?: { items: Attachment[] } } {
  const normalized = { ...obj };

  if (Array.isArray(normalized.reactions)) {
    normalized.reactions = { items: normalized.reactions as Reaction[] };
  }

  if (Array.isArray(normalized.media)) {
    normalized.media = { items: normalized.media as Attachment[] };
  }

  return normalized as T & { reactions?: { items: Reaction[] }; media?: { items: Attachment[] } };
}

/**
 * Extracts and normalizes message data
 * Separates content from message object and normalizes array fields
 */
function extractAndNormalizeMessage(
  message: Message,
  errorWasCleared: boolean
): MessageData {
  // Remove error field if it was cleared
  const messageWithoutError = errorWasCleared
    ? (({ error, ...rest }: Message & { error?: string }) => rest)(message as Message & { error?: string })
    : { ...message };

  // Clean metadata if error was cleared
  const cleanedMetadata = errorWasCleared
    ? cleanErrorFieldsFromMetadata(messageWithoutError.meta_data)
    : messageWithoutError.meta_data;

  // Extract content and remove fields that shouldn't be in state
  const messageWithMetadata = {
    ...messageWithoutError,
    meta_data: cleanedMetadata,
  };

  // Type assertion needed here due to dynamic property access
  const messageObj = messageWithMetadata as Message & {
    text?: string;
    executions?: unknown;
    parts?: unknown;
  };

  const content = messageObj.text || '';
  
  // Create clean message data without unwanted fields
  const { text, executions, parts, ...cleanMessageData } = messageObj;

  // Normalize array fields
  const normalized = normalizeArrayFields(cleanMessageData);

  return {
    content,
    messageData: normalized,
  };
}

/**
 * Merges metadata from two sources, respecting error clearing
 */
function mergeMetadata(
  existingMetadata: Record<string, unknown> | undefined,
  incomingMetadata: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!incomingMetadata && !existingMetadata) return undefined;
  if (!incomingMetadata) return existingMetadata;
  if (!existingMetadata) return incomingMetadata;

  return {
    ...existingMetadata,
    ...incomingMetadata,
  };
}

/**
 * Updates an existing message with new data
 */
function mergeMessages(
  existingMessage: Message,
  incomingMessage: Message,
  errorWasCleared: boolean
): { message: Message; content: string } {
  const { content, messageData } = extractAndNormalizeMessage(incomingMessage, errorWasCleared);

  const mergedMetadata = mergeMetadata(existingMessage.meta_data, messageData.meta_data);

  const mergedMessage: Message = {
    ...existingMessage,
    ...messageData,
  };

  if (mergedMetadata) {
    mergedMessage.meta_data = mergedMetadata;
  }

  return { message: mergedMessage, content };
}

/**
 * Processes executions from a message and returns normalized execution data
 */
function extractExecutions(message: Message): TaskExecution[] | null {
  const messageWithExecutions = message as Message & {
    executions?: TaskExecution[] | { items: TaskExecution[] };
  };

  const executionsData = messageWithExecutions.executions;

  if (!executionsData) return null;

  return Array.isArray(executionsData) ? executionsData : executionsData.items;
}

/**
 * Validates message has required fields
 */
function isValidMessage(message: unknown): message is Message {
  const msg = message as Partial<Message>;
  return !!(msg?.id && msg?.thread_id);
}

/**
 * Validates execution has required fields
 */
function isValidExecution(execution: unknown): execution is TaskExecution & { id: string } {
  const exec = execution as Partial<TaskExecution>;
  return !!(exec?.id);
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: MessagesSliceState = {
  messages: {
    byId: {},
    allIds: [],
  },
  messagesContent: {},
  messagesExecutions: {},
  executions: {
    byId: {},
    allIds: [],
  },
};

// ============================================================================
// Slice Definition
// ============================================================================

const messagesSlice = createSlice({
  name: 'room/messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      if (!isValidMessage(message)) {
        return;
      }

      // Update existing message
      if (state.messages.byId[message.id]) {
        const existingMessage = state.messages.byId[message.id];
        const errorWasCleared = hasErrorCleared(existingMessage);
        const { message: mergedMessage, content } = mergeMessages(
          existingMessage,
          message,
          errorWasCleared
        );

        state.messages.byId[message.id] = mergedMessage;
        
        if (content !== undefined) {
          state.messagesContent[message.id] = content;
        }
        return;
      }

      // Add new message
      const { content, messageData } = extractAndNormalizeMessage(message, false);

      state.messages.byId[message.id] = messageData;
      state.messages.allIds.push(message.id);
      state.messagesContent[message.id] = content;
    },

    removeMessage: (state, action: PayloadAction<RemoveMessagePayload>) => {
      const { ids } = action.payload;
      const messageId = ids?.[0];

      if (!messageId) {
        return;
      }

      delete state.messages.byId[messageId];
      delete state.messagesExecutions[messageId];
      delete state.messagesContent[messageId];
      state.messages.allIds = state.messages.allIds.filter((id) => id !== messageId);
    },

    updateMessageContent: (state, action: PayloadAction<{ messageId: string; content: string }>) => {
      const { messageId, content } = action.payload;
      state.messagesContent[messageId] = content;
    },

    updateMessageStreamingState: (
      state,
      action: PayloadAction<{ messageId: string; isStreaming: boolean }>,
    ) => {
      const { messageId, isStreaming } = action.payload;
      const message = state.messages.byId[messageId];
      
      if (message) {
        message.is_streaming = isStreaming;
      }
    },

    addMessageDelta: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      state.messagesContent[id] = (state.messagesContent[id] || '').concat(content);
    },

    setMessageError: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      const message = state.messages.byId[id];
      
      if (message) {
        state.messagesContent[id] = state.messagesContent[id] || ' ';
        message.error = content;
      }
    },

    clearMessageError: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      const message = state.messages.byId[id];
      
      if (!message) {
        return;
      }

      // Remove error field
      const { error, meta_data, ...restMessage } = message as Message & { error?: string };

      // Clean metadata
      const cleanedMetadata = cleanErrorFieldsFromMetadata(meta_data as Record<string, unknown> | undefined);

      // Replace with new message object (ensures immutability)
      const updatedMessage: Message = {
        ...restMessage,
      };

      if (cleanedMetadata) {
        updatedMessage.meta_data = cleanedMetadata;
      }

      state.messages.byId[id] = updatedMessage;
    },

    addMessageReaction: (state, action: PayloadAction<Reaction>) => {
      const reaction = action.payload;
      const message = state.messages.byId[reaction.message_id];
      
      if (message) {
        if (!message.reactions) {
          message.reactions = { items: [] };
        }
        message.reactions.items.push(reaction);
      }
    },

    addMessageAttachment: (state, action: PayloadAction<Attachment>) => {
      const attachment = action.payload;
      const message = state.messages.byId[attachment.message_id];
      
      if (message) {
        if (!message.media) {
          message.media = { items: [] };
        }
        message.media.items.push(attachment);
      }
    },

    addMessageExecution: (state, action: PayloadAction<TaskExecution & { message_id: string }>) => {
      const execution = action.payload;
      const messageId = execution.message_id;
      
      if (!state.messages.allIds.includes(messageId)) {
        return;
      }

      if (!execution.id) {
        return;
      }

      if (!state.messagesExecutions[messageId]) {
        state.messagesExecutions[messageId] = [];
      }
      
      state.messagesExecutions[messageId].push(execution.id);
      state.executions.byId[execution.id] = execution;
      state.executions.allIds.push(execution.id);
    },

    updateMessageExecution: (state, action: PayloadAction<UpdateMessageExecutionPayload>) => {
      const { ids, changes } = action.payload;

      const executionId = ids?.[0];
      if (!executionId || !state.executions.allIds.includes(executionId)) {
        return;
      }

      if (!state.executions.byId[executionId]) {
        state.executions.byId[executionId] = changes as TaskExecution;
      } else {
        Object_assign(state.executions.byId[executionId], changes);
      }
    },

    /**
     * Add multiple messages from thread data
     * Processes messages, executions, and parts in one action
     */
    addMessagesFromThread: (state, action: PayloadAction<AddMessagesFromThreadPayload>) => {
      const { messages } = action.payload;

      if (!messages || !Array.isArray(messages)) {
        return;
      }

      messages.forEach((message: Message) => {
        if (!isValidMessage(message)) {
          return;
        }

        // Check if message already exists
        const existingMessage = state.messages.byId[message.id];
        
        if (existingMessage) {
          // Update existing message
          const errorWasCleared = hasErrorCleared(existingMessage);
          const { message: mergedMessage, content } = mergeMessages(
            existingMessage,
            message,
            errorWasCleared
          );

          state.messages.byId[message.id] = mergedMessage;

          if (content !== undefined) {
            state.messagesContent[message.id] = content;
          }
        } else {
          // Add new message
          const { content, messageData } = extractAndNormalizeMessage(message, false);

          state.messages.byId[message.id] = messageData;
          state.messages.allIds.push(message.id);
          state.messagesContent[message.id] = content;
        }

        // Process executions
        const executions = extractExecutions(message);

        if (executions) {
          if (!state.messagesExecutions[message.id]) {
            state.messagesExecutions[message.id] = [];
          }

          executions.forEach((execution: TaskExecution) => {
            if (!isValidExecution(execution)) {
              return;
            }

            state.executions.byId[execution.id] = execution;

            if (!state.executions.allIds.includes(execution.id)) {
              state.executions.allIds.push(execution.id);
            }

            if (!state.messagesExecutions[message.id].includes(execution.id)) {
              state.messagesExecutions[message.id].push(execution.id);
            }
          });
        }
      });
    },
  },
});

export const {
  addMessage,
  removeMessage,
  updateMessageContent,
  updateMessageStreamingState,
  addMessageDelta,
  setMessageError,
  clearMessageError,
  addMessageReaction,
  addMessageAttachment,
  addMessageExecution,
  updateMessageExecution,
  addMessagesFromThread,
} = messagesSlice.actions;

export default messagesSlice.reducer;
