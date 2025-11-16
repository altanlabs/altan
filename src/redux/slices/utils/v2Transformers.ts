/**
 * Transformers to convert v2 REST API responses to Redux state format
 * Maintains backward compatibility with existing normalized state structure
 */

/**
 * Pagination info for Redux state
 */
export interface PaginationInfo {
  hasNextPage: boolean;
  cursor: string | null;
}

/**
 * Normalized collection structure
 */
export interface NormalizedCollection<T> {
  byId: Record<string, T>;
  allIds: string[];
  paginationInfo: PaginationInfo;
}

/**
 * V2 API pagination response
 */
export interface V2Pagination {
  has_next_page: boolean;
  next_cursor: string | null;
}

/**
 * Transform v2 pagination response to current Redux pagination format
 * @param items - Array of items from v2 response
 * @param pagination - v2 pagination object { has_next_page, next_cursor }
 * @returns Normalized format { byId, allIds, paginationInfo }
 */
export function paginateV2Collection<T extends { id: string }>(
  items: T[],
  pagination?: V2Pagination
): NormalizedCollection<T> {
  const byId: Record<string, T> = {};
  const allIds: string[] = [];

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item && item.id) {
        byId[item.id] = item;
        allIds.push(item.id);
      }
    });
  }

  return {
    byId,
    allIds,
    paginationInfo: {
      hasNextPage: pagination?.has_next_page || false,
      cursor: pagination?.next_cursor || null,
    },
  };
}

/**
 * V2 Room API response
 */
export interface V2RoomResponse {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_dm?: boolean;
  policy?: Record<string, unknown>;
  meta_data?: Record<string, unknown>;
  account_id?: string;
  external_id?: string;
  status?: string;
  last_interaction?: string;
  date_creation: string;
  date_update: string;
  main_thread_id?: string;
  [key: string]: unknown;
}

/**
 * Transformed Room for Redux
 */
export interface TransformedRoom {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_dm: boolean;
  policy: Record<string, unknown>;
  meta_data: Record<string, unknown>;
  account_id?: string;
  external_id?: string;
  status?: string;
  last_interaction?: string;
  date_creation: string;
  date_update: string;
}

/**
 * Transform v2 room response to current Redux format
 * @param roomResponse - v2 room API response
 * @returns Transformed room object
 */
export function transformRoom(roomResponse: V2RoomResponse): TransformedRoom {
  return {
    id: roomResponse.id,
    name: roomResponse.name,
    description: roomResponse.description,
    avatar_url: roomResponse.avatar_url,
    is_dm: roomResponse.is_dm || false,
    policy: roomResponse.policy || {},
    meta_data: roomResponse.meta_data || {},
    account_id: roomResponse.account_id,
    external_id: roomResponse.external_id,
    status: roomResponse.status,
    last_interaction: roomResponse.last_interaction,
    date_creation: roomResponse.date_creation,
    date_update: roomResponse.date_update,
  };
}

/**
 * Thread messages collection
 */
export interface ThreadMessagesCollection {
  byId: Record<string, unknown>;
  allIds: string[];
  paginationInfo: {
    hasNextPage?: boolean;
    cursor?: string | null;
  };
}

/**
 * Thread events/media collection
 */
export interface ThreadCollection {
  byId: Record<string, unknown>;
  allIds: string[];
  paginationInfo: {
    hasNextPage: boolean;
    cursor: string | null;
  };
}

/**
 * V2 Thread API response
 */
export interface V2ThreadResponse {
  id: string;
  room_id: string;
  name: string;
  description?: string;
  status?: string;
  is_main?: boolean;
  starter_message_id?: string;
  date_creation: string;
  date_update: string;
  [key: string]: unknown;
}

/**
 * Transformed Thread for Redux
 */
export interface TransformedThread {
  id: string;
  room_id: string;
  name: string;
  description?: string;
  status?: string;
  is_main: boolean;
  starter_message_id?: string;
  date_creation: string;
  date_update: string;
  messages: ThreadMessagesCollection;
  events: ThreadCollection;
  media: ThreadCollection;
  read_state: Record<string, unknown>;
}

/**
 * Transform v2 thread response to current Redux format
 * @param threadResponse - v2 thread API response
 * @returns Transformed thread object
 */
