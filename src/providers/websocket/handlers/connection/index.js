/**
 * Connection Event Handler
 * Routes connection events to appropriate operations
 */

import { extractConnectionEventData, CONNECTION_OPERATIONS } from './operations';

/**
 * Handle connection events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleConnectionEvent = (data) => {
  const extracted = extractConnectionEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = CONNECTION_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled connection event type: ${eventType}`);
  }
};

