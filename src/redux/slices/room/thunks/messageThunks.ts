/**
 * Message Thunks
 * Async actions for message operations
 * Refactored with DRY and SOLID principles
 */
// @ts-expect-error - analytics.js does not have type definitions
import { analytics } from '../../../../lib/analytics';
import { getAgentService } from '../../../../services/AgentService';
import { getRoomService } from '../../../../services/RoomService';
import type { MessageContent as ServiceMessageContent, Reaction as ServiceReaction } from '../../../../services/types';
import type { AppDispatch, RootState } from '../../../store';
import { setPreviewMode } from '../../previewControl';
import { copy } from '../helpers/utilities';
import {
  selectRunningResponses,
  selectMe,
  selectThreadDrawerDetails,
  selectMembers,
} from '../selectors';
import { makeSelectMessageContent } from '../selectors/messagePartSelectors';
import {
  clearMessageError,
  updateMessageContent,
} from '../slices/messagesSlice';
import {
  setThreadRespond,
  promoteTemporaryThread,
} from '../slices/threadsSlice';
import { setContextMenu, setIsUploading, updateMediaProgress } from '../slices/uiSlice';
import type { RoomState as RoomStateType, RoomMember, MembersState, Thread } from '../types/state';

// ============================================================================
// Types & Interfaces
// ============================================================================

declare const Audio: {
  prototype: HTMLAudioElement;
  new (src?: string): HTMLAudioElement;
};

declare const window: Window & typeof globalThis;
declare const console: Console;

// ============================================================================
// Constants
// ============================================================================

const NOTIFICATION_SOUND_URL = 'https://storage.googleapis.com/logos-chatbot-optimai/out.mp3';
const DEFAULT_THREAD_NAME = 'New Chat';
const THREAD_NAME_MAX_LENGTH = 50;

// Role constants for permission checks
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  LISTENER: 'listener',
  VIEWER: 'viewer',
} as const;

const ADMIN_ROLES = [ROLES.OWNER, ROLES.ADMIN] as const;
const PRIVILEGED_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER] as const;
const VIEWER_ROLES = [ROLES.VIEWER, ROLES.LISTENER] as const;

// Helper type for accessing room state safely
type RoomState = RoomStateType;

/**
 * Internal RootState type that properly types the room property
 * This resolves type mismatches between store inference and actual state shape
 */
interface TypedRootState extends Omit<RootState, 'room'> {
  room: RoomState;
}

/**
 * Type guard to safely extract room state from RootState
 * Converts RootState to TypedRootState to access room properties safely
 */
const getRoomState = (state: RootState): RoomState => {
  const typedState = state as TypedRootState;
  return typedState.room;
};

/**
 * Type guard to safely cast RootState for selector compatibility
 * Ensures selectors receive properly typed state
 */
const getTypedState = (state: RootState): TypedRootState => {
  return state as TypedRootState;
};

/**
 * Safely casts TypedRootState back to RootState for selector functions
 * This is necessary because selectors are typed to accept RootState
 * TypeScript requires this cast due to structural differences in the room property
 * 
 * This is safe because:
 * 1. TypedRootState extends RootState structure
 * 2. RoomState is the actual type of state.room at runtime
 * 3. Selectors work correctly with this properly typed state
 * 
 * @param state - The typed state to convert
 * @returns The state cast to RootState for selector compatibility
 */
const toSelectorState = (state: TypedRootState): RootState => {
  // Explicit cast needed: TypedRootState has stricter room typing than inferred RootState
  // Safe cast - TypedRootState is structurally compatible with RootState
  return state as never;
};

const SOUND_OUT = typeof Audio !== 'undefined' && typeof window !== 'undefined'
  ? new Audio(NOTIFICATION_SOUND_URL)
  : null;

// Re-export service Attachment type for consistency
export type { Attachment } from '../../../../services/types';

interface SendMessageParams {
  content: string;
  attachments?: ServiceMessageContent['attachments'];
  threadId: string;
}

interface SendAgentMessageParams extends SendMessageParams {
  agentId: string;
}

interface UpdateMessageParams {
  messageId: string;
  content: string;
}

interface ReactToMessageParams {
  messageId: string;
  reactionType: string;
  emoji?: string | null;
}

interface ContextMenuMessage {
  id: string;
  thread_id: string;
  member_id: string;
  [key: string]: unknown;
}

interface ContextMenuPosition {
  top?: number;
  left?: number;
  [key: string]: unknown;
}

