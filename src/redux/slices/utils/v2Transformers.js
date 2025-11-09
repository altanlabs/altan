/**
 * Transformers to convert v2 REST API responses to Redux state format
 * Maintains backward compatibility with existing normalized state structure
 */

/**
 * Transform v2 pagination response to current Redux pagination format
 * @param {Array} items - Array of items from v2 response
 * @param {Object} pagination - v2 pagination object { has_next_page, next_cursor }
 * @returns {Object} - Normalized format { byId, allIds, paginationInfo }
 */
export function paginateV2Collection(items, pagination) {
  const byId = {};
  const allIds = [];

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
 * Transform v2 room response to current Redux format
 * @param {Object} roomResponse - v2 room API response
 * @returns {Object} - Transformed room object
 */
export function transformRoom(roomResponse) {
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
 * Transform v2 thread response to current Redux format
 * @param {Object} threadResponse - v2 thread API response
 * @returns {Object} - Transformed thread object
 */
export function transformThread(threadResponse) {
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
 * Transform v2 message response to current Redux format
 * @param {Object} messageResponse - v2 message API response
 * @returns {Object} - Transformed message object
 */
export function transformMessage(messageResponse) {
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
 * Transform v2 member response to current Redux format
 * @param {Object} memberResponse - v2 member API response
 * @returns {Object} - Transformed member object
 */
export function transformMember(memberResponse) {
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
 * Transform v2 room member response to current Redux format
 * @param {Object} roomMemberResponse - v2 room member API response
 * @returns {Object} - Transformed room member object
 */
export function transformRoomMember(roomMemberResponse) {
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
