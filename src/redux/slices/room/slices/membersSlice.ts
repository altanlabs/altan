/**
 * Members Slice
 * Manages room members state
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { MembersState, RoomMember, AddMemberPayload } from '../types/state';

interface MembersSliceState {
  members: MembersState;
  me: RoomMember | null;
}

const initialState: MembersSliceState = {
  members: {
    byId: {},
    allIds: [],
  },
  me: null,
};

const membersSlice = createSlice({
  name: 'room/members',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<{ members: RoomMember[]; currentUserId?: string }>) => {
      const { members, currentUserId } = action.payload;

      if (!members || !Array.isArray(members)) {
        console.warn('⚠️ setMembers: Invalid members payload', action.payload);
        return;
      }

      console.log(`✅ Setting ${members.length} members in Redux state`);

      // Reset members state
      state.members.byId = {};
      state.members.allIds = [];
      state.me = null;

      // Add all members in one batch
      members.forEach((member) => {
        if (!member || !member.id) {
          console.warn('⚠️ Skipping invalid member:', member);
          return;
        }

        state.members.byId[member.id] = member;
        state.members.allIds.push(member.id);

        // Set 'me' if this is the current user
        if (currentUserId && member.member?.user?.id === currentUserId) {
          state.me = member;
          console.log('👤 Current user member found:', member.member?.user?.email || member.id);
        }
      });

      console.log(`✅ Members state updated: ${state.members.allIds.length} members, me:`, state.me ? 'set' : 'not found');
    },

    addMember: (state, action: PayloadAction<AddMemberPayload>) => {
      const payload = action.payload;

      // Handle both old and new payload structures for backward compatibility
      const roomMember = payload.roomMember || payload;
      const currentUserId = payload.currentUserId;

      if (!roomMember || !roomMember.id) {
        console.warn('⚠️ addMember: Invalid roomMember payload', payload);
        return;
      }

      // Avoid duplicates
      if (!state.members.allIds.includes(roomMember.id)) {
      state.members.byId[roomMember.id] = roomMember as RoomMember;
      state.members.allIds.push(roomMember.id);
        console.log('➕ Added member:', roomMember.id);
      }

      if (currentUserId && roomMember.member?.user?.id === currentUserId) {
        state.me = roomMember as RoomMember;
      }
    },

    roomMemberUpdate: (
      state,
      action: PayloadAction<{ ids: string | string[]; changes: Partial<RoomMember> }>,
    ) => {
      const { ids, changes } = action.payload;

      if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
        console.error(
          "❌ Invalid 'ids' in roomMemberUpdate: Must be an array of strings or a single string.",
          { received: action.payload, ids, idsType: typeof ids },
        );
        return;
      }

      if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
        console.error("❌ Invalid 'changes' in roomMemberUpdate: Must be an object.", {
          received: action.payload,
          changes,
          changesType: typeof changes,
        });
        return;
      }

      const memberIds = Array.isArray(ids) ? ids : [ids];

      memberIds.forEach((id) => {
        if (typeof id !== 'string') {
          console.error(`❌ Invalid member id: ${id}`);
          return;
        }

        const member = state.members.byId[id];
        if (member) {
          // Apply changes to each valid member
          Object.keys(changes).forEach((key) => {
            if ((changes as any)[key] !== undefined) {
              (member as any)[key] = (changes as any)[key];
            }
          });

          // Update the 'me' state if this member is the current user
          if (!!state.me && member.id === state.me.id) {
            Object.keys(changes).forEach((key) => {
              if ((changes as any)[key] !== undefined) {
                (state.me as any)[key] = (changes as any)[key];
              }
            });
          }
          console.log('🔄 Updated member:', id);
        } else {
          console.warn(`⚠️ RoomMember with id '${id}' not found.`);
        }
      });
    },

    clearMembers: (state) => {
      console.log('🧹 Clearing all members');
      state.members.byId = {};
      state.members.allIds = [];
      state.me = null;
    },
  },
});

export const { setMembers, addMember, roomMemberUpdate, clearMembers } = membersSlice.actions;

export default membersSlice.reducer;

