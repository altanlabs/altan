/**
 * Thread Thunks
 * Async actions for thread operations
 * 
 * This module follows SOLID principles:
 * - Single Responsibility: Each thunk handles one specific operation
 * - Open/Closed: Extensible through composition of helper functions
 * - Interface Segregation: Uses specific, well-typed interfaces
 * - Dependency Inversion: Depends on service abstractions
 */

import { sendMessage } from './messageThunks';
import { getAgentService } from '../../../../services/AgentService';
import { getRoomService } from '../../../../services/RoomService';
import type { Attachment } from '../../../../services/types';
import type { AppDispatch, RootState } from '../../../store';
import { getTimestamp } from '../helpers/utilities';
import { selectThreadsById } from '../selectors';
import { addPartsFromMessages } from '../slices/messagePartsSlice';
import { addMessagesFromThread } from '../slices/messagesSlice';
import { switchToThreadReducer } from '../slices/tabsSlice';
import {
  setMergeThreadBatch,
  addThread,
  addMessages,
  setThreadMain,
} from '../slices/threadsSlice';
import { setLoading, setInitialized } from '../slices/uiSlice';
import type { 
  Thread, 
  PaginationInfo, 
  MessagePart,
  RoomState,
  ThreadDrawer,
} from '../types/state';

// ============================================================================
// Type Definitions
// ============================================================================

interface MessageCollection {
  items: RawMessage[];
  has_next_page?: boolean;
  cursor?: string | null;
}

interface RawMessage {
  id: string;
  parts?: RawPart[] | { items: RawPart[] };
  [key: string]: unknown;
}

interface RawPart {
  id?: string;
  message_id?: string;
  [key: string]: unknown;
}

interface ThreadBatch {
  threads: {
    byId: Record<string, RawThread>;
    allIds: string[];
  };
  cursor: string | null;
}

interface RawThread {
  id: string;
  messages?: MessageCollection;
  [key: string]: unknown;
}

interface CreateThreadParams {
  content: string;
  attachments: Attachment[] | undefined;
}

interface PatchThreadParams {
  threadId: string;
  name: string | undefined;
  description: string | undefined;
  status: string | undefined;
}

interface SwitchToThreadParams {
  threadId: string;
  threadName: string | undefined;
}

// ============================================================================
// Helper Functions (DRY Principle)
// ============================================================================

/**
 * Type-safe helper to get RoomState from RootState
 * Ensures proper typing throughout the file
 */
const getRoomState = (state: RootState): RoomState => {
  // Use type assertion to handle the inferred RootState from combineReducers
  return (state as { room: RoomState }).room;
};

/**
 * Safe state accessor for room ID
 * Single Responsibility: Extract room ID from state
 */
const getRoomIdFromState = (state: RootState): string | null => {
  const roomState = getRoomState(state);
  return roomState?._room?.room?.id ?? null;
};

/**
 * Safe state accessor for thread drawer
 * Single Responsibility: Extract drawer state
 */
const getThreadDrawer = (state: RootState): ThreadDrawer | null => {
  const roomState = getRoomState(state);
  return roomState?._threads?.thread?.drawer ?? null;
};

/**
 * Safe state accessor for main thread
 * Single Responsibility: Extract main thread ID
 */
const getMainThreadId = (state: RootState): string | null => {
  const roomState = getRoomState(state);
  return roomState?._threads?.mainThread ?? null;
};

/**
 * Safe state accessor for thread by ID
 * Single Responsibility: Extract specific thread
 */
const getThreadById = (state: RootState, threadId: string): Thread | null => {
  const typedState = state as { room: RoomState };
  const threadsById = selectThreadsById(typedState);
  return threadsById?.[threadId] ?? null;
};

/**
 * Normalize parts array from various formats
 * Single Responsibility: Convert parts to array format
 */
const normalizePartsArray = (parts: RawPart[] | { items: RawPart[] } | null | undefined): RawPart[] => {
  if (!parts) return [];
  return Array.isArray(parts) ? parts : parts.items ?? [];
};

/**
 * Extract message parts with message_id attached
 * Single Responsibility: Process and normalize message parts
 */
