/**
 * Message Event Handler
 * Routes message events to appropriate operations
 */

import { extractMessageEventData, MESSAGE_OPERATIONS } from './operations';

/**
 * Handle message events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleMessageEvent = (data: unknown): void => {
  const extracted = extractMessageEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = MESSAGE_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled message event type: ${eventType}`);
  }
};

