/**
 * Main handler for MESSAGE events
 * Orchestrates message event processing following Single Responsibility Principle
 */

import { extractMessageEventData, MESSAGE_EVENT_HANDLERS } from './messageHandlers';

/**
 * Handle MESSAGE events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleMessageEvent = (data) => {
  const extracted = extractMessageEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = MESSAGE_EVENT_HANDLERS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled message event type: ${eventType}`);
  }
};
