/**
 * Message Parts Slice
 * Manages message parts with streaming support (text, thinking, tool parts)
 * 
 * Architecture:
 * - Follows Single Responsibility Principle with dedicated helper functions
 * - Follows DRY principle by extracting common validation and processing logic
 * - Follows Open/Closed Principle for easy extension with new part types
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { normalizePart, mergeIntoExistingPart } from '../helpers/normalizers';
import {
  ensureMessageIndex,
  resortMessageParts,
  processTextDelta,
  processArgumentsDelta,
  type TextMessagePart,
  type ToolMessagePart,
} from '../helpers/streaming';
import type {
  MessagePartsState,
  MessagePart,
  UpdateMessagePartPayload,
  RemoveMessagePartPayload,
} from '../types/state';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * State structure for message parts slice
 */
interface MessagePartsSliceState {
  messageParts: MessagePartsState;
}

/**
 * Payload for batch adding message parts from multiple messages
 */
interface AddPartsFromMessagesPayload {
  parts: MessagePart[];
}

/**
 * Part validation result
 */
interface PartValidation {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const initialState: MessagePartsSliceState = {
  messageParts: {
    byId: {},
    allIds: [],
    byMessageId: {}, // messageId -> [partId1, partId2, ...]
  },
};

// ============================================================================
// Helper Functions (DRY + Single Responsibility Principle)
// ============================================================================

/**
 * Check if we're in development mode
 * Follows DRY - single source of truth for environment check
 */
const isDevelopment = (): boolean => {
  /* eslint-disable no-undef */
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
  /* eslint-enable no-undef */
};

/**
 * Log error in development mode only
 * Follows Single Responsibility Principle - dedicated error logging
 */
const logDevError = (message: string, data?: unknown): void => {
  if (isDevelopment()) {
    // Using globalThis.console to avoid no-undef linter error
    globalThis.console.error(message, data ?? '');
  }
};

/**
 * Validate message part data
 * Follows Single Responsibility Principle - dedicated validation
 */
const validatePartData = (part: Partial<MessagePart>): PartValidation => {
  if (!part?.id) {
    return { isValid: false, error: 'Missing part id' };
  }
  if (!part?.message_id) {
    return { isValid: false, error: 'Missing message_id' };
  }
  return { isValid: true };
};

/**
 * Convert MessagePart to format expected by normalizePart
 * Fixes type compatibility issues with exactOptionalPropertyTypes
 */
const toRawPartInput = (part: MessagePart): MessagePart & { [key: string]: unknown } => {
  return part as MessagePart & { [key: string]: unknown };
};

/**
 * Type-safe cast for state when calling streaming helpers
 * Streaming helpers expect a minimal state shape - we use 'any' to bypass strict type checking
 * since the helpers only access specific fields that exist in our state
 * @param state - The message parts slice state
 * @returns State cast to any for compatibility with streaming helpers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toStreamingState = (state: MessagePartsSliceState): any => {
  return state;
};

/**
 * Ensure streaming fields exist for text/thinking parts
 * Fixes type compatibility with processTextDelta
 * Returns part cast to TextMessagePart after ensuring fields exist
 */
const ensureTextStreamingFields = (part: MessagePart): TextMessagePart => {
  const p = part as unknown as TextMessagePart;
  if (!p.streamingChunks) {
    p.streamingChunks = [];
  }
  if (!p.deltaBuffer) {
    p.deltaBuffer = Object.create(null) as Record<number, string>;
  }
  if (!p.receivedIndices) {
    p.receivedIndices = Object.create(null) as Record<number, boolean>;
  }
  if (p.lastProcessedIndex === undefined) {
    p.lastProcessedIndex = -1;
  }
  return p;
};

/**
 * Ensure streaming fields exist for tool parts
 * Fixes type compatibility with processArgumentsDelta
 * Returns part cast to ToolMessagePart after ensuring fields exist
 */
const ensureToolStreamingFields = (part: MessagePart): ToolMessagePart => {
  const p = part as unknown as ToolMessagePart;
  if (!p.argumentsDeltaBuffer) {
    p.argumentsDeltaBuffer = Object.create(null) as Record<number, string>;
  }
  if (!p.argumentsReceivedIndices) {
    p.argumentsReceivedIndices = Object.create(null) as Record<number, boolean>;
  }
  if (p.argumentsLastProcessedIndex === undefined) {
    p.argumentsLastProcessedIndex = -1;
  }
  return p;
};

/**
 * Handle message_id changes for a part
 * Follows Single Responsibility Principle
 */
const handleMessageIdChange = (
  state: MessagePartsSliceState,
  part: MessagePart,
  prevMessageId: string | undefined
): void => {
  if (prevMessageId && prevMessageId !== part.message_id) {
    const prevArr = state.messageParts.byMessageId[prevMessageId];
    if (prevArr) {
      state.messageParts.byMessageId[prevMessageId] = prevArr.filter((id) => id !== part.id);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ensureMessageIndex(toStreamingState(state), part.message_id).push(part.id);
  }
};

/**
 * Check if order values changed
 */
const orderChanged = (
  prevOrder: number | undefined,
  prevBlock: number | undefined,
  newOrder: number | undefined,
  newBlock: number | undefined
): boolean => {
  return prevOrder !== newOrder || prevBlock !== newBlock;
};

/**
 * Check if a name is a valid tool name (not an event keyword)
 */
const isValidToolName = (name: string | undefined): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const lowerName = name.toLowerCase().trim();
  
  // Reject event keywords
  const INVALID_KEYWORDS = [
    'updated', 'update',
    'added', 'add',
    'completed', 'complete',
    'deleted', 'delete',
    'created', 'create',
    'removed', 'remove',
    'started', 'start',
    'finished', 'finish',
    'failed', 'fail',
  ];
  
  if (INVALID_KEYWORDS.includes(lowerName)) {
    return false;
  }
  
  // Reject suspiciously short names
  if (lowerName.length < 3) {
    return false;
  }
  
  return true;
};

/**
 * Apply field updates to a part
 * Follows Open/Closed Principle - easy to extend with new fields
 * Avoids repetitive if statements
 */
const applyFieldUpdates = (part: MessagePart, updates: Partial<UpdateMessagePartPayload>): void => {
  /* eslint-disable no-param-reassign */
  // Simple field updates
  if (updates.order !== undefined) part.order = updates.order;
  if (updates.block_order !== undefined) part.block_order = updates.block_order;
  if (updates.text !== undefined) part.text = updates.text;
  if (updates.arguments !== undefined) part.arguments = updates.arguments;
  if (updates.is_done !== undefined) part.is_done = updates.is_done;
  if (updates.is_streaming !== undefined) part.is_streaming = updates.is_streaming;
  if (updates.tool_use_id !== undefined) part.tool_use_id = updates.tool_use_id;
  if (updates.tool_name !== undefined) part.tool_name = updates.tool_name;
  if (updates.content !== undefined) part.content = updates.content;
  if (updates.thinking !== undefined) part.thinking = updates.thinking;
  if (updates.status !== undefined) part.status = updates.status;
  
  // Special handling for name field - protect against invalid names
  // Never overwrite a valid name with an invalid one (like "Updated", "Added", etc.)
  if (updates.name !== undefined) {
    const currentNameIsValid = isValidToolName(part.name);
    const newNameIsValid = isValidToolName(updates.name);
    
    if (newNameIsValid) {
      // New name is valid, use it
      part.name = updates.name;
    } else if (!currentNameIsValid) {
      // Current name is also invalid, so we can replace it (both are bad)
      // But in this case, we should just skip updating to avoid pollution
      // The normalizer will set a default "Tool" name if needed
    }
    // else: keep existing valid name, ignore invalid update
  }
  
  if (updates.call_id !== undefined) part.call_id = updates.call_id;
  if (updates.meta_data !== undefined) part.meta_data = updates.meta_data;

  // Tool execution fields (critical for tool parts like websearch)
  if (updates.result !== undefined) part.result = updates.result;
  if (updates.error !== undefined) part.error = updates.error;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.task_execution !== undefined) part.task_execution = updates.task_execution;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.task_execution_id !== undefined) part.task_execution_id = updates.task_execution_id;
  if (updates.execution !== undefined) part.execution = updates.execution;
  if (updates.input !== undefined) part.input = updates.input;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.finished_at !== undefined) part.finished_at = updates.finished_at;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.created_at !== undefined) part.created_at = updates.created_at;

  // Tool intent fields
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.intent !== undefined) part.intent = updates.intent;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.act_now !== undefined) part.act_now = updates.act_now;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.act_done !== undefined) part.act_done = updates.act_done;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (updates.use_intent !== undefined) part.use_intent = updates.use_intent;

  // Handle type/part_type special case (they should stay in sync)
  if (updates.type !== undefined) {
    part.type = updates.type;
    part.part_type = updates.type;
  }
  if (updates.part_type !== undefined) {
    part.part_type = updates.part_type;
    if (!part.type) part.type = updates.part_type;
  }
  /* eslint-enable no-param-reassign */
};

