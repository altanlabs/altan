/**
 * Main handler for AGENT_RESPONSE events
 * Orchestrates event processing following Single Responsibility Principle
 */

import { batch } from 'react-redux';

import {
  extractEventData,
  handleActivationLifecycle,
  handleResponseLifecycle,
  EVENT_HANDLERS,
} from './agentResponseHandlers';

/**
 * Handle AGENT_RESPONSE events from WhisperStream WebSocket
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
  const handler = EVENT_HANDLERS[eventType];
  if (handler) {
    handler(eventData, timestamp);
  }
};