const extractPartsFromMessages = (messages: RawMessage[]): MessagePart[] => {
  const allParts: MessagePart[] = [];

  messages.forEach((message) => {
    const parts = normalizePartsArray(message.parts);
    parts.forEach((part) => {
      allParts.push({
        ...part,
        message_id: part.message_id || message.id,
      } as MessagePart);
    });
  });

  return allParts;
};

/**
 * Extract pagination info from message collection
 * Single Responsibility: Normalize pagination data
 */
const extractPaginationInfo = (messages: MessageCollection): PaginationInfo => {
  const info: PaginationInfo = {
    hasNextPage: messages.has_next_page ?? false,
  };
  
  // Set cursor if available
  if (messages.cursor) {
    info.startCursor = messages.cursor;
  }
  
  // Note: If hasNextPage is true but no cursor, pagination will silently stop
  // This is an API inconsistency that should be handled gracefully
  
  return info;
};

/**
 * Extract message IDs from message collection
 * Single Responsibility: Get list of message IDs
 */
const extractMessageIds = (messages: RawMessage[]): string[] => {
  return messages.map((msg) => msg.id).filter(Boolean);
};

/**
 * Dispatch messages and parts to appropriate slices
 * Single Responsibility: Coordinate message/parts dispatch
 * 
 * This function ensures proper separation of concerns:
 * - messages go to messagesSlice
 * - parts go to messagePartsSlice
 * - metadata (IDs + pagination) goes to threadsSlice
 */
const dispatchMessagesAndParts = (
  dispatch: AppDispatch,
  threadId: string,
  messages: MessageCollection,
): void => {
  if (!messages?.items || !Array.isArray(messages.items)) {
    return;
  }

  // Extract and dispatch parts
  const parts = extractPartsFromMessages(messages.items);
  if (parts.length > 0) {
    dispatch(addPartsFromMessages({ parts }));
  }

  // Dispatch full messages (cast to unknown first to bypass type checking)
  dispatch(addMessagesFromThread({ messages: messages.items as unknown as never[] }));

  // Dispatch message IDs and pagination to thread
  const messageIds = extractMessageIds(messages.items);
  const paginationInfo = extractPaginationInfo(messages);

  dispatch(
    addMessages({
      threadId,
      messageIds,
      paginationInfo,
    }),
  );
};

/**
 * Process thread batch and extract messages
 * Single Responsibility: Handle batch thread processing
 */
const processBatchThreadMessages = (
  dispatch: AppDispatch,
  batch: ThreadBatch,
): void => {
  if (!batch.threads?.byId) return;

  Object.entries(batch.threads.byId).forEach(([threadId, thread]) => {
    if (thread.messages) {
      dispatchMessagesAndParts(dispatch, threadId, thread.messages);
    }
  });
};

/**
 * Check if thread has loaded messages
 * Single Responsibility: Validate thread message state
 */
const hasThreadLoadedMessages = (thread: Thread | null): boolean => {
  if (!thread) return false;
  return thread.messages?.paginationInfo?.hasNextPage !== undefined;
};

/**
 * Check if pagination allows more messages
 * Single Responsibility: Validate pagination state
 */
const canFetchMoreMessages = (paginationInfo: PaginationInfo | undefined): boolean => {
  return !!(paginationInfo?.hasNextPage && paginationInfo.startCursor);
};

/**
 * Get parent thread ID for fallback
 * Single Responsibility: Extract parent thread reference
 */
const getParentThreadId = (thread: Thread | null, mainThread: string | null): string | null => {
  return thread?.parent?.thread_id ?? mainThread;
};

// ============================================================================
// Thunk Actions
// ============================================================================

/**
 * Fetch all threads for current room (paginated)
 * Uses async generator for efficient batch processing
 */
