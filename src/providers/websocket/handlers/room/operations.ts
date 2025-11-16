/**
 * Room Operations
 * Contains all room event handlers
 */

import { roomUpdate } from '../../../../redux/slices/room/slices/roomSlice';
import { dispatch } from '../../../../redux/store';

/**
 * Room event data structure
 */
interface RoomEventData {
  id?: string;
  ids?: string | string[];
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Extracted event data
 */
interface ExtractedEventData {
  eventData: RoomEventData;
  eventType: string;
}

/**
 * Normalized room update structure
 */
interface NormalizedRoomUpdate {
  ids: string | string[];
  changes: Record<string, unknown>;
}

/**
 * Extract and validate room event data
 */
export const extractRoomEventData = (data: unknown): ExtractedEventData | null => {
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
export const handleRoomCreated = (eventData: RoomEventData): void => {
  // Room creation is typically handled through the API
  // This event can be used for real-time room list updates
  console.log('Room created:', eventData);
};

/**
 * Handle room.updated event (from RoomUpdate)
 * This includes policy updates
 */
export const handleRoomUpdated = (eventData: RoomEventData): void => {
  // Normalize ids field (handle both 'id' and 'ids' from backend)
  const normalizedData: NormalizedRoomUpdate = {
    ids: eventData.ids || eventData.id!,
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
 * Operation handler type
 */
type OperationHandler = (eventData: RoomEventData) => void;

/**
 * Operation registry for room events
 */
export const ROOM_OPERATIONS: Record<string, OperationHandler> = {
  'room.created': handleRoomCreated,
  'room.updated': handleRoomUpdated,
};

