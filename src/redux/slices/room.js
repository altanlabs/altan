import { createSelector, createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-unresolved
import { truncate } from 'lodash';
import { createCachedSelector } from 're-reselect';

import { ROOM_ALL_THREADS_GQ, ROOM_GENERAL_GQ, ROOM_PARENT_THREAD_GQ } from './gqspecs/room';
import { THREAD_GENERAL_GQ, THREAD_MESSAGES_GQ } from './gqspecs/thread';
import { setPreviewMode } from './previewControl';
import { setPreviewMode } from './previewControl';
import {
  // checkArraysEqualShallow,
  checkArraysEqualsProperties,
  checkObjectsEqual,
  getNestedProperty,
} from '../helpers/memoize';
import { analytics } from '../../lib/analytics';
import { paginateCollection } from './utils/collections';
import { optimai, optimai_room, optimai_agent, optimai_integration } from '../../utils/axios';

const SOUND_OUT = new Audio('https://storage.googleapis.com/logos-chatbot-optimai/out.mp3');

const handleReadState = (read_state) => {
  return (
    read_state?.items?.reduce((acc, { member_id, timestamp }) => {
      acc[member_id] = timestamp;
      return acc;
    }, {}) || {}
  );
};

function getTimestamp() {
  return new Date().toISOString();
}

const copy = (text) => {
  const parentUrl = window.parent.location.href;
  if (!parentUrl) {
    window.parent.postMessage({ type: 'COPY_TO_CLIPBOARD', text }, '*');
    return true;
  }
  // Try to save to clipboard then save it in the state if worked
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export function fetchCurrentMember(memberId, members) {
  const found =
    members.byId[
      members.allIds.find((roomMemberId) => {
        const member = members.byId[roomMemberId];

        // Compare with member.id for both guests and users
        const matches = member?.member?.id === memberId;

        return matches;
      })
    ];

  return found;
}

// ---------- helpers ----------
const isFiniteNumber = (n) => typeof n === 'number' && Number.isFinite(n);

// Strict ordering: order → block_order → created_at → id
const comparePartOrder = (aIdOrObj, bIdOrObj, byId) => {
  const a = typeof aIdOrObj === 'string' ? byId[aIdOrObj] : aIdOrObj;
  const b = typeof bIdOrObj === 'string' ? byId[bIdOrObj] : bIdOrObj;

  const ao = isFiniteNumber(a?.order) ? a.order : Number.POSITIVE_INFINITY;
  const bo = isFiniteNumber(b?.order) ? b.order : Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;

  const ab = isFiniteNumber(a?.block_order) ? a.block_order : Number.POSITIVE_INFINITY;
  const bb = isFiniteNumber(b?.block_order) ? b.block_order : Number.POSITIVE_INFINITY;
  if (ab !== bb) return ab - bb;

  const ac = a?.created_at ? Date.parse(a.created_at) || 0 : 0;
  const bc = b?.created_at ? Date.parse(b.created_at) || 0 : 0;
  if (ac !== bc) return ac - bc;

  return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
};

// Ensure the message has an array; return it
const ensureMessageIndex = (state, messageId) => {
  if (!state.messageParts.byMessageId[messageId]) {
    state.messageParts.byMessageId[messageId] = [];
  }
  return state.messageParts.byMessageId[messageId];
};

// Re-sort the message’s parts after any add/update impacting order
const resortMessageParts = (state, messageId) => {
  const arr = state.messageParts.byMessageId[messageId];
  if (!arr || arr.length <= 1) return;
  arr.sort((a, b) => comparePartOrder(a, b, state.messageParts.byId));
};

// Normalize incoming raw part
const normalizePart = (raw) => {
  const type = raw?.type || raw?.part_type || 'text';

  // Defaults: missing order/block_order sort last (Infinity)
  const order = isFiniteNumber(raw?.order) ? raw.order : Number.POSITIVE_INFINITY;
  const block_order = isFiniteNumber(raw?.block_order) ? raw.block_order : Number.POSITIVE_INFINITY;

  // For tool parts, extract data from task_execution if available
  let toolData = {};
  if (type === 'tool' && raw?.task_execution) {
    const execution = raw.task_execution;
    const executionStatus = execution.status || 'pending';

    // Parse arguments to extract special fields
    let parsedArgs = {};
    let argumentsStr = '';
    if (execution.arguments) {
      if (typeof execution.arguments === 'string') {
        try {
          parsedArgs = JSON.parse(execution.arguments);
          argumentsStr = execution.arguments;
        } catch {
          argumentsStr = execution.arguments;
        }
      } else {
        parsedArgs = execution.arguments;
        argumentsStr = JSON.stringify(execution.arguments);
      }
    }

    toolData = {
      name: execution.tool?.name || 'Tool',
      arguments: argumentsStr,
      result: execution.content,
      error: execution.error,
      status: executionStatus,
      finished_at: execution.finished_at,
      input: execution.input,
      // Store execution ID for dialog access
      task_execution_id: execution.id,
      // Keep the full task_execution reference for accessing nested data like icons and intent
      task_execution: execution,
      // Extract special fields - prioritize root level of execution, fallback to arguments
      act_now: execution.act_now || parsedArgs.__act_now,
      act_done: execution.act_done || parsedArgs.__act_done,
      intent: execution.intent || parsedArgs.__intent,
      use_intent: execution.use_intent ?? parsedArgs.__use_intent,
      // For tool parts, use the execution status to determine if done (don't override raw is_done)
      // is_done will be handled by the main logic below
    };
  } else if (type === 'tool' && raw?.task_execution_id) {
    // If we only have the execution ID, store it for later access
    toolData = {
      task_execution_id: raw.task_execution_id,
    };
  }

  // Determine if part is done based on type
  let isDone = raw?.is_done || false;
  if (type === 'tool' && toolData?.status) {
    isDone = ['success', 'error'].includes(toolData.status);
  } else if (type === 'thinking') {
    isDone = raw?.status === 'completed' || !!raw?.finished_at;
  }

  const thinkingProperties = {};
  if (type === 'thinking') {
    thinkingProperties.summary = raw?.meta_data?.summary ?? [];
    thinkingProperties.provider = raw?.meta_data?.provider ?? '';
    thinkingProperties.provider_id = raw?.meta_data?.provider_id ?? '';
  }

  return {
    ...raw,
    ...thinkingProperties,
    id: raw?.id,
    message_id: raw?.message_id,
    type,
    part_type: type, // keep both keys for compatibility
    order,
    block_order,
    is_done: isDone,
    created_at: raw?.created_at || raw?.date_creation || new Date().toISOString(),

    // Streaming helpers (non-serializable/run-time):
    // Plain objects to remain Immer-friendly without Map/Set semantics.
    deltaBuffer: raw?.deltaBuffer ?? Object.create(null), // index -> string
    receivedIndices: raw?.receivedIndices ?? Object.create(null), // index -> true
    lastProcessedIndex: isFiniteNumber(raw?.lastProcessedIndex) ? raw.lastProcessedIndex : -1,

    // Tool-specific streaming helpers for arguments
    argumentsDeltaBuffer: raw?.argumentsDeltaBuffer ?? Object.create(null), // index -> string
    argumentsReceivedIndices: raw?.argumentsReceivedIndices ?? Object.create(null), // index -> true
    argumentsLastProcessedIndex: isFiniteNumber(raw?.argumentsLastProcessedIndex)
      ? raw.argumentsLastProcessedIndex
      : -1,

    // Text default for text and thinking parts
    text: (type === 'text' || type === 'thinking') ? (raw?.text ?? '') : raw?.text,
    // Tool parts: use extracted tool data or fallback to raw arguments
    arguments: type === 'tool' ? toolData.arguments || raw?.arguments || '' : raw?.arguments,
    // Thinking parts: ensure status field is present
    status: type === 'thinking' ? (raw?.meta_data?.status || 'in_progress') : raw?.status,

    // Add tool-specific fields (but don't override is_done since we handled it above)
    ...Object.fromEntries(Object.entries(toolData).filter(([key]) => key !== 'is_done')),
  };
};

// Merge without nuking streaming helpers
const mergeIntoExistingPart = (existing, incoming) => {
  // Keep streaming fields from existing unless incoming explicitly carries them (rare)
  const {
    deltaBuffer = existing.deltaBuffer,
    receivedIndices = existing.receivedIndices,
    lastProcessedIndex = existing.lastProcessedIndex,
    argumentsDeltaBuffer = existing.argumentsDeltaBuffer,
    argumentsReceivedIndices = existing.argumentsReceivedIndices,
    argumentsLastProcessedIndex = existing.argumentsLastProcessedIndex,
    ...restIncoming
  } = incoming;

  Object.assign(existing, restIncoming);
  existing.deltaBuffer = deltaBuffer;
  existing.receivedIndices = receivedIndices;
  existing.lastProcessedIndex = lastProcessedIndex;
  existing.argumentsDeltaBuffer = argumentsDeltaBuffer;
  existing.argumentsReceivedIndices = argumentsReceivedIndices;
  existing.argumentsLastProcessedIndex = argumentsLastProcessedIndex;
};

const handleThread = (thread) => {
  const { messages, events, media, read_status, ...rest } = thread;
  return {
    ...rest,
    messages: paginateCollection(messages),
    events: paginateCollection(events),
    media: paginateCollection(media),
    read_state: handleReadState(read_status),
  };
};

function Object_assign(target, ...sources) {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const s_val = source[key];
      const t_val = target[key];
      if (t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object') {
        target[key] = Object_assign(t_val, s_val);
      } else {
        target[key] = s_val;
      }
    });
  });
  return target;
}

const initialState = {
  isLoading: false,
  error: null,
  initialized: {
    room: false,
    mainThread: false,
    allThreads: false,
    publicRooms: false,
    userRooms: false,
  },
  loading: {
    room: false,
    mainThread: false,
    allThreads: false,
    publicRooms: false,
    userRooms: false,
  },
  room: null,
  publicRooms: [],
  userRooms: [],
  userRoomsPagination: {
    hasNextPage: false,
    nextCursor: null,
    isLoadingMore: false,
  },
  // Add search state
  searchRooms: {
    results: [],
    isSearching: false,
    query: '',
    hasResults: false,
  },
  me: null,
  calendar_events: [],
  authorization_requests: [],
  runningResponses: {},
  // Add voice conversation state
  voiceConversations: {
    byThreadId: {}, // threadId -> { isActive, agentId, elevenlabsId, conversation }
    isConnecting: false,
  },
  // Minimal response lifecycle tracking
  responseLifecycles: {
    byId: {}, // response_id -> { response_id, agent_id, thread_id, status, events: [], message_id?, created_at, updated_at }
    activeByThread: {}, // thread_id -> [response_id1, response_id2, ...] (active responses)
  },
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
  // Add tab state management
  tabs: {
    byId: {},
    allIds: [],
    activeTabId: null,
    nextTabId: 1,
  },
  drawerOpen: false,
  drawerOpenJob: false,
  drawerExpanded: false,
  messages: {
    byId: {},
    allIds: [],
  },
  messagesContent: {},
  messagesExecutions: {},
  // Add message parts support
  messageParts: {
    byId: {},
    allIds: [],
    byMessageId: {}, // messageId -> [partId1, partId2, ...]
  },
  executions: {
    byId: {},
    allIds: [],
  },
  members: {
    byId: {},
    allIds: [],
  },
  events: {
    byId: {},
    allIds: [],
  },
  threads: {
    byId: {},
    allIds: [],
  },
  account: null,
  uploadProgress: null,
  isUploading: false,
  mainThread: null,
  isRealtimeCall: false,
  contextMenu: null,
};

const extractMessagesFromThread = (state, thread) => {
  const messagesById = {};
  const messagesExecutions = {};
  const executionsById = {};
  const messagesContentById = {};
  const threadMessages = thread.messages;
  // Iterate over each message in the current thread
  for (const messageId of threadMessages.allIds) {
    const message = threadMessages.byId[messageId];
    // Add the message to messages.byId
    messagesContentById[messageId] = message.text;

    // Process executions
    const executions = message.executions?.items ?? null;
    if (executions) {
      messagesExecutions[messageId] = [];
      for (const execution of executions) {
        executionsById[execution.id] = execution;
        messagesExecutions[messageId].push(execution.id);
      }
    }

    // Process message parts
    const parts = message.parts?.items ?? null;
    if (parts) {
      for (const rawPart of parts) {
        // Set message_id if not present
        if (!rawPart.message_id) {
          rawPart.message_id = messageId;
        }

        const normalized = normalizePart(rawPart);

        // Add to global parts collection
        state.messageParts.byId[normalized.id] = normalized;
        if (!state.messageParts.allIds.includes(normalized.id)) {
          state.messageParts.allIds.push(normalized.id);
        }

        // Add to message association
        const arr = ensureMessageIndex(state, messageId);
        if (!arr.includes(normalized.id)) {
          arr.push(normalized.id);
        }
      }

      // Sort the parts for this message
      resortMessageParts(state, messageId);
    }

    delete message.text;
    delete message.executions;
    delete message.parts; // Also clean up parts from the message object

    // Merge with existing message if it exists, especially preserving meta_data
    const existingMessage = state.messages.byId[message.id];
    if (existingMessage) {
      // Merge meta_data from both existing and new message
      const mergedMetaData = {
        ...(existingMessage.meta_data || {}),
        ...(message.meta_data || {}),
      };
      messagesById[message.id] = {
        ...existingMessage,
        ...message,
        meta_data: mergedMetaData,
      };
    } else {
      messagesById[message.id] = message;
    }
  }
  state.messages.byId = { ...state.messages.byId, ...messagesById };
  state.messages.allIds = [...state.messages.allIds, ...Object.keys(messagesById)];
  state.messagesExecutions = { ...state.messagesExecutions, ...messagesExecutions };
  state.executions.byId = { ...state.executions.byId, ...executionsById };
  state.executions.allIds = [...state.executions.allIds, ...Object.keys(executionsById)];
  state.messagesContent = { ...state.messagesContent, ...messagesContentById };
};

