/**
 * Thread Selectors
 * Selectors for thread state and operations
 */
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { selectMe } from './memberSelectors';
import { selectMessagesById, selectMessagesIds, selectMessagesCreation } from './messageSelectors';
import { checkArraysEqualsProperties, checkObjectsEqual } from '../../../helpers/memoize';
import type {
  RootState,
  ThreadsState,
  Thread,
  ThreadDrawer,
  ThreadMain,
  TemporaryThread,
  Message,
  RoomMember,
} from '../types/state';

export const selectThreads = (state: RootState): ThreadsState => state.room._threads.threads;

export const selectThreadsById = (state: RootState): Record<string, Thread> =>
  selectThreads(state).byId;

export const selectThreadsIds = (state: RootState): string[] | undefined =>
  state.room._threads?.threads?.allIds;

export const selectMainThread = (state: RootState): string | null =>
  state.room._threads.mainThread;

export const selectRoomThreadMain = (state: RootState): ThreadMain =>
  state.room._threads.thread.main;

export const selectThreadDrawerDetails = (state: RootState): ThreadDrawer =>
  state.room._threads.thread.drawer;

export const selectTemporaryThread = (state: RootState): TemporaryThread | null =>
  state.room._threads.temporaryThread;

export const selectCurrentThread = createSelector(
  [selectRoomThreadMain, selectThreadsById],
  (threadMain: ThreadMain, threads: Record<string, Thread>): Thread | undefined =>
    threadMain.current ? threads[threadMain.current] : undefined,
);

export const selectCurrentDrawerThreadId = (state: RootState): string | null => {
  const drawer = selectThreadDrawerDetails(state);
  return !!drawer.current && !drawer.messageId && !drawer.isCreation ? drawer.current : null;
};

export const selectCurrentDrawerThread = createSelector(
  [selectThreadsById, selectCurrentDrawerThreadId],
  (threads: Record<string, Thread>, threadId: string | null): Thread | null =>
    !threadId ? null : threads[threadId],
);

export const makeSelectHasMessageCreatedParentThreads = (): ReturnType<
  typeof createSelector
> =>
  createSelector(
    [selectThreadsById, (_state: RootState, messageId: string) => messageId],
    (threads: Record<string, Thread>, messageId: string): boolean =>
      !!(
        !!messageId &&
        Object.values(threads).filter((t) => t.starter_message_id === messageId).length
      ),
  );

export const selectDisplayThreadsDrawer = createSelector(
  [selectThreadDrawerDetails],
  (drawer: ThreadDrawer): boolean => !!drawer.display && (!!drawer.current || !!drawer.isCreation),
);

export const selectCurrentDrawerThreadName = createSelector(
  [selectCurrentDrawerThread],
  (currentDrawerThread: Thread | null): string | undefined => currentDrawerThread?.name,
);

export const makeSelectThread = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectThreadsById, (_state: RootState, threadId: string) => threadId],
    (threadsById: Record<string, Thread>, threadId: string): Thread | null =>
      !threadId ? null : threadsById?.[threadId],
  );

export const makeSelectMoreMessages = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectThread()], (thread: Thread | null): boolean => {
    const paginationInfo = thread?.messages?.paginationInfo;
    // Must have BOTH hasNextPage AND startCursor to fetch more
    return !!(paginationInfo?.hasNextPage && paginationInfo.startCursor);
  });

export const MENTION_ANNOTATION_REGEX = /\**\[@([\w\s]+)\]\(\/member\/[a-f0-9\-]+\)\**/g;

export const makeSelectThreadName = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectThread()], (thread: Thread | null): string => {
    if (!thread) {
      return 'Main';
    }
    if (thread.is_main) {
      return 'Main';
    }
    return thread.name?.replace(MENTION_ANNOTATION_REGEX, '@$1') || 'Thread';
  });

export const makeSelectThreadAttribute = (): ReturnType<typeof createSelector> =>
  createSelector(
    [makeSelectThread(), (_state: RootState, _threadId: string, attribute: string) => attribute],
    (thread: Thread | null, attribute: string): unknown => thread?.[attribute as keyof Thread],
  );

export const selectNewThreadPlaceholder = (state: RootState): string => {
  const drawer = selectThreadDrawerDetails(state);
  const messagesById = selectMessagesById(state);
  if (!drawer.messageId || !messagesById) {
    return '#CoolThread';
  }
  const message = messagesById[drawer.messageId];
  const text = message && 'text' in message ? String(message.text) : '';
  const cleanText = text.replace(MENTION_ANNOTATION_REGEX, '@$1') || 'Thread';
  // Truncate to 40 characters
  return cleanText.length > 40 ? cleanText.substring(0, 37) + '...' : cleanText;
};

