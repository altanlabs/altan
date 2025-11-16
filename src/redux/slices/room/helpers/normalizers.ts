/**
 * Data Normalization Utilities
 * Functions for transforming and normalizing data structures
 */

import { isFiniteNumber } from './comparators';
import { paginateCollection } from '../../utils/collections';
import type { MessagePart, Thread, TaskExecution, Message, Attachment, Reaction } from '../types/state';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Part type enumeration
 */
type PartType = 'text' | 'thinking' | 'tool';

/**
 * Execution status constants
 */
const EXECUTION_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

/**
 * Tool data extracted from task execution
 */
interface ToolData {
  name?: string;
  arguments?: string;
  result?: unknown;
  error?: unknown;
  status?: string;
  finished_at?: string;
  input?: unknown;
  task_execution_id?: string;
  task_execution?: TaskExecution;
  act_now?: string;
  act_done?: string;
  intent?: string;
  use_intent?: boolean;
}

/**
 * Thinking-specific properties
 */
interface ThinkingProperties {
  summary?: unknown[];
  provider?: string;
  provider_id?: string;
}

/**
 * Raw part input (potentially incomplete or untyped)
 */
interface RawPartInput {
  id?: string;
  message_id?: string;
  type?: string;
  part_type?: string;
  order?: unknown;
  block_order?: unknown;
  is_done?: boolean;
  text?: string;
  arguments?: string;
  status?: string;
  created_at?: string;
  date_creation?: string;
  finished_at?: string;
  task_execution?: TaskExecution;
  task_execution_id?: string;
  meta_data?: {
    summary?: unknown[];
    provider?: string;
    provider_id?: string;
    status?: string;
    [key: string]: unknown;
  };
  // Streaming state
  deltaBuffer?: Record<number, string>;
  receivedIndices?: Record<number, boolean>;
  lastProcessedIndex?: number;
  argumentsDeltaBuffer?: Record<number, string>;
  argumentsReceivedIndices?: Record<number, boolean>;
  argumentsLastProcessedIndex?: number;
  streamingChunks?: string[];
  updateRevision?: number;
  [key: string]: unknown;
}

/**
 * Arguments parsing result
 */
interface ParsedArguments {
  argumentsString: string;
  parsedObject: Record<string, unknown>;
}

/**
 * Read state item from API
 */
interface ReadStateItem {
  member_id: string;
  timestamp: string;
}

/**
 * Raw read state structure
 */
interface RawReadState {
  items?: ReadStateItem[];
}

/**
 * Raw thread input
 */
interface RawThreadInput {
  messages?: unknown;
  events?: unknown;
  media?: unknown;
  read_status?: RawReadState;
  [key: string]: unknown;
}

/**
 * Collection wrapper for items
 */
interface ItemsCollection<T> {
  items: T[];
}

/**
 * Raw message data (from WebSocket or API)
 */
interface RawMessageData {
  media?: Attachment[] | ItemsCollection<Attachment>;
  reactions?: Reaction[] | ItemsCollection<Reaction>;
  [key: string]: unknown;
}

// ============================================================================
// Part Type Helpers
// ============================================================================

/**
 * Determine the part type from raw data
 * @param raw - Raw part input
 * @returns Normalized part type
 */
const determinePartType = (raw: RawPartInput): PartType => {
  const type = raw?.type || raw?.part_type || 'text';
  if (type === 'text' || type === 'thinking' || type === 'tool') {
    return type;
  }
  return 'text'; // Default fallback
};

/**
 * Normalize order values with fallback to Infinity for missing values
 * @param raw - Raw part input
 * @returns Normalized order values
 */
const normalizeOrderValues = (raw: RawPartInput): { order: number; block_order: number } => {
  return {
    order: isFiniteNumber(raw?.order) ? raw.order : Number.POSITIVE_INFINITY,
    block_order: isFiniteNumber(raw?.block_order) ? raw.block_order : Number.POSITIVE_INFINITY,
  };
};

// ============================================================================
// Arguments Parsing (DRY)
// ============================================================================

/**
 * Parse arguments which can be string or object
 * Follows Single Responsibility Principle - only handles argument parsing
 * @param args - Arguments in string or object form
 * @returns Parsed arguments with both string and object forms
 */