const mergeShallowArray = (array1, array2) => {
  const resultSet = new Set(array1);
  for (const item of array2) {
    resultSet.add(item);
  }
  return Array.from(resultSet);
};

const mergeProperties = (previous, current, property) => {
  if (!!current[property]) {
    if (
      !!previous[property] &&
      !!current[property].allIds?.length &&
      Object.keys(current[property].byId ?? {}).length
    ) {
      previous[property].allIds = mergeShallowArray(
        previous[property].allIds,
        current[property].allIds,
      );
      Object.assign(previous[property].byId, current[property].byId);
    } else {
      previous[property] = current[property];
    }
  }
};

const mergeThreads = (previous, current) => {
  // Directly assigning properties that always get overwritten
  ['name', 'date_creation', 'parent', 'starter_message_id', 'status', 'read_state'].forEach(
    (prop) => {
      previous[prop] = current[prop];
    },
  );

  // Merge and optimize repetitive structures using a helper function
  ['events', 'media', 'messages'].forEach((prop) => {
    mergeProperties(previous, current, prop);
  });
};

const slice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setContextMenu: (state, action) => {
      state.contextMenu = action.payload;
    },
    setDrawerOpen: (state, action) => {
      state.drawerOpen = action.payload;
    },
    setDrawerOpen: (state, action) => {
      state.drawerOpen = action.payload;
    },
    setDrawerOpenJob: (state, action) => {
      state.drawerOpenJob = action.payload;
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    toggleDrawerJob: (state) => {
      state.drawerOpenJob = !state.drawerOpenJob;
    },
    setPublicRooms: (state, action) => {
      state.publicRooms = action.payload;
      state.initialized.publicRooms = true;
      state.loading.publicRooms = false;
    },
    setUserRooms: (state, action) => {
      const { rooms, hasNextPage, nextCursor, isLoadMore = false } = action.payload;
      if (isLoadMore) {
        state.userRooms = [...state.userRooms, ...rooms];
      } else {
        state.userRooms = rooms;
      }
      state.userRoomsPagination.hasNextPage = hasNextPage;
      state.userRoomsPagination.nextCursor = nextCursor;
      state.userRoomsPagination.isLoadingMore = false;
      state.initialized.userRooms = true;
      state.loading.userRooms = false;
    },
    setUserRoomsLoadingMore: (state, action) => {
      state.userRoomsPagination.isLoadingMore = action.payload;
    },
    // Add search actions
    setSearchRoomsQuery: (state, action) => {
      state.searchRooms.query = action.payload;
      if (!action.payload) {
        // Clear search results when query is empty
        state.searchRooms.results = [];
        state.searchRooms.hasResults = false;
      }
    },
    setSearchRoomsLoading: (state, action) => {
      state.searchRooms.isSearching = action.payload;
    },
    setSearchRoomsResults: (state, action) => {
      state.searchRooms.results = action.payload;
      state.searchRooms.hasResults = action.payload.length > 0;
      state.searchRooms.isSearching = false;
    },
    setLoading: (state, action) => {
      state.loading[action.payload] = true;
    },
    startRealtime: (state) => {
      state.isRealtimeCall = true;
    },
    stopRealtime: (state) => {
      state.isRealtimeCall = false;
    },
    addRunningResponse: (state, action) => {
      const { id, llm_response_id } = action.payload;
      state.runningResponses[id] = llm_response_id;
    },
    deleteRunningResponse: (state, action) => {
      const { id } = action.payload;
      if (id in state.runningResponses) {
        delete state.runningResponses[id];
      }
    },
    setRoom: (state, action) => {
      const { room: roomObject, guest, user } = action.payload;
      const account = roomObject.account;
      delete roomObject.account;
      const members = roomObject.members;
      delete roomObject.members;
      const events = roomObject.events;
      delete roomObject.events;
      const threads = roomObject.threads;
      delete roomObject.threads;

      state.room = {
        id: roomObject.id,
        name: roomObject.name,
        description: roomObject.description,
        avatar_url: roomObject.avatar_url || null,
        is_dm: roomObject.is_dm,
        policy: roomObject.policy || {},
        meta_data: roomObject.meta_data || {},
        external_id: roomObject.external_id || null,
      };
      state.account = account;
      state.members = paginateCollection(members);
      // Authorization requests are now fetched separately via API

      const memberId = guest?.member.id || user?.member.id;
      state.me = fetchCurrentMember(memberId, state.members);

      if (threads?.items) {
        threads.items = threads.items.map(handleThread);
      }
      const tempThreads = paginateCollection(threads);
      for (const threadId of tempThreads.allIds) {
        const thread = tempThreads.byId[threadId];
        extractMessagesFromThread(state, thread);
        delete thread.messages.byId;
        delete thread.messages.allIds;
      }
      state.messages.allIds = Object.keys(state.messages.byId);
      state.threads.byId = { ...state.threads.byId, ...tempThreads.byId };
      state.threads.allIds = Object.keys(tempThreads.byId);
      state.events = paginateCollection(events);
      state.initialized.room = true;
      state.loading.room = false;
    },
    addMessageExecution: (state, action) => {
      const execution = action.payload;

      // const threadId = state.threads.allIds.find(id =>
      //   state.threads.byId[id].messages.allIds.includes(execution.message_id)
      // );
      const messageId = execution.message_id;
      if (!state.messages.allIds.includes(messageId)) {
        console.warn(`Message with id '${messageId}' not found.`);
      }
      if (!state.messagesExecutions[messageId]) {
        state.messagesExecutions[messageId] = [];
      }
      state.messagesExecutions[messageId].push(execution.id);
      state.executions.byId[execution.id] = execution;
      state.executions.allIds.push(execution.id);
    },

    updateMessageExecution: (state, action) => {
      const { ids, changes } = action.payload;

      if (!ids?.length) {
        return;
      }
      const executionId = ids[0];

      if (!state.executions.allIds.includes(executionId)) {
        return;
      }

      if (!state.executions.byId[executionId]) {
        state.executions.byId[executionId] = changes;
      } else {
        Object_assign(state.executions.byId[executionId], changes);
      }
    },

    setMergeThreadBatch: (state, action) => {
      const { threads, cursor } = action.payload;
      threads.allIds.forEach((tId) => {
        const thread = threads.byId[tId];
        extractMessagesFromThread(state, thread);
        delete thread.messages.byId;
        delete thread.messages.allIds;
        if (!state.threads.byId[tId]) {
          state.threads.byId[tId] = thread;
        } else {
          mergeThreads(state.threads.byId[tId], thread);
        }
      });
      if (!cursor) {
        state.initialized.allThreads = true;
        state.loading.allThreads = false;
      }
    },
    setParentThread: (state, action) => {
      const thread = action.payload;
      const tempThread = handleThread(thread);
      extractMessagesFromThread(state, tempThread);
      if (!state.threads.byId[thread.id]) {
        state.threads.byId[thread.id] = tempThread;
      } else {
        state.threads.byId[thread.id] = { ...state.threads.byId[thread.id], ...tempThread };
      }

      // Set the main thread reference
      state.mainThread = thread.id;

      // Only set as current thread if:
      // 1. No tabs are active, OR
      // 2. There's an active tab but it's pointing to the main thread, OR
      // 3. There's an active tab but the thread it points to doesn't exist yet
      const hasActiveTabs = state.tabs.allIds.length > 0 && state.tabs.activeTabId;
      if (!hasActiveTabs) {
        // No tabs system in use, set main thread as current
        state.thread.main.current = thread.id;
      } else {
        // Tabs are in use, check if we should override the current thread
        const activeTab = state.tabs.byId[state.tabs.activeTabId];
        const activeTabThreadExists = activeTab && state.threads.byId[activeTab.threadId];

        // Only override if the active tab's thread doesn't exist or if there's no current thread set
        if (!activeTabThreadExists || !state.thread.main.current) {
          state.thread.main.current = thread.id;
        }
        // Otherwise, preserve the current thread (from active tab)
      }

      state.initialized.mainThread = true;
      state.loading.mainThread = false;
    },
    setThreadRespond: (state, action) => {
      const { threadId, messageId } = action.payload;
      state.thread.respond[threadId] = messageId;
    },
    setThreadMain: (state, action) => {
      const { current } = action.payload;
      if (state.thread.drawer.current === current) {
        state.thread.drawer = initialState.thread.drawer;
      }
      state.thread.main.current = current;
    },
    setThreadDrawer: (state, action) => {
      const drawer = action.payload;
      if (drawer === null) {
        state.thread.drawer = initialState.thread.drawer;
      } else {
        // state.thread.drawer = drawer;
        state.thread.drawer = { ...state.thread.drawer, ...drawer };
      }
      state.drawerOpen = true;
    },
    addThread: (state, action) => {
      const thread = action.payload;
      if (!!state.threads) {
        if (!state.threads.allIds.includes(thread.id)) {
          state.threads.allIds.push(thread.id);
        }
        const tempThread = handleThread(thread);
        extractMessagesFromThread(state, tempThread);
        delete tempThread.messages.byId;
        delete tempThread.messages.allIds;
        state.threads.byId[thread.id] = tempThread;

        // Update corresponding tab name if it exists
        const tabWithThisThread = Object.values(state.tabs.byId).find(
          (tab) => tab.threadId === thread.id,
        );
        if (tabWithThisThread && thread.name) {
          tabWithThisThread.name = thread.name;
        }

        if (tempThread.is_main) {
          state.thread.main.current = state.mainThread = thread.id;
        }
      }
    },
    addMessages: (state, action) => {
      const { id, messages } = action.payload;

      if (!id || !messages || !Array.isArray(messages.items)) {
        console.error('Invalid input for addMessages.');
        return;
      }
      const thread = state.threads.byId[id];
      if (thread) {
        const { byId, allIds, paginationInfo } = paginateCollection(messages);
        Object.assign(thread.messages.paginationInfo, paginationInfo);
        extractMessagesFromThread(state, { messages: { byId, allIds } });
      } else {
        console.warn(`Thread with id '${id}' not found.`);
      }
    },
    changeThreadReadState: (state, action) => {
      const data = action.payload;
      let member_id = null;
      let thread_id = null;
      let timestamp = null;
      if (data.ids?.length) {
        const ids = data.ids[0].split('_');
        thread_id = ids[0];
        member_id = ids[1];
        timestamp = data.changes.timestamp;
      } else if (data.attributes) {
        thread_id = data.attributes.thread_id;
        member_id = data.attributes.member_id;
        timestamp = data.attributes.timestamp;
      }
      if (!thread_id) {
        return;
      }
      const thread = state.threads.byId[thread_id];
      if (!!thread) {
        thread.read_state[member_id] = timestamp;
      }
    },
    threadUpdate: (state, action) => {
      const { ids, changes } = action.payload;

      if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
        console.error("Invalid 'ids': Must be an array of strings or a single string.");
        return;
      }

      if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
        console.error("Invalid 'changes': Must be an object.");
        return;
      }

      const threadIds = Array.isArray(ids) ? ids : [ids];

      threadIds.forEach((id) => {
        if (typeof id !== 'string') {
          console.error(`Invalid thread id: ${id}`);
          return;
        }

        const thread = state.threads.byId[id];
        if (thread) {
          // Apply changes to each valid thread
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              thread[key] = changes[key];
            }
          });

          // Update corresponding tab name if the thread name changed
          if (changes.name) {
            const tabWithThisThread = Object.values(state.tabs.byId).find(
              (tab) => tab.threadId === id,
            );
            if (tabWithThisThread) {
              tabWithThisThread.name = changes.name;
            }
          }
        } else {
          console.warn(`Thread with id '${id}' not found.`);
        }
      });
    },
    addMember: (state, action) => {
      const payload = action.payload;

      // Handle both old and new payload structures for backward compatibility
      const roomMember = payload.roomMember || payload;
      const currentUserId = payload.currentUserId;

      if (!roomMember || !roomMember.id) {
        console.warn('addMember: Invalid roomMember payload', payload);
        return;
      }

      state.members.byId[roomMember.id] = roomMember;
      state.members.allIds.push(roomMember.id);

      if (currentUserId && roomMember.member?.user?.id === currentUserId) {
        state.me = roomMember;
      }
    },
    roomMemberUpdate: (state, action) => {
      const { ids, changes } = action.payload;

      if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
        console.error("Invalid 'ids': Must be an array of strings or a single string.");
        return;
      }

      if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
        console.error("Invalid 'changes': Must be an object.");
        return;
      }

      const memberIds = Array.isArray(ids) ? ids : [ids];

      memberIds.forEach((id) => {
        if (typeof id !== 'string') {
          console.error(`Invalid member id: ${id}`);
          return;
        }

        const member = state.members.byId[id];
        if (member) {
          // Apply changes to each valid member
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              member[key] = changes[key];
            }
          });

          // Update the 'me' state if this member is the current user
          if (!!state.me && member.id === state.me.id) {
            Object.keys(changes).forEach((key) => {
              if (changes[key] !== undefined) {
                state.me[key] = changes[key];
              }
            });
          }
        } else {
          console.warn(`RoomMember with id '${id}' not found.`);
        }
      });
    },
    // addMessages: (state, action) => {
    //   const { id, messages } = action.payload;

    //   if (!id || !messages || !Array.isArray(messages.items)) {
    //     console.error("Invalid input for addMessages.");
    //     return;
    //   }
    //   const thread = state.threads.byId[id];
    //   if (thread) {
    //     const { byId, allIds, paginationInfo } = paginateCollection(messages);
    //     thread.messages.byId = thread.messages.byId || {};
    //     thread.messages.allIds = thread.messages.allIds || [];
    //     Object.assign(thread.messages.paginationInfo, paginationInfo);
    //     Object.assign(thread.messages.byId, byId);
    //     thread.messages.allIds = [...new Set([...thread.messages.allIds, ...allIds])];
    //   } else {
    //     console.warn(`Thread with id '${id}' not found.`);
    //   }
    // },
    addMessage: (state, action) => {
      const message = action.payload;
      if (!message?.id || !message?.thread_id) {
        console.error('Invalid input for addMessage.');
        return;
      }

      // Only play sound for non-streaming messages or when streaming starts
      // and it's not from the current user
      // if (message.member_id !== state.me?.id && !message.is_streaming) {
      //   // Don't play sound if voice is active for this thread
      //   const isVoiceActiveForThread =
      //     !!state.voiceConversations.byThreadId[message.thread_id]?.isActive;
      //   if (!isVoiceActiveForThread) {
      //     SOUND_IN.play();
      //   }
      // }

      console.log('[addMessage] Message:', message);

      // Check if message already exists to avoid duplicates
      if (state.messages.byId[message.id]) {
        // Update existing message properties, merging meta_data
        const existingMessage = state.messages.byId[message.id];
        Object.assign(existingMessage, message);

        // Ensure meta_data is properly merged (not replaced)
        if (message.meta_data) {
          existingMessage.meta_data = {
            ...existingMessage.meta_data,
            ...message.meta_data,
          };
        }
        return;
      }

      extractMessagesFromThread(state, {
        messages: { byId: { [message.id]: message }, allIds: [message.id] },
      });
    },
    removeMessage: (state, action) => {
      const data = action.payload;

      const messageId = data?.ids?.length ? data.ids[0] : null;

      if (!messageId) {
        console.error('Invalid message to delete.');
        return;
      }

      // Clean up message parts
      const messageParts = state.messageParts.byMessageId[messageId] || [];
      messageParts.forEach((partId) => {
        delete state.messageParts.byId[partId];
        state.messageParts.allIds = state.messageParts.allIds.filter((id) => id !== partId);
      });
      delete state.messageParts.byMessageId[messageId];

      delete state.messages.byId[messageId];
      delete state.messagesExecutions[messageId];
      delete state.messagesContent[messageId];
      // TODO: delete executions
      state.messages.allIds = state.messages.allIds.filter((id) => id !== messageId);
    },
    removeThread: (state, action) => {
      const data = action.payload;

      const threadId = data?.ids?.length ? data.ids[0] : null;

      if (!threadId) {
        console.error('Invalid thread to delete.');
        return;
      }

      state.threads.allIds = state.threads.allIds.filter((id) => id !== threadId);
      if (threadId in state.threads.byId) {
        delete state.threads.byId[threadId];
      }
    },
    addMessageDelta: (state, action) => {
      const { id, content } = action.payload;
      state.messagesContent[id] = (state.messagesContent[id] || '').concat(content);
    },
    setMessageError: (state, action) => {
      const { id, content } = action.payload;
      const message = state.messages.byId[id];
      if (!!message) {
        state.messagesContent[id] = state.messagesContent[id] || ' ';
        message.error = content;
      }
    },
    addMessageReaction: (state, action) => {
      const reaction = action.payload;

      const message = state.messages.byId[reaction.message_id];
      if (message) {
        if (!message.reactions) {
          message.reactions = { items: [] };
        }
        message.reactions.items.push(reaction);
      } else {
        console.warn(`Message with id '${reaction.message_id}' not found.`);
      }
    },
    updateMediaProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    setIsUploading(state, action) {
      state.isUploading = action.payload;
    },
    clearUploadState(state) {
      state.isUploading = false;
      state.uploadProgress = {};
    },
    addMessageAttachment: (state, action) => {
      const attachment = action.payload;
      const message = state.messages.byId[attachment.message_id];
      if (message) {
        if (!message.media) {
          message.media = { items: [] };
        }
        message.media.items.push(attachment);
      } else {
        console.warn(`Message with id '${attachment.message_id}' not found.`);
      }
    },
    clearState: (state) => {
      // Preserve userRooms data when clearing room state
      const preservedUserRooms = [...state.userRooms];
      const preservedUserRoomsPagination = { ...state.userRoomsPagination };
      const preservedUserRoomsInitialized = state.initialized.userRooms;
      const preservedSearchRooms = { ...state.searchRooms };

      // Reset to initial state
      Object.keys(initialState).forEach((key) => {
        if (key === 'userRooms') {
          state[key] = preservedUserRooms;
        } else if (key === 'userRoomsPagination') {
          state[key] = preservedUserRoomsPagination;
        } else if (key === 'searchRooms') {
          state[key] = preservedSearchRooms;
        } else if (key === 'initialized') {
          // Reset all initialized flags but preserve userRooms
          state[key] = { ...initialState[key] };
          state[key].userRooms = preservedUserRoomsInitialized;
          // Specifically ensure room is not initialized for new room fetch
          state[key].room = false;
          state[key].mainThread = false;
          state[key].allThreads = false;
        } else {
          state[key] = initialState[key];
        }
      });
    },
    updateMessageContent: (state, action) => {
      const { messageId, content } = action.payload;
      state.messagesContent[messageId] = content;
    },
    updateMessageStreamingState: (state, action) => {
      const { messageId, isStreaming } = action.payload;
      if (state.messages.byId[messageId]) {
        state.messages.byId[messageId].is_streaming = isStreaming;
      }
    },
    addAuthorizationRequest: (state, action) => {
      const request = action.payload;
      state.authorization_requests.push(request);
    },
    updateAuthorizationRequest: (state, action) => {
      const { ids, changes } = action.payload;
      if (!Array.isArray(ids) || !ids.length) {
        console.error("Invalid 'ids': Must be a non-empty array.");
        return;
      }
      const requestId = ids[0];
      const requestIndex = state.authorization_requests.findIndex((req) => req.id === requestId);
      if (requestIndex !== -1) {
        state.authorization_requests[requestIndex] = {
          ...state.authorization_requests[requestIndex],
          ...changes,
        };
      }
    },
    setAuthorizationRequests: (state, action) => {
      state.authorization_requests = action.payload;
    },
    roomUpdate: (state, action) => {
      const { ids, changes } = action.payload;

      if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
        console.error("Invalid 'ids': Must be an array of strings or a single string.");
        return;
      }

      if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
        console.error("Invalid 'changes': Must be an object.");
        return;
      }

      const roomIds = Array.isArray(ids) ? ids : [ids];

      roomIds.forEach((roomId) => {
        if (typeof roomId !== 'string') {
          console.error(`Invalid room id: ${roomId}`);
          return;
        }

        // Update current room if it matches
        if (state.room && state.room.id === roomId) {
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              state.room[key] = changes[key];
            }
          });
        }

        // Update in userRooms array
        const userRoomIndex = state.userRooms.findIndex((room) => room.id === roomId);
        if (userRoomIndex !== -1) {
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              state.userRooms[userRoomIndex][key] = changes[key];
            }
          });
        }

        // Update in publicRooms array
        const publicRoomIndex = state.publicRooms.findIndex((room) => room.id === roomId);
        if (publicRoomIndex !== -1) {
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              state.publicRooms[publicRoomIndex][key] = changes[key];
            }
          });
        }

        // Update in searchRooms results
        const searchRoomIndex = state.searchRooms.results.findIndex((room) => room.id === roomId);
        if (searchRoomIndex !== -1) {
          Object.keys(changes).forEach((key) => {
            if (changes[key] !== undefined) {
              state.searchRooms.results[searchRoomIndex][key] = changes[key];
            }
          });
        }
      });
    },
    // Add tab management actions
    createTab: (state, action) => {
      const { threadId, threadName, isMainThread = false } = action.payload;

      // Check if a tab with this threadId already exists
      const existingTabId = state.tabs.allIds.find(
        (tabId) => state.tabs.byId[tabId]?.threadId === threadId,
      );

      // If tab with same threadId exists, switch to it instead of creating a new one
      if (existingTabId) {
        // Deactivate current active tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        // Activate existing tab
        state.tabs.activeTabId = existingTabId;
        state.tabs.byId[existingTabId].isActive = true;
        state.thread.main.current = threadId;
        return;
      }

      // Create new tab only if no tab with this threadId exists
      const tabId = `tab-${state.tabs.nextTabId}`;

      state.tabs.byId[tabId] = {
        id: tabId,
        threadId,
        name: threadName || (isMainThread ? 'Main' : 'New Thread'),
        isMainThread,
        isActive: false,
        createdAt: new Date().toISOString(),
      };

      state.tabs.allIds.push(tabId);
      state.tabs.nextTabId += 1;

      // If this is the first tab or no active tab, make it active
      if (!state.tabs.activeTabId) {
        state.tabs.activeTabId = tabId;
        state.tabs.byId[tabId].isActive = true;
        state.thread.main.current = threadId;
      }
    },
    switchTab: (state, action) => {
      const { tabId } = action.payload;

      if (!state.tabs.byId[tabId]) {
        console.warn(`Tab with id '${tabId}' not found.`);
        return;
      }

      // Deactivate current active tab
      if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
        state.tabs.byId[state.tabs.activeTabId].isActive = false;
      }

      // Activate new tab
      state.tabs.activeTabId = tabId;
      state.tabs.byId[tabId].isActive = true;

      // Update the main thread to match the tab's thread
      state.thread.main.current = state.tabs.byId[tabId].threadId;
    },
    closeTab: (state, action) => {
      const { tabId } = action.payload;

      if (!state.tabs.byId[tabId]) {
        console.warn(`Tab with id '${tabId}' not found.`);
        return;
      }

      const wasActive = state.tabs.byId[tabId].isActive;

      // Remove tab
      delete state.tabs.byId[tabId];
      state.tabs.allIds = state.tabs.allIds.filter((id) => id !== tabId);

      // If this was the active tab, we need to switch to another tab
      if (wasActive) {
        if (state.tabs.allIds.length > 0) {
          // Switch to the last remaining tab
          const newActiveTabId = state.tabs.allIds[state.tabs.allIds.length - 1];
          state.tabs.activeTabId = newActiveTabId;
          state.tabs.byId[newActiveTabId].isActive = true;
          state.thread.main.current = state.tabs.byId[newActiveTabId].threadId;
        } else {
          // No tabs left
          state.tabs.activeTabId = null;
          state.thread.main.current = null;
        }
      }
    },
    updateTab: (state, action) => {
      const { tabId, changes } = action.payload;

      if (!state.tabs.byId[tabId]) {
        console.warn(`Tab with id '${tabId}' not found.`);
        return;
      }

      Object.keys(changes).forEach((key) => {
        state.tabs.byId[tabId][key] = changes[key];
      });
    },
    clearTabs: (state) => {
      state.tabs = {
        byId: {},
        allIds: [],
        activeTabId: null,
        nextTabId: 1,
      };
    },
    loadTabs: (state, action) => {
      const { tabs } = action.payload;
      if (tabs && typeof tabs === 'object') {
        state.tabs = {
          byId: tabs.byId || {},
          allIds: tabs.allIds || [],
          activeTabId: tabs.activeTabId || null,
          nextTabId: tabs.nextTabId || 1,
        };

        // Update current thread to match active tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.thread.main.current = state.tabs.byId[state.tabs.activeTabId].threadId;
        }
      }
    },
    switchToThread: (state, action) => {
      const { threadId, threadName } = action.payload;

      if (!threadId) {
        console.warn('No threadId provided for switchToThread');
        return;
      }

      // Find if there's already a tab for this thread
      const existingTab = Object.values(state.tabs.byId).find((tab) => tab.threadId === threadId);

      if (existingTab) {
        // Switch to existing tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        state.tabs.activeTabId = existingTab.id;
        state.tabs.byId[existingTab.id].isActive = true;
        state.thread.main.current = threadId;
      } else {
        // Create new tab for this thread
        const tabId = `tab-${state.tabs.nextTabId}`;

        // Determine if this is the main thread
        const isMainThread = threadId === state.mainThread;

        state.tabs.byId[tabId] = {
          id: tabId,
          threadId,
          name: threadName || (isMainThread ? 'Main' : 'Thread'),
          isMainThread,
          isActive: false,
          createdAt: new Date().toISOString(),
        };

        state.tabs.allIds.push(tabId);
        state.tabs.nextTabId += 1;

        // Deactivate current tab
        if (state.tabs.activeTabId && state.tabs.byId[state.tabs.activeTabId]) {
          state.tabs.byId[state.tabs.activeTabId].isActive = false;
        }

        // Activate new tab
        state.tabs.activeTabId = tabId;
        state.tabs.byId[tabId].isActive = true;
        state.thread.main.current = threadId;
      }
    },
    // Voice conversation actions
    startVoiceConversation: (state, action) => {
      const { threadId, agentId, elevenlabsId, conversation } = action.payload;
      state.voiceConversations.byThreadId[threadId] = {
        isActive: true,
        agentId,
        elevenlabsId,
        conversation,
        startedAt: new Date().toISOString(),
      };
      state.voiceConversations.isConnecting = false;
    },
    setVoiceConversationConnecting: (state, action) => {
      const { threadId, isConnecting } = action.payload;
      state.voiceConversations.isConnecting = isConnecting;
      if (isConnecting && !state.voiceConversations.byThreadId[threadId]) {
        state.voiceConversations.byThreadId[threadId] = {
          isActive: false,
          agentId: null,
          elevenlabsId: null,
          conversation: null,
        };
      }
    },
    stopVoiceConversation: (state, action) => {
      const { threadId } = action.payload;
      if (state.voiceConversations.byThreadId[threadId]) {
        delete state.voiceConversations.byThreadId[threadId];
      }
      state.voiceConversations.isConnecting = false;
    },
    updateVoiceConversation: (state, action) => {
      const { threadId, updates } = action.payload;
      if (state.voiceConversations.byThreadId[threadId]) {
        Object.assign(state.voiceConversations.byThreadId[threadId], updates);
      }
    },
    // Message Parts reducers
    addMessagePart: (state, action) => {
      const raw = action.payload;
      if (!raw?.id || !raw?.message_id) {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.error('Invalid message part data', raw);
        }
        return;
      }

      const normalized = normalizePart(raw);
      const existing = state.messageParts.byId[normalized.id];

      if (existing) {
        // Upsert behavior: do not duplicate, just merge fields & potentially resort
        const prevOrder = existing.order;
        const prevBlock = existing.block_order;
        const prevMsgId = existing.message_id;

        mergeIntoExistingPart(existing, normalized);

        // If message_id changed (shouldn't, but be safe), move the id
        if (prevMsgId && prevMsgId !== existing.message_id) {
          const prevArr = state.messageParts.byMessageId[prevMsgId];
          if (prevArr) {
            state.messageParts.byMessageId[prevMsgId] = prevArr.filter((id) => id !== existing.id);
          }
          ensureMessageIndex(state, existing.message_id).push(existing.id);
        }

        // Re-sort if order keys changed
        if (prevOrder !== existing.order || prevBlock !== existing.block_order) {
          resortMessageParts(state, existing.message_id);
        }
        return;
      }

      // New part
      state.messageParts.byId[normalized.id] = normalized;
      if (!state.messageParts.allIds.includes(normalized.id)) {
        state.messageParts.allIds.push(normalized.id);
      }

      const arr = ensureMessageIndex(state, normalized.message_id);
      if (!arr.includes(normalized.id)) {
        arr.push(normalized.id);
        resortMessageParts(state, normalized.message_id);
      }
    },

    updateMessagePart: (state, action) => {
      const { id, delta, index, ...updates } = action.payload || {};
      const part = id ? state.messageParts.byId[id] : null;

      if (!part) {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.error('Message part not found for update:', id, 'payload:', action.payload);
        }
        return;
      }

      const partType = part.type || part.part_type || 'text';

      // Streaming text updates with (id, index, delta) - for text and thinking parts
      if (delta !== undefined && (partType === 'text' || partType === 'thinking')) {
        // If index provided, do ordered buffering + dedup
        if (index !== undefined && index >= 0) {
          // Deduplicate by (id, index)
          if (part.receivedIndices[index]) {
            // Duplicate chunk → ignore safely
          } else if (index <= part.lastProcessedIndex) {
            // Late/duplicate chunk behind the cursor → ignore safely
          } else {
            part.receivedIndices[index] = true;
            // Store delta even if empty; presence is what matters
            part.deltaBuffer[index] = (part.deltaBuffer[index] ?? '') + String(delta);

            // Consume as many consecutive chunks as possible
            let next = part.lastProcessedIndex + 1;
            while (Object.prototype.hasOwnProperty.call(part.deltaBuffer, next)) {
              part.text = (part.text || '') + part.deltaBuffer[next];
              delete part.deltaBuffer[next];
              part.lastProcessedIndex = next;
              next += 1;
            }
          }
        } else {
          // No index → fallback to simple append (still idempotent if caller repeats exact same delta only when upstream avoids repeats)
          part.text = (part.text || '') + String(delta);
        }
      }

      // Streaming tool arguments updates with (id, index, delta)
      if (delta !== undefined && partType === 'tool') {
        // If index provided, do ordered buffering + dedup for arguments
        if (index !== undefined && index >= 0) {
          // Deduplicate by (id, index)
          if (part.argumentsReceivedIndices[index]) {
            // Duplicate chunk → ignore safely
          } else if (index <= part.argumentsLastProcessedIndex) {
            // Late/duplicate chunk behind the cursor → ignore safely
          } else {
            part.argumentsReceivedIndices[index] = true;
            // Store delta even if empty; presence is what matters
            part.argumentsDeltaBuffer[index] =
              (part.argumentsDeltaBuffer[index] ?? '') + String(delta);

            // Consume as many consecutive chunks as possible
            let next = part.argumentsLastProcessedIndex + 1;
            while (Object.prototype.hasOwnProperty.call(part.argumentsDeltaBuffer, next)) {
              part.arguments = (part.arguments || '') + part.argumentsDeltaBuffer[next];
              delete part.argumentsDeltaBuffer[next];
              part.argumentsLastProcessedIndex = next;
              next += 1;
            }

            // Try to extract special fields from arguments as they stream
            // Use partial extraction that doesn't require complete JSON
            try {
              const parsed = JSON.parse(part.arguments);
              if (parsed.__act_now) part.act_now = parsed.__act_now;
              if (parsed.__act_done) part.act_done = parsed.__act_done;
              if (parsed.__intent) part.intent = parsed.__intent;
              if (parsed.__use_intent !== undefined) part.use_intent = parsed.__use_intent;
            } catch {
              // If full JSON parse fails, try partial extraction with regex
              const extractPartialField = (fieldName) => {
                const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
                const match = part.arguments.match(regex);
                return match ? match[1] : null;
              };

              const actNow = extractPartialField('__act_now');
              const actDone = extractPartialField('__act_done');
              const intent = extractPartialField('__intent');

              if (actNow) part.act_now = actNow;
              if (actDone) part.act_done = actDone;
              if (intent) part.intent = intent;
            }
          }
        } else {
          // No index → fallback to simple append for arguments
          part.arguments = (part.arguments || '') + String(delta);

          // Try to extract special fields - use partial extraction
          try {
            const parsed = JSON.parse(part.arguments);
            if (parsed.__act_now) part.act_now = parsed.__act_now;
            if (parsed.__act_done) part.act_done = parsed.__act_done;
            if (parsed.__intent) part.intent = parsed.__intent;
            if (parsed.__use_intent !== undefined) part.use_intent = parsed.__use_intent;
          } catch {
            // If full JSON parse fails, try partial extraction with regex
            const extractPartialField = (fieldName) => {
              const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
              const match = part.arguments.match(regex);
              return match ? match[1] : null;
            };

            const actNow = extractPartialField('__act_now');
            const actDone = extractPartialField('__act_done');
            const intent = extractPartialField('__intent');

            if (actNow) part.act_now = actNow;
            if (actDone) part.act_done = actDone;
            if (intent) part.intent = intent;
          }
        }
      }

      // Apply other field updates (including order/block_order/is_done/etc.)
      // Whitelist of allowed update fields to prevent metadata pollution
      const ALLOWED_UPDATE_FIELDS = [
        'order',
        'block_order',
        'type',
        'part_type',
        'text',
        'arguments',
        'is_done',
        'result',
        'error',
        'status',
        'finished_at',
        'input',
        'act_now',
        'act_done',
        'intent',
        'use_intent',
        'task_execution',
        'task_execution_id',
        'created_at',
        'message_id',
      ];

      let needsResort = false;
      const prevOrder = part.order;
      const prevBlock = part.block_order;

      Object.keys(updates).forEach((k) => {
        const v = updates[k];
        if (v === undefined) return;

        // Skip fields that are not in the whitelist (prevents metadata like event_type, name from websocket from polluting the part)
        if (!ALLOWED_UPDATE_FIELDS.includes(k)) {
          if (
            typeof process !== 'undefined' &&
            process.env &&
            process.env.NODE_ENV !== 'production'
          ) {
            console.warn(`Ignoring unexpected update field '${k}' for message part ${id}`);
          }
          return;
        }

        if (k === 'order' || k === 'block_order') {
          part[k] = isFiniteNumber(v) ? v : Number.POSITIVE_INFINITY;
          needsResort = true;
        } else if (k === 'type' || k === 'part_type') {
          part.type = v;
          part.part_type = v;
        } else if (k === 'text' && (partType === 'text' || partType === 'thinking')) {
          // Direct text replacement (rare), allowed for text and thinking parts
          part.text = v ?? '';
        } else if (k === 'arguments' && partType === 'tool') {
          // Direct arguments replacement (when final object is received), allowed
          part.arguments = v ?? '';
        } else {
          part[k] = v;
        }
      });

      // Re-sort if ordering keys changed
      if (needsResort || prevOrder !== part.order || prevBlock !== part.block_order) {
        resortMessageParts(state, part.message_id);
      }
    },

    markMessagePartDone: (state, action) => {
      const payload = action.payload || {};
      const { id } = payload;
      const part = id ? state.messageParts.byId[id] : null;
      if (!part) {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.error('Message part not found for mark done:', id);
        }
        return;
      }

      // Mark as done
      part.is_done = true;

      // Determine part type
      const partType = part.type || part.part_type || 'text';

      // If this is a thinking part, set finished_at and status
      if (partType === 'thinking') {
        if (!part.finished_at) {
          part.finished_at = payload.finished_at || payload.created_at || new Date().toISOString();
        }
        part.status = 'completed';
      }

      // If this is a tool part, apply the execution data from the payload
      if (partType === 'tool') {
        // Update tool part with final execution data
        if (payload.result !== undefined) part.result = payload.result;
        if (payload.error !== undefined) part.error = payload.error;
        if (payload.name) part.name = payload.name;
        if (payload.input !== undefined) part.input = payload.input;
        if (payload.created_at) part.finished_at = payload.created_at;

        // Determine status based on result/error
        if (payload.result && !payload.error) {
          part.status = 'success';
        } else if (payload.error) {
          part.status = 'error';
        }

        // Store execution ID for dialog access
        if (payload.id) {
          part.task_execution_id = payload.id;
        }

        // Extract special fields - prioritize root level of payload, fallback to arguments
        part.act_now = payload.act_now;
        part.act_done = payload.act_done;
        part.intent = payload.intent;
        part.use_intent = payload.use_intent;

        // Also check arguments for special fields if not found at root level
        if (payload.arguments && (!part.act_now || !part.act_done || !part.intent)) {
          try {
            const parsed = typeof payload.arguments === 'string'
              ? JSON.parse(payload.arguments)
              : payload.arguments;
            if (!part.act_now && parsed.__act_now) part.act_now = parsed.__act_now;
            if (!part.act_done && parsed.__act_done) part.act_done = parsed.__act_done;
            if (!part.intent && parsed.__intent) part.intent = parsed.__intent;
            if (part.use_intent === undefined && parsed.__use_intent !== undefined) {
              part.use_intent = parsed.__use_intent;
            }
          } catch {
            // Invalid JSON, skip extraction
          }
        }

        // Create/update execution in state for dialog access
        if (payload.id) {
          const executionData = {
            id: payload.id,
            date_creation: payload.created_at,
            arguments: payload.arguments,
            input: payload.input,
            content: payload.result,
            error: payload.error,
            status: part.status,
            finished_at: payload.created_at,
            tool: {
              id: payload.tool_id,
              name: payload.name,
            },
          };

          // Add to executions state
          state.executions.byId[payload.id] = executionData;
          if (!state.executions.allIds.includes(payload.id)) {
            state.executions.allIds.push(payload.id);
          }
        }

        // Update or create task_execution structure for ToolPartCard compatibility
        if (!part.task_execution) {
          part.task_execution = {};
        }

        // Try to find the execution data from the message's executions if we have tool_id
        let toolInfo = part.task_execution.tool;
        if (payload.tool_id && !toolInfo) {
          // Look for the execution in the state to get tool information
          const execution =
            state.executions.byId[payload.tool_id] ||
            Object.values(state.executions.byId).find((exec) => exec.tool?.id === payload.tool_id);
          if (execution?.tool) {
            toolInfo = execution.tool;
          }
        }

        // Update task_execution with the latest data
        Object.assign(part.task_execution, {
          tool: toolInfo || {
            name: payload.name,
            action_type: {
              connection_type: {
                icon: 'ri:hammer-fill', // fallback icon
              },
            },
          },
          arguments: payload.arguments,
          content: payload.result,
          error: payload.error,
          status: part.status,
          finished_at: payload.created_at,
          input: payload.input,
        });
      }

      // Cleanup streaming helpers (idempotent)
      if (part.deltaBuffer) part.deltaBuffer = Object.create(null);
      if (part.receivedIndices) part.receivedIndices = Object.create(null);
      if (isFiniteNumber(part.lastProcessedIndex))
        part.lastProcessedIndex = part.lastProcessedIndex; // keep as a watermark

      // Cleanup tool arguments streaming helpers
      if (part.argumentsDeltaBuffer) part.argumentsDeltaBuffer = Object.create(null);
      if (part.argumentsReceivedIndices) part.argumentsReceivedIndices = Object.create(null);
      if (isFiniteNumber(part.argumentsLastProcessedIndex))
        part.argumentsLastProcessedIndex = part.argumentsLastProcessedIndex; // keep as a watermark
    },
    deleteMessagePart: (state, action) => {
      const { id } = action.payload;
      if (!id || !state.messageParts.byId[id]) {
        console.error('Message part not found for deletion');
        return;
      }

      const part = state.messageParts.byId[id];
      const messageId = part.message_id;

      // Remove from global collection
      delete state.messageParts.byId[id];
      state.messageParts.allIds = state.messageParts.allIds.filter((partId) => partId !== id);

      // Remove from message association
      if (state.messageParts.byMessageId[messageId]) {
        state.messageParts.byMessageId[messageId] = state.messageParts.byMessageId[
          messageId
        ].filter((partId) => partId !== id);
        if (state.messageParts.byMessageId[messageId].length === 0) {
          delete state.messageParts.byMessageId[messageId];
        }
      }
    },
    clearMessageParts: (state, action) => {
      const { messageId } = action.payload;
      if (!messageId) {
        console.error('Message ID required for clearing parts');
        return;
      }

      // Get all parts for this message
      const messageParts = state.messageParts.byMessageId[messageId] || [];

      // Remove each part from global collection
      messageParts.forEach((partId) => {
        delete state.messageParts.byId[partId];
        state.messageParts.allIds = state.messageParts.allIds.filter((id) => id !== partId);
      });

      // Remove message association
      delete state.messageParts.byMessageId[messageId];
    },
    resetMessagePartStreaming: (state, action) => {
      const { id } = action.payload;
      if (!id || !state.messageParts.byId[id]) {
        console.error('Message part not found for reset');
        return;
      }

      const part = state.messageParts.byId[id];
      const partType = part.type || part.part_type || 'text';

      // Reset streaming state
      if (partType === 'text' || partType === 'thinking') {
        part.text = '';
      } else if (partType === 'tool') {
        part.arguments = '';
      }
      part.is_done = false;

      // Clear streaming buffers
      part.deltaBuffer = Object.create(null);
      part.receivedIndices = Object.create(null);
      part.lastProcessedIndex = -1;

      // Clear tool arguments streaming buffers
      if (partType === 'tool') {
        part.argumentsDeltaBuffer = Object.create(null);
        part.argumentsReceivedIndices = Object.create(null);
        part.argumentsLastProcessedIndex = -1;
      }

      // Clear any existing text buffer (legacy)
      if (part.textBuffer) {
        delete part.textBuffer;
      }
    },
    // Response lifecycle management
    addResponseLifecycle: (state, action) => {
      const { response_id, agent_id, thread_id, event_type, event_data, timestamp } = action.payload;

      if (!state.responseLifecycles.byId[response_id]) {
        // Create new response lifecycle
        state.responseLifecycles.byId[response_id] = {
          response_id,
          agent_id,
          thread_id,
          status: 'submitted',
          events: [],
          created_at: timestamp || new Date().toISOString(),
          updated_at: timestamp || new Date().toISOString(),
        };

        // Add to active responses for thread
        if (!state.responseLifecycles.activeByThread[thread_id]) {
          state.responseLifecycles.activeByThread[thread_id] = [];
        }
        state.responseLifecycles.activeByThread[thread_id].push(response_id);
      }

      const lifecycle = state.responseLifecycles.byId[response_id];

      // Add event to timeline
      lifecycle.events.push({
        type: event_type,
        data: event_data,
        timestamp: timestamp || new Date().toISOString(),
      });

      // Update status based on event
      if (event_type.startsWith('activation.')) {
        lifecycle.status = event_type.replace('activation.', '');
      } else if (event_type.startsWith('response.')) {
        lifecycle.status = event_type.replace('response.', '');

        // Set message_id when response starts
        if (event_type === 'response.started' && event_data.message_id) {
          lifecycle.message_id = event_data.message_id;
        }
      }

      lifecycle.updated_at = timestamp || new Date().toISOString();
    },

    completeResponseLifecycle: (state, action) => {
      const { response_id, thread_id } = action.payload;

      // Remove from active responses
      if (state.responseLifecycles.activeByThread[thread_id]) {
        state.responseLifecycles.activeByThread[thread_id] =
          state.responseLifecycles.activeByThread[thread_id].filter((id) => id !== response_id);

        // Clean up empty arrays
        if (state.responseLifecycles.activeByThread[thread_id].length === 0) {
          delete state.responseLifecycles.activeByThread[thread_id];
        }
      }

      // Keep completed responses for a while (they'll be cleaned up later)
      if (state.responseLifecycles.byId[response_id]) {
        state.responseLifecycles.byId[response_id].completed_at = new Date().toISOString();
      }
    },

    cleanupResponseLifecycles: (state, action) => {
      const { olderThan = 300000 } = action.payload || {}; // 5 minutes default
      const cutoff = Date.now() - olderThan;

      Object.keys(state.responseLifecycles.byId).forEach((response_id) => {
        const lifecycle = state.responseLifecycles.byId[response_id];
        if (lifecycle.completed_at) {
          const completedTime = new Date(lifecycle.completed_at).getTime();
          if (completedTime < cutoff) {
            delete state.responseLifecycles.byId[response_id];
          }
        }
      });
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startRealtime,
  stopRealtime,
  setDrawerOpen,
  setDrawerOpenJob,
  toggleDrawer,
  toggleDrawerJob,
  setMyMember,
  setRoom,
  addEvent,
  addMessages,
  addMessage,
  removeMessage,
  addMessageDelta,
  addMessageAttachment,
  setMessageError,
  addMessageReaction,
  addThread,
  removeThread,
  setThreadMain,
  setThreadDrawer,
  setThreadRespond,
  changeThreadReadState,
  threadUpdate,
  addMember,
  roomMemberUpdate,
  roomUpdate,
  clearUploadState,
  addMessageExecution,
  updateMessageExecution,
  setContextMenu,
  addRunningResponse,
  deleteRunningResponse,
  clearState: clearRoomState,
  updateMessageContent,
  updateMessageStreamingState,
  addAuthorizationRequest,
  updateAuthorizationRequest,
  setAuthorizationRequests,
  setPublicRooms,
  setUserRooms,
  setUserRoomsLoadingMore,
  // Add search actions
  setSearchRoomsQuery,
  setSearchRoomsLoading,
  setSearchRoomsResults,
  // Add tab management actions
  createTab,
  switchTab,
  closeTab,
  updateTab,
  clearTabs,
  loadTabs,
  switchToThread,
  // Voice conversation actions
  startVoiceConversation,
  setVoiceConversationConnecting,
  stopVoiceConversation,
  updateVoiceConversation,
  // Message parts actions
  addMessagePart,
  updateMessagePart,
  markMessagePartDone,
  deleteMessagePart,
  clearMessageParts,
  resetMessagePartStreaming,
  // Response lifecycle actions
  addResponseLifecycle,
  completeResponseLifecycle,
  cleanupResponseLifecycles,
} = slice.actions;

