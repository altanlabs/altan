/**
 * Altaner Component Event Handler
 * Routes altaner component events to appropriate operations
 */

import {
  extractAltanerComponentEventData,
  ALTANER_COMPONENT_OPERATIONS,
} from './operations';

/**
 * Handle altaner component events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleAltanerComponentEvent = (data) => {
  const extracted = extractAltanerComponentEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ALTANER_COMPONENT_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled altaner component event type: ${eventType}`);
  }
};

