/**
 * Interface Operations
 * Contains all interface event handlers
 */

import { addInterface, updateInterface, deleteInterface } from '../../../../redux/slices/general';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate interface event data
 */
export const extractInterfaceEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid interface event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle interface.created event (from InterfaceNew)
 */
export const handleInterfaceCreated = (eventData) => {
  dispatch(addInterface(eventData));
};

/**
 * Handle interface.updated event (from InterfaceUpdate)
 */
export const handleInterfaceUpdated = (eventData) => {
  const updatePayload = {
    id: eventData.id || (eventData.ids && eventData.ids[0]),
    ...(eventData.changes || eventData),
  };

  dispatch(updateInterface(updatePayload));
};

/**
 * Handle interface.deleted event (from InterfaceDelete)
 */
export const handleInterfaceDeleted = (eventData) => {
  const interfaceId = eventData.id || (eventData.ids && eventData.ids[0]);
  dispatch(deleteInterface(interfaceId));
};

/**
 * Operation registry for interface events
 */
export const INTERFACE_OPERATIONS = {
  'interface.created': handleInterfaceCreated,
  'interface.updated': handleInterfaceUpdated,
  'interface.deleted': handleInterfaceDeleted,
};
