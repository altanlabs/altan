/**
 * Connection Operations
 * Contains all connection event handlers
 */

import type {
  WebSocketConnectionEvent,
  ExtractedConnectionEvent,
  ConnectionEventData,
  ConnectionOperationsRegistry,
} from './types';
import { addConnection, updateConnection, deleteConnection } from '../../../../redux/slices/connections';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate connection event data
 */
export const extractConnectionEventData = (
  data: WebSocketConnectionEvent,
): ExtractedConnectionEvent | null => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid connection event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle connection.created event (from ConnectionNew)
 */
export const handleConnectionCreated = (eventData: ConnectionEventData): void => {
  dispatch(addConnection(eventData));
};

/**
 * Handle connection.updated event (from ConnectionUpdate)
 */
export const handleConnectionUpdated = (eventData: ConnectionEventData): void => {
  const updatePayload = {
    id: eventData.id || (eventData.ids && eventData.ids[0]),
    ...eventData.changes || eventData,
  };

  dispatch(updateConnection(updatePayload));
};

/**
 * Handle connection.deleted event (from ConnectionDelete)
 */
export const handleConnectionDeleted = (eventData: ConnectionEventData): void => {
  dispatch(deleteConnection(eventData));
};

/**
 * Operation registry for connection events
 */
export const CONNECTION_OPERATIONS: ConnectionOperationsRegistry = {
  'connection.created': handleConnectionCreated,
  'connection.updated': handleConnectionUpdated,
  'connection.deleted': handleConnectionDeleted,
};

