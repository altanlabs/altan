/**
 * Main handler for THREAD events
 * Orchestrates thread event processing following Single Responsibility Principle
 */

import { extractThreadEventData, THREAD_EVENT_HANDLERS } from './threadHandlers';

/**
 * Handle THREAD events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleThreadEvent = (data) => {
  const extracted = extractThreadEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = THREAD_EVENT_HANDLERS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled thread event type: ${eventType}`);
  }
};
