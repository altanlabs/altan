/**
 * Streaming State Management
 * Utilities for handling streaming message parts and delta buffering
 */

import { comparePartOrder } from './comparators';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Delta buffering state for ordered chunk processing
 */
interface DeltaBufferState {
  receivedIndices: Record<number, boolean>;
  deltaBuffer: Record<number, string>;
  lastProcessedIndex: number;
}

/**
 * Base message part with common streaming fields
 */
interface BaseMessagePart {
  updateRevision?: number;
  [key: string]: unknown;
}

/**
 * Text-based message part (text/thinking)
 */
export interface TextMessagePart extends BaseMessagePart, DeltaBufferState {
  text?: string;
  streamingChunks: string[];
}

/**
 * Tool call message part with arguments
 */
export interface ToolMessagePart extends BaseMessagePart {
  arguments?: string;
  argumentsReceivedIndices: Record<number, boolean>;
  argumentsDeltaBuffer: Record<number, string>;
  argumentsLastProcessedIndex: number;
  act_now?: string;
  act_done?: string;
  intent?: string;
  use_intent?: boolean;
}

/**
 * Message parts collection state
 */
interface MessagePartsState {
  byId: Record<string, BaseMessagePart>;
  byMessageId: Record<string, string[]>;
}

/**
 * Main streaming state interface
 */
export interface StreamingState {
  messageParts: MessagePartsState;
}

/**
 * Special fields extracted from tool arguments
 */
interface SpecialFields {
  __act_now?: string;
  __act_done?: string;
  __intent?: string;
  __use_intent?: boolean;
}

/**
 * Mutable part type for delta processing (Immer draft-compatible)
 */
type MutablePart = {
  updateRevision?: number;
  [key: string]: unknown;
};

/**
 * Delta processing configuration
 */
interface DeltaProcessorConfig<T extends MutablePart> {
  contentKey: keyof T;
  bufferIndicesKey: keyof T;
  bufferKey: keyof T;
  lastProcessedIndexKey: keyof T;
  streamingChunksKey?: keyof T;
  postProcessor?: (part: T) => void;
}

// ============================================================================
// Message Index Management
// ============================================================================

/**
 * Ensure a message has a parts index array
 * @param state - Redux state containing message parts
 * @param messageId - Unique message identifier
 * @returns Parts array for the message
 */
export const ensureMessageIndex = (state: StreamingState, messageId: string): string[] => {
  if (!state.messageParts.byMessageId[messageId]) {
    state.messageParts.byMessageId[messageId] = [];
  }
  return state.messageParts.byMessageId[messageId];
};

/**
 * Re-sort message parts after add/update
 * @param state - Redux state containing message parts
 * @param messageId - Unique message identifier
 */
export const resortMessageParts = (state: StreamingState, messageId: string): void => {
  const parts = state.messageParts.byMessageId[messageId];
  if (!parts || parts.length <= 1) return;
  
  parts.sort((a, b) => comparePartOrder(a, b, state.messageParts.byId));
};

// ============================================================================
// Delta Processing Core (DRY)
// ============================================================================

/**
 * Check if chunk should be skipped due to duplication
 * @param receivedIndices - Record of received chunk indices
 * @param lastProcessedIndex - Last successfully processed index
 * @param index - Current chunk index
 * @returns True if chunk should be skipped
 */
const shouldSkipChunk = (
  receivedIndices: Record<number, boolean>,
  lastProcessedIndex: number,
  index: number
): boolean => {
  return receivedIndices[index] === true || index <= lastProcessedIndex;
};

/**
 * Consume consecutive chunks from buffer and update content
 * @param part - Message part to update (Immer draft - mutation is safe)
 * @param config - Processing configuration
 * @returns Number of chunks consumed
 */
const consumeConsecutiveChunks = <T extends MutablePart>(
  part: T,
  config: DeltaProcessorConfig<T>
): number => {
  const buffer = part[config.bufferKey] as Record<number, string>;
  const lastProcessedIndex = part[config.lastProcessedIndexKey] as number;
  let next = lastProcessedIndex + 1;
  let chunksConsumed = 0;

  while (Object.prototype.hasOwnProperty.call(buffer, next)) {
    const chunk = buffer[next];
    const currentContent = (part[config.contentKey] as string) || '';
    // eslint-disable-next-line no-param-reassign
    part[config.contentKey] = (currentContent + chunk) as T[keyof T];

    // Add to streaming chunks if configured
    if (config.streamingChunksKey) {
      const streamingChunks = part[config.streamingChunksKey] as string[];
      streamingChunks.push(chunk);
    }

    delete buffer[next];
    // eslint-disable-next-line no-param-reassign
    part[config.lastProcessedIndexKey] = next as T[keyof T];
    next += 1;
    chunksConsumed += 1;
  }

  return chunksConsumed;
};

/**
 * Process delta with ordered buffering and deduplication
 * Generic implementation following Single Responsibility Principle
 * @param part - Message part to update (Immer draft - mutation is safe)
 * @param delta - Delta content to process
 * @param index - Optional chunk index for ordered processing
 * @param config - Processing configuration
 * @returns True if content was updated
 */
