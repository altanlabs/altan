/**
 * Room Operations
 * Contains all room event handlers
 */

import { roomUpdate } from '../../../../redux/slices/room';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate room event data
 */
export const extractRoomEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid room event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle room.created event (from RoomNew)
 */
export const handleRoomCreated = (eventData) => {
  // Room creation is typically handled through the API
  // This event can be used for real-time room list updates
  console.log('Room created:', eventData);
};

/**
 * Handle room.updated event (from RoomUpdate)
 * This includes policy updates
 */
export const handleRoomUpdated = (eventData) => {
  // Normalize ids field (handle both 'id' and 'ids' from backend)
  const normalizedData = {
    ids: eventData.ids || eventData.id,
    changes: eventData.changes || eventData,
  };

  if (!normalizedData.ids || typeof normalizedData.changes !== 'object') {
    console.error('Invalid RoomUpdate data structure:', {
      received: eventData,
      expected: '{ ids: string | string[], changes: object }',
    });
    return;
  }

  dispatch(roomUpdate(normalizedData));
};

/**
 * Operation registry for room events
 */
export const ROOM_OPERATIONS = {
  'room.created': handleRoomCreated,
  'room.updated': handleRoomUpdated,
};