const selectMessagesThreadIds = createSelector(
  [selectMessagesById],
  (messages: Record<string, Message> | undefined): Record<string, string> => {
    if (!messages) {
      return {};
    }

    const result = Object.entries(messages).reduce(
      (acc, [id, message]) => {
        if (message.thread_id) {
          acc[id] = message.thread_id;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    return result;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const selectMessagesIdsByThread = createSelector(
  [selectMessagesIds, selectMessagesThreadIds],
  (
    allMessageIds: string[] | undefined,
    threadByMessageId: Record<string, string>,
  ): Record<string, string[]> => {
    const messagesIdsByThread: Record<string, string[]> = {};

    allMessageIds?.forEach((msgId) => {
      const tId = threadByMessageId[msgId];
      if (!tId) {
        return;
      }
      if (!messagesIdsByThread[tId]) {
        messagesIdsByThread[tId] = [];
      }
      messagesIdsByThread[tId].push(msgId);
    });

    return messagesIdsByThread;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const makeSelectSortedThreadMessageIds = (): ReturnType<typeof createSelector> =>
  createSelector(
    [
      selectThreadsById,
      selectMessagesIdsByThread,
      selectMessagesById,
      (_state: RootState, threadId: string) => threadId,
    ],
    (
      threadsById: Record<string, Thread>,
      msgsIdsByThread: Record<string, string[]>,
      messagesById: Record<string, Message> | undefined,
      threadId: string,
    ): string[] => {
      const thread = threadId ? threadsById[threadId] : null;
      if (!thread) {
        return [];
      }

      const allMessageIds = thread.parent?.id ? [thread.parent.id] : [];
      const threadMessagesIds = msgsIdsByThread[threadId] || [];

      if (threadMessagesIds.length === 0) {
        return allMessageIds;
      }

      const sorted = [...threadMessagesIds].sort((a, b) => {
        const messageA = messagesById?.[a];
        const messageB = messagesById?.[b];
        const dateA = new Date(messageA?.date_creation ?? 0);
        const dateB = new Date(messageB?.date_creation ?? 0);
        return dateA.getTime() - dateB.getTime();
      });

      const result = [...allMessageIds, ...sorted];

      return result;
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkArraysEqualsProperties(),
      },
    },
  );

export const makeSelectLastMessageOfThread = (): ReturnType<typeof createSelector> =>
  createSelector(
    [makeSelectSortedThreadMessageIds(), selectMessagesById],
    (sortedMessages: string[], messagesById: Record<string, Message> | undefined): Message | null =>
      sortedMessages.length > 0 && messagesById
        ? messagesById[sortedMessages[sortedMessages.length - 1]]
        : null,
    {
      memoizeOptions: {
        resultEqualityCheck: (prev: Message | null, next: Message | null) =>
          prev?.date_creation === next?.date_creation,
      },
    },
  );

export const selectRoomThreadsIds = createSelector(
  [selectThreadsIds, selectThreadsById, selectMessagesIdsByThread, selectMessagesById],
  (
    threadsIds: string[] | undefined,
    threadsById: Record<string, Thread>,
    msgsIdsByThread: Record<string, string[]>,
    messagesById: Record<string, Message> | undefined,
  ): string[] => {
    if (!threadsIds?.length) return [];

    const threadsWithLastDate = threadsIds.map((threadId) => {
      let lastDate = 0;
      const parentId = threadsById[threadId]?.parent?.id;
      if (parentId && messagesById) {
        const parentDate = new Date(messagesById[parentId]?.date_creation || 0).getTime();
        lastDate = Math.max(lastDate, parentDate);
      }

      const messageIds = msgsIdsByThread[threadId] || [];
      for (const msgId of messageIds) {
        const msgDate = new Date(messagesById?.[msgId]?.date_creation || 0).getTime();
        if (msgDate > lastDate) {
          lastDate = msgDate;
        }
      }

      return { threadId, lastDate };
    });

    threadsWithLastDate.sort((a, b) => b.lastDate - a.lastDate);
    return threadsWithLastDate.map((item) => item.threadId);
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeHasUnreadMessages = () =>
  createCachedSelector(
    selectThreadsById,
    selectMessagesIds,
    selectMessagesThreadIds,
    selectMe,
    selectMessagesCreation,
    (_state: RootState, threadId: string) => threadId,
    (
      threads: Record<string, Thread>,
      messagesIds: string[] | undefined,
      messagesThreadIds: Record<string, string>,
      me: RoomMember | null,
      messagesById: Record<string, string>,
      threadId: string,
    ): boolean => {
      if (!threadId || !me) {
        return false;
      }
      const thread = threads[threadId];

      const checkForUnreadMessages = (thread: Thread): boolean => {
        const currentThreadId = thread?.id;
        if (!currentThreadId) {
          return false;
        }
        const messages =
          messagesIds?.filter(
            (id) => id in messagesThreadIds && messagesThreadIds[id] === currentThreadId,
          ) ?? [];
        if (!messages.length) {
          return false;
        }

        const threadReadState = thread.read_state?.[me.id];
        if (!threadReadState) {
          return true;
        }

        if (messages.some((mId) => messagesById[mId] > threadReadState)) {
          return true;
        }

        return Object.values(threads)
          .filter((t) => t.parent?.thread_id === thread.id)
          .some((childThread) => checkForUnreadMessages(childThread));
      };

      return checkForUnreadMessages(thread);
    },
  )((_state, threadId) => threadId);

export const makeSelectThreadMessageCount = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagesIdsByThread, (_state: RootState, threadId: string) => threadId],
    (messagesIdsByThread: Record<string, string[]>, threadId: string): number => {
      if (!threadId || !messagesIdsByThread[threadId]) {
        return 0;
      }
      return messagesIdsByThread[threadId].length;
    },
  );