// SELECTORS

export const selectRoomState = (state) => state.room;

export const selectRoomStateInitialized = (attribute) =>
  createSelector([selectRoomState], (roomState) => roomState.initialized[attribute]);

export const selectRoomStateLoading = (attribute) =>
  createSelector([selectRoomState], (roomState) => roomState.loading[attribute]);

export const selectRoom = (state) => selectRoomState(state).room;

export const selectRoomId = (state) => selectRoom(state)?.id;

export const selectRoomAttribute = (attribute) =>
  createSelector([selectRoom], (room) => getNestedProperty(room, attribute));

export const selectMainThread = (state) => selectRoomState(state).mainThread;

export const selectRoomThreadMain = (state) => selectRoomState(state).thread.main;

export const selectMe = (state) => selectRoomState(state).me;

export const selectRealtime = (state) => selectRoomState(state)?.isRealtimeCall;

export const selectContextMenu = (state) => selectRoomState(state).contextMenu;

export const selectMembers = (state) => selectRoomState(state).members;

export const selectTotalMembers = createSelector(
  [selectMembers],
  (members) => members.allIds.length || 1,
);

export const selectThreads = (state) => selectRoomState(state).threads;

export const selectAuthorizationRequests = (state) =>
  selectRoomState(state).authorization_requests.filter((request) => !request.is_completed);