interface ContextMenuRoomMember {
  id: string;
  is_kicked?: boolean;
  is_silenced?: boolean;
  is_vblocked?: boolean;
  role?: string;
  member?: {
    member_type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface MenuItem {
  l: string;
  a: { k: string; p: unknown } | null;
  i: string;
  children?: MenuItem[];
}

// ============================================================================
// Helper Functions (DRY Principle)
// ============================================================================

/**
 * Checks if voice is active for a specific thread
 */
const isVoiceActiveForThread = (state: RootState, threadId: string): boolean => {
  const roomState = getRoomState(state);
  return !!roomState._voice.voiceConversations?.byThreadId?.[threadId]?.isActive;
};

/**
 * Plays notification sound if voice is not active
 */
const playNotificationSound = (state: RootState, threadId: string): void => {
  if (!isVoiceActiveForThread(state, threadId) && SOUND_OUT) {
    void SOUND_OUT.play().catch(() => { /* ignore audio errors */ });
  }
};

/**
 * Clears the respond state for a thread
 */
const clearThreadRespond = (
  dispatch: AppDispatch,
  respond: Record<string, string>,
  threadId: string
): void => {
  if (respond[threadId]) {
    dispatch(setThreadRespond({ threadId, messageId: '' }));
  }
};

/**
 * Creates progress callback for media uploads
 */
const createProgressCallback = (
  dispatch: AppDispatch,
  threadId: string
) => (percentCompleted: number): void => {
  dispatch(updateMediaProgress({ threadId, percentCompleted }));
};

/**
 * Handles upload start state
 */
const handleUploadStart = (
  dispatch: AppDispatch,
  attachments?: ServiceMessageContent['attachments']
): void => {
  if (attachments?.length) {
    dispatch(setIsUploading(true));
  }
};

/**
 * Gets the project ID from current URL
 */
const getProjectIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  if (typeof window !== 'undefined' && window.location) {
    const urlParts = window.location.pathname.split('/');
    const projectIndex = urlParts.indexOf('project');
    return projectIndex !== -1 && urlParts[projectIndex + 1]
      ? urlParts[projectIndex + 1]
      : null;
  }
  return null;
};

/**
 * Checks if current URL is in a project route
 */
const isInProjectRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof window !== 'undefined' && window.location) {
    return window.location.pathname.includes('/project/');
  }
  return false;
};

/**
 * Switches to development mode if in project route
 */
const switchToDevModeIfNeeded = (dispatch: AppDispatch): void => {
  if (isInProjectRoute()) {
    dispatch(setPreviewMode('development'));
  }
};

/**
 * Tracks message sent event in analytics
 */
const trackMessageSent = (
  threadId: string,
  content: string,
  attachments: ServiceMessageContent['attachments'],
  isReply: boolean
): void => {
  if (typeof analytics === 'undefined' || !analytics.messageSent) return;

  try {
    const trackingProperties: Record<string, unknown> = {
      has_attachments: !!attachments?.length,
      attachment_count: attachments?.length || 0,
      content_length: content?.length || 0,
      is_reply: isReply,
    };

    const projectId = getProjectIdFromUrl();
    if (projectId) {
      trackingProperties.project_id = projectId;
    }

    void analytics.messageSent(threadId, trackingProperties);
  } catch {
    // Silent fail - analytics should never break functionality
  }
};

/**
 * Handles temporary thread creation and promotion
 */
const handleTemporaryThreadCreation = async (
  dispatch: AppDispatch,
  state: RootState,
  threadId: string,
  content: string
): Promise<string> => {
  const roomState = getRoomState(state);
  const temporaryThread = roomState._threads.temporaryThread;
  const room = roomState._room.room;

  // Check if this is a temporary thread that needs to be created in DB
  if (!temporaryThread || temporaryThread.id !== threadId || !temporaryThread.isTemporary) {
    return threadId;
  }

  if (typeof console !== 'undefined' && console.log) {
    console.log('🔧 Creating temporary thread in database before sending message...');
  }

  const threadName = content.substring(0, THREAD_NAME_MAX_LENGTH).trim() || DEFAULT_THREAD_NAME;
  const roomIdToUse = temporaryThread.roomId || room?.id;
  
  if (!roomIdToUse) {
    throw new Error('No room ID available');
  }

  const roomService = getRoomService();
  const createdThread = await roomService.createThread(roomIdToUse, undefined, threadName);

  if (typeof console !== 'undefined' && console.log) {
    console.log('✅ Temporary thread created in DB:', createdThread.id);
  }

  dispatch(
    promoteTemporaryThread({
      tempId: threadId,
      realThreadId: createdThread.id,
      threadData: createdThread as unknown as Partial<Thread>,
    })
  );

  return createdThread.id;
};

