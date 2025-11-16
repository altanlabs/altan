/**
 * Agent Response Operations
 * Contains all agent response event handlers
 */

import { batch } from 'react-redux';

// @ts-expect-error - analytics.js doesn't have TypeScript definitions
import analytics from '../../../../lib/analytics';
import {
  addActivationLifecycle,
  completeActivationLifecycle,
  discardActivationLifecycle,
  addResponseLifecycle,
  completeResponseLifecycle,
  addRunningResponse,
  deleteRunningResponse,
} from '../../../../redux/slices/room/slices/lifecycleSlice';
import {
  addMessagePart,
  updateMessagePart,
  markMessagePartComplete,
} from '../../../../redux/slices/room/slices/messagePartsSlice';
import {
  addMessage,
  updateMessageStreamingState,
} from '../../../../redux/slices/room/slices/messagesSlice';
import type { Message, MessagePart, UpdateMessagePartPayload } from '../../../../redux/slices/room/types/state';
import { dispatch } from '../../../../redux/store';
import { messagePartBatcher } from '../../../../utils/eventBatcher';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * WebSocket event structure
 */
interface WebSocketEvent {
  type: string;
  data?: EventData;
  timestamp?: string;
}

/**
 * Base event data structure
 */
interface EventData {
  response_id?: string;
  agent_id?: string;
  thread_id?: string;
  message_id?: string;
  room_member_id?: string;
  error_code?: string;
  error_message?: string;
  error_type?: string;
  failed_in?: string;
  retryable?: boolean;
  total_attempts?: number;
  [key: string]: unknown;
}

/**
 * Base message part event data shared by all message_part.* events
 */
interface BaseMessagePartEventData extends EventData {
  /**
   * Unique ID of the message part
   */
  id: string;
  /**
   * Parent message ID this part belongs to
   */
  message_id: string;
  /**
   * Logical part type
   */
  type?: 'text' | 'thinking' | 'tool';
  /**
   * Legacy/alternate part type field
   */
  part_type?: 'text' | 'thinking' | 'tool';
  /**
   * Ordering fields within the message
   */
  order?: number;
  block_order?: number;
  /**
   * Common status flags
   */
  is_done?: boolean;
  is_streaming?: boolean;
  status?: string;
  finished_at?: string;
  /**
   * Optional display name for the part/tool
   * NOTE: for message_part.updated events this may contain an event key like
   * \"message_part.updated\" – we sanitize that before storing.
   */
  name?: string;
  /**
   * Optional tool execution payloads
   */
  result?: unknown;
  error?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task_execution?: any;
  task_execution_id?: string;
}

/**
 * message_part.added
 *
 * Fired once when a new part is created. Contains the static metadata
 * needed to render the tool header immediately (name, provider, etc.).
 */
export interface MessagePartAddedEventData extends BaseMessagePartEventData {
  type: 'tool' | 'text' | 'thinking';
  /**
   * Initial full arguments payload (may be empty string and then streamed via deltas)
   */
  arguments?: string;
  /**
   * Tool name, e.g. \"web_search\"
   */
  name?: string;
  /**
   * Backend provider information (anthropic, openai, etc.)
   */
  provider?: string;
  provider_id?: string;
  /**
   * Provider-specific class of call, e.g. \"web_search_call\"
   */
  provider_item_type?: string;
  /**
   * Tool call identifier used by the provider
   */
  tool_call_id?: string;
  /**
   * Whether intent-based execution is used
   */
  use_intent?: boolean;
}

/**
 * message_part.updated
 *
 * High-frequency streaming updates. For tool parts this carries
 * ordered argument deltas (delta + index) that we feed into the
 * streaming helpers to reconstruct the full JSON arguments.
 */
export interface MessagePartUpdatedEventData extends BaseMessagePartEventData {
  /**
   * Streaming text/argument delta
   *
   * For tool parts this is a JSON fragment that will be aggregated
   * in the messagePartsSlice via processArgumentsDelta.
   */
  delta?: string;
  /**
   * Ordered index of this delta chunk. Gaps are buffered until
   * all preceding chunks arrive.
   */
  index?: number;
  /**
   * For updated events the backend sometimes sends
   * name: \"message_part.updated\" – we treat this as metadata,
   * NOT as the tool name, and sanitize it before writing to state.
   */
  name?: string;
  text?: string;
  arguments?: string;
}

