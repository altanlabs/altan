/**
 * Lifecycle Selectors
 * Selectors for activation and response lifecycles
 */
import { createSelector } from '@reduxjs/toolkit';

import { selectMembers } from './memberSelectors';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { checkArraysEqualsProperties } from '../../../helpers/memoize';
import type {
  RootState,
  ActivationLifecyclesState,
  ResponseLifecyclesState,
  ActivationLifecycle,
  ResponseLifecycle,
  MembersState,
  RoomMember,
} from '../types/state';

interface LifecycleWithAgent extends ActivationLifecycle {
  agent: {
    id: string;
    name: string;
    avatar: string | undefined;
  } | null;
}

interface ResponseLifecycleWithAgent extends ResponseLifecycle {
  agent: {
    id: string;
    name: string;
    avatar: string | undefined;
  } | null;
}

export const selectActivationLifecycles = (state: RootState): ActivationLifecyclesState =>
  state.room._lifecycle.activationLifecycles;

export const selectResponseLifecycles = (state: RootState): ResponseLifecyclesState =>
  state.room._lifecycle.responseLifecycles;

export const selectActiveActivationsByThread = (
  threadId: string,
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectActivationLifecycles, selectMembers],
    (lifecycles: ActivationLifecyclesState, members: MembersState): LifecycleWithAgent[] => {
      const activeActivationIds = lifecycles.activeByThread[threadId] || [];
      return activeActivationIds
        .map((responseId) => {
          const lifecycle = lifecycles.byId[responseId];
          if (!lifecycle) return null;

          const roomMember = Object.values(members.byId || {}).find(
            (member: RoomMember) =>
              member?.member?.member_type === 'agent' &&
              member?.member?.agent_id === lifecycle.agent_id,
          );

          return {
            ...lifecycle,
            agent: roomMember
              ? {
                  id: roomMember.member.agent_id!,
                  name: roomMember.member?.agent?.name || 'Agent',
                  avatar: roomMember.member?.agent?.avatar_url,
                }
              : null,
          };
        })
        .filter((item): item is LifecycleWithAgent => item !== null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
  );

export const selectActiveResponsesByThread = (
  threadId: string,
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectResponseLifecycles, selectMembers],
    (lifecycles: ResponseLifecyclesState, members: MembersState): ResponseLifecycleWithAgent[] => {
      const activeResponseIds = lifecycles.activeByThread[threadId] || [];
      return activeResponseIds
        .map((responseId) => {
          const lifecycle = lifecycles.byId[responseId];
          if (!lifecycle) return null;

          const roomMember = Object.values(members.byId || {}).find(
            (member: RoomMember) =>
              member?.member?.member_type === 'agent' &&
              member?.member?.agent_id === lifecycle.agent_id,
          );

          return {
            ...lifecycle,
            agent: roomMember
              ? {
                  id: roomMember.member.agent_id!,
                  name: roomMember.member?.agent?.name || 'Agent',
                  avatar: roomMember.member?.agent?.avatar_url,
                }
              : null,
          };
        })
        .filter((item): item is ResponseLifecycleWithAgent => item !== null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
  );

export const selectResponseLifecycleById = (
  responseId: string,
): ReturnType<typeof createSelector> =>
  createSelector(
    [selectResponseLifecycles],
    (lifecycles: ResponseLifecyclesState): ResponseLifecycle | null =>
      lifecycles.byId[responseId] || null,
  );

interface PlaceholderMessage {
  id: string;
  response_id: string;
  member_id: string;
  thread_id: string;
  date_creation: string;
  isPlaceholder: true;
  meta_data: {
    loading: true;
    status: string;
  };
}

export const makeSelectPlaceholderMessagesForThread = (): ReturnType<typeof createSelector> =>
  createSelector(
    [
      selectActivationLifecycles,
      selectResponseLifecycles,
      selectMembers,
      (_state: RootState, threadId: string) => threadId,
    ],
    (
      activationLifecycles: ActivationLifecyclesState,
      responseLifecycles: ResponseLifecyclesState,
      members: MembersState,
      threadId: string,
    ): PlaceholderMessage[] => {
      const activeActivationIds = activationLifecycles.activeByThread[threadId] || [];
      const activeResponseIds = responseLifecycles.activeByThread[threadId] || [];

      const responsePhaseIds = new Set(activeResponseIds);

      const allActivationsForThread = Object.values(activationLifecycles.byId).filter(
        (lifecycle) => lifecycle.thread_id === threadId && !lifecycle.discarded,
      );

      const activationPlaceholders = allActivationsForThread
        .filter((lifecycle) => {
          if (responsePhaseIds.has(lifecycle.response_id)) return false;

          if (activeActivationIds.includes(lifecycle.response_id)) return true;

          if (lifecycle.completed_at) {
            const completedTime = new Date(lifecycle.completed_at).getTime();
            const now = Date.now();
            return now - completedTime < 5000;
          }

          return false;
        })
        .map((lifecycle) => {
          const roomMember = Object.values(members.byId || {}).find(
            (member: RoomMember) =>
              member?.member?.member_type === 'agent' &&
              member?.member?.agent_id === lifecycle.agent_id,
          );

          if (!roomMember) return null;

          return {
            id: `placeholder-activation-${lifecycle.response_id}`,
            response_id: lifecycle.response_id,
            member_id: roomMember.id,
            thread_id: lifecycle.thread_id,
            date_creation: lifecycle.created_at,
            isPlaceholder: true as const,
            meta_data: {
              loading: true as const,
              status: lifecycle.status,
            },
          };
        })
        .filter((item): item is PlaceholderMessage => item !== null);

      const responsePlaceholders = activeResponseIds
        .map((responseId) => {
          const lifecycle = responseLifecycles.byId[responseId];
          if (!lifecycle || lifecycle.message_id) return null;

          const roomMember = Object.values(members.byId || {}).find(
            (member: RoomMember) =>
              member?.member?.member_type === 'agent' &&
              member?.member?.agent_id === lifecycle.agent_id,
          );

          if (!roomMember) return null;

          return {
            id: `placeholder-response-${responseId}`,
            response_id: responseId,
            member_id: roomMember.id,
            thread_id: lifecycle.thread_id,
            date_creation: lifecycle.created_at,
            isPlaceholder: true as const,
            meta_data: {
              loading: true as const,
              status: lifecycle.status,
            },
          };
        })
        .filter((item): item is PlaceholderMessage => item !== null);

      return [...activationPlaceholders, ...responsePlaceholders].sort(
        (a, b) => new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime(),
      );
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkArraysEqualsProperties(['id', 'status', 'date_creation'] as const),
      },
    },
  );

