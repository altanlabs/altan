/**
 * Message Part Selectors
 * Selectors for message parts (text, thinking, tool)
 */
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { selectMessagesContent } from './messageSelectors';
import type { RootState, MessagePartsState, MessagePart, Message } from '../types/state';

export const selectMessageParts = (state: RootState): MessagePartsState =>
  state.room._messageParts.messageParts;

export const selectMessagePartsById = (state: RootState): Record<string, MessagePart> =>
  selectMessageParts(state).byId;

export const selectMessagePartsAllIds = (state: RootState): string[] =>
  selectMessageParts(state).allIds;

export const selectMessagePartsByMessageId = (state: RootState): Record<string, string[]> =>
  selectMessageParts(state).byMessageId;

export const makeSelectMessageContent = (): ReturnType<typeof createSelector> =>
  createSelector(
    [
      selectMessagesContent,
      selectMessagePartsById,
      selectMessagePartsByMessageId,
      (_state: RootState, messageId: string) => messageId,
    ],
    (
      messagesContent: Record<string, string>,
      partsById: Record<string, MessagePart>,
      partsByMessageId: Record<string, string[]>,
      messageId: string,
    ): string => {
      const messageParts = partsByMessageId[messageId];
      if (messageParts && messageParts.length > 0) {
        return messageParts
          .map((partId) => partsById[partId])
          .filter((part) => part && part.part_type === 'text')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((part) => part.text || '')
          .join('');
      }
      return messagesContent[messageId] || '';
    },
  );

export const makeSelectHasMessageContent = (): ReturnType<typeof createSelector> =>
  createSelector([makeSelectMessageContent()], (content: string): boolean => !!content?.length);

export const makeSelectMessageParts = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsByMessageId, (_state: RootState, messageId: string) => messageId],
    (partsByMessageId: Record<string, string[]>, messageId: string): string[] =>
      partsByMessageId[messageId] || [],
  );

export const makeSelectMessagePartById = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): MessagePart | null =>
      partsById[partId] || null,
  );

interface TextPartContent {
  text: string | undefined;
  is_done: boolean;
  type: 'text' | 'thinking' | 'tool';
}

export const makeSelectTextPartContent = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): TextPartContent | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        text: part.text,
        is_done: part.is_done,
        type: part.type || part.part_type,
      };
    },
  );

interface ToolPartHeader {
  name: string | undefined;
  act_now: string | undefined;
  act_done: string | undefined;
  is_done: boolean;
  status: string | undefined;
  finished_at: string | undefined;
  created_at: string | undefined;
  intent: string | undefined;
  meta_data: Record<string, unknown> | undefined;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeSelectToolPartHeader = () =>
  createCachedSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): ToolPartHeader | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        name: part.name,
        act_now: part.act_now,
        act_done: part.act_done,
        is_done: part.is_done,
        status: part.status,
        finished_at: part.finished_at,
        created_at: part.created_at || part.date_creation,
        intent: part.intent,
        meta_data: part.meta_data,
      };
    },
  )((_state, partId) => `toolPartHeader_${partId}`);

interface ToolPartArguments {
  arguments: string | undefined;
  is_done: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeSelectToolPartArguments = () =>
  createCachedSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): ToolPartArguments | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        arguments: part.arguments,
        is_done: part.is_done,
      };
    },
  )((_state, partId) => `toolPartArgs_${partId}`);

interface ToolPartError {
  error: unknown;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeSelectToolPartError = () =>
  createCachedSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): ToolPartError | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        error: part.error,
      };
    },
  )((_state, partId) => `toolPartError_${partId}`);

interface ToolPartResult {
  result: unknown;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeSelectToolPartResult = () =>
  createCachedSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): ToolPartResult | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        result: part.result,
      };
    },
  )((_state, partId) => `toolPartResult_${partId}`);

interface ToolPartExecution {
  task_execution_id: string | undefined;
  task_execution: unknown;
  execution: unknown;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeSelectToolPartExecution = () =>
  createCachedSelector(
    [selectMessagePartsById, (_state: RootState, partId: string) => partId],
    (partsById: Record<string, MessagePart>, partId: string): ToolPartExecution | null => {
      const part = partsById[partId];
      if (!part) return null;

      return {
        task_execution_id: part.task_execution_id,
        task_execution: part.task_execution,
        execution: part.execution,
      };
    },
  )((_state, partId) => `toolPartExec_${partId}`);

export const makeSelectMessagePartsContent = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, makeSelectMessageParts()],
    (partsById: Record<string, MessagePart>, partIds: string[]): string => {
      return partIds
        .map((partId) => partsById[partId])
        .filter((part) => part && (part.type === 'text' || part.part_type === 'text'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((part) => part.text || '')
        .join('');
    },
  );

export const makeSelectMessagePartsOfType = (
  partType: 'text' | 'thinking' | 'tool',
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, makeSelectMessageParts()],
    (partsById: Record<string, MessagePart>, partIds: string[]): MessagePart[] => {
      return partIds
        .map((partId) => partsById[partId])
        .filter((part) => part && (part.type === partType || part.part_type === partType))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  );

export const makeSelectMessagePartsGrouped = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, makeSelectMessageParts()],
    (partsById: Record<string, MessagePart>, partIds: string[]): Record<string, MessagePart[]> => {
      const parts = partIds
        .map((partId) => partsById[partId])
        .filter((part): part is MessagePart => !!part)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return parts.reduce(
        (acc, part) => {
          const partType = part.type || part.part_type || 'text';
          if (!acc[partType]) {
            acc[partType] = [];
          }
          acc[partType].push(part);
          return acc;
        },
        {} as Record<string, MessagePart[]>,
      );
    },
  );

export const makeSelectMessageHasStreamingParts = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMessagePartsById, makeSelectMessageParts()],
    (partsById: Record<string, MessagePart>, partIds: string[]): boolean => {
      return partIds.some((partId) => {
        const part = partsById[partId];
        return part && !part.is_done;
      });
    },
  );

/**
 * Select tool parts for a specific thread
 * Note: We recompute the messagesIdsByThread mapping locally to avoid circular dependency
 * with threadSelectors (threadSelectors imports from messageSelectors)
 */
export const makeSelectToolPartsByThreadId = (): ReturnType<typeof createSelector> =>
  createSelector(
    [
      selectMessagePartsById,
      selectMessagePartsByMessageId,
      selectMessagesContent,
      (state: RootState) => {
        // Get messages directly from room state to avoid circular import
        return state.room._messages?.messages?.byId || {};
      },
      (_state: RootState, threadId: string) => threadId,
    ],
    (
      partsById: Record<string, MessagePart>,
      partsByMessageId: Record<string, string[]>,
      _messagesContent: Record<string, string>,
      messagesById: Record<string, Message>,
      threadId: string,
    ): MessagePart[] => {
      if (!threadId) return [];

      // Build messagesIdsByThread mapping locally (same logic as threadSelectors)
      const messageIds = Object.keys(messagesById).filter(
        (msgId) => messagesById[msgId]?.thread_id === threadId,
      );

      const toolParts: MessagePart[] = [];

      messageIds.forEach((messageId) => {
        const partIds = partsByMessageId[messageId] || [];
        partIds.forEach((partId) => {
          const part = partsById[partId];
          if (part && (part.type === 'tool' || part.part_type === 'tool')) {
            toolParts.push(part);
          }
        });
      });

      return toolParts.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const blockOrderA = a.block_order ?? 0;
        const blockOrderB = b.block_order ?? 0;
        return blockOrderA - blockOrderB;
      });
    },
  );

