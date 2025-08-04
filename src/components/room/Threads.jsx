import React, { memo, useEffect } from 'react';

import ThreadsHistory from './ThreadsHistory.jsx';
import {
  fetchRoomAllThreads,
  fetchRoomParent,
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
}) => {
  const parentThreadInitialized = useSelector(selectMainThreadInitialized);
  const allThreadsInitialized = useSelector(selectAllThreadsInitialized);
  const parentThreadLoading = useSelector(selectParentThreadLoading);
  const allThreadsLoading = useSelector(selectAllThreadsLoading);

  useEffect(() => {
    if (!parentThreadInitialized && !parentThreadLoading) {
      dispatch(fetchRoomParent());
    }
  }, [parentThreadInitialized, parentThreadLoading]);

  useEffect(() => {
    if (!allThreadsInitialized && !allThreadsLoading) {
      dispatch(fetchRoomAllThreads());
    }
  }, [allThreadsInitialized, allThreadsLoading]);

  return (
    <ThreadsHistory
      hideInput={hideInput}
      title={title}
      description={description}
      suggestions={suggestions}
      renderCredits={renderCredits}
    />
  );
};

export default memo(Threads);
