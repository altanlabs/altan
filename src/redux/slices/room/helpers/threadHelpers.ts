/**
 * Thread Helpers
 * Reusable functions for thread operations following DRY and SOLID principles
 */

import type { Thread, PaginationInfo } from '../types/state';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Raw thread data from API with various possible formats for collections
 */
export interface RawThreadData {
  id: string;
  room_id?: string;
  is_main?: boolean;
  messages?: MessageCollection | MessageNormalizedCollection | RawMessage[];
  events?: { items: unknown[] };
  media?: { items: unknown[] };
  read_status?: { items: ReadStatusItem[] } | null;
  [key: string]: unknown;
}

/**
 * Message collection from API
 */
interface MessageCollection {
  items: RawMessage[];
  paginationInfo?: PaginationInfo;
  pagination_info?: PaginationInfo;
}

/**
 * Already normalized message collection
 */
interface MessageNormalizedCollection {
  byId: Record<string, unknown>;
  allIds: string[];
  paginationInfo?: PaginationInfo;
}

/**
 * Raw message from API
 */
interface RawMessage {
  id: string;
  [key: string]: unknown;
}

/**
 * Read status item from API
 */
interface ReadStatusItem {
  member_id: string;
  timestamp: string;
}

// ============================================================================
// Message ID Extraction
// ============================================================================

/**
 * Normalize pagination info to ensure consistent field names
 * Maps 'cursor' to 'startCursor' for consistency across the app
 */
const normalizePaginationInfo = (rawPagination: Record<string, unknown>): PaginationInfo => {
  const normalized: PaginationInfo = {};
  
  if ('hasNextPage' in rawPagination) {
    normalized.hasNextPage = rawPagination.hasNextPage as boolean;
  }
  if ('hasPreviousPage' in rawPagination) {
    normalized.hasPreviousPage = rawPagination.hasPreviousPage as boolean;
  }
  
  // Normalize cursor fields - API might return 'cursor' or 'startCursor'
  if ('startCursor' in rawPagination && rawPagination.startCursor) {
    normalized.startCursor = rawPagination.startCursor as string;
  } else if ('cursor' in rawPagination && rawPagination.cursor) {
    normalized.startCursor = rawPagination.cursor as string;
  }
  
  if ('endCursor' in rawPagination && rawPagination.endCursor) {
    normalized.endCursor = rawPagination.endCursor as string;
  }
  
  if ('total' in rawPagination) {
    normalized.total = rawPagination.total as number;
  }
  
  return normalized;
};

/**
 * Extract message IDs from various message collection formats
 * Follows Single Responsibility Principle - only handles message ID extraction
 * @param messages - Messages in various formats
 * @returns Object with message IDs and pagination info
 */
export const extractMessageIds = (
  messages: MessageCollection | MessageNormalizedCollection | RawMessage[] | undefined
): { messageIds: string[]; paginationInfo: PaginationInfo } => {
  const defaultResult = { messageIds: [], paginationInfo: {} };

  if (!messages) {
    return defaultResult;
  }

  // Check for API format: { items: [...], paginationInfo: {...} }
  if ('items' in messages && Array.isArray(messages.items)) {
    const collection = messages as MessageCollection;
    const rawPagination = collection.paginationInfo || collection.pagination_info || {};
    return {
      messageIds: collection.items.map((msg) => msg.id).filter(Boolean),
      paginationInfo: normalizePaginationInfo(rawPagination as Record<string, unknown>),
    };
  }

  // Check for already normalized format: { byId: {...}, allIds: [...] }
  if ('byId' in messages && 'allIds' in messages) {
    const normalized = messages as MessageNormalizedCollection;
    const rawPagination = normalized.paginationInfo || {};
    return {
      messageIds: [...normalized.allIds],
      paginationInfo: normalizePaginationInfo(rawPagination as Record<string, unknown>),
    };
  }

  // Check for direct array format
  if (Array.isArray(messages)) {
    return {
      messageIds: messages.map((msg) => msg.id).filter(Boolean),
      paginationInfo: {},
    };
  }

  return defaultResult;
};

// ============================================================================
// Read State Normalization
// ============================================================================

/**
 * Normalize read status to a member ID -> timestamp map
 * Follows Single Responsibility Principle - only handles read state normalization
 * @param readStatus - Read status in API format
 * @returns Normalized read state map
 */
export const normalizeReadState = (
  readStatus: { items: ReadStatusItem[] } | null | undefined
): Record<string, string> => {
  if (!readStatus?.items) {
    return {};
  }

  return readStatus.items.reduce<Record<string, string>>((acc, { member_id, timestamp }) => {
    acc[member_id] = timestamp;
    return acc;
  }, {});
};

// ============================================================================
// Thread Normalization
// ============================================================================

/**
 * Normalize thread for storage - extract message IDs only
 * Messages themselves should be stored in messagesSlice
 * Follows Open/Closed Principle - easy to extend with new fields
 * @param thread - Raw thread data
 * @returns Normalized thread with only message IDs
 */