export const selectUserRooms = (state) => selectRoomState(state).userRooms;

export const selectUserRoomsPagination = (state) => selectRoomState(state).userRoomsPagination;

// Add search selectors
export const selectSearchRooms = (state) => selectRoomState(state).searchRooms;
export const selectSearchRoomsQuery = (state) => selectSearchRooms(state).query;
export const selectSearchRoomsResults = (state) => selectSearchRooms(state).results;
export const selectSearchRoomsLoading = (state) => selectSearchRooms(state).isSearching;
export const selectSearchRoomsHasResults = (state) => selectSearchRooms(state).hasResults;

export const selectThreadsById = (state) => selectThreads(state).byId;

export const selectAccount = (state) => selectRoomState(state).account;

export const selectAccountId = (state) => selectRoomState(state).account?.id;

export const selectMessagesById = (state) => selectRoomState(state)?.messages?.byId;

export const selectMessagesIds = (state) => selectRoomState(state)?.messages?.allIds;

export const selectThreadsIds = (state) => selectRoomState(state)?.threads?.allIds;

const selectMessagesContent = (state) => selectRoomState(state).messagesContent;

export const selectMessagesExecutions = (state) => selectRoomState(state).messagesExecutions;

export const selectExecutionsById = (state) => selectRoomState(state).executions.byId;

