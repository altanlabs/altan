/**
 * Authorization Request Operations
 * Contains all authorization request event handlers
 */

import type {
  AuthorizationRequestEventData,
  ExtractedAuthorizationRequestEvent,
  AuthorizationRequestUpdateData,
  AuthorizationOperationsRegistry,
  AuthorizationRequest,
} from './types';
import {
  addAuthorizationRequest,
  updateAuthorizationRequest,
} from '../../../../redux/slices/room/slices/roomSlice';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate authorization request event data
 */
export const extractAuthorizationRequestEventData = (
  data: AuthorizationRequestEventData
): ExtractedAuthorizationRequestEvent | null => {
  if (!data || !data.type || !data.data) {
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle authorization_request.created event (from AuthorizationRequestNew)
 */
export const handleAuthorizationRequestCreated = (eventData: unknown): void => {
  const authRequestData = eventData as AuthorizationRequest;
  dispatch(addAuthorizationRequest(authRequestData));
};

/**
 * Handle authorization_request.updated event (from AuthorizationRequestUpdate)
 */
export const handleAuthorizationRequestUpdated = (eventData: unknown): void => {
  const updateData = eventData as AuthorizationRequestUpdateData;
  const id = updateData.id || (updateData.ids && updateData.ids[0]);
  
  if (!id) return;

  const { id: _id, ids: _ids, changes, ...rest } = updateData;

  dispatch(
    updateAuthorizationRequest({
      id,
      changes: changes || rest,
    })
  );
};

/**
 * Handle authorization_request.deleted event
 */
export const handleAuthorizationRequestDeleted = (eventData: unknown): void => {
  // Handle deletion if needed in the future
  void eventData;
};

/**
 * Operation registry for authorization request events
 */
export const AUTHORIZATION_OPERATIONS: AuthorizationOperationsRegistry = {
  'authorization_request.created': handleAuthorizationRequestCreated,
  'authorization_request.updated': handleAuthorizationRequestUpdated,
  'authorization_request.deleted': handleAuthorizationRequestDeleted,
};