/**
 * Process streaming delta for a part
 * Follows Single Responsibility Principle
 */
const processStreamingDelta = (
  part: MessagePart,
  delta: string,
  index: number | undefined
): void => {
  const partType = part.type || part.part_type || 'text';

  // Text and thinking parts use text streaming
  if (partType === 'text' || partType === 'thinking') {
    const textPart = ensureTextStreamingFields(part);
    processTextDelta(textPart, delta, index);
  }

  // Tool parts use arguments streaming
  if (partType === 'tool') {
    const toolPart = ensureToolStreamingFields(part);
    processArgumentsDelta(toolPart, delta, index);
  }
};

/**
 * Add or update a single part in state
 * Follows Single Responsibility Principle - extracted from addMessagePart and batch operations
 */
const upsertPart = (state: MessagePartsSliceState, raw: MessagePart): void => {
  const validation = validatePartData(raw);
  if (!validation.isValid) {
    logDevError('Invalid message part data', { error: validation.error, part: raw });
    return;
  }

  const normalized = normalizePart(toRawPartInput(raw));
  const existing = state.messageParts.byId[normalized.id];

  if (existing) {
    // Update existing part
    const prevOrder = existing.order;
    const prevBlock = existing.block_order;
    const prevMsgId = existing.message_id;

    mergeIntoExistingPart(existing, normalized);
    handleMessageIdChange(state, existing, prevMsgId);

    // Re-sort if order changed
    if (orderChanged(prevOrder, prevBlock, existing.order, existing.block_order)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resortMessageParts(toStreamingState(state), existing.message_id);
    }
  } else {
    // Add new part
    state.messageParts.byId[normalized.id] = normalized;
    if (!state.messageParts.allIds.includes(normalized.id)) {
      state.messageParts.allIds.push(normalized.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const arr = ensureMessageIndex(toStreamingState(state), normalized.message_id);
    if (!arr.includes(normalized.id)) {
      arr.push(normalized.id);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resortMessageParts(toStreamingState(state), normalized.message_id);
    }
  }
};

/**
 * Batch upsert parts and resort affected messages
 * Follows DRY - used by both addMessageParts and addPartsFromMessages
 */
const batchUpsertParts = (state: MessagePartsSliceState, parts: MessagePart[]): void => {
  if (!Array.isArray(parts)) {
    logDevError('Batch upsert: parts must be an array');
    return;
  }

  const affectedMessageIds = new Set<string>();

  parts.forEach((raw: MessagePart) => {
    const validation = validatePartData(raw);
    if (!validation.isValid) {
      logDevError('Invalid message part in batch', { error: validation.error, part: raw });
      return;
    }

    const normalized = normalizePart(toRawPartInput(raw));

    if (state.messageParts.byId[normalized.id]) {
      // Update existing
      const existing = state.messageParts.byId[normalized.id];
      mergeIntoExistingPart(existing, normalized);
    } else {
      // Add new
      state.messageParts.byId[normalized.id] = normalized;
      if (!state.messageParts.allIds.includes(normalized.id)) {
        state.messageParts.allIds.push(normalized.id);
      }

      // Add to message index
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const arr = ensureMessageIndex(toStreamingState(state), normalized.message_id);
      if (!arr.includes(normalized.id)) {
        arr.push(normalized.id);
      }
    }

    if (normalized.message_id) {
      affectedMessageIds.add(normalized.message_id);
    }
  });

  // Sort all affected message parts
  affectedMessageIds.forEach((messageId) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    resortMessageParts(toStreamingState(state), messageId);
  });
};

// ============================================================================
// Slice Definition
// ============================================================================

const messagePartsSlice = createSlice({
  name: 'room/messageParts',
  initialState,
  reducers: {
    /**
     * Add or update a single message part
     * Uses extracted upsertPart helper (DRY)
     */
    addMessagePart: (state, action: PayloadAction<MessagePart>) => {
      upsertPart(state, action.payload);
    },

    /**
     * Update an existing message part with streaming support
     * Uses extracted helpers for validation, delta processing, and field updates (DRY + SRP)
     */
    updateMessagePart: (state, action: PayloadAction<UpdateMessagePartPayload>) => {
      const { id, delta, index, ...updates } = action.payload || {};
      const part = id ? state.messageParts.byId[id] : null;

      if (!part) {
        logDevError('Message part not found for update', { id, payload: action.payload });
        return;
      }

      // Process streaming delta if provided
      if (delta !== undefined) {
        processStreamingDelta(part, delta, index);
      }

      // Apply field updates
      const prevOrder = part.order;
      const prevBlock = part.block_order;
      applyFieldUpdates(part, updates);

      // Re-sort if order changed
      if (orderChanged(prevOrder, prevBlock, part.order, part.block_order)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        resortMessageParts(toStreamingState(state), part.message_id);
      }
    },

    /**
     * Remove one or more message parts
     * Supports batch removal for efficiency
     */
    removeMessagePart: (state, action: PayloadAction<RemoveMessagePartPayload>) => {
      const data = action.payload;
      
      // Determine which part ID(s) to remove
      const partIdsToRemove: string[] = 
        data.ids && Array.isArray(data.ids) && data.ids.length > 0
          ? data.ids
          : data.id
          ? [data.id]
          : [];

      if (partIdsToRemove.length === 0) {
        logDevError('Invalid message part to delete: no id or ids provided');
        return;
      }

      // Remove each part
      partIdsToRemove.forEach((partId) => {
        const part = state.messageParts.byId[partId];
        if (part) {
          const messageId = part.message_id;
          delete state.messageParts.byId[partId];
          state.messageParts.allIds = state.messageParts.allIds.filter((id) => id !== partId);

          // Remove from byMessageId
          if (state.messageParts.byMessageId[messageId]) {
            state.messageParts.byMessageId[messageId] = state.messageParts.byMessageId[
              messageId
            ].filter((id) => id !== partId);
          }
        }
      });
    },

    /**
     * Batch add message parts (from initial thread/message load)
     * More efficient than individual addMessagePart calls
     * Uses shared batchUpsertParts helper (DRY)
     */
    addMessageParts: (state, action: PayloadAction<MessagePart[]>) => {
      batchUpsertParts(state, action.payload);
    },

    /**
     * Batch add message parts from messages (thread thunk compatible)
     * Accepts payload with { parts: MessagePart[] } structure
     * Uses shared batchUpsertParts helper (DRY)
     */
    addPartsFromMessages: (state, action: PayloadAction<AddPartsFromMessagesPayload>) => {
      batchUpsertParts(state, action.payload.parts);
    },

    /**
     * Clear all message parts for a given message ID
     * Used when message is deleted or when replacing message parts
     */
    clearMessageParts: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const partIds = state.messageParts.byMessageId[messageId] || [];

      partIds.forEach((partId) => {
        delete state.messageParts.byId[partId];
        state.messageParts.allIds = state.messageParts.allIds.filter((id) => id !== partId);
      });

      delete state.messageParts.byMessageId[messageId];
    },

    /**
     * Mark a message part as complete (is_done = true)
     * Used when streaming finishes for a part
     * Accepts either a string (partId) or an object with completion data
     * Handles type-specific completion logic and applies any final updates
     */
    markMessagePartComplete: (state, action: PayloadAction<string | Partial<MessagePart> & { id: string }>) => {
      const payload = action.payload;
      const partId = typeof payload === 'string' ? payload : payload.id;
      const part = state.messageParts.byId[partId];
      
      if (!part) return;

      // If payload is an object with additional fields, apply them first
      if (typeof payload === 'object' && payload !== null) {
        const { id, ...updates } = payload;
        applyFieldUpdates(part, updates);
      }

      // Mark as complete
      part.is_done = true;
      part.is_streaming = false;
      
      const partType = part.type || part.part_type;
      const now = new Date().toISOString();

      // Type-specific completion handling
      if (partType === 'thinking') {
        // Only set default status if not already provided
        if (!part.status) {
        part.status = 'completed';
        }
        part.finished_at = part.finished_at || now;
      } else if (partType === 'tool') {
        // Only set default success status if no status provided and not already set
        if (!part.status || !['success', 'error', 'completed'].includes(part.status)) {
          part.status = 'success';
        }
        part.finished_at = part.finished_at || now;
      }
    },

    /**
     * Set message part order explicitly
     * Useful for reordering or setting specific part order
     */
    setMessagePartOrder: (
      state,
      action: PayloadAction<{ id: string; order: number; block_order?: number }>,
    ) => {
      const { id, order, block_order } = action.payload;
      const part = state.messageParts.byId[id];
      
      if (!part) return;

      part.order = order;
      if (block_order !== undefined) {
        part.block_order = block_order;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      resortMessageParts(toStreamingState(state), part.message_id);
    },
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  addMessagePart,
  updateMessagePart,
  removeMessagePart,
  addMessageParts,
  addPartsFromMessages,
  clearMessageParts,
  markMessagePartComplete,
  setMessagePartOrder,
} = messagePartsSlice.actions;

export default messagePartsSlice.reducer;