export const selectThreadDrawerDetails = (state) => selectRoomState(state).thread.drawer;

export const selectRunningResponses = (state) => selectRoomState(state).runningResponses;

export const selectCurrentThread = createSelector(
  [selectRoomThreadMain, selectThreadsById],
  (threadMain, threads) => threads[threadMain.current],
);

export const selectCurrentDrawerThreadId = (state) => {
  const drawer = selectThreadDrawerDetails(state);
  return !!drawer.current && !drawer.messageId && !drawer.isCreation ? drawer.current : null;
};

export const selectCurrentDrawerThread = createSelector(
  [selectThreadsById, selectCurrentDrawerThreadId],
  (threads, threadId) => (!threadId ? null : threads[threadId]),
);

export const makeSelectHasMessageCreatedParentThreads = () =>
  createSelector(
    [selectThreadsById, (state, messageId) => messageId],
    (threads, messageId) =>
      !!(
        !!messageId &&
        Object.values(threads).filter((t) => t.starter_message_id === messageId).length
      ),
  );

export const selectDisplayThreadsDrawer = createSelector(
  [selectThreadDrawerDetails],
  (drawer) => !!drawer.display && (!!drawer.current || !!drawer.isCreation),
);

export const selectCurrentDrawerThreadName = createSelector(
  [selectCurrentDrawerThread],
  (currentDrawerThread) => currentDrawerThread?.name,
);

// export const makeSelectThread = () => {
//   const selectItemsByCategory = createSelector(
//     [state => state.items, (state, category) => category],
//     (items, category) => items.filter(item => item.category === category)
//   )
//   return selectItemsByCategory
// }

export const selectRoomAccountId = (state) => selectRoomState(state).account?.id;

export const makeSelectThread = () =>
  createSelector([selectThreadsById, (state, threadId) => threadId], (threadsById, threadId) =>
    !threadId ? null : threadsById?.[threadId],
  );

export const makeSelectMoreMessages = () =>
  createSelector([makeSelectThread()], (thread) => !!thread?.messages?.paginationInfo?.hasNextPage);

export const makeSelectMessageRunning = () =>
  createSelector(
    [selectRunningResponses, (state, messageId) => messageId],
    (runningResponses, messageId) => !!(messageId && runningResponses?.[messageId]),
  );

export const makeSelectMessage = () =>
  createSelector(
    [selectMessagesById, (state, messageId) => messageId],
    (messagesById, messageId) => !!messageId && messagesById?.[messageId],
  );

// Message Parts selectors (moved up to be defined before use)
export const selectMessageParts = (state) => selectRoomState(state).messageParts;

export const selectMessagePartsById = (state) => selectMessageParts(state).byId;

export const selectMessagePartsAllIds = (state) => selectMessageParts(state).allIds;

export const selectMessagePartsByMessageId = (state) => selectMessageParts(state).byMessageId;