const processDeltaWithBuffering = <T extends MutablePart>(
  part: T,
  delta: string,
  index: number | undefined,
  config: DeltaProcessorConfig<T>
): boolean => {
  // Ordered buffering path
  if (index !== undefined && index >= 0) {
    const receivedIndices = part[config.bufferIndicesKey] as Record<number, boolean>;
    const lastProcessedIndex = part[config.lastProcessedIndexKey] as number;

    // Check for duplicate or late chunk
    if (shouldSkipChunk(receivedIndices, lastProcessedIndex, index)) {
      return false;
    }

    // Mark chunk as received
    receivedIndices[index] = true;

    // Store delta in buffer
    const buffer = part[config.bufferKey] as Record<number, string>;
    buffer[index] = (buffer[index] ?? '') + String(delta);

    // Consume consecutive chunks
    consumeConsecutiveChunks(part, config);

    // Run post-processor if configured
    config.postProcessor?.(part);

    // Increment revision counter (Immer draft mutation)
    // eslint-disable-next-line no-param-reassign
    part.updateRevision = ((part.updateRevision as number) || 0) + 1;
    return true;
  }

  // Simple append path (no index)
  const deltaStr = String(delta);
  const currentContent = (part[config.contentKey] as string) || '';
  // eslint-disable-next-line no-param-reassign
  part[config.contentKey] = (currentContent + deltaStr) as T[keyof T];

  // Add to streaming chunks if configured
  if (config.streamingChunksKey) {
    const streamingChunks = part[config.streamingChunksKey] as string[];
    streamingChunks.push(deltaStr);
  }

  // Run post-processor if configured
  config.postProcessor?.(part);

  // eslint-disable-next-line no-param-reassign
  part.updateRevision = ((part.updateRevision as number) || 0) + 1;
  return true;
};

// ============================================================================
// Special Fields Extraction
// ============================================================================

/**
 * Extract a field value from partial JSON using regex
 * @param fieldName - Name of the field to extract
 * @param jsonString - Potentially incomplete JSON string
 * @returns Extracted field value or null
 */
const extractPartialField = (fieldName: string, jsonString: string): string | null => {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = jsonString.match(regex);
  return match?.[1] ?? null;
};

/**
 * Extract special fields from tool arguments (complete or partial JSON)
 * Follows Open/Closed Principle - easy to extend with new fields
 * @param part - Tool message part with arguments (Immer draft - mutation is safe)
 */
const extractSpecialFieldsFromArguments = (part: ToolMessagePart): void => {
  if (!part.arguments) return;

  try {
    // Try full JSON parse first
    const parsed = JSON.parse(part.arguments) as SpecialFields;
    
    /* eslint-disable no-param-reassign */
    if (parsed.__act_now) part.act_now = parsed.__act_now;
    if (parsed.__act_done) part.act_done = parsed.__act_done;
    if (parsed.__intent) part.intent = parsed.__intent;
    if (parsed.__use_intent !== undefined) part.use_intent = parsed.__use_intent;
    /* eslint-enable no-param-reassign */
  } catch {
    // Fallback to partial extraction for incomplete JSON
    const actNow = extractPartialField('__act_now', part.arguments);
    const actDone = extractPartialField('__act_done', part.arguments);
    const intent = extractPartialField('__intent', part.arguments);

    /* eslint-disable no-param-reassign */
    if (actNow) part.act_now = actNow;
    if (actDone) part.act_done = actDone;
    if (intent) part.intent = intent;
    /* eslint-enable no-param-reassign */
  }
};

// ============================================================================
// Public Delta Processing Functions
// ============================================================================

/**
 * Process delta buffering for text/thinking parts
 * Handles ordered chunks with deduplication
 * @param part - Text message part
 * @param delta - Delta content
 * @param index - Optional chunk index
 * @returns True if content was updated
 */
export const processTextDelta = (
  part: TextMessagePart,
  delta: string,
  index?: number
): boolean => {
  return processDeltaWithBuffering(part, delta, index, {
    contentKey: 'text',
    bufferIndicesKey: 'receivedIndices',
    bufferKey: 'deltaBuffer',
    lastProcessedIndexKey: 'lastProcessedIndex',
    streamingChunksKey: 'streamingChunks',
  });
};

/**
 * Process delta buffering for tool arguments
 * Handles ordered chunks with deduplication
 * @param part - Tool message part
 * @param delta - Delta content
 * @param index - Optional chunk index
 * @returns True if content was updated
 */
export const processArgumentsDelta = (
  part: ToolMessagePart,
  delta: string,
  index?: number
): boolean => {
  return processDeltaWithBuffering(part, delta, index, {
    contentKey: 'arguments',
    bufferIndicesKey: 'argumentsReceivedIndices',
    bufferKey: 'argumentsDeltaBuffer',
    lastProcessedIndexKey: 'argumentsLastProcessedIndex',
    postProcessor: extractSpecialFieldsFromArguments,
  });
};
