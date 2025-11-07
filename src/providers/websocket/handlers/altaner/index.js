/**
 * Altaner Event Handler
 * Routes altaner events to appropriate operations
 */

import { extractAltanerEventData, ALTANER_OPERATIONS } from './operations';

/**
 * Handle altaner events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleAltanerEvent = (data) => {
  const extracted = extractAltanerEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ALTANER_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled altaner event type: ${eventType}`);
  }
};

