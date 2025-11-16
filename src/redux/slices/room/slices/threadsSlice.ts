/**
 * Threads Slice
 * Manages thread state, navigation, and temporary threads
 * Refactored following DRY and SOLID principles
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  normalizeThreadForStorage,
  mergeThreads,
  validateThreadUpdate,
  parseReadStateUpdate,
  mergeMessageIds,
  type RawThreadData,
} from '../helpers/threadHelpers';
import type {
  Thread,
  ThreadsState,
  ThreadDrawer,
  ThreadMain,
  TemporaryThread,
  ThreadUpdatePayload,
  AddMessagesPayload,
  PromoteTemporaryThreadPayload,
  SetMergeThreadBatchPayload,
} from '../types/state';


// ============================================================================
// State Type Definition
// ============================================================================

interface ThreadsSliceState {
  threads: ThreadsState;
  mainThread: string | null;
  thread: {
    drawer: ThreadDrawer;
    main: ThreadMain;
    respond: Record<string, string>;
  };
  temporaryThread: TemporaryThread | null;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ThreadsSliceState = {
  threads: {
    byId: {},
    allIds: [],
  },
  mainThread: null,
  thread: {
    drawer: {
      navigation: [],
      current: null,
      isCreation: false,
      messageId: null,
      display: false,
      threadName: null,
    },
    main: {
      navigation: [],
      current: null,
    },
    respond: {},
  },
  temporaryThread: null,
};

// ============================================================================
// Helper Functions (Private to this slice)
// ============================================================================

/**
 * Add or update a thread in state
 * Follows DRY principle - reusable thread upsert logic
 */
const upsertThread = (
  state: ThreadsSliceState,
  threadId: string,
  normalizedThread: Thread
): void => {
  // Add to allIds if not present
  if (!state.threads.allIds.includes(threadId)) {
    state.threads.allIds.push(threadId);
  }

  // Store or merge the thread
  if (!state.threads.byId[threadId]) {
    state.threads.byId[threadId] = normalizedThread;
  } else {
    const existing = state.threads.byId[threadId];
    state.threads.byId[threadId] = mergeThreads(existing, normalizedThread);
  }

  // Set as main thread if applicable
  if (normalizedThread.is_main) {
    state.thread.main.current = state.mainThread = threadId;
  }
};

/**
 * Apply changes to a thread
 * Follows Single Responsibility Principle
 * Note: Safe to mutate in Redux Toolkit due to Immer
 */
const applyThreadChanges = (
  threadDraft: Record<string, unknown>,
  changes: Partial<Thread>
): void => {
  // Mutation is safe and intended in Redux Toolkit with Immer
  Object.keys(changes).forEach((key) => {
    const value = changes[key as keyof Thread];
    if (value !== undefined) {
      // eslint-disable-next-line no-param-reassign
      threadDraft[key] = value;
    }
  });
};

// ============================================================================
// Slice Definition
// ============================================================================

