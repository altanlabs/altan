import { createSelector, createSlice } from '@reduxjs/toolkit';
import { truncate } from 'lodash';
import { createCachedSelector } from 're-reselect';

import { ROOM_ALL_THREADS_GQ, ROOM_GENERAL_GQ, ROOM_PARENT_THREAD_GQ } from './gqspecs/room';
import { THREAD_GENERAL_GQ, THREAD_MESSAGES_GQ } from './gqspecs/thread';
import {
  // checkArraysEqualShallow,
  checkArraysEqualsProperties,
  checkObjectsEqual,
  getNestedProperty,
} from '../helpers/memoize';
import { paginateCollection } from './utils/collections';
import { setPreviewMode } from './previewControl';
import { optimai, optimai_room, optimai_agent } from '../../utils/axios';

const SOUND_OUT = new Audio('https://storage.googleapis.com/logos-chatbot-optimai/out.mp3');
const SOUND_IN = new Audio('https://storage.googleapis.com/logos-chatbot-optimai/in.mp3');

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
      target[key] =
        t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object'
          ? Object_assign(t_val, s_val)
          : s_val;
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
    const executions = message.executions?.items ?? null;
    if (executions) {
      messagesExecutions[messageId] = [];
      for (const execution of executions) {
        executionsById[execution.id] = execution;
        messagesExecutions[messageId].push(execution.id);
      }
    }
    delete message.text;
    delete message.executions;
    messagesById[message.id] = message;
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
      state.authorization_requests = roomObject.authorization_requests.items || [];

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
      if (message.member_id !== state.me?.id && !message.is_streaming) {
        // Don't play sound if voice is active for this thread
        const isVoiceActiveForThread =
          !!state.voiceConversations.byThreadId[message.thread_id]?.isActive;
        if (!isVoiceActiveForThread) {
          SOUND_IN.play();
        }
      }

      // Check if message already exists to avoid duplicates
      if (state.messages.byId[message.id]) {
        // Update existing message properties
        Object.assign(state.messages.byId[message.id], message);
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
      Object.assign(state, initialState);
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
      const part = action.payload;
      if (!part?.id || !part?.message_id) {
        console.error('Invalid message part data');
        return;
      }

      // Normalize the part data structure
      const normalizedPart = {
        ...part,
        part_type: part.type || part.part_type || 'text',
        text: part.text || '',
        order: part.order || part.block_order || 0,
        is_done: part.is_done || false,
      };

      // Add part to global parts collection
      state.messageParts.byId[part.id] = normalizedPart;
      if (!state.messageParts.allIds.includes(part.id)) {
        state.messageParts.allIds.push(part.id);
      }

      // Associate part with message
      if (!state.messageParts.byMessageId[part.message_id]) {
        state.messageParts.byMessageId[part.message_id] = [];
      }
      if (!state.messageParts.byMessageId[part.message_id].includes(part.id)) {
        state.messageParts.byMessageId[part.message_id].push(part.id);
        // Sort parts by order
        state.messageParts.byMessageId[part.message_id].sort((a, b) => {
          const partA = state.messageParts.byId[a];
          const partB = state.messageParts.byId[b];
          return (partA?.order || 0) - (partB?.order || 0);
        });
      }
    },
    updateMessagePart: (state, action) => {
      const { id, delta, index, ...updates } = action.payload;
      if (!id || !state.messageParts.byId[id]) {
        console.error('Message part not found for update:', id);
        console.error('Available parts:', Object.keys(state.messageParts.byId));
        console.error('Payload:', action.payload);
        return;
      }

      const part = state.messageParts.byId[id];

      // Handle delta updates for text parts with proper ordering
      const partType = part.type || part.part_type || 'text';
      if (delta !== undefined && partType === 'text') {
        if (index !== undefined && index >= 0) {
          // Initialize buffer for ordered streaming
          if (!part.deltaBuffer) {
            part.deltaBuffer = {}; // index -> delta (using plain object instead of Map)
            part.lastProcessedIndex = -1;
          }

          // Store the delta at the specified index
          part.deltaBuffer[index] = delta;

          // Process all consecutive deltas starting from lastProcessedIndex + 1
          let currentIndex = part.lastProcessedIndex + 1;
          let newText = part.text || '';

          while (part.deltaBuffer[currentIndex] !== undefined) {
            newText += part.deltaBuffer[currentIndex];
            delete part.deltaBuffer[currentIndex];
            part.lastProcessedIndex = currentIndex;
            currentIndex++;
          }

          part.text = newText;
        } else {
          // Fallback: simple append if no index provided
          part.text = (part.text || '') + delta;
        }
      }

      // Apply other updates
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          part[key] = updates[key];
        }
      });
    },
    markMessagePartDone: (state, action) => {
      const { id } = action.payload;
      if (!id || !state.messageParts.byId[id]) {
        console.error('Message part not found');
        return;
      }

      const part = state.messageParts.byId[id];
      part.is_done = true;

      // Clean up the text buffer when streaming is complete
      if (part.textBuffer) {
        delete part.textBuffer;
      }
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

      // Reset streaming state
      part.text = '';
      part.is_done = false;

      // Clear any existing text buffer
      if (part.textBuffer) {
        delete part.textBuffer;
      }
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

export const selectAccountId = (state) => selectRoomState(state).account.id;

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

export const fetchRoom =
  ({ roomId, user, guest }) =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoading('room'));
      const response = await optimai_room.post(`/${roomId}`, ROOM_GENERAL_GQ);
      const room = response.data;
      dispatch(slice.actions.setRoom({ room, guest, user }));
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
