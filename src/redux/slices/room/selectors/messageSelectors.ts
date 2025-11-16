/**
 * Message Selectors
 * Selectors for messages, content, and executions
 */
import { createSelector } from '@reduxjs/toolkit';

import { selectMe } from './memberSelectors';
import { checkObjectsEqual } from '../../../helpers/memoize';
import type {
  RootState,
  Message,
  TaskExecution,
  Reaction,
  Attachment,
} from '../types/state';

export const selectMessagesById = (state: RootState): Record<string, Message> | undefined =>
  state.room._messages?.messages?.byId;

export const selectMessagesIds = (state: RootState): string[] | undefined =>
  state.room._messages?.messages?.allIds;

export const selectMessagesContent = (state: RootState): Record<string, string> =>
  state.room._messages.messagesContent;

export const selectMessagesExecutions = (state: RootState): Record<string, string[]> =>
  state.room._messages.messagesExecutions;

export const selectExecutionsById = (state: RootState): Record<string, TaskExecution> =>
  state.room._messages.executions.byId;

export const selectRunningResponses = (state: RootState): Record<string, string> =>
  state.room._lifecycle.runningResponses;

export const selectMessagesCreation = createSelector(
  [selectMessagesById],
  (messages: Record<string, Message> | undefined): Record<string, string> =>
    messages
      ? Object.entries(messages).reduce(
          (acc, [id, message]) => {
            acc[id] = message.date_creation;
            return acc;
          },
          {} as Record<string, string>,
        )
      : {},
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

export const makeSelectMessage = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagesById, (_state: RootState, messageId: string) => messageId],
    (messagesById: Record<string, Message> | undefined, messageId: string): Message | false =>
      !!messageId ? messagesById?.[messageId] || false : false,
  );

export const makeSelectMessageRunning = (): ReturnType<typeof createSelector> => createSelector(
    [selectRunningResponses, (_state: RootState, messageId: string) => messageId],
    (runningResponses: Record<string, string>, messageId: string): boolean =>
      !!(messageId && runningResponses?.[messageId]),
  );

export const makeSelectMessageExecutions = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagesExecutions, (_state: RootState, messageId: string) => messageId],
    (messagesExecutions: Record<string, string[]>, messageId: string): string[] =>
      messagesExecutions[messageId] || [],
  );

export const makeSelectExecution = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectExecutionsById, (_state: RootState, executionId: string) => executionId],
    (executionsById: Record<string, TaskExecution>, executionId: string): TaskExecution | undefined =>
      executionsById[executionId],
  );

export const makeSelectMessageMedia = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessage()], (message: Message | false): Attachment[] | undefined =>
    message ? message?.media?.items : undefined,
  );

export const makeSelectHasMessageMedia = (): ReturnType<typeof createSelector> =>
  createSelector(
    [makeSelectMessageMedia()],
    (media: Attachment[] | undefined): number | undefined => media?.length,
  );

export const makeSelectMessageReactions = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessage()], (message: Message | false): Reaction[] | undefined =>
    message ? message?.reactions?.items : undefined,
  );

export const makeSelectMessageLikeDislikeReactions = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessage()], (message: Message | false): Reaction[] => {
    const reactions = message ? message?.reactions?.items || [] : [];
    return reactions.filter(
      (reaction) => reaction.reaction_type === 'like' || reaction.reaction_type === 'dislike',
    );
  });

export const makeSelectMessageUserLiked = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessage(), selectMe], (message: Message | false, me): boolean => {
    const reactions = message ? message?.reactions?.items || [] : [];
    const memberId = me?.id;
    return reactions.some(
      (reaction) => reaction.reaction_type === 'like' && reaction.member_id === memberId,
    );
  });

export const makeSelectMessageUserDisliked = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessage(), selectMe], (message: Message | false, me): boolean => {
    const reactions = message ? message?.reactions?.items || [] : [];
    const memberId = me?.id;
    return reactions.some(
      (reaction) => reaction.reaction_type === 'dislike' && reaction.member_id === memberId,
    );
  });