export const normalizeThreadForStorage = (thread: RawThreadData): Thread => {
  const { messages, events, media, read_status, ...rest } = thread;

  // Extract message IDs from messages collection
  const { messageIds, paginationInfo } = extractMessageIds(messages);

  // Normalize read state
  const read_state = normalizeReadState(read_status);

  return {
    ...rest,
    id: thread.id,
    room_id: thread.room_id || '',
    is_main: thread.is_main || false,
    messages: {
      allIds: messageIds,
      paginationInfo,
    },
    events: events?.items ? { items: [] } : { items: [] }, // We don't store events for now
    media: media?.items ? { items: [] } : { items: [] }, // We don't store media for now
    read_state,
  } as Thread;
};

// ============================================================================
// Message ID Deduplication
// ============================================================================

/**
 * Merge message ID arrays removing duplicates
 * Follows DRY principle - reusable deduplication logic
 * @param existing - Existing message IDs
 * @param incoming - New message IDs to merge
 * @returns Merged array without duplicates, preserving order
 */
export const mergeMessageIds = (existing: string[], incoming: string[]): string[] => {
  const seen = new Set(existing);
  const result = [...existing];

  for (const id of incoming) {
    if (!seen.has(id)) {
      result.push(id);
      seen.add(id);
    }
  }

  return result;
};

// ============================================================================
// Thread Merging
// ============================================================================

/**
 * Merge existing thread with new thread data
 * Follows Single Responsibility Principle - only handles thread merging
 * @param existing - Existing thread in state
 * @param incoming - New thread data
 * @returns Merged thread
 */
export const mergeThreads = (existing: Thread, incoming: Thread): Thread => {
  return {
    ...existing,
    ...incoming,
    messages: {
      allIds: mergeMessageIds(
        existing.messages?.allIds || [],
        incoming.messages?.allIds || []
      ),
      paginationInfo: {
        ...existing.messages?.paginationInfo,
        ...incoming.messages?.paginationInfo,
      },
    },
  };
};

// ============================================================================
// Thread Validation
// ============================================================================

/**
 * Validate thread update payload
 * Follows Single Responsibility Principle - only handles validation
 * @param payload - Update payload to validate
 * @returns Validation result with normalized ids and changes
 */
export interface ThreadUpdateValidationResult {
  isValid: boolean;
  ids: string[];
  changes: Partial<Thread>;
  error?: string;
}

export const validateThreadUpdate = (
  payload: { ids?: string | string[]; changes?: Partial<Thread>; id?: string; [key: string]: unknown }
): ThreadUpdateValidationResult => {
  let ids: string | string[] | undefined;
  let changes: Partial<Thread>;

  // Handle both old format { ids, changes } and new format (full object with id)
  if (payload.changes) {
    // Old format: { ids, changes }
    ids = payload.ids;
    changes = payload.changes;
  } else if (payload.id) {
    // New format: full object with id
    const { id, ...rest } = payload;
    ids = id;
    changes = rest;
  } else {
    return {
      isValid: false,
      ids: [],
      changes: {},
      error: "Invalid threadUpdate payload: Must contain either 'changes' or 'id'",
    };
  }

  // Validate ids
  if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
    return {
      isValid: false,
      ids: [],
      changes: {},
      error: "Invalid 'ids' in threadUpdate: Must be an array of strings or a single string",
    };
  }

  // Validate changes
  if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
    return {
      isValid: false,
      ids: [],
      changes: {},
      error: "Invalid 'changes' in threadUpdate: Must be an object",
    };
  }

  const threadIds = Array.isArray(ids) ? ids : [ids];

  // Validate each ID is a string
  for (const id of threadIds) {
    if (typeof id !== 'string') {
      return {
        isValid: false,
        ids: [],
        changes: {},
        error: `Invalid thread id: ${id}`,
      };
    }
  }

  return {
    isValid: true,
    ids: threadIds,
    changes,
  };
};

// ============================================================================
// Read State Parsing
// ============================================================================

/**
 * Parse read state update from various payload formats
 * @param data - Read state update payload
 * @returns Parsed read state update or null if invalid
 */
export interface ReadStateUpdate {
  threadId: string;
  memberId: string;
  timestamp: string;
}

export const parseReadStateUpdate = (data: {
  ids?: string[];
  changes?: { timestamp: string };
  attributes?: { thread_id: string; member_id: string; timestamp: string };
}): ReadStateUpdate | null => {
  let memberId: string | null = null;
  let threadId: string | null = null;
  let timestamp: string | null = null;

  if (data.ids?.length) {
    const ids = data.ids[0].split('_');
    threadId = ids[0];
    memberId = ids[1];
    timestamp = data.changes?.timestamp || null;
  } else if (data.attributes) {
    threadId = data.attributes.thread_id;
    memberId = data.attributes.member_id;
    timestamp = data.attributes.timestamp;
  }

  if (!threadId || !memberId || !timestamp) {
    return null;
  }

  return { threadId, memberId, timestamp };
};

