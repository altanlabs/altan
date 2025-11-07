/**
 * Deployment Event Handler
 * Routes deployment events to appropriate operations
 */

import { extractDeploymentEventData, DEPLOYMENT_OPERATIONS } from './operations';

/**
 * Handle deployment events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleDeploymentEvent = (data) => {
  const extracted = extractDeploymentEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = DEPLOYMENT_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  } else {
    console.warn(`Unhandled deployment event type: ${eventType}`);
  }
};

