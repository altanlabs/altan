import { createSelector } from '@reduxjs/toolkit';

import { checkArraysEqualsProperties } from '../redux/helpers/memoize.ts';
import {
  selectRoomThreadMain,
  selectRoomThreadsIds,
  selectThreadDrawerDetails,
  selectThreadsById,
} from '../redux/slices/room/selectors/threadSelectors';

export const makeSelectSortedAndFilteredThreads = () =>
  createSelector(
    [
      selectRoomThreadsIds,
      selectThreadsById,
      selectRoomThreadMain,
      selectThreadDrawerDetails,
      (state, status) => status,
      (state, status, searchTerm) => searchTerm,
    ],
    (threadsIds, threads, threadMain, drawer, status, searchTerm) => {
      if (!!drawer.display || !!drawer.isCreation) {
        return null;
      }
      return threadsIds.filter((id) => {
        const thread = threads[id];
        if (!thread) {
          return false;
        }
        if (
          !(
            thread.parent?.thread_id === threadMain.current ||
            (!!threads[threadMain.current]?.is_main &&
              !thread.is_main &&
              !thread.starter_message_id)
          )
        ) {
          return false;
        }
        const matchesSearchTerm = (thread.name || '').toLowerCase().includes(searchTerm);
        const currentStatus = thread.status === 'fenix' ? 'running' : thread.status;
        const matchesStatus = currentStatus === status;
        return matchesSearchTerm && matchesStatus;
      });
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkArraysEqualsProperties('id'),
      },
    },
  );

export const makeSelectMessageChildrenThreads = () =>
  createSelector(
    [
      selectRoomThreadsIds,
      selectThreadsById,
      selectThreadDrawerDetails,
      (state, messageId, threadId, mode) => ({ messageId, threadId, mode }),
    ],
    (threadsIds, threads, drawer, { messageId, threadId, mode }) => {
      if (!messageId) {
        return null;
      }
      const messageThreads =
        (messageId !== drawer.messageId || mode !== 'drawer') &&
        threadsIds.filter(
          (id) => id in threads && threads[id].starter_message_id === messageId && id !== threadId,
        );
      if (!messageThreads) {
        return null;
      }
      return messageThreads;
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkArraysEqualsProperties(),
      },
    },
  );