/**
 * Gets the respond message ID for a thread
 */
const getRespondMessageId = (
  respond: Record<string, string>,
  threadId: string
): string | undefined => {
  return respond[threadId] || undefined;
};

/**
 * Prepares message data for sending
 * Constructs the message payload with optional attachments and reply ID
 */
const prepareMessageData = (
  content: string,
  attachments: ServiceMessageContent['attachments'],
  respond: Record<string, string>,
  threadId: string
): ServiceMessageContent => {
  const messageData: ServiceMessageContent = {
    text: content,
  };

  if (attachments) {
    messageData.attachments = attachments;
  }

  const replyId = getRespondMessageId(respond, threadId);
  if (replyId) {
    messageData.replied_id = replyId;
  }

  return messageData;
};

// ============================================================================
// Public Thunks
// ============================================================================

/**
 * Send a user message
 * Handles temporary threads, uploads, analytics, and notifications
 */
export const sendMessage =
  ({ content, attachments, threadId }: SendMessageParams) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    const respond = state.room._threads.thread.respond || {};

    // Handle temporary thread creation
    const actualThreadId = await handleTemporaryThreadCreation(
      dispatch,
      state,
      threadId,
      content
    );

    // Switch to dev mode if needed
    switchToDevModeIfNeeded(dispatch);

    // Handle upload state
    handleUploadStart(dispatch, attachments);

    // Prepare and send message with progress tracking
    const messageData = prepareMessageData(content, attachments, respond, actualThreadId);
    const roomService = getRoomService();
    const response = await roomService.sendMessage(
      actualThreadId,
      messageData,
      createProgressCallback(dispatch, actualThreadId)
    );

    // Play notification sound
    playNotificationSound(state, actualThreadId);

    // Clear respond state
    clearThreadRespond(dispatch, respond, actualThreadId);

    // Track analytics
    trackMessageSent(
      actualThreadId,
      content,
      attachments,
      !!respond[actualThreadId]
    );

    return response;
  };

/**
 * Send an agent message
 * Similar to sendMessage but for agent-initiated messages
 */
export const sendAgentMessage =
  ({ content, attachments, threadId, agentId }: SendAgentMessageParams) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    const respond = state.room._threads.thread.respond || {};

    // Handle upload state
    handleUploadStart(dispatch, attachments);

    // Prepare and send agent message with progress tracking
    const messageData = prepareMessageData(content, attachments, respond, threadId);
    const roomService = getRoomService();
    const response = await roomService.sendAgentMessage(
      threadId,
      agentId,
      messageData,
      createProgressCallback(dispatch, threadId)
    );

    // Play notification sound
    playNotificationSound(state, threadId);

    // Clear respond state
    clearThreadRespond(dispatch, respond, threadId);

    return response;
  };

/**
 * Update message content
 */
export const updateMessage =
  ({ messageId, content }: UpdateMessageParams) =>
  async (dispatch: AppDispatch) => {
    const roomService = getRoomService();
    await roomService.updateMessage(messageId, content);
    dispatch(updateMessageContent({ messageId, content }));
  };

/**
 * Delete a message
 */
export const deleteMessage =
  ({ messageId }: { messageId: string }) =>
  async () => {
    const roomService = getRoomService();
    await roomService.delete('message', messageId);
    return 'success';
  };

/**
 * Copy message content to clipboard
 */
export const copyMessage =
  ({ messageId }: { messageId: string }) =>
  (_dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    const selector = makeSelectMessageContent();
    // Safe: toSelectorState properly converts TypedRootState to RootState for selectors
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const content = selector(toSelectorState(state), messageId);
    copy(content ?? '');
  };

/**
 * React to a message (like/dislike/emoji)
 */
export const reactToMessage =
  ({ messageId, reactionType, emoji = null }: ReactToMessageParams) =>
  async () => {
    const roomService = getRoomService();
    const reactionData: ServiceReaction = {
      reaction_type: reactionType,
      emoji: emoji || '',
    };
    await roomService.addReaction(messageId, reactionData);
    return 'success';
  };

/**
 * Retry failed message/response
 */
export const retryResponse =
  (messageId: string, threadId: string, roomId: string, agentId: string) =>
  async (dispatch: AppDispatch) => {
    const agentService = getAgentService();
    const response = await agentService.retryResponse({
      response_id: messageId,
      override_message_id: messageId,
      thread_id: threadId,
      room_id: roomId,
      agent_id: agentId,
    });

    dispatch(clearMessageError({ id: messageId }));

    return response;
  };

