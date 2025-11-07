/**
 * Commit Event Handler
 * Routes commit events to appropriate operations
 */

import { extractCommitEventData, COMMIT_OPERATIONS } from './operations';

/**
 * Handle commit events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleCommitEvent = (data) => {
  const extracted = extractCommitEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = COMMIT_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled commit event type: ${eventType}`);
  }
};

