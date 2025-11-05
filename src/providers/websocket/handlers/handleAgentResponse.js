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
 * @param {Object} data - The WebSocket event data
 */
export const handleAgentResponseEvent = (data) => {
  const extracted = extractEventData(data);
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
