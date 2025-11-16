/**
 * Altaner Component Event Handler
 * Routes altaner component events to appropriate operations
 */

import {
  extractAltanerComponentEventData,
  ALTANER_COMPONENT_OPERATIONS,
} from './operations';
import type { AltanerComponentEventData } from './types';

/**
 * Handle altaner component events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleAltanerComponentEvent = (
  data: AltanerComponentEventData
): void => {
  const extracted = extractAltanerComponentEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ALTANER_COMPONENT_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  }
};

