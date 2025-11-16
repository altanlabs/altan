/**
 * Interface Operations
 * Contains all interface event handlers
 */

import { addInterface, updateInterface, deleteInterface } from '../../../../redux/slices/general/index';
import { dispatch } from '../../../../redux/store';

/**
 * Interface event data structure
 */
interface InterfaceEventData {
  id?: string;
  ids?: string[];
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * WebSocket event structure
 */
interface WebSocketEvent {
  type: string;
  data: InterfaceEventData;
}

/**
 * Extracted event data
 */
interface ExtractedEventData {
  eventData: InterfaceEventData;
  eventType: string;
}

/**
 * Extract and validate interface event data
 */
export const extractInterfaceEventData = (data: unknown): ExtractedEventData | null => {
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
export const handleInterfaceCreated = (eventData: InterfaceEventData): void => {
  dispatch(addInterface(eventData));
};

/**
 * Handle interface.updated event (from InterfaceUpdate)
 */
export const handleInterfaceUpdated = (eventData: InterfaceEventData): void => {
  const updatePayload = {
    id: eventData.id || (eventData.ids && eventData.ids[0]),
    ...(eventData.changes || eventData),
  };

  dispatch(updateInterface(updatePayload));
};

/**
 * Handle interface.deleted event (from InterfaceDelete)
 */
export const handleInterfaceDeleted = (eventData: InterfaceEventData): void => {
  const interfaceId = eventData.id || (eventData.ids && eventData.ids[0]);
  dispatch(deleteInterface(interfaceId));
};

/**
 * Operation handler type
 */
type OperationHandler = (eventData: InterfaceEventData) => void;

/**
 * Operation registry for interface events
 */
export const INTERFACE_OPERATIONS: Record<string, OperationHandler> = {
  'interface.created': handleInterfaceCreated,
  'interface.updated': handleInterfaceUpdated,
  'interface.deleted': handleInterfaceDeleted,
};

