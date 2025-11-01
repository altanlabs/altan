/**
 * Event Batcher - High-performance batching for WebSocket events
 *
 * Uses requestAnimationFrame to batch Redux updates for smooth 60 FPS streaming.
 * Batches multiple rapid-fire updates into single animation frames.
 *
 * Benefits:
 * - Batches updates at 60 FPS (~16ms intervals) for smooth streaming
 * - Groups multiple updates into single Redux batch
 * - Prevents UI freezing during rapid-fire events
 * - Memory efficient with automatic cleanup
 *
 * Strategy:
 * - Accumulates events as they arrive
 * - Flushes on next animation frame (RAF ~16ms)
 * - Single Redux batch for all accumulated events
 * - Smooth 60 FPS updates with minimal overhead
 *
 * Best Practices:
 * - Only batch high-frequency events (e.g., streaming updates)
 * - Process lifecycle events immediately (e.g., completed, added, deleted)
 * - Call flush() before critical state changes to ensure ordering
 *
 * Example Usage:
 * ```javascript
 * import { messagePartBatcher } from '../../utils/eventBatcher';
 *
 * // Register handler for high-frequency updates
 * messagePartBatcher.registerHandler('updated', (eventData) => {
 *   dispatch(updateMessagePart(eventData));
 * });
 *
 * // Batch high-frequency events (thousands per second!)
 * case 'message_part.updated':
 *   messagePartBatcher.enqueue('updated', eventData);
 *   break;
 *
 * // Process lifecycle events immediately
 * case 'message_part.completed':
 *   messagePartBatcher.flush(); // Flush pending updates first
 *   dispatch(markMessagePartDone(eventData));
 *   break;
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
      // Use RAF for smooth updates at 60 FPS
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Flush all pending events in a single batch
   */
  flush() {
    // Clear RAF if it's pending
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.pendingEvents.size === 0) {
      return;
    }

    // const totalEvents = Array.from(this.pendingEvents.values()).reduce((sum, arr) => sum + arr.length, 0);

    // Collect aggregate stats for logging
    const partStats = new Map(); // partId -> { type, messageId, updates }

    for (const [, events] of this.pendingEvents.entries()) {
      events.forEach(event => {
        const partId = event?.id;
        const messageId = event?.message_id;
        const partType = event?.type || event?.part_type || 'unknown';

        if (partId) {
          if (!partStats.has(partId)) {
            partStats.set(partId, { type: partType, messageId, updates: 0 });
          }
          partStats.get(partId).updates++;
        }
      });
    }

    // Process all pending events in a single Redux batch
    // const startTime = performance.now();
    batch(() => {
      for (const [eventType, events] of this.pendingEvents.entries()) {
        const handler = this.handlers.get(eventType);

        if (handler) {
          // Call handler with all events for this type
          events.forEach(eventData => handler(eventData));
        } else {
          // eslint-disable-next-line no-console
          console.warn(`[${this.name}] No handler registered for event type: ${eventType}`);
        }
      }
    });
    // const duration = performance.now() - startTime;

    // Log aggregate stats
    // eslint-disable-next-line no-console
    // console.log(`[${this.name}] ⚡ Batched ${totalEvents} updates in ${duration.toFixed(1)}ms:`,
    //   Array.from(partStats.entries()).map(([partId, stats]) => ({
    //     part: partId.substring(0, 8),
    //     type: stats.type,
    //     msg: stats.messageId?.substring(0, 8),
    //     updates: stats.updates,
    //   })),
    // );

    // Clear pending events and reset RAF
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

// Create singleton batcher for message part events - uses RAF for instant updates
export const messagePartBatcher = new EventBatcher('MessagePartBatcher');

// Export the class for creating other batchers if needed
export default EventBatcher;
