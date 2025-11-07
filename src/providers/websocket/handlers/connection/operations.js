/**
 * Connection Operations
 * Contains all connection event handlers
 */

import { addConnection, updateConnection, deleteConnection } from '../../../../redux/slices/connections';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate connection event data
 */
export const extractConnectionEventData = (data) => {
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
export const handleConnectionCreated = (eventData) => {
  dispatch(addConnection(eventData));
};

/**
 * Handle connection.updated event (from ConnectionUpdate)
 */
export const handleConnectionUpdated = (eventData) => {
  const updatePayload = {
    id: eventData.id || (eventData.ids && eventData.ids[0]),
    ...eventData.changes || eventData,
  };

  dispatch(updateConnection(updatePayload));
};

/**
 * Handle connection.deleted event (from ConnectionDelete)
 */
export const handleConnectionDeleted = (eventData) => {
  dispatch(deleteConnection(eventData));
};

/**
 * Operation registry for connection events
 */
export const CONNECTION_OPERATIONS = {
  'connection.created': handleConnectionCreated,
  'connection.updated': handleConnectionUpdated,
  'connection.deleted': handleConnectionDeleted,
};
