/**
 * Authorization Request Event Handler
 * Routes authorization request events to appropriate operations
 */

import {
  extractAuthorizationRequestEventData,
  AUTHORIZATION_OPERATIONS,
} from './operations';

/**
 * Handle authorization request events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleAuthorizationRequestEvent = (data) => {
  const extracted = extractAuthorizationRequestEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = AUTHORIZATION_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled authorization request event type: ${eventType}`);
  }
};

