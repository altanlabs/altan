/**
 * Agent Response Event Handlers
 * Separated by concern following Single Responsibility Principle
 */

import { batch } from 'react-redux';

import analytics from '../../../lib/analytics';
import {
  addMessage,
  addMessagePart,
  updateMessageStreamingState,
  addRunningResponse,
  deleteRunningResponse,
  addActivationLifecycle,
  completeActivationLifecycle,
  discardActivationLifecycle,
  addResponseLifecycle,
  completeResponseLifecycle,
  markMessagePartDone,
  deleteMessagePart,
} from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store';
import { messagePartBatcher } from '../../../utils/eventBatcher';

/**
 * Extract and validate event data from WebSocket message
 */
export const extractEventData = (data) => {
  const eventData = data.data?.agent_event || data.data;

  if (!eventData) {
    // eslint-disable-next-line no-console
    console.warn('Hermes WS: AGENT_RESPONSE missing event data, skipping');
    return null;
  }

  const eventType = eventData?.event_name || eventData?.event_type;

  if (!eventType || typeof eventType !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('Hermes WS: AGENT_RESPONSE missing or invalid event_type');
    return null;
  }

  const timestamp = data.timestamp || new Date().toISOString();

  return { eventData, eventType, timestamp };
};

/**
 * Handle activation lifecycle events
 */
export const handleActivationLifecycle = (eventData, eventType, timestamp) => {
  dispatch(
    addActivationLifecycle({
      response_id: eventData.response_id,
      agent_id: eventData.agent_id,
      thread_id: eventData.thread_id,
      event_type: eventType,
      event_data: eventData,
      timestamp,
    }),
  );

  // Complete activation when scheduled or rescheduled
  if (['activation.scheduled', 'activation.rescheduled'].includes(eventType)) {
    dispatch(
      completeActivationLifecycle({
        response_id: eventData.response_id,
        thread_id: eventData.thread_id,
      }),
    );
  }

  // Discard activation when discarded
  if (eventType === 'activation.discarded') {
    dispatch(
      discardActivationLifecycle({
        response_id: eventData.response_id,
        thread_id: eventData.thread_id,
      }),
    );
  }
};

/**
 * Handle response lifecycle events
 */
export const handleResponseLifecycle = (eventData, eventType, timestamp) => {
  if (eventData && eventData.response_id) {
    dispatch(
      addResponseLifecycle({
        response_id: eventData.response_id,
        agent_id: eventData.agent_id,
        thread_id: eventData.thread_id,
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
        response_id: eventData.response_id,
        thread_id: eventData.thread_id,
        message_id: eventData.message_id,
        status: eventType.replace('response.', ''),
      }),
    );
  }
};

/**
 * Handle response started event
 */
export const handleResponseStarted = (eventData, timestamp) => {
  messagePartBatcher.flush();
  batch(() => {
    if (eventData.message_id) {
      const messageData = {
        id: eventData.message_id,
        thread_id: eventData.thread_id,
        member_id: eventData.room_member_id,
        date_creation: timestamp,
        text: '',
        is_streaming: true,
        response_id: eventData.response_id,
      };
      dispatch(addMessage(messageData));
    }
    dispatch(addRunningResponse(eventData));
  });
};

/**
 * Handle response completed event
 */
export const handleResponseCompleted = (eventData) => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse(eventData));
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
export const handleResponseEmpty = (eventData) => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse(eventData));
    if (eventData.message_id) {
      dispatch(
        updateMessageStreamingState({
          messageId: eventData.message_id,
          isStreaming: false,
        }),
      );

      dispatch(
        addMessage({
          id: eventData.message_id,
          thread_id: eventData.thread_id,
          meta_data: {
            is_empty: true,
          },
        }),
      );
    }
  });
};

/**
 * Handle response failed event
 */
export const handleResponseFailed = (eventData) => {
  messagePartBatcher.flush();
  batch(() => {
    dispatch(deleteRunningResponse(eventData));
    if (eventData.message_id) {
      dispatch(
        updateMessageStreamingState({
          messageId: eventData.message_id,
          isStreaming: false,
        }),
      );

      dispatch(
        addMessage({
          id: eventData.message_id,
          thread_id: eventData.thread_id,
          meta_data: {
            error_code: eventData.error_code,
            error_message: eventData.error_message,
            error_type: eventData.error_type,
            failed_in: eventData.failed_in,
            retryable: eventData.retryable,
            total_attempts: eventData.total_attempts,
          },
        }),
      );

      const errorPartId = `${eventData.message_id}-error`;
      dispatch(
        addMessagePart({
          id: errorPartId,
          message_id: eventData.message_id,
          thread_id: eventData.thread_id,
          type: 'error',
          error_code: eventData.error_code,
          error_message: eventData.error_message,
          error_type: eventData.error_type,
          failed_in: eventData.failed_in,
          retryable: eventData.retryable,
          total_attempts: eventData.total_attempts,
          order: 999,
          is_done: true,
        }),
      );
    }
  });
};

/**
 * Handle activation failed event
 */
export const handleActivationFailed = (eventData) => {
  if (eventData.error_type === 'not_enough_credits') {
    const getSimulatedDate = () => {
      const date = new Date();
      const isoString = date.toISOString().slice(0, -1);
      const splitTime = isoString.split('.');
      const milliseconds = splitTime[1] || '000';
      const microseconds = milliseconds.padEnd(6, '0');
      return `${splitTime[0]}.${microseconds}`;
    };

    analytics.track('credits_finished', {
      thread_id: eventData.thread_id,
      error_type: eventData.error_type,
    });

    dispatch(
      addMessage({
        text: '[no_credits](no_credits/no_credits)',
        thread_id: eventData.thread_id,
        member_id: 'system',
        date_creation: getSimulatedDate(),
        id: 'credits-not-enough',
      }),
    );
  }
};

/**
 * Handle message part events
 */
export const handleMessagePartAdded = (eventData) => {
  dispatch(addMessagePart(eventData));
};

export const handleMessagePartUpdated = (eventData) => {
  messagePartBatcher.enqueue('updated', eventData);
};

export const handleMessagePartCompleted = (eventData) => {
  messagePartBatcher.flush();
  dispatch(markMessagePartDone(eventData));
};

export const handleMessagePartDeleted = (eventData) => {
  messagePartBatcher.flush();
  dispatch(deleteMessagePart(eventData));
};

/**
 * Event handler registry - maps event types to handlers
 * Following Open/Closed Principle - easy to extend without modification
 */
export const EVENT_HANDLERS = {
  'response.scheduled': handleResponseStarted,
  'response.started': handleResponseStarted,
  'response.completed': handleResponseCompleted,
  'response.empty': handleResponseEmpty,
  'response.failed': handleResponseFailed,
  'activation.failed': handleActivationFailed,
  'message_part.added': handleMessagePartAdded,
  'message_part.updated': handleMessagePartUpdated,
  'message_part.completed': handleMessagePartCompleted,
  MessagePartDeleted: handleMessagePartDeleted,
};
