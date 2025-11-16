/**
 * Room Selectors
 * Selectors for core room state
 */
import { createSelector } from '@reduxjs/toolkit';

import type {
  RootState,
  RoomState,
  Room,
  Account,
  AuthorizationRequest,
  SearchRoomsState,
  UserRoomsPagination,
} from '../types/state';

/**
 * Get a nested property from an object
 * @param stateObj - The object to get the property from
 * @param attribute - The attribute to get the property from
 * @returns The property value
 */
export const getNestedProperty = (stateObj: any, attribute: string): any => {
  if (!attribute?.length) {
    return stateObj;
  }
  return attribute.split('.').reduce((prev, attr) => prev?.[attr], stateObj);
};

export const selectRoomState = (state: RootState): RoomState => state.room;

export const selectRoom = (state: RootState): Room | null => state.room._room.room;

export const selectRoomId = (state: RootState): string | undefined => selectRoom(state)?.id;

export const selectRoomAttribute = (attribute: string) =>
  createSelector([selectRoom], (room): any => getNestedProperty(room, attribute));

export const selectRoomContext = (state: RootState): any => state.room._room.roomContext;

export const selectAccount = (state: RootState): Account | null => state.room._room.account;

export const selectAccountId = (state: RootState): string | undefined =>
  state.room._room.account?.id;

export const selectRoomAccountId = (state: RootState): string | undefined =>
  state.room._room.account?.id;

// Authorization requests selector
export const selectAuthorizationRequests = createSelector(
  [(state: RootState) => state.room._room.authorization_requests],
  (authorizationRequests: AuthorizationRequest[]): AuthorizationRequest[] =>
    authorizationRequests.filter((request) => !request.is_completed),
);

// User rooms selectors
export const selectUserRooms = (state: RootState): Room[] => state.room._room.userRooms;

export const selectUserRoomsPagination = (state: RootState): UserRoomsPagination =>
  state.room._room.userRoomsPagination;

// Search selectors
export const selectSearchRooms = (state: RootState): SearchRoomsState =>
  state.room._room.searchRooms;
export const selectSearchRoomsQuery = (state: RootState): string => selectSearchRooms(state).query;
export const selectSearchRoomsResults = (state: RootState): Room[] =>
  selectSearchRooms(state).results;
export const selectSearchRoomsLoading = (state: RootState): boolean =>
  selectSearchRooms(state).isSearching;
export const selectSearchRoomsHasResults = (state: RootState): boolean =>
  selectSearchRooms(state).hasResults;

