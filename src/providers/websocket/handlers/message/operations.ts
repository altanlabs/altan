/**
 * Message Operations
 * Contains all message event handlers
 */

import {
  addMessage,
  removeMessage,
  addMessageReaction,
} from '../../../../redux/slices/room/slices/messagesSlice';
import { dispatch } from '../../../../redux/store';

/**
 * Media structure for messages
 */
interface MediaStructure {
  items: unknown[];
}

/**
 * Message event data structure
 */
interface MessageEventData {
  id: string;
  media?: unknown[] | MediaStructure;
  [key: string]: unknown;
}

/**
 * Extracted event data
 */
interface ExtractedEventData {
  eventData: MessageEventData;
  eventType: string;
}

/**
 * Extract and validate message event data
 */
export const extractMessageEventData = (data: unknown): ExtractedEventData | null => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid message event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Normalize message data structure
 * Converts WebSocket format to match the format expected by Redux state
 */
const normalizeMessageData = (eventData: MessageEventData): MessageEventData => {
  const normalizedData = { ...eventData };

  // Normalize media: WebSocket sends an array, but Redux expects { items: [] }
  if (Array.isArray(normalizedData.media)) {
    normalizedData.media = { items: normalizedData.media };
  }

  return normalizedData;
};

/**
 * Handle message.created event
 */
export const handleMessageCreated = (eventData: MessageEventData): void => {
  console.log('handleMessageCreated', eventData);
  const normalizedData = normalizeMessageData(eventData);
  dispatch(addMessage(normalizedData));
};

/**
 * Handle message.updated event
 */
export const handleMessageUpdated = (eventData: MessageEventData): void => {
  // addMessage will merge with existing message if it exists
  const normalizedData = normalizeMessageData(eventData);
  dispatch(addMessage(normalizedData));
};

/**
 * Handle message.deleted event
 */
export const handleMessageDeleted = (eventData: MessageEventData): void => {
  const deletePayload = {
    ids: [eventData.id],
  };
  dispatch(removeMessage(deletePayload));
};

/**
 * Handle message.reaction_added event
 */
export const handleMessageReactionAdded = (eventData: MessageEventData): void => {
  dispatch(addMessageReaction(eventData));
};

/**
 * Operation handler type
 */
type OperationHandler = (eventData: MessageEventData) => void;

/**
 * Operation registry for message events
 */
export const MESSAGE_OPERATIONS: Record<string, OperationHandler> = {
  'message.created': handleMessageCreated,
  'message.updated': handleMessageUpdated,
  'message.deleted': handleMessageDeleted,
  'message.reaction.created': handleMessageReactionAdded,
};