export function transformThread(threadResponse: V2ThreadResponse): TransformedThread {
  return {
    id: threadResponse.id,
    room_id: threadResponse.room_id,
    name: threadResponse.name,
    description: threadResponse.description,
    status: threadResponse.status,
    is_main: threadResponse.is_main || false,
    starter_message_id: threadResponse.starter_message_id,
    date_creation: threadResponse.date_creation,
    date_update: threadResponse.date_update,
    // Initialize empty collections for messages, events, media
    messages: {
      byId: {},
      allIds: [],
      paginationInfo: {
        // Use undefined to indicate messages were never fetched
        // When messages are fetched, this will be set by addMessages
        hasNextPage: undefined,
        cursor: undefined,
      },
    },
    events: {
      byId: {},
      allIds: [],
      paginationInfo: {
        hasNextPage: false,
        cursor: null,
      },
    },
    media: {
      byId: {},
      allIds: [],
      paginationInfo: {
        hasNextPage: false,
        cursor: null,
      },
    },
    read_state: {},
  };
}

/**
 * V2 Message API response
 */
export interface V2MessageResponse {
  id: string;
  thread_id: string;
  member_id: string;
  content: string;
  replied_id?: string;
  cost?: number;
  tokens?: number;
  external_id?: string;
  date_creation: string;
  date_update: string;
  [key: string]: unknown;
}

/**
 * Transformed Message for Redux
 */
export interface TransformedMessage extends V2MessageResponse {
  cost: number;
  tokens: number;
}

/**
 * Transform v2 message response to current Redux format
 * @param messageResponse - v2 message API response
 * @returns Transformed message object
 */
export function transformMessage(messageResponse: V2MessageResponse): TransformedMessage {
  return {
    id: messageResponse.id,
    thread_id: messageResponse.thread_id,
    member_id: messageResponse.member_id,
    content: messageResponse.content,
    replied_id: messageResponse.replied_id,
    cost: messageResponse.cost || 0,
    tokens: messageResponse.tokens || 0,
    external_id: messageResponse.external_id,
    date_creation: messageResponse.date_creation,
    date_update: messageResponse.date_update,
    // Preserve any additional fields (reactions, media, parts, etc.)
    ...messageResponse,
  };
}

/**
 * V2 Member API response
 */
export interface V2MemberResponse {
  id: string;
  member_type: string;
  guest_id?: string;
  user_id?: string;
  agent_id?: string;
  date_creation: string;
  [key: string]: unknown;
}

/**
 * Transformed Member for Redux
 */
export type TransformedMember = V2MemberResponse;

/**
 * Transform v2 member response to current Redux format
 * @param memberResponse - v2 member API response
 * @returns Transformed member object
 */
export function transformMember(memberResponse: V2MemberResponse): TransformedMember {
  return {
    id: memberResponse.id,
    member_type: memberResponse.member_type,
    guest_id: memberResponse.guest_id,
    user_id: memberResponse.user_id,
    agent_id: memberResponse.agent_id,
    date_creation: memberResponse.date_creation,
    // Preserve any additional nested data
    ...memberResponse,
  };
}

/**
 * V2 Room Member API response
 */
export interface V2RoomMemberResponse {
  id: string;
  room_id: string;
  member_id: string;
  caller_id?: string;
  role: string;
  is_kicked?: boolean;
  is_silenced?: boolean;
  is_vblocked?: boolean;
  date_creation: string;
  member?: unknown;
  [key: string]: unknown;
}

/**
 * Transformed Room Member for Redux
 */
export interface TransformedRoomMember extends V2RoomMemberResponse {
  is_kicked: boolean;
  is_silenced: boolean;
  is_vblocked: boolean;
}

/**
 * Transform v2 room member response to current Redux format
 * @param roomMemberResponse - v2 room member API response
 * @returns Transformed room member object
 */
export function transformRoomMember(roomMemberResponse: V2RoomMemberResponse): TransformedRoomMember {
  return {
    id: roomMemberResponse.id,
    room_id: roomMemberResponse.room_id,
    member_id: roomMemberResponse.member_id,
    caller_id: roomMemberResponse.caller_id,
    role: roomMemberResponse.role,
    is_kicked: roomMemberResponse.is_kicked || false,
    is_silenced: roomMemberResponse.is_silenced || false,
    is_vblocked: roomMemberResponse.is_vblocked || false,
    date_creation: roomMemberResponse.date_creation,
    // Preserve nested member data
    member: roomMemberResponse.member,
    ...roomMemberResponse,
  };
}