const parseArguments = (args: string | Record<string, unknown> | undefined): ParsedArguments => {
  if (!args) {
    return { argumentsString: '', parsedObject: {} };
  }

  if (typeof args === 'string') {
    try {
      const parsed: unknown = JSON.parse(args);
      return {
        argumentsString: args,
        parsedObject: (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>,
      };
    } catch {
      return {
        argumentsString: args,
        parsedObject: {},
      };
    }
  }

  // Args is an object
  return {
    argumentsString: JSON.stringify(args),
    parsedObject: args,
  };
};

/**
 * Extract special fields with priority: root level first, then arguments
 * @param execution - Task execution data
 * @param parsedArgs - Parsed arguments object
 * @returns Special fields extracted
 */
const extractSpecialFields = (
  execution: TaskExecution,
  parsedArgs: Record<string, unknown>
): Pick<ToolData, 'act_now' | 'act_done' | 'intent' | 'use_intent'> => {
  const result: Pick<ToolData, 'act_now' | 'act_done' | 'intent' | 'use_intent'> = {};

  // Extract act_now
  const actNow = (execution.act_now as string | undefined) || (parsedArgs.__act_now as string | undefined);
  if (actNow) {
    result.act_now = actNow;
  }

  // Extract act_done
  const actDone = (execution.act_done as string | undefined) || (parsedArgs.__act_done as string | undefined);
  if (actDone) {
    result.act_done = actDone;
  }

  // Extract intent
  const intent = (execution.intent as string | undefined) || (parsedArgs.__intent as string | undefined);
  if (intent) {
    result.intent = intent;
  }

  // Extract use_intent with proper type guard
  if (typeof execution.use_intent === 'boolean') {
    result.use_intent = execution.use_intent;
  } else if (typeof parsedArgs.__use_intent === 'boolean') {
    result.use_intent = parsedArgs.__use_intent;
  }

  return result;
};

// ============================================================================
// Tool Data Extraction
// ============================================================================

/**
 * Check if a tool name is valid (not an event keyword)
 * Prevents "Updated", "Added", etc. from being used as tool names
 */
const isValidToolName = (name: string | undefined): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const lowerName = name.toLowerCase().trim();
  
  // Reject event keywords that should never be tool names
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
 * Extract tool data from task execution
 * Follows Single Responsibility Principle - only handles tool data extraction
 * @param execution - Task execution data
 * @returns Extracted tool data
 */
const extractToolDataFromExecution = (execution: TaskExecution): ToolData => {
  const executionStatus = execution.status || EXECUTION_STATUS.PENDING;
  const { argumentsString, parsedObject } = parseArguments(execution.arguments);
  const specialFields = extractSpecialFields(execution, parsedObject);

  // Get tool name, but validate it's not an event keyword
  const rawToolName = execution.tool?.name;
  const toolName = isValidToolName(rawToolName) ? (rawToolName as string) : 'Tool';

  const toolData: ToolData = {
    name: toolName,
    arguments: argumentsString,
    result: execution.content,
    error: execution.error,
    status: executionStatus,
    input: execution.input,
    task_execution: execution,
    ...specialFields,
  };

  // Only add optional fields if they exist
  if (execution.finished_at !== undefined) {
    toolData.finished_at = execution.finished_at;
  }
  if (execution.id !== undefined) {
    toolData.task_execution_id = execution.id;
  }

  return toolData;
};

/**
 * Extract tool data based on available information
 * @param raw - Raw part input
 * @param partType - Determined part type
 * @returns Tool data or empty object
 */
const extractToolData = (raw: RawPartInput, partType: PartType): ToolData => {
  if (partType !== 'tool') {
    return {};
  }

  if (raw.task_execution) {
    return extractToolDataFromExecution(raw.task_execution);
  }

  if (raw.task_execution_id) {
    return { task_execution_id: raw.task_execution_id };
  }

  return {};
};

// ============================================================================
// Part Completion Status
// ============================================================================

/**
 * Determine if a tool part is complete based on status
 * @param status - Execution status
 * @returns True if tool is complete
 */
const isToolComplete = (status: string | undefined): boolean => {
  if (!status) return false;
  return status === EXECUTION_STATUS.SUCCESS || status === EXECUTION_STATUS.ERROR;
};

/**
 * Determine if a thinking part is complete
 * @param raw - Raw part input
 * @returns True if thinking is complete
 */
const isThinkingComplete = (raw: RawPartInput): boolean => {
  return raw.status === EXECUTION_STATUS.COMPLETED || !!raw.finished_at;
};

/**
 * Determine if part is done based on type and status
 * @param raw - Raw part input
 * @param partType - Part type
 * @param toolData - Extracted tool data
 * @returns True if part is complete
 */
const determinePartCompletion = (
  raw: RawPartInput,
  partType: PartType,
  toolData: ToolData
): boolean => {
  if (raw.is_done) return true;

  switch (partType) {
    case 'tool':
      return isToolComplete(toolData.status);
    case 'thinking':
      return isThinkingComplete(raw);
    default:
      return false;
  }
};

// ============================================================================
// Type-Specific Properties
// ============================================================================

/**
 * Extract thinking-specific properties
 * @param raw - Raw part input
 * @returns Thinking properties
 */
const extractThinkingProperties = (raw: RawPartInput): ThinkingProperties => {
  return {
    summary: raw.meta_data?.summary ?? [],
    provider: raw.meta_data?.provider ?? '',
    provider_id: raw.meta_data?.provider_id ?? '',
  };
};

/**
 * Get type-specific properties based on part type
 * @param raw - Raw part input
 * @param partType - Part type
 * @returns Type-specific properties
 */
const getTypeSpecificProperties = (
  raw: RawPartInput,
  partType: PartType
): Partial<MessagePart> => {
  switch (partType) {
    case 'thinking':
      return {
        ...extractThinkingProperties(raw),
        text: raw.text ?? '',
        status: raw.meta_data?.status || EXECUTION_STATUS.IN_PROGRESS,
      };
    case 'text':
      return {
        text: raw.text ?? '',
      };
    case 'tool':
      return {
        // Tool properties handled separately through toolData
      };
    default:
      return {};
  }
};

// ============================================================================
// Streaming State Initialization
// ============================================================================

/**
 * Initialize streaming state for a part
 * @param raw - Raw part input
 * @returns Streaming state fields
 */
const initializeStreamingState = (raw: RawPartInput): Partial<MessagePart> => {
  return {
    // Text/thinking streaming helpers
    deltaBuffer: raw.deltaBuffer ?? (Object.create(null) as Record<number, string>),
    receivedIndices: raw.receivedIndices ?? (Object.create(null) as Record<number, boolean>),
    lastProcessedIndex: isFiniteNumber(raw.lastProcessedIndex) ? raw.lastProcessedIndex : -1,

    // Tool arguments streaming helpers
    argumentsDeltaBuffer: raw.argumentsDeltaBuffer ?? (Object.create(null) as Record<number, string>),
    argumentsReceivedIndices: raw.argumentsReceivedIndices ?? (Object.create(null) as Record<number, boolean>),
    argumentsLastProcessedIndex: isFiniteNumber(raw.argumentsLastProcessedIndex)
      ? raw.argumentsLastProcessedIndex
      : -1,

    // Streaming animation helpers
    streamingChunks: raw.streamingChunks ?? [],
    updateRevision: raw.updateRevision ?? 0,
  };
};

// ============================================================================
// Main Normalization Function
// ============================================================================

/**
 * Normalize incoming raw message part
 * Follows Open/Closed Principle - easy to extend with new part types
 * @param raw - Raw part data
 * @returns Normalized part
 */
export const normalizePart = (raw: RawPartInput): MessagePart => {
  const partType = determinePartType(raw);
  const { order, block_order } = normalizeOrderValues(raw);
  const toolData = extractToolData(raw, partType);
  const isDone = determinePartCompletion(raw, partType, toolData);
  const typeSpecificProps = getTypeSpecificProperties(raw, partType);
  const streamingState = initializeStreamingState(raw);

  // Filter out is_done from toolData to avoid override
  const { is_done: _isDone, ...toolDataWithoutIsDone } = toolData as ToolData & { is_done?: boolean };

  // Build base part object
  const basePart: Partial<MessagePart> = {
    ...raw,
    ...typeSpecificProps,
    ...streamingState,
    ...toolDataWithoutIsDone,
    id: raw.id!,
    message_id: raw.message_id!,
    type: partType,
    part_type: partType,
    order,
    block_order,
    is_done: isDone,
    created_at: raw.created_at || raw.date_creation || new Date().toISOString(),
  };

  // Ensure tool parts never end up with invalid names like "updated"
  if (partType === 'tool') {
    const currentName = basePart.name;
    if (!isValidToolName(currentName)) {
      // Prefer sanitized toolData name if available, otherwise fallback to "Tool"
      const fallbackName =
        isValidToolName(toolDataWithoutIsDone.name) && toolDataWithoutIsDone.name
          ? toolDataWithoutIsDone.name
          : 'Tool';
      basePart.name = fallbackName;
    }
  }

  return basePart as MessagePart;
};

// ============================================================================
// Part Merging
// ============================================================================

/**
 * Streaming fields that should be preserved during merge
 */
const STREAMING_FIELD_KEYS = [
  'deltaBuffer',
  'receivedIndices',
  'lastProcessedIndex',
  'argumentsDeltaBuffer',
  'argumentsReceivedIndices',
  'argumentsLastProcessedIndex',
] as const;

/**
 * Merge incoming data into existing part without nuking streaming helpers
 * Preserves streaming state for Immer compatibility
 * @param existing - Existing part (Immer draft)
 * @param incoming - Incoming part data
 */
export const mergeIntoExistingPart = (
  existing: MessagePart,
  incoming: Partial<MessagePart>
): void => {
  // Preserve streaming fields from existing unless incoming explicitly provides them
  const preservedFields: Partial<MessagePart> = {};
  
  for (const key of STREAMING_FIELD_KEYS) {
    if (incoming[key] === undefined && existing[key] !== undefined) {
      // Type assertion needed due to dynamic key access
      preservedFields[key] = existing[key] as never;
    }
  }

  // Merge incoming data with preserved streaming fields
  Object.assign(existing, incoming, preservedFields);
};

// ============================================================================
// Thread Normalization
// ============================================================================

/**
 * Convert read state items array to member ID map
 * @param readState - Raw read state with items array
 * @returns Map of member ID to timestamp
 */
const normalizeReadState = (readState: RawReadState | undefined): Record<string, string> => {
  if (!readState?.items) {
    return {};
  }

  return readState.items.reduce<Record<string, string>>((acc, { member_id, timestamp }) => {
    acc[member_id] = timestamp;
    return acc;
  }, {});
};

/**
 * Normalize thread data structure
 * @param thread - Raw thread data
 * @returns Normalized thread
 */
export const handleThread = (thread: RawThreadInput): Thread => {
  const { messages, events, media, read_status, ...rest } = thread;
  
  // Create a properly typed thread object
  const normalized = {
    ...rest,
    // paginateCollection expects specific input types, cast to never for compatibility
    messages: paginateCollection(messages as never),
    events: paginateCollection(events as never),
    media: paginateCollection(media as never),
    read_state: normalizeReadState(read_status),
  };

  // Type assertion is safe here because we're adding normalized collections
  // to the existing thread data which should contain id, room_id, etc.
  return normalized as unknown as Thread;
};

// ============================================================================
// Message Normalization
// ============================================================================

/**
 * Check if value is an items collection wrapper
 * @param value - Value to check
 * @returns True if value is an items collection
 */
const isItemsCollection = <T>(value: unknown): value is ItemsCollection<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as ItemsCollection<T>).items)
  );
};

/**
 * Normalize a field that can be either an array or items collection
 * @param field - Field value to normalize
 * @returns Normalized items collection
 */
const normalizeItemsField = <T>(field: T[] | ItemsCollection<T> | undefined): ItemsCollection<T> => {
  if (!field) {
    return { items: [] };
  }

  if (Array.isArray(field)) {
    return { items: field };
  }

  if (isItemsCollection<T>(field)) {
    return field;
  }

  return { items: [] };
};

/**
 * Normalize message data from WebSocket
 * Converts WebSocket format to match the format expected by Redux state
 * @param eventData - Raw message data from WebSocket
 * @returns Normalized message data
 */
export const normalizeMessageData = (eventData: RawMessageData): Partial<Message> => {
  return {
    ...eventData,
    media: normalizeItemsField<Attachment>(eventData.media),
    reactions: normalizeItemsField<Reaction>(eventData.reactions),
  };
};