export const fetchRoomAllThreads = () => async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state: RootState = getState();
  const roomId = getRoomIdFromState(state);

  if (!roomId) {
    throw new Error('fetchRoomAllThreads: No room ID found');
  }

  dispatch(setLoading({ key: 'allThreads', value: true }));

  try {
    const roomService = getRoomService();

    // Fetch all threads using generator
    for await (const batchRaw of roomService.fetchAllThreads(roomId)) {
      const batch = batchRaw as ThreadBatch;
      // Process and extract messages from batch
      processBatchThreadMessages(dispatch, batch);

      // Dispatch the batch of threads (now with only message IDs)
      dispatch(
        setMergeThreadBatch({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          threads: batch.threads as any,
          cursor: batch.cursor,
        }),
      );
    }

    // Signal completion
    dispatch(
      setMergeThreadBatch({
        threads: { byId: {}, allIds: [] },
        cursor: null,
      }),
    );

    dispatch(setLoading({ key: 'allThreads', value: false }));
    dispatch(setInitialized({ key: 'allThreads', value: true }));

    return 'success';
  } catch (error) {
    dispatch(setLoading({ key: 'allThreads', value: false }));
    throw error;
  }
};

/**
 * Fetch a single thread with messages
 */
export const fetchThread = ({
  threadId,
  force = false,
}: {
  threadId: string;
  force?: boolean;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const state: RootState = getState();
    const thread = getThreadById(state, threadId);

    if (!force && thread) {
      return 'Thread already loaded.';
    }

    const roomService = getRoomService();
    const threadRaw = await roomService.fetchThreadWithMessages(threadId);
    const threadWithMessages = threadRaw as RawThread;

    // Extract and dispatch messages
    if (threadWithMessages.messages) {
      dispatchMessagesAndParts(dispatch, threadId, threadWithMessages.messages);
    }

    // Add the thread itself (which now only contains message IDs)
    dispatch(addThread(threadWithMessages as unknown as Thread));

    return 'success';
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch thread resource (messages) with pagination
 * Open/Closed Principle: Extensible for other resource types
 */
export const fetchThreadResource = ({
  resource,
  threadId,
}: {
  resource: string;
  threadId: string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const state: RootState = getState();
    const thread = getThreadById(state, threadId);

    if (!thread) {
      throw new Error(`Thread '${threadId}' not found`);
    }

    // Only messages are supported in v2
    if (resource !== 'messages') {
      throw new Error(`Resource type '${resource}' not supported`);
    }

    const paginationInfo = thread.messages?.paginationInfo;

    if (!canFetchMoreMessages(paginationInfo)) {
      return 'No more messages to fetch';
    }

    const roomService = getRoomService();
    const messagesRaw = await roomService.fetchMessages(
      threadId,
      paginationInfo?.startCursor ?? null,
    );
    const messages = messagesRaw as MessageCollection;

    dispatchMessagesAndParts(dispatch, threadId, messages);

    return 'success';
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new thread with initial message
 */
export const createThread = ({
  content,
  attachments,
}: CreateThreadParams) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const state: RootState = getState();
    const roomId = getRoomIdFromState(state);
    const drawer = getThreadDrawer(state);

    if (!roomId) {
      throw new Error('No room ID found');
    }

    if (!drawer || !drawer.isCreation) {
      throw new Error('Invalid drawer creation mode.');
    }

    const roomService = getRoomService();
    const threadRaw = await roomService.createThread(
      roomId,
      drawer.messageId ?? undefined,
      drawer.threadName ?? content,
    );
    const thread = threadRaw as { id: string; name?: string };

    await dispatch(
      sendMessage({
        threadId: thread.id,
        content,
        ...(attachments && { attachments }),
      }),
    );

    return thread.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Update thread properties (name, description, status)
 * Interface Segregation: Accepts only relevant fields
 */
export const patchThread = ({
  threadId,
  name,
  description,
  status,
}: PatchThreadParams) => async () => {
  try {
    const payload: Record<string, string> = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;

    const roomService = getRoomService();
    await roomService.updateThread(threadId, payload);

    return 'success';
  } catch (error) {
    throw error;
  }
};

/**
 * Archive main thread
 */
export const archiveMainThread = ({ threadId }: { threadId: string }) => async () => {
  try {
    const roomService = getRoomService();
    const axiosInstance = roomService.port.getAxiosInstance() as { post: (url: string, data: unknown) => Promise<unknown> };
    await axiosInstance.post(`/thread/${threadId}/archive-main`, {});

    return 'success';
  } catch (error) {
    throw error;
  }
};

/**
 * Mark thread as read
 */
export const readThread = ({ threadId }: { threadId: string }) => async () => {
  try {
    const timestamp = getTimestamp();
    const roomService = getRoomService();
    await roomService.markThreadRead(threadId, timestamp);

    return 'success';
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a thread
 * Handles thread navigation after deletion
 */
export const deleteThread = (threadId: string) => async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const state: RootState = getState();
    const thread = getThreadById(state, threadId);
    const mainThread = getMainThreadId(state);

    // Navigate to parent thread or main thread before deletion
    const targetThreadId = getParentThreadId(thread, mainThread);
    if (targetThreadId) {
      dispatch(setThreadMain({ current: targetThreadId }));
    }

    const roomService = getRoomService();
    const response = await roomService.delete('thread', threadId) as unknown;

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Stop thread generation
 */
export const stopThreadGeneration = (threadId: string) => async () => {
  try {
    const agentService = getAgentService();
    const response: unknown = await agentService.stopThreadGeneration(threadId);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Switch to a thread (tab-aware) and ensure messages are loaded
 * Composite operation: navigation + data loading
 */
export const switchToThread = ({
  threadId,
  threadName,
}: SwitchToThreadParams) => async (dispatch: AppDispatch, getState: () => RootState) => {
  // First, switch to the thread (creates tab if needed)
  dispatch(
    switchToThreadReducer({
      threadId,
      ...(threadName && { threadName }),
    }),
  );

  // Then, ensure messages are loaded
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state: RootState = getState();
  const thread = getThreadById(state, threadId);

  if (!thread) {
    // Thread doesn't exist, fetch it (will fetch both thread and messages)
    await dispatch(fetchThread({ threadId }));
    return;
  }

  // Check if messages are loaded for this thread
  const hasMessages = hasThreadLoadedMessages(thread);

  if (!hasMessages) {
    try {
      const roomService = getRoomService();
      const messagesRaw = await roomService.fetchMessages(threadId, null);
      const messages = messagesRaw as MessageCollection;

      dispatchMessagesAndParts(dispatch, threadId, messages);
    } catch {
      // Silent fail - messages may be loaded via other means
    }
  }
};

/**
 * Helper action for tab-aware thread switching
 * Adapts behavior based on tabs feature state
 */
export const switchToThreadInTab = (
  threadId: string,
  threadName: string | undefined,
) => (dispatch: AppDispatch, getState: () => RootState) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state: RootState = getState();
  const roomState = getRoomState(state);
  const tabsEnabled = (roomState?._tabs?.tabs?.allIds?.length ?? 0) > 0;

  if (tabsEnabled) {
    void dispatch(
      switchToThread({
        threadId,
        threadName,
      }),
    );
  } else {
    dispatch(setThreadMain({ current: threadId }));
  }
};

/**
 * Create a new thread without messages
 */
export const createNewThread = () => async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const state: RootState = getState();
    const roomId = getRoomIdFromState(state);

    if (!roomId) {
      throw new Error('No room ID found');
    }

    const roomService = getRoomService();
    const threadRaw = await roomService.createThread(roomId, undefined, 'New Thread');
    const thread = threadRaw as { id: string; name?: string };

    dispatch(addThread(thread as unknown as Thread));

    await dispatch(
      switchToThread({
        threadId: thread.id,
        threadName: thread.name ?? 'New Thread',
      }),
    );

    return thread.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Ensure thread messages are loaded when switching to it
 * Idempotent: Safe to call multiple times
 */
export const ensureThreadMessagesLoaded = (threadId: string) => async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state: RootState = getState();
  const thread = getThreadById(state, threadId);

  if (!thread) {
    await dispatch(fetchThread({ threadId }));
    return;
  }

  const messageCount = thread.messages?.allIds?.length ?? 0;

  if (messageCount === 0) {
    try {
      await dispatch(fetchThread({ threadId, force: true }));
    } catch {
      // Silent fail - thread may be loading
    }
  }
};