const threadsSlice = createSlice({
  name: 'room/threads',
  initialState,
  reducers: {
    /**
     * Add a thread to the state
     * Extracts message IDs from thread data, full messages should be added via messagesSlice
     */
    addThread: (state, action: PayloadAction<Thread>) => {
      const thread = action.payload;
      
      if (!state.threads) {
        return;
      }

      // Normalize and upsert the thread
      const normalizedThread = normalizeThreadForStorage(thread as unknown as RawThreadData);
      upsertThread(state, thread.id, normalizedThread);
    },

    /**
     * Set the parent/main thread for the room
     * This is typically called when loading a room
     */
    setParentThread: (state, action: PayloadAction<Thread>) => {
      const thread = action.payload;

      // Normalize the thread
      const normalizedThread = normalizeThreadForStorage(thread as unknown as RawThreadData);

      // Upsert the thread
      upsertThread(state, thread.id, normalizedThread);

      // Set the main thread reference
      state.mainThread = thread.id;

      // Set as current thread
      state.thread.main.current = thread.id;
    },

    /**
     * Merge a batch of threads (used during pagination)
     */
    setMergeThreadBatch: (state, action: PayloadAction<SetMergeThreadBatchPayload>) => {
      const { threads } = action.payload;

      threads.allIds.forEach((threadId) => {
        const thread = threads.byId[threadId];
        const normalizedThread = normalizeThreadForStorage(thread as unknown as RawThreadData);
        upsertThread(state, threadId, normalizedThread);
      });
    },

    /**
     * Update one or more threads
     * Supports both old format { ids, changes } and new format (full object with id)
     */
    threadUpdate: (state, action: PayloadAction<ThreadUpdatePayload>) => {
      const validation = validateThreadUpdate(action.payload);

      if (!validation.isValid) {
        // Invalid payload - silently ignore in production
        // Error details available in validation.error for debugging
        return;
      }

      const { ids, changes } = validation;

      ids.forEach((id) => {
        const threadDraft = state.threads.byId[id];
        if (threadDraft) {
          applyThreadChanges(threadDraft as Record<string, unknown>, changes);
        }
        // Silently ignore updates to non-existent threads
      });
    },

    /**
     * Remove a thread from state
     */
    removeThread: (state, action: PayloadAction<{ ids: string[] }>) => {
      const { ids } = action.payload;
      const threadId = ids?.length ? ids[0] : null;

      if (!threadId) {
        // Invalid thread ID - silently ignore
        return;
      }

      state.threads.allIds = state.threads.allIds.filter((id) => id !== threadId);
      if (threadId in state.threads.byId) {
        delete state.threads.byId[threadId];
      }
    },

    /**
     * Set the current main thread
     */
    setThreadMain: (state, action: PayloadAction<{ current: string }>) => {
      const { current } = action.payload;
      
      // If switching away from drawer thread, close the drawer
      if (state.thread.drawer.current === current) {
        state.thread.drawer = initialState.thread.drawer;
      }
      
      state.thread.main.current = current;
    },

    /**
     * Set or clear the thread drawer state
     */
    setThreadDrawer: (state, action: PayloadAction<Partial<ThreadDrawer> | null>) => {
      const drawer = action.payload;
      
      if (drawer === null) {
        state.thread.drawer = initialState.thread.drawer;
      } else {
        state.thread.drawer = { ...state.thread.drawer, ...drawer };
      }
    },

    /**
     * Set which message to respond to in a thread
     */
    setThreadRespond: (state, action: PayloadAction<{ threadId: string; messageId: string }>) => {
      const { threadId, messageId } = action.payload;
      state.thread.respond[threadId] = messageId;
    },

    /**
     * Update thread read state for a member
     */
    changeThreadReadState: (state, action: PayloadAction<{
      ids?: string[];
      changes?: { timestamp: string };
      attributes?: { thread_id: string; member_id: string; timestamp: string };
    }>) => {
      const readState = parseReadStateUpdate(action.payload);

      if (!readState) {
        return;
      }

      const thread = state.threads.byId[readState.threadId];
      if (thread) {
        if (!thread.read_state) {
          thread.read_state = {};
        }
        thread.read_state[readState.memberId] = readState.timestamp;
      }
    },

    /**
     * Add messages to thread metadata
     * This only updates the thread's message ID list and pagination info
     * Actual message data is stored in messagesSlice via addMessagesFromThread
     */
    addMessages: (state, action: PayloadAction<AddMessagesPayload>) => {
      const { threadId, messageIds, paginationInfo } = action.payload;

      if (!threadId) {
        return;
      }

      const thread = state.threads.byId[threadId];
      if (!thread) {
        return;
      }

      // Ensure thread.messages structure exists
      if (!thread.messages) {
        thread.messages = {
          allIds: [],
          paginationInfo: {},
        };
      }

      // Add message IDs (avoid duplicates)
      if (messageIds && Array.isArray(messageIds)) {
        thread.messages.allIds = mergeMessageIds(thread.messages.allIds, messageIds);
      }

      // Update pagination info
      if (paginationInfo) {
        if (!thread.messages.paginationInfo) {
          thread.messages.paginationInfo = {};
        }
        Object.assign(thread.messages.paginationInfo, paginationInfo);
      }
    },

    /**
     * Create a temporary thread for optimistic UI updates
     */
    createTemporaryThread: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload;
      
      // Generate a unique temporary thread ID
      const tempThreadId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      state.temporaryThread = {
        id: tempThreadId,
        roomId,
        isTemporary: true,
        created_at: new Date().toISOString(),
      };

      // Set it as the current thread
      state.thread.main.current = tempThreadId;
    },

    /**
     * Promote a temporary thread to a real thread
     * Called after successfully creating a thread on the server
     */
    promoteTemporaryThread: (state, action: PayloadAction<PromoteTemporaryThreadPayload>) => {
      const { tempId, realThreadId, threadData } = action.payload;

      // Only proceed if the current temporary thread matches
      if (state.temporaryThread?.id !== tempId || !state.temporaryThread.isTemporary) {
        return;
      }

      // Normalize the thread data
      const normalizedThread = normalizeThreadForStorage({
        ...threadData,
        id: realThreadId,
        messages: threadData.messages || { items: [] },
        events: threadData.events || { items: [] },
        media: threadData.media || { items: [] },
        read_status: threadData.read_status || null,
      } as RawThreadData);

      // Mark thread as freshly promoted to prevent unnecessary fetch
      (normalizedThread as Thread & { justPromoted?: boolean }).justPromoted = true;

      // Add the thread to state
      state.threads.byId[realThreadId] = normalizedThread;
      if (!state.threads.allIds.includes(realThreadId)) {
        state.threads.allIds.push(realThreadId);
      }

      // Update current thread reference to the real thread ID
      state.thread.main.current = realThreadId;

      // Clear the temporary thread
      state.temporaryThread = null;
    },

    /**
     * Clear temporary thread state
     */
    clearTemporaryThread: (state) => {
      state.temporaryThread = null;
    },
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  addThread,
  setParentThread,
  setMergeThreadBatch,
  threadUpdate,
  removeThread,
  setThreadMain,
  setThreadDrawer,
  setThreadRespond,
  changeThreadReadState,
  addMessages,
  createTemporaryThread,
  promoteTemporaryThread,
  clearTemporaryThread,
} = threadsSlice.actions;

export default threadsSlice.reducer;

