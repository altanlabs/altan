/**
 * Agent Response Event Handler
 * Routes agent response events to appropriate operations
 */

import { batch } from 'react-redux';

import {
  extractEventData,
  handleActivationLifecycle,
  handleResponseLifecycle,
  AGENT_RESPONSE_OPERATIONS,
} from './operations';

/**
 * Handle agent response events from Hermes WebSocket
 * @param {Object} event - The WebSocket event
 */
export const handleAgentResponseEvent = (event) => {
  const extracted = extractEventData(event);
  if (!extracted) return;

  const { eventData, eventType, timestamp } = extracted;

  // Handle lifecycle events
  batch(() => {
    if (eventType.startsWith('activation.')) {
      handleActivationLifecycle(eventData, eventType, timestamp);
    }

    if (eventType.startsWith('response.')) {
      handleResponseLifecycle(eventData, eventType, timestamp);
    }
  });

  // Handle specific event types using registry
  const handler = AGENT_RESPONSE_OPERATIONS[eventType];
  if (handler) {
    handler(eventData, timestamp);
  }
};

