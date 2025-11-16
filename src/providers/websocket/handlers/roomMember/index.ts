/**
 * Room Member Event Handler
 * Routes room member events to appropriate operations
 */

import {
  extractRoomMemberEventData,
  ROOM_MEMBER_OPERATIONS,
} from './operations';

/**
 * Handle room member events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 * @param {string} user_id - The current user ID
 */
export const handleRoomMemberEvent = (data: unknown, user_id: string): void => {
  const extracted = extractRoomMemberEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ROOM_MEMBER_OPERATIONS[eventType];
  if (handler) {
    handler(eventData, user_id);
  } else {
    console.warn(`Unhandled room member event type: ${eventType}`);
  }
};

