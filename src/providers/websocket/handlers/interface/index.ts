/**
 * Interface Event Handler
 * Routes interface events to appropriate operations
 */

import { extractInterfaceEventData, INTERFACE_OPERATIONS } from './operations';

/**
 * Handle interface events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleInterfaceEvent = (data: unknown): void => {
  const extracted = extractInterfaceEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = INTERFACE_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled interface event type: ${eventType}`);
  }
};

