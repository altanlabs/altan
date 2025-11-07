/**
 * Message Operations
 * Contains all message event handlers
 */

import {
  addMessage,
  removeMessage,
  addMessageReaction,
} from '../../../../redux/slices/room';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate message event data
 */
export const extractMessageEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid message event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle message.created event
 */
export const handleMessageCreated = (eventData) => {
  dispatch(addMessage(eventData));
};

/**
 * Handle message.updated event
 */
export const handleMessageUpdated = (eventData) => {
  // addMessage will merge with existing message if it exists
  dispatch(addMessage(eventData));
};

/**
 * Handle message.deleted event
 */
export const handleMessageDeleted = (eventData) => {
  const deletePayload = {
    ids: [eventData.id],
  };
  dispatch(removeMessage(deletePayload));
};

/**
 * Handle message.reaction_added event
 */
export const handleMessageReactionAdded = (eventData) => {
  dispatch(addMessageReaction(eventData));
};

/**
 * Operation registry for message events
 */
export const MESSAGE_OPERATIONS = {
  'message.created': handleMessageCreated,
  'message.updated': handleMessageUpdated,
  'message.deleted': handleMessageDeleted,
  'message.reaction.created': handleMessageReactionAdded,
};
