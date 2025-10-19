/**
 * Event Batcher - High-performance batching for WebSocket events
 * 
 * Uses requestAnimationFrame to sync updates with browser paint cycles,
 * providing smooth 60fps performance even during high-frequency streaming.
 * 
 * Benefits:
 * - Automatically throttles to ~60fps (what users can actually see)
 * - Groups multiple updates into single Redux batch
 * - Prevents UI freezing during rapid-fire events
 * - Memory efficient with automatic cleanup
 * 
 * Example Usage:
 * ```javascript
 * import { messagePartBatcher } from '../../utils/eventBatcher';
 * 
 * // Register handler
 * messagePartBatcher.registerHandler('updated', (eventData) => {
 *   dispatch(updateMessagePart(eventData));
 * });
 * 
 * // Enqueue events (even thousands per second!)
 * messagePartBatcher.enqueue('updated', eventData);
 * 
 * // Events are automatically batched and flushed at next animation frame
 * ```
 */

import { batch } from 'react-redux';

class EventBatcher {
  constructor(name = 'EventBatcher') {
    this.name = name;
    this.pendingEvents = new Map(); // Map<eventType, Array<eventData>>
    this.rafId = null;
    this.handlers = new Map(); // Map<eventType, handler function>
  }

  /**
   * Register a handler for a specific event type
   * @param {string} eventType - The event type to handle
   * @param {Function} handler - The function to call with batched events
   */
  registerHandler(eventType, handler) {
    this.handlers.set(eventType, handler);
  }

  /**
   * Enqueue an event for batched processing
   * @param {string} eventType - The event type
   * @param {any} eventData - The event data
   */
  enqueue(eventType, eventData) {
    // Initialize array for this event type if needed
    if (!this.pendingEvents.has(eventType)) {
      this.pendingEvents.set(eventType, []);
    }

    // Add event to pending queue
    this.pendingEvents.get(eventType).push(eventData);

    // Schedule flush if not already scheduled
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Flush all pending events in a single batch
   */
  flush() {
    if (this.pendingEvents.size === 0) {
      this.rafId = null;
      return;
    }

    // Process all pending events in a single Redux batch
    batch(() => {
      for (const [eventType, events] of this.pendingEvents.entries()) {
        const handler = this.handlers.get(eventType);
        
        if (handler) {
          // Call handler with all events for this type
          events.forEach(eventData => handler(eventData));
        } else {
          console.warn(`[${this.name}] No handler registered for event type: ${eventType}`);
        }
      }
    });

    // Clear pending events and reset RAF ID
    this.pendingEvents.clear();
    this.rafId = null;
  }

  /**
   * Cancel any pending flush
   */
  cancel() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingEvents.clear();
  }

  /**
   * Get statistics about pending events (useful for debugging)
   */
  getStats() {
    const stats = {
      pending: this.rafId !== null,
      totalEvents: 0,
      eventsByType: {},
    };

    for (const [eventType, events] of this.pendingEvents.entries()) {
      stats.eventsByType[eventType] = events.length;
      stats.totalEvents += events.length;
    }

    return stats;
  }
}

// Create singleton batcher for message part events
export const messagePartBatcher = new EventBatcher('MessagePartBatcher');

// Export the class for creating other batchers if needed
export default EventBatcher;