/**
 * message_part.completed
 *
 * Terminal update for a part. Carries any final status fields and
 * optionally the fully materialized tool result.
 */
export interface MessagePartCompletedEventData extends BaseMessagePartEventData {
  is_done?: boolean;
  is_streaming?: boolean;
}

/**
 * Unified type for any message_part.* event that we route through
 * the message part handlers.
 */
export type MessagePartEventData =
  | MessagePartAddedEventData
  | MessagePartUpdatedEventData
  | MessagePartCompletedEventData;

/**
 * Extracted event data result
 */
interface ExtractedEvent {
  eventData: EventData;
  eventType: string;
  timestamp: string;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Check if a string is an invalid tool name (event type keyword)
 * Returns true if the name should be rejected
 */
const isInvalidToolName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const lowerName = name.toLowerCase().trim();
  
  // Exact matches of event keywords
  const EVENT_KEYWORDS = [
    'updated', 'update',
    'added', 'add', 
    'completed', 'complete',
    'deleted', 'delete',
    'created', 'create',
    'removed', 'remove',
    'started', 'start',
    'finished', 'finish',
    'failed', 'fail',
  ];
  
  if (EVENT_KEYWORDS.includes(lowerName)) {
    return true;
  }
  
  // Also reject if the name is suspiciously short (< 3 chars) or generic
  if (lowerName.length < 3) {
    return true;
  }
  
  return false;
};

/**
 * Sanitize message part event data to prevent field pollution
 * Filters out event type keywords that might appear in data fields
 */
