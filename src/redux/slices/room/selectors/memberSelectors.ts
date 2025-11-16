/**
 * Member Selectors
 * Selectors for room members state
 */
import { createSelector } from '@reduxjs/toolkit';

import type { RootState, MembersState, RoomMember } from '../types/state';

export const selectMembers = (state: RootState): MembersState => state.room._members.members;

export const selectMe = (state: RootState): RoomMember | null => state.room._members.me;

export const makeSelectMemberById = (): ReturnType<typeof createSelector> =>
  createSelector(
    [selectMembers, (_state: RootState, memberId: string) => memberId],
    (members: MembersState, memberId: string): RoomMember | null =>
      memberId ? members.byId[memberId] : null,
  );

export const selectTotalMembers = createSelector(
  [selectMembers],
  (members: MembersState): number => members.allIds.length || 1,
);

