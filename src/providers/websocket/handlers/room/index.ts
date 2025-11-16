/**
 * Room Event Handler
 * Routes room events to appropriate operations
 */

import { extractRoomEventData, ROOM_OPERATIONS } from './operations';

/**
 * Handle room events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleRoomEvent = (data: unknown): void => {
  const extracted = extractRoomEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ROOM_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled room event type: ${eventType}`);
  }
};