const sanitizeMessagePartData = (eventData: MessagePartEventData): MessagePartEventData => {
  const sanitized = { ...eventData };
  
  // Remove invalid name field
  if (sanitized.name && isInvalidToolName(sanitized.name)) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Filtered invalid tool name "${sanitized.name}" from event data (part: ${sanitized.id}). ` +
      `The correct name should come from task_execution.tool.name.`
    );
    delete sanitized.name;
  }
  
  // Also sanitize task_execution.tool.name if present
  if (sanitized.task_execution && typeof sanitized.task_execution === 'object') {
    const execution = sanitized.task_execution as Record<string, unknown>;
    if (execution.tool && typeof execution.tool === 'object') {
      const tool = execution.tool as Record<string, unknown>;
      if (tool.name && typeof tool.name === 'string' && isInvalidToolName(tool.name)) {
        // eslint-disable-next-line no-console
        console.warn(
          `⚠️ Filtered invalid tool name "${tool.name}" from task_execution.tool.name (part: ${sanitized.id})`
        );
        delete tool.name;
      }
    }
  }

  // Sanitize meta_data.name if present (used for certain provider types)
  if (sanitized.meta_data && typeof sanitized.meta_data === 'object') {
    const meta = sanitized.meta_data as Record<string, unknown>;
    if (meta.name && typeof meta.name === 'string' && isInvalidToolName(meta.name)) {
      // eslint-disable-next-line no-console
      console.warn(
        `⚠️ Filtered invalid tool name "${meta.name}" from meta_data.name (part: ${sanitized.id})`,
      );
      delete meta.name;
    }
  }
  
  return sanitized;
};

// Register handler for high-frequency streaming updates
// Only 'updated' events are batched - lifecycle events are processed immediately
messagePartBatcher.registerHandler('updated', (eventData) => {
  const sanitizedData = sanitizeMessagePartData(eventData as MessagePartEventData);
  dispatch(updateMessagePart(sanitizedData as unknown as UpdateMessagePartPayload));
});

/**
 * Extract and validate event data from WebSocket message
 */
export const extractEventData = (event: WebSocketEvent): ExtractedEvent | null => {
  const eventData = event.data;

  if (!eventData) {
    // eslint-disable-next-line no-console
    console.warn('Hermes WS: AGENT_RESPONSE missing event data, skipping');
    return null;
  }

  const eventType = event.type;
  const timestamp = event.timestamp || new Date().toISOString();

  return { eventData, eventType, timestamp };
};

/**
 * Handle activation lifecycle events
 */
export const handleActivationLifecycle = (
  eventData: EventData,
  eventType: string,
  timestamp: string,
): void => {
  dispatch(
    addActivationLifecycle({
      response_id: eventData.response_id ?? '',
      agent_id: eventData.agent_id ?? '',
      thread_id: eventData.thread_id ?? '',
      event_type: eventType,
      event_data: eventData,
      timestamp,
    }),
  );

  // Complete activation when scheduled or rescheduled
  if (['activation.scheduled', 'activation.rescheduled'].includes(eventType)) {
    dispatch(
      completeActivationLifecycle({
        response_id: eventData.response_id ?? '',
        thread_id: eventData.thread_id ?? '',
      }),
    );
  }

  // Discard activation when discarded
  if (eventType === 'activation.discarded') {
    dispatch(
      discardActivationLifecycle({
        response_id: eventData.response_id ?? '',
        thread_id: eventData.thread_id ?? '',
      }),
    );
  }
};

/**
 * Handle response lifecycle events
 */
export const handleResponseLifecycle = (
  eventData: EventData,
  eventType: string,
  timestamp: string,
): void => {
  if (eventData && eventData.response_id) {
    dispatch(
      addResponseLifecycle({
        response_id: eventData.response_id ?? '',
        agent_id: eventData.agent_id ?? '',
        thread_id: eventData.thread_id ?? '',
        event_type: eventType,
        event_data: eventData,
        timestamp,
      }),
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn('⚠️ WhisperStream WS: Received response event without response_id');
  }

  // Complete response lifecycle on terminal events
  const terminalEvents = [
    'response.completed',
    'response.failed',
    'response.empty',
    'response.stopped',
    'response.interrupted',
    'response.suspended',
    'response.requeued',
  ];

  if (terminalEvents.includes(eventType)) {
    dispatch(
      completeResponseLifecycle({
        response_id: eventData.response_id ?? '',
        thread_id: eventData.thread_id ?? '',
        message_id: eventData.message_id ?? '',
        status: eventType.replace('response.', ''),
      }),
    );
  }
};

/**
 * Handle response started event
 */
export const handleResponseStarted = (eventData: EventData, timestamp?: string): void => {
  messagePartBatcher.flush();
  batch(() => {
    if (eventData.message_id) {
      const messageData = {
        id: eventData.message_id,
        thread_id: eventData.thread_id ?? '',
        member_id: eventData.room_member_id ?? '',
        date_creation: timestamp ?? new Date().toISOString(),
        text: '',
        is_streaming: true,
        response_id: eventData.response_id ?? '',
      } satisfies Partial<Message>;
      dispatch(addMessage(messageData as Message));
    }
    dispatch(addRunningResponse({
      id: eventData.response_id ?? '',
      llm_response_id: eventData.response_id ?? '',
    }));
  });
};

/**
 * Handle response completed event
 */
export const handleResponseCompleted = (eventData: EventData): void => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse({
      id: eventData.response_id ?? '',
    }));
    if (eventData.message_id) {
      dispatch(
        updateMessageStreamingState({
          messageId: eventData.message_id,
          isStreaming: false,
        }),
      );
    }
  });
};

/**
 * Handle response empty event
 */
export const handleResponseEmpty = (eventData: EventData): void => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse({
      id: eventData.response_id ?? '',
    }));
    if (eventData.message_id) {
      dispatch(
        updateMessageStreamingState({
          messageId: eventData.message_id,
          isStreaming: false,
        }),
      );

      const emptyMessage = {
        id: eventData.message_id,
        thread_id: eventData.thread_id ?? '',
        member_id: '',
        date_creation: new Date().toISOString(),
        meta_data: {
          is_empty: true,
        },
      } satisfies Partial<Message>;
      dispatch(addMessage(emptyMessage as Message));
    }
  });
};

/**
 * Handle response failed event
 */
export const handleResponseFailed = (eventData: EventData): void => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse({
      id: eventData.response_id ?? '',
    }));
    if (eventData.message_id) {
      dispatch(
        updateMessageStreamingState({
          messageId: eventData.message_id,
          isStreaming: false,
        }),
      );

      const failedMessage = {
        id: eventData.message_id,
        thread_id: eventData.thread_id ?? '',
        member_id: '',
        date_creation: new Date().toISOString(),
        meta_data: {
          error_code: eventData.error_code as string,
          error_message: eventData.error_message as string,
          error_type: eventData.error_type as string,
          failed_in: eventData.failed_in as string,
          retryable: eventData.retryable as boolean,
          total_attempts: eventData.total_attempts as number,
        },
      } satisfies Partial<Message>;
      dispatch(addMessage(failedMessage as Message));

      const errorPartId = `${eventData.message_id}-error`;
      const errorPart = {
        id: errorPartId,
        message_id: eventData.message_id,
        part_type: 'text' as const,
        type: 'text' as const,
        order: 999,
        is_done: true,
        // Store error info in meta_data since these fields don't exist on MessagePart
        meta_data: {
          error_code: eventData.error_code,
          error_message: eventData.error_message,
          error_type: eventData.error_type,
          failed_in: eventData.failed_in,
          retryable: eventData.retryable,
          total_attempts: eventData.total_attempts,
        },
      } satisfies Partial<MessagePart>;
      dispatch(addMessagePart(errorPart as unknown as MessagePart));
    }
  });
};

/**
 * Handle activation failed event
 */
export const handleActivationFailed = (eventData: EventData): void => {
  if (eventData.error_type === 'not_enough_credits') {
    const getSimulatedDate = (): string => {
      const date = new Date();
      const isoString = date.toISOString().slice(0, -1);
      const splitTime = isoString.split('.');
      const milliseconds = splitTime[1] || '000';
      const microseconds = milliseconds.padEnd(6, '0');
      return `${splitTime[0]}.${microseconds}`;
    };

    void analytics.track('credits_finished', {
      thread_id: eventData.thread_id,
      error_type: eventData.error_type,
    });

    const creditsMessage = {
      text: '[no_credits](no_credits/no_credits)',
      thread_id: eventData.thread_id ?? '',
      member_id: 'system',
      date_creation: getSimulatedDate(),
      id: 'credits-not-enough',
    } satisfies Partial<Message>;
    dispatch(addMessage(creditsMessage as Message));
  }
};

/**
 * Handle message part added event
 */
export const handleMessagePartAdded = (eventData: MessagePartEventData): void => {
  const sanitizedData = sanitizeMessagePartData(eventData);
  // Cast to MessagePart - the reducer will normalize and validate
  dispatch(addMessagePart(sanitizedData as unknown as MessagePart));
};

/**
 * Handle message part updated event
 * Batches high-frequency updates for performance
 */
export const handleMessagePartUpdated = (eventData: MessagePartEventData): void => {
  // Sanitization happens in the registered batcher handler above
  messagePartBatcher.enqueue('updated', eventData);
};

/**
 * Handle message part completed event
 * Marks a part as done (is_done = true, is_streaming = false)
 * Passes full event data including tool results, errors, and status
 * This ensures tool executions like websearch get their final results
 */
export const handleMessagePartCompleted = (eventData: MessagePartEventData): void => {
  messagePartBatcher.flush();
  // Sanitize and pass the entire eventData object with all fields (result, error, status, etc.)
  // The reducer will apply these updates before marking the part as complete
  const sanitizedData = sanitizeMessagePartData(eventData);
  // Cast to the union type expected by markMessagePartComplete
  dispatch(markMessagePartComplete(sanitizedData as unknown as string | (Partial<MessagePart> & { id: string })));
};

// ============================================================================
// Operation Registry
// ============================================================================

/**
 * Handler function type for operation registry
 */
type OperationHandler = (eventData: EventData, timestamp?: string) => void;

/**
 * Operation registry - maps event types to handlers
 */
export const AGENT_RESPONSE_OPERATIONS: Record<string, OperationHandler> = {
  'response.scheduled': handleResponseStarted,
  'response.started': handleResponseStarted,
  'response.completed': handleResponseCompleted,
  'response.empty': handleResponseEmpty,
  'response.failed': handleResponseFailed,
  'activation.failed': handleActivationFailed,
  'message_part.added': handleMessagePartAdded as OperationHandler,
  'message_part.updated': handleMessagePartUpdated as OperationHandler,
  'message_part.completed': handleMessagePartCompleted as OperationHandler,
};

