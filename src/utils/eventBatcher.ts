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
 * ```typescript
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
 *   dispatch(markMessagePartComplete(eventData));
 *   break;
 * ```
 */

import { batch } from 'react-redux';

/**
 * Generic event data structure for batching
 * Designed to work with WebSocket message part events
 */
export interface BatchableEventData {
  id?: string;
  message_id?: string;
  type?: string;
  part_type?: string;
  [key: string]: unknown;
}

/**
 * Event handler function type
 * Processes a single event from the batch
 */
export type EventHandler<T extends BatchableEventData = BatchableEventData> = (eventData: T) => void;

/**
 * Statistics about pending events in the batcher
 */
export interface BatcherStats {
  /** Whether a flush is currently scheduled */
  pending: boolean;
  /** Total number of pending events across all types */
  totalEvents: number;
  /** Count of events by type */
  eventsByType: Record<string, number>;
}

/**
 * High-performance event batcher using requestAnimationFrame
 *
 * Generic type T allows for type-safe event data handling
 * while maintaining flexibility for different event structures.
 */
export class EventBatcher<T extends BatchableEventData = BatchableEventData> {
  /** Human-readable name for logging */
  private readonly name: string;

  /** Pending events grouped by event type */
  private readonly pendingEvents: Map<string, T[]>;

  /** Current requestAnimationFrame ID (null if no flush scheduled) */
  private rafId: number | null;

  /** Registered handlers for each event type */
  private readonly handlers: Map<string, EventHandler<T>>;

  /**
   * Create a new event batcher
   * @param name - Human-readable name for logging
   */
  constructor(name = 'EventBatcher') {
    this.name = name;
    this.pendingEvents = new Map<string, T[]>();
    this.rafId = null;
    this.handlers = new Map<string, EventHandler<T>>();
  }

  /**
   * Register a handler for a specific event type
   *
   * Handlers are called once per event during flush, wrapped in a Redux batch.
   * Multiple events of the same type are processed sequentially within the batch.
   *
   * @param eventType - The event type to handle (e.g., 'updated', 'completed')
   * @param handler - Function to call for each event of this type
   */
  registerHandler(eventType: string, handler: EventHandler<T>): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Enqueue an event for batched processing
   *
   * Events are accumulated until the next animation frame (~16ms).
   * If this is the first event since the last flush, schedules a RAF callback.
   *
   * @param eventType - The event type (must have a registered handler)
   * @param eventData - The event payload
   */
  enqueue(eventType: string, eventData: T): void {
    // Initialize array for this event type if needed
    if (!this.pendingEvents.has(eventType)) {
      this.pendingEvents.set(eventType, []);
    }

    // Add event to pending queue
    const queue = this.pendingEvents.get(eventType);
    if (queue) {
      queue.push(eventData);
    }

    // Schedule flush if not already scheduled
    if (this.rafId === null) {
      // Use RAF for smooth updates at 60 FPS
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Flush all pending events in a single Redux batch
   *
   * Processes all accumulated events immediately, wrapped in batch() to
   * minimize React re-renders. Clears the RAF callback if pending.
   *
   * Safe to call multiple times - no-op if no events are pending.
   */
  flush(): void {
    // Clear RAF if it's pending
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.pendingEvents.size === 0) {
      return;
    }

    // Process all pending events in a single Redux batch
    batch(() => {
      for (const [eventType, events] of this.pendingEvents.entries()) {
        const handler = this.handlers.get(eventType);

        if (handler) {
          // Call handler with each event for this type
          events.forEach((eventData) => {
            handler(eventData);
          });
        } else {
          // eslint-disable-next-line no-console
          console.warn(`[${this.name}] No handler registered for event type: ${eventType}`);
        }
      }
    });

    // Clear pending events and reset RAF
    this.pendingEvents.clear();
    this.rafId = null;
  }

  /**
   * Cancel any pending flush and clear all queued events
   *
   * Useful for cleanup when unmounting components or disconnecting WebSocket.
   * All pending events are discarded without being processed.
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingEvents.clear();
  }

  /**
   * Get statistics about pending events
   *
   * Useful for debugging and monitoring batch performance.
   *
   * @returns Current batcher statistics
   */
  getStats(): BatcherStats {
    const stats: BatcherStats = {
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

/**
 * Singleton batcher for message part events
 *
 * Used by WebSocket handlers to batch high-frequency message_part.updated events.
 * Provides smooth 60 FPS streaming updates without overwhelming React.
 */
export const messagePartBatcher = new EventBatcher<BatchableEventData>('MessagePartBatcher');

// Export the class as default for creating custom batchers
export default EventBatcher;

