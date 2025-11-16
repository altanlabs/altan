/**
 * Thread Event Handler
 * Routes thread events to appropriate operations
 */

import { extractThreadEventData, THREAD_OPERATIONS } from './operations';

/**
 * Handle thread events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleThreadEvent = (data: unknown): void => {
  const extracted = extractThreadEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = THREAD_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled thread event type: ${eventType}`);
  }
};

