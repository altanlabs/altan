/**
 * Thread Operations
 * Contains all thread event handlers
 */

import {
  addThread,
  threadUpdate,
  removeThread,
  changeThreadReadState,
} from '../../../../redux/slices/room';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate thread event data
 */
export const extractThreadEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid thread event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle thread.created event
 */
export const handleThreadCreated = (eventData) => {
  dispatch(addThread(eventData));
};

/**
 * Handle thread.updated event
 */
export const handleThreadUpdated = (eventData) => {
  // Transform the flat structure to match the expected format
  const updatePayload = {
    ids: [eventData.id],
    changes: eventData,
  };
  dispatch(threadUpdate(updatePayload));
};

/**
 * Handle thread.deleted event
 */
export const handleThreadDeleted = (eventData) => {
  const deletePayload = {
    ids: [eventData.id],
  };
  dispatch(removeThread(deletePayload));
};

/**
 * Handle thread.read event
 */
export const handleThreadRead = (eventData) => {
  dispatch(changeThreadReadState(eventData));
};

/**
 * Handle thread.opened event (similar to created)
 */
export const handleThreadOpened = (eventData) => {
  dispatch(addThread(eventData));
};

/**
 * Operation registry for thread events
 */
export const THREAD_OPERATIONS = {
  'thread.created': handleThreadCreated,
  'thread.updated': handleThreadUpdated,
  'thread.deleted': handleThreadDeleted,
  'thread.read': handleThreadRead,
  'thread.opened': handleThreadOpened,
};
