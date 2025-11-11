import React, { memo, useEffect } from 'react';

import ThreadsHistory from './ThreadsHistory.jsx';
import {
  fetchRoomAllThreads,
  selectRoomStateLoading,
  selectRoomStateInitialized,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store.js';

const selectMainThreadInitialized = selectRoomStateInitialized('mainThread');
const selectAllThreadsInitialized = selectRoomStateInitialized('allThreads');
const selectParentThreadLoading = selectRoomStateLoading('mainThread');
const selectAllThreadsLoading = selectRoomStateLoading('allThreads');

const Threads = ({
  hideInput = false,
  title = null,
  description = null,
  suggestions = [],
  renderCredits = false,
  renderFeedback = false,
  show_mode_selector = false,
  ephemeral_mode = false,
}) => {
  const parentThreadInitialized = useSelector(selectMainThreadInitialized);
  const allThreadsInitialized = useSelector(selectAllThreadsInitialized);
  const parentThreadLoading = useSelector(selectParentThreadLoading);
  const allThreadsLoading = useSelector(selectAllThreadsLoading);

  // Main thread is now fetched within fetchRoom, no need for separate effect

  useEffect(() => {
    // Skip fetching threads in ephemeral mode
    if (!ephemeral_mode && !allThreadsInitialized && !allThreadsLoading) {
      dispatch(fetchRoomAllThreads());
    }
  }, [ephemeral_mode, allThreadsInitialized, allThreadsLoading]);

  return (
    <ThreadsHistory
      hideInput={hideInput}
      title={title}
      description={description}
      suggestions={suggestions}
      renderCredits={renderCredits}
      renderFeedback={renderFeedback}
      show_mode_selector={show_mode_selector}
      ephemeral_mode={ephemeral_mode}
    />
  );
};

export default memo(Threads);
