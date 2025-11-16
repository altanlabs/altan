/**
 * Room Member Operations
 * Contains all room member event handlers
 */

import { addMember, roomMemberUpdate } from '../../../../redux/slices/room/slices/membersSlice';
import { dispatch } from '../../../../redux/store';

interface RoomMemberEventData {
  id: string;
  member_id: string;
  member_type: 'user' | 'agent';
  member_name?: string;
  user_id?: string;
  agent_id?: string;
  role: string;
  date_creation: string;
  is_kicked: boolean;
  is_silenced: boolean;
  is_vblocked: boolean;
  is_cagi_enabled: boolean;
  agent_interaction?: string;
  caller_id?: string;
  account_id: string;
  room_id: string;
  room_name?: string;
}

interface RoomMemberUpdateData {
  ids?: string | string[];
  id?: string | string[];
  changes?: Record<string, unknown>;
}

interface ExtractedEventData {
  eventData: unknown;
  eventType: string;
}

/**
 * Extract and validate room member event data
 */
export const extractRoomMemberEventData = (data: unknown): ExtractedEventData | null => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid room member event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle room_member.created event (from RoomMemberJoined)
 */
export const handleRoomMemberCreated = (eventData: RoomMemberEventData, user_id: string): void => {
  // Transform flat websocket structure to match expected nested member structure
  const memberData: unknown = {
    id: eventData.member_id,
    member_type: eventData.member_type,
  };

  // Add user or agent data based on member_type
  if (eventData.member_type === 'user') {
    memberData.user = {
      id: eventData.user_id || eventData.member_id,
      first_name: eventData.member_name || '',
      last_name: '',
    };
  } else if (eventData.member_type === 'agent') {
    memberData.agent = {
      id: eventData.agent_id || eventData.member_id,
      name: eventData.member_name,
    };
  }

  dispatch(
    addMember({
      roomMember: {
        id: eventData.id,
        role: eventData.role,
        date_creation: eventData.date_creation,
        is_kicked: eventData.is_kicked,
        is_silenced: eventData.is_silenced,
        is_vblocked: eventData.is_vblocked,
        is_cagi_enabled: eventData.is_cagi_enabled,
        agent_interaction: eventData.agent_interaction,
        caller_id: eventData.caller_id,
        account_id: eventData.account_id,
        room_id: eventData.room_id,
        room_name: eventData.room_name,
        member: memberData,
      },
      currentUserId: user_id,
    }),
  );
};

/**
 * Handle room_member.updated event (from RoomMemberUpdate)
 */
export const handleRoomMemberUpdated = (eventData: RoomMemberUpdateData): void => {
  // Normalize ids field (handle both 'id' and 'ids' from backend)
  const normalizedData = {
    ids: eventData.ids || eventData.id,
    changes: eventData.changes || eventData,
  };

  if (!normalizedData.ids || typeof normalizedData.changes !== 'object') {
    console.error('Invalid RoomMemberUpdate data structure:', {
      received: eventData,
      expected: '{ ids: string | string[], changes: object }',
    });
    return;
  }

  dispatch(roomMemberUpdate(normalizedData));
};

/**
 * Operation registry for room member events
 */
export const ROOM_MEMBER_OPERATIONS: Record<string, (eventData: unknown, user_id?: string) => void> = {
  'room_member.created': handleRoomMemberCreated,
  'room_member.updated': handleRoomMemberUpdated,
};