/**
 * Stop agent response generation
 */
export const stopAgentResponse =
  (messageId: string) =>
  async (_dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    // Safe: toSelectorState properly converts TypedRootState to RootState for selectors
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const runningResponses = selectRunningResponses(toSelectorState(state));
    const llmResponseId = runningResponses[messageId];
    
    if (!llmResponseId) {
      return undefined;
    }

    const agentService = getAgentService();
    const response = await agentService.stopResponse(llmResponseId);
    return response;
  };

// ============================================================================
// Context Menu Builders
// ============================================================================

/**
 * Extracts role as string from unknown type
 */
const extractRole = (role: unknown): string | undefined => {
  return typeof role === 'string' ? role : undefined;
};

/**
 * Checks if user has admin or owner role
 */
const hasAdminRole = (role: unknown): boolean => {
  const roleStr = extractRole(role);
  return !!roleStr && ADMIN_ROLES.includes(roleStr as typeof ADMIN_ROLES[number]);
};

/**
 * Checks if user has privileged role (owner, admin, or member)
 */
const hasPrivilegedRole = (role: unknown): boolean => {
  const roleStr = extractRole(role);
  return !!roleStr && PRIVILEGED_ROLES.includes(roleStr as typeof PRIVILEGED_ROLES[number]);
};

/**
 * Checks if user is a viewer or listener
 */
const isViewerRole = (role: unknown): boolean => {
  const roleStr = extractRole(role);
  return !!roleStr && VIEWER_ROLES.includes(roleStr as typeof VIEWER_ROLES[number]);
};

/**
 * Checks if user has permission to delete a message
 */
const canDeleteMessage = (
  me: RoomMember | null,
  message: ContextMenuMessage,
  members: MembersState
): boolean => {
  if (!me || !message?.member_id) return false;

  const memberData = members.byId[message.member_id];

  return (
    me.id === message.member_id ||
    (hasAdminRole(me.role) && memberData?.member?.member_type === 'agent')
  );
};

/**
 * Checks if thread-only actions should be enabled
 */
const shouldEnableThreadOnlyActions = (
  message: ContextMenuMessage | null,
  isViewer: boolean,
  threadId: string,
  drawer: { current: string | null; messageId?: string | null }
): boolean => {
  if (!message || isViewer) return false;
  
  return (
    message.thread_id === threadId &&
    (drawer.current !== threadId || !drawer.messageId)
  );
};

/**
 * Creates thread-only menu items
 */
const createThreadOnlyMenuItems = (message: ContextMenuMessage, threadId: string): MenuItem[] => [
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

/**
 * Creates common menu items available for all messages
 */
const createCommonMenuItems = (messageId: string): MenuItem[] => [
  { l: 'Copy', a: { k: 'handleCopy', p: messageId as unknown }, i: 'mdi-content-copy' },
  { l: 'Copy Id', a: { k: 'handleCopyId', p: messageId as unknown }, i: 'mdi:identifier' },
];

/**
 * Creates menu items for message owner
 */
const createOwnerMenuItems = (): MenuItem[] => [
  { l: 'Edit', a: null, i: 'mdi-pencil' },
];

/**
 * Creates delete menu item
 */
const createDeleteMenuItem = (messageId: string): MenuItem => ({
  l: 'Delete',
  a: { k: 'deleteMessage', p: { messageId } as unknown },
  i: 'mdi-delete',
});

/**
 * Create message context menu
 */
export const createMessageContextMenu =
  ({
    anchorEl,
    message,
    threadId,
    position,
  }: {
    anchorEl: HTMLElement | null;
    message: ContextMenuMessage | null;
    threadId: string;
    position: ContextMenuPosition | null;
  }) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    // Safe: toSelectorState properly converts TypedRootState to RootState for selectors
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const selectorState = toSelectorState(state);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const me = selectMe(selectorState);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const drawer = selectThreadDrawerDetails(selectorState);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const members = selectMembers(selectorState);

    const isViewer = isViewerRole(me?.role);
    const enableThreadOnlyActions = shouldEnableThreadOnlyActions(
      message,
      isViewer,
      threadId,
      drawer
    );

    let menuItems: MenuItem[] = [];

    if (message) {
      // Add thread-only actions if enabled
      if (enableThreadOnlyActions) {
        menuItems = createThreadOnlyMenuItems(message, threadId);
      }

      // Add common items
      menuItems = menuItems.concat(createCommonMenuItems(message.id));

      // Add owner-only items
      if (message.member_id === me?.id) {
        menuItems = menuItems.concat(createOwnerMenuItems());
      }

      // Add delete item if permitted
      if (canDeleteMessage(me, message, members)) {
        menuItems.push(createDeleteMenuItem(message.id));
      }
    }

    dispatch(setContextMenu({ anchorEl, menuItems: menuItems as unknown, position }));
    return Promise.resolve(menuItems);
  };

