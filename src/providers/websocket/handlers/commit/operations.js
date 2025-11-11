/**
 * Commit Operations
 * Contains all commit event handlers
 */

import {
  addInterfaceCommit,
  updateInterfaceCommit,
  deleteInterfaceCommit,
} from '../../../../redux/slices/general';
import { refreshIframe } from '../../../../redux/slices/previewControl';
import { dispatch } from '../../../../redux/store';

/**
 * Extract and validate commit event data
 */
export const extractCommitEventData = (data) => {
  if (!data || !data.type || !data.data) {
    console.warn('Hermes WS: Invalid commit event structure:', data);
    return null;
  }

  const eventType = data.type;
  const eventData = data.data;

  return { eventData, eventType };
};

/**
 * Handle commit.created event (from CommitNew)
 */
export const handleCommitCreated = (eventData) => {
  console.log('handleCommitCreated', eventData);
  const commitPayload = {
    id: eventData.id,
    interface_id: eventData.interface_id,
    ...eventData,
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
export const handleCommitUpdated = (eventData) => {
  console.log('handleCommitUpdated', eventData);
  const updatePayload = {
    id: eventData.id || (eventData.ids && eventData.ids[0]),
    interface_id: eventData.interface_id || eventData.changes?.interface_id,
    ...(eventData.changes || eventData),
  };

  dispatch(updateInterfaceCommit(updatePayload));
};

/**
 * Handle commit.deleted event (from CommitDelete)
 */
export const handleCommitDeleted = (eventData) => {
  const commitId = eventData.id || (eventData.ids && eventData.ids[0]);
  dispatch(deleteInterfaceCommit(commitId));
};

/**
 * Operation registry for commit events
 */
export const COMMIT_OPERATIONS = {
  'commit.created': handleCommitCreated,
  'commit.updated': handleCommitUpdated,
  'commit.deleted': handleCommitDeleted,
};