export const makeSelectMessageContent = () =>
  createSelector(
    [
      selectMessagesContent,
      selectMessagePartsById,
      selectMessagePartsByMessageId,
      (state, messageId) => messageId,
    ],
    (messagesContent, partsById, partsByMessageId, messageId) => {
      // First check if we have message parts for this message
      const messageParts = partsByMessageId[messageId];
      if (messageParts && messageParts.length > 0) {
        // Use message parts to construct content
        return messageParts
          .map((partId) => partsById[partId])
          .filter((part) => part && part.part_type === 'text')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((part) => part.text || '')
          .join('');
      }

      // Fallback to legacy message content
      return messagesContent[messageId] || '';
    },
  );

export const makeSelectHasMessageContent = () =>
  createSelector([makeSelectMessageContent()], (content) => !!content?.length);

export const makeSelectMessageExecutions = () =>
  createSelector(
    [selectMessagesExecutions, (state, messageId) => messageId],
    (messagesExecutions, messageId) => messagesExecutions[messageId] || [],
  );

export const makeSelectExecution = () =>
  createSelector(
    [selectExecutionsById, (state, executionId) => executionId],
    (executionsById, executionId) => executionsById[executionId],
  );

export const makeSelectMessageMedia = () =>
  createSelector([makeSelectMessage()], (message) => message?.media?.items);

export const makeSelectHasMessageMedia = () =>
  createSelector([makeSelectMessageMedia()], (media) => media?.length);

export const makeSelectMessageReactions = () =>
  createSelector([makeSelectMessage()], (message) => message?.reactions?.items);

// Selector to get like/dislike reactions for a message
export const makeSelectMessageLikeDislikeReactions = () =>
  createSelector([makeSelectMessage()], (message) => {
    const reactions = message?.reactions?.items || [];
    return reactions.filter(
      (reaction) => reaction.reaction_type === 'like' || reaction.reaction_type === 'dislike',
    );
  });

// Selector to check if current user has liked a message
export const makeSelectMessageUserLiked = () =>
  createSelector([makeSelectMessage(), selectMe], (message, me) => {
    const reactions = message?.reactions?.items || [];
    const memberId = me?.id; // Use me.id, not me.member.id
    return reactions.some(
      (reaction) => reaction.reaction_type === 'like' && reaction.member_id === memberId,
    );
  });

// Selector to check if current user has disliked a message
export const makeSelectMessageUserDisliked = () =>
  createSelector([makeSelectMessage(), selectMe], (message, me) => {
    const reactions = message?.reactions?.items || [];
    const memberId = me?.id; // Use me.id, not me.member.id
    return reactions.some(
      (reaction) => reaction.reaction_type === 'dislike' && reaction.member_id === memberId,
    );
  });

