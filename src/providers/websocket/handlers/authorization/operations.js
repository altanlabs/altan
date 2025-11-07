/**
 * Authorization Request Operations
 * Contains all authorization request event handlers
 */

import { addAuthorizationRequest, updateAuthorizationRequest } from '../../../../redux/slices/room';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate authorization request event data
 */
export const extractAuthorizationRequestEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid authorization request event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle authorization_request.created event (from AuthorizationRequestNew)
 */
export const handleAuthorizationRequestCreated = (eventData) => {
  dispatch(addAuthorizationRequest(eventData));
};

/**
 * Handle authorization_request.updated event (from AuthorizationRequestUpdate)
 */
export const handleAuthorizationRequestUpdated = (eventData) => {
  const { id, ...changes } = eventData;
  
  const updatePayload = {
    ids: [id || (eventData.ids && eventData.ids[0])],
    changes: eventData.changes || changes,
  };

  dispatch(updateAuthorizationRequest(updatePayload));
};

/**
 * Handle authorization_request.deleted event
 */
export const handleAuthorizationRequestDeleted = (eventData) => {
  // Handle deletion if needed in the future
  console.log('Authorization request deleted:', eventData);
};

/**
 * Operation registry for authorization request events
 */
export const AUTHORIZATION_OPERATIONS = {
  'authorization_request.created': handleAuthorizationRequestCreated,
  'authorization_request.updated': handleAuthorizationRequestUpdated,
  'authorization_request.deleted': handleAuthorizationRequestDeleted,
};

