/**
 * Commit Operations
 * Contains all commit event handlers
 */

import type {
  WebSocketCommitEvent,
  ExtractedCommitEvent,
  CommitEventData,
  CommitOperationsRegistry,
} from './types';
import {
  addInterfaceCommit,
  updateInterfaceCommit,
  deleteInterfaceCommit,
} from '../../../../redux/slices/general/index';
import { refreshIframe } from '../../../../redux/slices/previewControl';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate commit event data
 */
export const extractCommitEventData = (
  data: WebSocketCommitEvent,
): ExtractedCommitEvent | null => {
  if (!data || !data.type || !data.data) {
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle commit.created event (from CommitNew)
 */
export const handleCommitCreated = (eventData: CommitEventData): void => {
  const commitPayload = {
    ...eventData,
    id: eventData.id,
    interface_id: eventData.interface_id,
  };

  dispatch(addInterfaceCommit(commitPayload));

  // Wait 2 seconds before refreshing iframe to allow server to deploy
  setTimeout(() => {
    dispatch(refreshIframe());
  }, 2000);
};

/**
 * Handle commit.updated event (from CommitUpdate)
 */
export const handleCommitUpdated = (eventData: CommitEventData): void => {
  const id = eventData.id || (eventData.ids && eventData.ids[0]);
  const interface_id = eventData.interface_id || eventData.changes?.interface_id;
  
  if (!id || !interface_id) return;

  const updatePayload = {
    id,
    interface_id,
    ...(eventData.changes || eventData),
  };

  dispatch(updateInterfaceCommit(updatePayload));
};

/**
 * Handle commit.deleted event (from CommitDelete)
 */
export const handleCommitDeleted = (eventData: CommitEventData): void => {
  const commitId = eventData.id || (eventData.ids && eventData.ids[0]);
  
  if (!commitId) return;
  
  dispatch(deleteInterfaceCommit(commitId));
};

/**
 * Operation registry for commit events
 */
export const COMMIT_OPERATIONS: CommitOperationsRegistry = {
  'commit.created': handleCommitCreated,
  'commit.updated': handleCommitUpdated,
  'commit.deleted': handleCommitDeleted,
};