const selectMessagesCreation = createSelector(
  [selectMessagesById],
  (messages) =>
    Object.entries(messages).reduce((acc, [id, message]) => {
      acc[id] = message.date_creation;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const selectMessagesThreadIds = createSelector(
  [selectMessagesById],
  (messages) =>
    Object.entries(messages).reduce((acc, [id, message]) => {
      acc[id] = message.thread_id;
      return acc;
    }, {}),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectMessagesIdsByThread = createSelector(
  [selectMessagesIds, selectMessagesThreadIds],
  (allMessageIds, threadByMessageId) => {
    const messagesIdsByThread = {};

    allMessageIds.forEach((msgId) => {
      const tId = threadByMessageId[msgId];
      if (!tId) return;
      if (!messagesIdsByThread[tId]) {
        messagesIdsByThread[tId] = [];
      }
      messagesIdsByThread[tId].push(msgId);
    });

    return messagesIdsByThread;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const makeSelectSortedThreadMessageIds = () =>
  createSelector(
    [
      selectThreadsById,
      selectMessagesIdsByThread, // memoized: threadId -> [msgId, msgId, ...]
      selectMessagesById,
      (_state, threadId) => threadId,
    ],
    (threadsById, msgsIdsByThread, messagesById, threadId) => {
      const thread = threadId ? threadsById[threadId] : null;
      if (!thread) return [];

      // Start with the parent if it exists
      const allMessageIds = thread.parent?.id ? [thread.parent.id] : [];

      // Append this thread's actual messages
      const threadMessagesIds = msgsIdsByThread[threadId] || [];
      if (threadMessagesIds.length === 0) {
        return allMessageIds;
      }

      // Sort based on message creation, or any other property
      const sorted = [...threadMessagesIds].sort((a, b) => {
        const dateA = new Date(messagesById[a]?.date_creation ?? 0);
        const dateB = new Date(messagesById[b]?.date_creation ?? 0);
        return dateA - dateB;
      });

      return [...allMessageIds, ...sorted];
    },
    {
      memoizeOptions: {
        // Compare arrays in a shallow or custom manner
        // for better memoization. For example:
        resultEqualityCheck: checkArraysEqualsProperties(),
      },
    },
  );

export const makeSelectLastMessageOfThread = () =>
  createSelector(
    [makeSelectSortedThreadMessageIds(), selectMessagesById],
    (sortedMessages, messagesById) =>
      sortedMessages.length > 0 ? messagesById[sortedMessages[sortedMessages.length - 1]] : null,
    {
      memoizeOptions: {
        // Because we return a single object (the last message),
        // and we want to only recompute if the date_creation changes:
        resultEqualityCheck: (prev, next) => prev?.date_creation === next?.date_creation,
      },
    },
  );

export const selectRoomThreadsIds = createSelector(
  [
    selectThreadsIds, // e.g. (state) => state.threads.allIds
    selectThreadsById, // e.g. (state) => state.threads.byId
    selectMessagesIdsByThread, // step #1 above
    selectMessagesById, // e.g. (state) => state.messages.byId
  ],
  (threadsIds, threadsById, msgsIdsByThread, messagesById) => {
    if (!threadsIds?.length) return [];

    // Create an array of { threadId, lastDate } so we can sort by lastDate
    const threadsWithLastDate = threadsIds.map((threadId) => {
      let lastDate = 0;
      // if there's a "parent" on the thread, consider that as well
      const parentId = threadsById[threadId]?.parent?.id;
      if (parentId) {
        const parentDate = new Date(messagesById[parentId]?.date_creation || 0).getTime();
        lastDate = Math.max(lastDate, parentDate);
      }

      // Then compute the max creation date among the thread's messages
      const messageIds = msgsIdsByThread[threadId] || [];
      for (const msgId of messageIds) {
        const msgDate = new Date(messagesById[msgId]?.date_creation || 0).getTime();
        if (msgDate > lastDate) {
          lastDate = msgDate;
        }
      }

      return { threadId, lastDate };
    });

    // Sort in descending order of lastDate (most recent first)
    threadsWithLastDate.sort((a, b) => b.lastDate - a.lastDate);

    // Return just the thread IDs in the desired order
    return threadsWithLastDate.map((item) => item.threadId);
  },
  {
    memoizeOptions: {
      // If you already have a custom array equality check, use it here
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

export const MENTION_ANNOTATION_REGEX = /\**\[@([\w\s]+)\]\(\/member\/[a-f0-9\-]+\)\**/g;

export const selectNewThreadPlaceholder = (state) => {
  const drawer = selectThreadDrawerDetails(state);
  return !!drawer.messageId
    ? truncate(
        selectMessagesById(state)[drawer.messageId]?.text?.replace(
          MENTION_ANNOTATION_REGEX,
          '@$1',
        ) || 'Thread',
        { length: 40 },
      )
    : '#CoolThread';
};

export const makeHasUnreadMessages = () =>
  createCachedSelector(
    selectThreadsById,
    selectMessagesIds,
    selectMessagesThreadIds,
    selectMe,
    selectMessagesCreation,
    (state, threadId) => threadId,
    (threads, messagesIds, messagesThreadIds, me, messagesById, threadId) => {
      if (!threadId || !me) {
        return false;
      }
      const thread = threads[threadId];

      const checkForUnreadMessages = (thread) => {
        const currentThreadId = thread?.id;
        if (!currentThreadId) {
          return false;
        }
        const messages =
          messagesIds?.filter(
            (id) => id in messagesThreadIds && messagesThreadIds[id] === currentThreadId,
          ) ?? [];
        if (!messages.length) {
          return false;
        }

        const threadReadState = thread.read_state?.[me.id];
        if (!threadReadState) {
          return true; // If no read state, there are unread messages
        }

        // Check if any local messages are unread
        if (messages.some((mId) => messagesById[mId] > threadReadState)) {
          return true;
        }

        // Check for unread messages in child threads
        return Object.values(threads)
          .filter((t) => t.parent?.thread_id === thread.id)
          .some((childThread) => checkForUnreadMessages(childThread));
      };

      return checkForUnreadMessages(thread);
    },
  )((state, threadId) => threadId);

export const makeSelectThreadName = () =>
  createSelector([makeSelectThread()], (thread) => {
    if (!thread) {
      return 'Main'; // Default to 'Main' instead of 'Unknown' when thread doesn't exist
    }
    if (thread.is_main) {
      return 'Main';
    }
    // For non-main threads, use the thread name or default to 'Thread'
    return thread.name?.replace(MENTION_ANNOTATION_REGEX, '@$1') || 'Thread';
  });

export const makeSelectThreadAttribute = () =>
  createSelector(
    [makeSelectThread(), (state, threadId, attribute) => attribute],
    (thread, attribute) => thread?.[attribute],
  );

export const makeSelectThreadMessageCount = () =>
  createSelector(
    [selectMessagesIdsByThread, (state, threadId) => threadId],
    (messagesIdsByThread, threadId) => {
      if (!threadId || !messagesIdsByThread[threadId]) {
        return 0;
      }
      return messagesIdsByThread[threadId].length;
    },
  );

// Add tab selectors
export const selectTabs = (state) => selectRoomState(state).tabs;

export const selectTabsById = (state) => selectTabs(state).byId;

export const selectTabsAllIds = (state) => selectTabs(state).allIds;

export const selectActiveTabId = (state) => selectTabs(state).activeTabId;

export const selectActiveTab = createSelector(
  [selectTabsById, selectActiveTabId],
  (tabsById, activeTabId) => (activeTabId ? tabsById[activeTabId] : null),
);

export const selectTabsCount = createSelector([selectTabsAllIds], (allIds) => allIds.length);

export const selectTabsArray = createSelector(
  [selectTabsById, selectTabsAllIds],
  (tabsById, allIds) => allIds.map((id) => tabsById[id]),
);

export const makeSelectTabById = () =>
  createSelector([selectTabsById, (state, tabId) => tabId], (tabsById, tabId) => tabsById[tabId]);

// Voice conversation selectors
export const selectVoiceConversations = (state) => selectRoomState(state).voiceConversations;

export const selectVoiceConversationByThreadId = (threadId) =>
  createSelector(
    [selectVoiceConversations],
    (voiceConversations) => voiceConversations.byThreadId[threadId] || null,
  );

export const selectIsVoiceActive = (threadId) =>
  createSelector(
    [selectVoiceConversations],
    (voiceConversations) => !!voiceConversations.byThreadId[threadId]?.isActive,
  );

export const selectIsVoiceConnecting = (state) => selectVoiceConversations(state).isConnecting;

// Message Parts selectors (definitions moved up earlier)

export const makeSelectMessageParts = () =>
  createSelector(
    [selectMessagePartsByMessageId, (state, messageId) => messageId],
    (partsByMessageId, messageId) => partsByMessageId[messageId] || [],
  );

export const makeSelectMessagePartById = () =>
  createSelector(
    [selectMessagePartsById, (state, partId) => partId],
    (partsById, partId) => partsById[partId] || null,
  );

export const makeSelectMessagePartsContent = () =>
  createSelector([selectMessagePartsById, makeSelectMessageParts()], (partsById, partIds) => {
    return partIds
      .map((partId) => partsById[partId])
      .filter((part) => part && (part.type === 'text' || part.part_type === 'text'))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((part) => part.text || '')
      .join('');
  });

export const makeSelectMessagePartsOfType = (partType) =>
  createSelector([selectMessagePartsById, makeSelectMessageParts()], (partsById, partIds) => {
    return partIds
      .map((partId) => partsById[partId])
      .filter((part) => part && (part.type === partType || part.part_type === partType))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  });

// Helper selector to get all parts for a message organized by type
export const makeSelectMessagePartsGrouped = () =>
  createSelector([selectMessagePartsById, makeSelectMessageParts()], (partsById, partIds) => {
    const parts = partIds
      .map((partId) => partsById[partId])
      .filter((part) => part)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return parts.reduce((acc, part) => {
      const partType = part.type || part.part_type || 'text';
      if (!acc[partType]) {
        acc[partType] = [];
      }
      acc[partType].push(part);
      return acc;
    }, {});
  });

// Helper to check if a message has any streaming parts
export const makeSelectMessageHasStreamingParts = () =>
  createSelector([selectMessagePartsById, makeSelectMessageParts()], (partsById, partIds) => {
    return partIds.some((partId) => {
      const part = partsById[partId];
      return part && !part.is_done;
    });
  });

// Response lifecycle selectors
export const selectResponseLifecycles = (state) => selectRoomState(state).responseLifecycles;

export const selectActiveResponsesByThread = (threadId) =>
  createSelector(
    [selectResponseLifecycles, selectMembers],
    (lifecycles, members) => {
      const activeResponseIds = lifecycles.activeByThread[threadId] || [];
      return activeResponseIds
        .map((responseId) => {
          const lifecycle = lifecycles.byId[responseId];
          if (!lifecycle) return null;

          // Get agent details
          const agent = Object.values(members.byId || {}).find(
            (member) => member.member?.id === lifecycle.agent_id,
          );

          return {
            ...lifecycle,
            agent: agent
              ? {
                  id: agent.member.id,
                  name: agent.member?.name || 'Agent',
                  avatar: agent.member?.picture,
                  member_type: agent.member?.member_type,
                }
              : null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },
  );

export const selectResponseLifecycleById = (responseId) =>
  createSelector(
    [selectResponseLifecycles],
    (lifecycles) => lifecycles.byId[responseId] || null,
  );

// ACTIONS

export const fetchPublicRooms = () => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading('publicRooms'));
    const response = await optimai_room.get('/');
    const rooms = response.data;
    dispatch(slice.actions.setPublicRooms(rooms));
    return rooms;
  } catch (e) {
    console.error('error fetching room', e);
    return Promise.reject(e);
  }
};

export const fetchUserRooms = () => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoading('userRooms'));
    const response = await optimai_room.get('/');
    const { rooms, has_next_page, next_cursor } = response.data;
    dispatch(
      slice.actions.setUserRooms({
        rooms,
        hasNextPage: has_next_page,
        nextCursor: next_cursor,
        isLoadMore: false,
      }),
    );
    return rooms;
  } catch (e) {
    console.error('error fetching user rooms', e);
    return Promise.reject(e);
  }
};

export const fetchMoreUserRooms = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const pagination = selectUserRoomsPagination(state);

    if (!pagination.hasNextPage || pagination.isLoadingMore) {
      return;
    }

    dispatch(slice.actions.setUserRoomsLoadingMore(true));
    const response = await optimai_room.get(`/?cursor=${pagination.nextCursor}`);
    const { rooms, has_next_page, next_cursor } = response.data;
    dispatch(
      slice.actions.setUserRooms({
        rooms,
        hasNextPage: has_next_page,
        nextCursor: next_cursor,
        isLoadMore: true,
      }),
    );
    return rooms;
  } catch (e) {
    console.error('error fetching more user rooms', e);
    dispatch(slice.actions.setUserRoomsLoadingMore(false));
    return Promise.reject(e);
  }
};

export const searchUserRooms = (query) => async (dispatch) => {
  try {
    if (!query?.trim()) {
      dispatch(slice.actions.setSearchRoomsQuery(''));
      return;
    }

    dispatch(slice.actions.setSearchRoomsQuery(query));
    dispatch(slice.actions.setSearchRoomsLoading(true));
    const response = await optimai_room.get(`/?name=${encodeURIComponent(query)}&limit=50`);
    const { rooms } = response.data;
    dispatch(slice.actions.setSearchRoomsResults(rooms || []));
    return rooms;
  } catch (e) {
    console.error('error searching user rooms', e);
    dispatch(slice.actions.setSearchRoomsLoading(false));
    return Promise.reject(e);
  }
};

// Fetch authorization requests from the API
export const fetchAuthorizationRequests =
  (roomId = null) =>
  async (dispatch) => {
    try {
      const params = new URLSearchParams();
      if (roomId) {
        params.append('room_id', roomId);
      }
      params.append('is_completed', 'false');

      const response = await optimai_integration.get(`/authorization-request?${params.toString()}`);

      if (response.status === 200 && response.data?.authorization_requests) {
        dispatch(setAuthorizationRequests(response.data.authorization_requests));
      }
    } catch (error) {
      console.error('Failed to fetch authorization requests:', error);
    }
  };

export const fetchRoom =
  ({ roomId, user, guest }) =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoading('room'));
      const response = await optimai_room.post(`/${roomId}`, ROOM_GENERAL_GQ);
      const room = response.data;
      dispatch(slice.actions.setRoom({ room, guest, user }));

      // Fetch authorization requests for this room
      dispatch(fetchAuthorizationRequests(roomId));
      return room;
    } catch (e) {
      console.error('error fetching room', e);
      return Promise.reject(e);
    }
  };

export const connectAgentDM =
  ({ agentId }) =>
  async () => {
    try {
      const response = await optimai.get(`/agent/${agentId}/dm`);
      const { id } = response.data;
      // dispatch(slice.actions.fetchRoom(id))
      return Promise.resolve(id);
    } catch (e) {
      console.error('error fetching room', e);
      return Promise.reject(e);
    }
  };

export const fetchRoomParent = () => async (dispatch, getState) => {
  try {
    const roomId = selectRoomId(getState());
    dispatch(slice.actions.setLoading('mainThread'));
    const response = await optimai_room.post(`/${roomId}`, ROOM_PARENT_THREAD_GQ);
    const room = response.data;
    dispatch(slice.actions.setParentThread(room.threads.items[0]));
    return Promise.resolve('success');
  } catch (e) {
    console.error('error fetching room', e);
    return Promise.reject(e);
  }
};

const THREADS_STATUSES = ['running', 'blocked', 'dead', 'fenix'];

const fetchAllThreadsCursor = async (roomId, dispatch, cursor = null, statusIndex = 0) => {
  const threadStatus = THREADS_STATUSES[statusIndex];
  let i = statusIndex;
  const response = await optimai_room.post(`/${roomId}`, ROOM_ALL_THREADS_GQ(cursor, threadStatus));
  const { threads } = response.data;
  if (threads?.items) {
    threads.items = threads.items.map(handleThread);
  }
  const newCursor = threads.next_cursor;
  delete threads.next_cursor;
  dispatch(
    slice.actions.setMergeThreadBatch({
      cursor: newCursor,
      threads: paginateCollection(threads),
    }),
  );
  // dispatch(slice.actions.setThreads({ threads: room.threads }));
  if (!newCursor) {
    i += 1;
  }
  if (!!newCursor || i < 3) {
    fetchAllThreadsCursor(roomId, dispatch, newCursor, i);
  }
};

export const fetchRoomAllThreads = () => async (dispatch, getState) => {
  const roomId = selectRoomId(getState());
  try {
    dispatch(slice.actions.setLoading('allThreads'));
    fetchAllThreadsCursor(roomId, dispatch);
    return Promise.resolve('success');
  } catch (e) {
    console.error('error fetching room', e);
    return Promise.reject(e.message);
  }
};

export const fetchThread =
  ({ threadId }) =>
  async (dispatch, getState) => {
    try {
      const { threads } = getState().room;
      if (!!threads?.byId[threadId]) {
        return Promise.resolve('Thread already loaded.');
      }
      const response = await optimai_room.post(`/thread/${threadId}/gq`, THREAD_GENERAL_GQ());
      const thread = response.data;
      dispatch(slice.actions.addThread(thread));
      return Promise.resolve('success');
    } catch (e) {
      // console.error('error fetching thread', e);
      return Promise.reject(e.message);
    }
  };

export const fetchThreadResource =
  ({ resource, threadId }) =>
  async (dispatch, getState) => {
    try {
      const thread = !threadId ? null : selectThreadsById(getState())[threadId];
      if (!thread || !thread[resource]) {
        console.error(`Thread or resource '${resource}' not found`);
        return Promise.reject(`Thread or resource '${resource}' not found`);
      }

      const paginationInfo = thread[resource].paginationInfo;
      if (!paginationInfo.hasNextPage || !paginationInfo.cursor) {
        console.warn(`Thread ${resource} have no page to query.`);
        return;
      }

      const resourceToGQSpec = {
        messages: THREAD_MESSAGES_GQ,
        // events: THREAD_EVENTS_GQ,
        // media: THREAD_MEDIA_GQ
      };

      const gqSpec = resourceToGQSpec[resource];
      if (!gqSpec) {
        console.warn(`Thread ${resource} have no GQ specification available.`);
        return;
      }

      const response = await optimai_room.post(
        `/thread/${threadId}/gq`,
        gqSpec(paginationInfo.cursor),
      );
      const updatedThreadData = response.data;

      if (!updatedThreadData[resource]) {
        console.error(`Resource '${resource}' not found in the response`);
        return Promise.reject(`Resource '${resource}' not found in the response`);
      }

      // Map resource to the corresponding action
      const resourceToActionMap = {
        messages: 'addMessages',
        events: 'addEvents',
        media: 'addMedia',
      };

      const actionType = resourceToActionMap[resource];
      if (!actionType) {
        // console.error(`Invalid resource type: ${resource}`);
        return Promise.reject(`Invalid resource type: ${resource}`);
      }

      // Dispatch the corresponding action
      dispatch(
        slice.actions[actionType]({
          id: threadId,
          [resource]: updatedThreadData[resource],
        }),
      );

      return Promise.resolve('success');
    } catch (e) {
      // console.error('Error fetching thread resource', e);
      return Promise.reject(e.message);
    }
  };

export const createMedia =
  ({ fileName, fileContent, fileType }) =>
  async (dispatch, getState) => {
    try {
      const { room } = getState().room;
      const response = await optimai_room.post(`/${room.id}/media`, {
        file_name: fileName,
        mime_type: fileType,
        file_content: fileContent,
      });
      const { media_url } = response.data;
      return media_url;
    } catch (e) {
      console.error(`error: could not post media: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const patchMember =
  ({ action, body }) =>
  async (_, getState) => {
    try {
      const { room } = getState().room;
      await optimai_room.patch(`/${room.id}/member/${action}`, body);
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could not patch member: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const readThread =
  ({ threadId }) =>
  async () => {
    try {
      const timestamp = getTimestamp();
      await optimai_room.patch(`/thread/${threadId}/read`, { timestamp });
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could not patch member: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const changeThreadStatus =
  ({ threadId, status }) =>
  async () => {
    try {
      const statusToActionMap = {
        dead: 'close',
        running: 'revive',
        blocked: 'block',
      };
      const action = statusToActionMap[status];
      await optimai_room.patch(`/thread/${threadId}/status/${action}`);
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error changing thread status: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const patchThread =
  ({ threadId, name, description, status }) =>
  async () => {
    try {
      const payload = {};
      if (name !== undefined) payload.name = name;
      if (description !== undefined) payload.description = description;
      if (status !== undefined) payload.status = status;

      await optimai_room.patch(`/thread/${threadId}`, payload);
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error patching thread: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const archiveMainThread =
  ({ threadId }) =>
  async (dispatch) => {
    try {
      await optimai_room.post(`/thread/${threadId}/archive-main`, {});
      dispatch(slice.actions.setMessagesIds([]));
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error refreshing conversation: ${e.message}`);
      return Promise.reject(e);
    }
  };

export const sendMessage =
  ({ content, attachments, threadId }) =>
  async (dispatch, getState) => {
    try {
      const state = getState();
      const {
        thread: { respond },
      } = state.room;

      // Check if we're in an interface project and switch to dev mode if needed
      const currentUrl = window.location.pathname;
      const isInProjectRoute = currentUrl.includes('/project/');

      if (isInProjectRoute) {
        dispatch(setPreviewMode('development'));
      }

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(slice.actions.updateMediaProgress({ threadId, percentCompleted }));
        },
      };

      if (attachments?.length > 0) {
        dispatch(slice.actions.setIsUploading({ threadId, messageId: null }));
      }

      const response = await optimai_room.post(
        `/thread/${threadId}/message`,
        { content, attachments, replied_id: respond[threadId] },
        config,
      );

      // Don't play sound if voice is active for this thread
      const isVoiceActiveForThread =
        !!state.room.voiceConversations?.byThreadId?.[threadId]?.isActive;
      if (!isVoiceActiveForThread) {
        SOUND_OUT.play();
      }
      if (respond && respond[threadId]) {
        dispatch(slice.actions.setThreadRespond({ threadId, messageId: null }));
      }

      // Track message sent event
      try {
        const trackingProperties = {
          has_attachments: !!(attachments?.length > 0),
          attachment_count: attachments?.length || 0,
          content_length: content?.length || 0,
          is_reply: !!(respond && respond[threadId]),
        };

        // Extract project ID from URL (/project/{project-id}/c/{conversation-id})
        const urlParts = window.location.pathname.split('/');
        const projectIndex = urlParts.indexOf('project');
        if (projectIndex !== -1 && urlParts[projectIndex + 1]) {
          trackingProperties.project_id = urlParts[projectIndex + 1];
        }

        analytics.messageSent(threadId, trackingProperties);
      } catch (trackingError) {
        console.warn('Failed to track message sent event:', trackingError);
      }

      return response.data;
    } catch (e) {
      console.error('Failed to send message:', e);
      return Promise.reject(e.message);
    }
  };

export const sendAgentMessage =
  ({ content, attachments, threadId, agentId }) =>
  async (dispatch, getState) => {
    try {
      const {
        thread: { respond },
      } = getState().room;
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(slice.actions.updateMediaProgress({ threadId, percentCompleted }));
        },
      };
      if (attachments?.length > 0) {
        dispatch(slice.actions.setIsUploading({ threadId, messageId: null }));
      }

      const response = await optimai_room.post(
        `/thread/${threadId}/agents/message?agent_id=${agentId}`,
        { content, attachments, replied_id: respond[threadId] },
        config,
      );

      // Don't play sound if voice is active for this thread
      const state = getState();
      const isVoiceActiveForThread = !!state.room.voiceConversations.byThreadId[threadId]?.isActive;
      if (!isVoiceActiveForThread) {
        SOUND_OUT.play();
      }
      if (!!respond) {
        dispatch(slice.actions.setThreadRespond({ threadId, messageId: null }));
      }
      return response.data;
    } catch (e) {
      console.error('Failed to send message:', e);
      return Promise.reject(e.message);
    }
  };

