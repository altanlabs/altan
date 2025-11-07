/**
 * Main handler for task and plan events
 * Orchestrates event processing following Single Responsibility Principle
 */

import { batch } from 'react-redux';

import {
  TASK_EVENT_HANDLERS,
} from './taskHandlers';

/**
 * Handle task.* and plan.* events from WebSocket
 * @param {Object} event - The WebSocket event
 */
export const handleTaskEvent = (event) => {
  const eventType = event.type;
  const eventData = event.data;

  if (!eventType || !eventData) {
    console.error('Task event missing event_type or data:', event);
    return;
  }

  // Handle specific task event types using registry
  batch(() => {
    const handler = TASK_EVENT_HANDLERS[eventType];
    if (handler) {
      handler(eventData);
    } else {
      console.log('Unknown task event type:', eventType);
    }
  });
};
