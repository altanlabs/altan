/**
 * Altaner Event Handler
 * Routes altaner events to appropriate operations
 */

import { extractAltanerEventData, ALTANER_OPERATIONS } from './operations';
import type { AltanerEventData } from './types';

/**
 * Handle altaner events from Hermes WebSocket
 * @param {Object} data - The WebSocket event data
 */
export const handleAltanerEvent = (data: AltanerEventData): void => {
  const extracted = extractAltanerEventData(data);
  if (!extracted) return;

  const { eventData, eventType } = extracted;

  // Handle specific event types using registry
  const handler = ALTANER_OPERATIONS[eventType];
  if (handler) {
    handler(eventData);
  }
};