export const createThread =
  ({ content, attachments }) =>
  async (dispatch, getState) => {
    try {
      const {
        room,
        thread: { drawer },
      } = getState().room;
      if (!drawer.isCreation) {
        throw new Error('Invalid drawer creation mode.');
      }
      const response = await optimai_room.post(
        !drawer.messageId ? `/${room.id}/thread` : `/message/${drawer.messageId}/thread`,
        { name: drawer?.threadName || content },
      );
      const { thread } = response.data;

      // Check if tabs are enabled
      // const state = getState();
      // const tabsEnabled = state.room.tabs.allIds.length > 0;

      // if (tabsEnabled) {
      //   // Create a tab for the new thread and switch to it
      //   dispatch(
      //     switchToThread({
      //       threadId: thread.id,
      //       threadName: thread.name || drawer?.threadName || 'New Thread',
      //     }),
      //   );
      // } else {
      //   // Fallback to traditional drawer system
      //   dispatch(
      //     slice.actions.setThreadDrawer({
      //       current: thread.id,
      //       threadName: null,
      //       isCreation: false,
      //       messageId: null,
      //     }),
      //   );
      // }

      dispatch(
        sendMessage({
          threadId: thread.id,
          content,
          attachments,
        }),
      );
      return Promise.resolve(thread.id);
    } catch (e) {
      console.error('Failed to create thread:', e);
      return Promise.reject(e.message);
    }
  };

export const reactToMessage =
  ({ messageId, reactionType: reaction_type, emoji = null }) =>
  async () => {
    try {
      await optimai_room.post(`/message/${messageId}/react`, {
        reaction_type,
        emoji,
      });
      return Promise.resolve('success');
    } catch (e) {
      console.error('Failed to react to message:', e);
      return Promise.reject(e);
    }
  };

export const copyMessage =
  ({ messageId }) =>
  async (_, getState) => {
    const content = makeSelectMessageContent()(getState(), messageId);
    copy(content ?? '');
  };

export const deleteMessage =
  ({ messageId }) =>
  async () => {
    try {
      await optimai_room.delete(`/message/${messageId}`);
      return Promise.resolve('success');
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const createRoom = (roomData) => async (dispatch, getState) => {
  try {
    const response = await optimai_room.post('/', roomData);
    const { room, main_thread, members } = response.data;

    // Optionally add the new room to the userRooms list
    const state = getState();
    const currentRooms = selectUserRooms(state);
    const pagination = selectUserRoomsPagination(state);

    dispatch(
      slice.actions.setUserRooms({
        rooms: [room, ...currentRooms],
        hasNextPage: pagination.hasNextPage,
        nextCursor: pagination.nextCursor,
        isLoadMore: false,
      }),
    );

    return { room, main_thread, members };
  } catch (e) {
    console.error('error creating room', e);
    return Promise.reject(e);
  }
};

export const createRoomCode = (dispatch, getState) => async () => {
  try {
    const { room } = getState().room;

    const response = await optimai_room.post(`/${room.id}/video/token`);
    return response.data;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const updateRoom = (data) => async (dispatch, getState) => {
  try {
    const { room } = getState().room;
    await optimai_room.patch(`/${room.id}`, data);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const inviteMembersOrGuests = (invitation) => async (dispatch, getState) => {
  try {
    const { room } = getState().room;
    await optimai_room.post(`/${room.id}/invite`, invitation);
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const createRoomEvent = (event) => async (dispatch, getState) => {
  try {
    const { room } = getState().room;
    const response = await optimai_room.post(`/${room.id}/event`, event);
    const { calendar_event } = response.data;
    dispatch(slice.actions.addEvent(calendar_event));
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteRoom = (roomId) => async (dispatch, getState) => {
  try {
    // Use the provided roomId or fall back to current room if not provided
    const targetRoomId = roomId || getState().room.room?.id;
    if (!targetRoomId) {
      throw new Error('No room ID provided');
    }

    const response = await optimai_room.delete(`/${targetRoomId}`);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteThread = (threadId) => async (dispatch, getState) => {
  try {
    const { threads, mainThread } = getState().room;
    dispatch(
      setThreadMain({
        current: threads.byId[threadId]?.parent?.thread_id || mainThread,
      }),
    );
    const response = await optimai_room.delete(`/thread/${threadId}`);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const updateRoomStatus = (newStatus) => async (dispatch, getState) => {
  try {
    const { room } = getState().room;
    const response = await optimai_room.patch(`/${room.id}/status/${newStatus}`);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const exitRoom = () => async (dispatch, getState) => {
  try {
    const { room } = getState().room;
    const response = await optimai_room.post(`/${room.id}/exit`);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const acceptRoomInvitation = (invitationId) => async () => {
  try {
    const response = await optimai_room.patch(`/invitation/room/${invitationId}/accept`);
    const { room } = response.data;
    return Promise.resolve(room);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const stopAgentResponse = (messageId) => async (dispatch, getState) => {
  const runningResponses = selectRunningResponses(getState());
  const llmResponseId = runningResponses[messageId];
  if (!llmResponseId) {
    return;
  }
  try {
    const response = await optimai_agent.post(`/activation/response/${llmResponseId}/stop`);
    const { room } = response.data;
    return Promise.resolve(room);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const declineRoomInvitation = (invitationId) => async () => {
  try {
    const response = await optimai_room.patch(`/invitation/room/${invitationId}/decline`);
    const { room } = response.data;
    return Promise.resolve(room);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const createMessageContextMenu =
  ({ anchorEl, message, threadId, position }) =>
  (dispatch, getState) => {
    const state = getState();
    const me = selectMe(state);
    const drawer = selectThreadDrawerDetails(state);
    const members = selectMembers(state);

    const isViewer = !!me && ['viewer', 'listener'].includes(me.role);

    const canDeleteMessage =
      !!me &&
      !!message?.member_id &&
      (me.id === message.member_id || // Users can always delete their own messages
        (['owner', 'admin'].includes(me.role) &&
          members.byId[message.member_id]?.member?.member_type === 'agent'));

    const enableThreadOnlyActions =
      !!message &&
      !isViewer &&
      message.thread_id === threadId &&
      (drawer.current !== threadId || !drawer.messageId);

    let menuItems = [];

    if (message) {
      const threadOnlyMenuItems = [
        {
          l: 'Create Thread',
          a: {
            k: 'createThread',
            p: {
              messageId: message.id,
              current: message.thread_id,
              display: true,
              isCreation: true,
            },
          },
          i: 'mdi-comment-plus-outline',
        },
        {
          l: 'Respond',
          a: { k: 'replyToMessage', p: { messageId: message.id, threadId } },
          i: 'mdi-reply',
        },
        {
          l: 'Add Reaction',
          a: { k: 'addReaction', p: { messageId: message.id } },
          i: 'mdi-emoticon-happy-outline',
        },
      ];

      const commonMenuItems = [
        { l: 'Copy', a: { k: 'handleCopy', p: message.id }, i: 'mdi-content-copy' },
        { l: 'Copy Id', a: { k: 'handleCopyId', p: message.id }, i: 'mdi:identifier' },
      ];

      const myMenuItems = [{ l: 'Edit', a: null, i: 'mdi-pencil' }];

      if (enableThreadOnlyActions) {
        menuItems = threadOnlyMenuItems;
      }

      menuItems = menuItems.concat(commonMenuItems);

      if (message.member_id === me?.id) {
        menuItems = menuItems.concat(myMenuItems);
      }

      if (canDeleteMessage) {
        menuItems.push({
          l: 'Delete',
          a: { k: 'deleteMessage', p: { messageId: message.id } },
          i: 'mdi-delete',
        });
      }
    }
    dispatch(slice.actions.setContextMenu({ anchorEl, menuItems, position }));
    return Promise.resolve(menuItems);
  };

export const createMemberContextMenu =
  ({ anchorEl, roomMember, position }) =>
  (dispatch, getState) => {
    const state = getState();
    const me = selectMe(state);
    const role = me?.role || 'viewer';

    const items = [];
    items.push({ l: 'Block', a: null, i: 'mdi-block-helper' });
    if (['admin', 'owner', 'member'].includes(role)) {
      items.push({ l: 'Mention', a: null, i: 'mdi-comment-account' });
    }
    if (['admin', 'owner'].includes(role)) {
      items.push({
        l: `${!roomMember.is_kicked ? 'Kick' : 'Readmit'} Member`,
        a: {
          k: 'patchMember',
          p: {
            action: !roomMember.is_kicked ? 'kick' : 'readmit',
            body: { room_member_id: roomMember.id },
          },
        },
        i: `mdi-account-${!roomMember.is_kicked ? 'remove' : 'add'}`,
      });
      items.push({
        l: `${!roomMember.is_silenced ? 'Silence' : 'Unsilence'} Member`,
        a: {
          k: 'patchMember',
          p: {
            action: !roomMember.is_silenced ? 'mute' : 'unmute',
            body: { room_member_id: roomMember.id },
          },
        },
        i: `mdi-volume-${!roomMember.silenced ? 'off' : 'on'}`,
      });
      items.push({
        l: `${!roomMember.is_vblocked ? 'Inhabilitate' : 'Habilitate'} Video`,
        a: {
          k: 'patchMember',
          p: {
            action: !roomMember.is_vblocked ? 'vblock' : 'unvblock',
            body: { room_member_id: roomMember.id, role: 'viewer' },
          },
        },
        i: `mdi-video-${!roomMember.is_vblocked ? 'off' : 'on'}`,
      });

      const changeRoleItem = {
        l: 'Change Role',
        children: [
          {
            l: 'Admin',
            a: {
              k: 'patchMember',
              p: { action: 'set_role', body: { room_member_id: roomMember.id, role: 'admin' } },
            },
          },
          {
            l: 'Member',
            a: {
              k: 'patchMember',
              p: { action: 'set_role', body: { room_member_id: roomMember.id, role: 'member' } },
            },
          },
          {
            l: 'Listener',
            a: {
              k: 'patchMember',
              p: { action: 'set_role', body: { room_member_id: roomMember.id, role: 'listener' } },
            },
          },
          {
            l: 'Viewer',
            a: {
              k: 'patchMember',
              p: { action: 'set_role', body: { room_member_id: roomMember.id, role: 'viewer' } },
            },
          },
        ],
        i: 'mdi-account-convert',
      };
      changeRoleItem.children = changeRoleItem.children.filter(
        (e) => e.l.toLocaleLowerCase() !== roomMember.role,
      );
      if (role === 'owner' && roomMember.role !== 'owner') {
        changeRoleItem.children.push({
          l: 'Owner',
          a: {
            k: 'patchMember',
            p: { action: 'set_role', body: { room_member_id: roomMember.id, role: 'owner' } },
          },
        });
      }
      if (roomMember.role !== 'owner' || role === 'owner') {
        items.push(changeRoleItem);
      }

      if (roomMember.member.member_type === 'agent') {
        items.push({
          l: 'Agent Interaction',
          i: 'fluent:comment-multiple-mention-16-filled',
          children: [
            {
              l: 'Mention Only',
              a: {
                k: 'patchMember',
                p: {
                  action: 'agent_interaction',
                  body: { room_member_id: roomMember.id, agent_interaction: 'mention_only' },
                },
              },
            },
            {
              l: 'Always',
              a: {
                k: 'patchMember',
                p: {
                  action: 'agent_interaction',
                  body: { room_member_id: roomMember.id, agent_interaction: 'always' },
                },
              },
            },
          ],
        });
      }
    }
    dispatch(slice.actions.setContextMenu({ anchorEl, menuItems: items, position }));
    return Promise.resolve(items);
  };

export const updateMessage =
  ({ messageId, content }) =>
  async (dispatch) => {
    try {
      await optimai_room.patch(`/messages/${messageId}`, {
        content,
      });
      dispatch(updateMessageContent({ messageId, content }));
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  };

export const selectDrawerExpanded = (state) => state.drawerExpanded;

// Helper action creator for tab-aware thread switching
export const switchToThreadInTab = (threadId, threadName) => (dispatch, getState) => {
  const state = getState();
  const tabsEnabled = state.room.tabs.allIds.length > 0;

  if (tabsEnabled) {
    // Use tab-aware switching
    dispatch(switchToThread({ threadId, threadName }));
  } else {
    // Fallback to traditional switching
    dispatch(setThreadMain({ current: threadId }));
  }
};

export const createNewThread = () => async (dispatch, getState) => {
  try {
    const { room } = getState().room;

    // Create a new thread without a predefined name
    // The thread will get its name from the first message content
    const response = await optimai_room.post(`/${room.id}/thread`, { name: 'New Thread' });
    const { thread } = response.data;

    // Add the thread to the state
    dispatch(addThread(thread));

    // Create a tab for the new thread and switch to it
    // Use a temporary name that will be updated when the first message is sent
    dispatch(
      switchToThread({
        threadId: thread.id,
        threadName: thread.name || 'New Thread',
      }),
    );

    return Promise.resolve(thread.id);
  } catch (e) {
    console.error('Failed to create new thread:', e);
    return Promise.reject(e.message);
  }
};