/**
 * Creates kick/readmit menu item
 */
const createKickMenuItem = (roomMember: ContextMenuRoomMember): MenuItem => ({
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

/**
 * Creates silence/unsilence menu item
 */
const createSilenceMenuItem = (roomMember: ContextMenuRoomMember): MenuItem => ({
  l: `${!roomMember.is_silenced ? 'Silence' : 'Unsilence'} Member`,
  a: {
    k: 'patchMember',
    p: {
      action: !roomMember.is_silenced ? 'mute' : 'unmute',
      body: { room_member_id: roomMember.id },
    },
  },
  i: `mdi-volume-${!roomMember.is_silenced ? 'off' : 'on'}`,
});

/**
 * Creates video block/unblock menu item
 */
const createVideoBlockMenuItem = (roomMember: ContextMenuRoomMember): MenuItem => ({
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

/**
 * Creates a single role change menu item
 */
const createRoleOption = (
  roomMemberId: string,
  roleLabel: string,
  roleValue: string
): MenuItem => ({
  l: roleLabel,
  a: {
    k: 'patchMember',
    p: {
      action: 'set_role',
      body: { room_member_id: roomMemberId, role: roleValue },
    },
  },
  i: '',
});

/**
 * Creates role change submenu
 */
const createRoleChangeMenuItem = (
  roomMember: ContextMenuRoomMember,
  myRole: string
): MenuItem | null => {
  const roleOptions = [
    { label: 'Admin', value: ROLES.ADMIN },
    { label: 'Member', value: ROLES.MEMBER },
    { label: 'Listener', value: ROLES.LISTENER },
    { label: 'Viewer', value: ROLES.VIEWER },
  ];

  const children = roleOptions
    .filter((option) => option.label.toLowerCase() !== roomMember.role)
    .map((option) => createRoleOption(roomMember.id, option.label, option.value));

  // Add owner option if applicable
  if (myRole === ROLES.OWNER && roomMember.role !== ROLES.OWNER) {
    children.push(createRoleOption(roomMember.id, 'Owner', ROLES.OWNER));
  }

  // Only show menu if there are role options available
  if (roomMember.role !== ROLES.OWNER || myRole === ROLES.OWNER) {
    return {
      l: 'Change Role',
      children,
      i: 'mdi-account-convert',
      a: null,
    };
  }

  return null;
};

/**
 * Creates agent interaction submenu
 */
const createAgentInteractionMenuItem = (roomMember: ContextMenuRoomMember): MenuItem | null => {
  if (roomMember.member?.member_type !== 'agent') {
    return null;
  }

  return {
    l: 'Agent Interaction',
    i: 'fluent:comment-multiple-mention-16-filled',
    a: null,
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
        i: '',
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
        i: '',
      },
    ],
  };
};

/**
 * Create member context menu
 */
export const createMemberContextMenu =
  ({
    anchorEl,
    roomMember,
    position,
  }: {
    anchorEl: HTMLElement | null;
    roomMember: ContextMenuRoomMember;
    position: ContextMenuPosition | null;
  }) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getTypedState(getState());
    // Safe: toSelectorState properly converts TypedRootState to RootState for selectors
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const me = selectMe(toSelectorState(state));
    const role = extractRole(me?.role) || ROLES.VIEWER;

    const items: MenuItem[] = [];

    // Block option (available to all)
    items.push({ l: 'Block', a: null, i: 'mdi-block-helper' });

    // Mention option (admin, owner, member)
    if (hasPrivilegedRole(role)) {
      items.push({ l: 'Mention', a: null, i: 'mdi-comment-account' });
    }

    // Admin and owner options
    if (hasAdminRole(role)) {
      items.push(createKickMenuItem(roomMember));
      items.push(createSilenceMenuItem(roomMember));
      items.push(createVideoBlockMenuItem(roomMember));

      const roleChangeItem = createRoleChangeMenuItem(roomMember, role);
      if (roleChangeItem) {
        items.push(roleChangeItem);
      }

      const agentInteractionItem = createAgentInteractionMenuItem(roomMember);
      if (agentInteractionItem) {
        items.push(agentInteractionItem);
      }
    }

    dispatch(setContextMenu({ anchorEl, menuItems: items as unknown, position }));
    return Promise.resolve(items);
  };
