/**
 * Room Slice
 * Manages core room state including room data, public/user rooms, and search
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  Room,
  Account,
  SearchRoomsState,
  UserRoomsPagination,
  AuthorizationRequest,
  SetRoomPayload,
  SetUserRoomsPayload,
  RoomUpdatePayload,
  UpdateAuthorizationRequestPayload,
} from '../types/state';

// Room context can be any shape for extensibility
type RoomContext = Record<string, unknown> | null;

interface RoomSliceState {
  room: Room | null;
  userRooms: Room[];
  userRoomsPagination: UserRoomsPagination;
  searchRooms: SearchRoomsState;
  account: Account | null;
  roomContext: RoomContext;
  authorization_requests: AuthorizationRequest[];
}

const initialState: RoomSliceState = {
  room: null,
  userRooms: [],
  userRoomsPagination: {
    hasNextPage: false,
    nextCursor: null,
    isLoadingMore: false,
  },
  searchRooms: {
    results: [],
    isSearching: false,
    query: '',
    hasResults: false,
  },
  account: null,
  roomContext: null, // Context to append to all messages in this room
  authorization_requests: [],
};

// ============================================================================
// Helper Functions (DRY Principle)
// ============================================================================

/**
 * Extracts Room fields from a payload object, filtering out nested objects
 * @param roomObject - The incoming room object with potential extra fields
 * @returns Clean Room object with only Room interface fields
 */
const extractRoomFields = (roomObject: SetRoomPayload['room']): Room => {
  const room: Room = {
    id: roomObject.id,
    name: roomObject.name,
    is_dm: roomObject.is_dm,
  };

  // Only add optional fields if they exist
  if (roomObject.description !== null && roomObject.description !== undefined) {
    room.description = roomObject.description;
  }
  if (roomObject.avatar_url !== undefined) {
    room.avatar_url = roomObject.avatar_url;
  }
  if (roomObject.policy !== undefined) {
    room.policy = roomObject.policy;
  }
  if (roomObject.meta_data !== undefined) {
    room.meta_data = roomObject.meta_data;
  }
  if (roomObject.account_id !== undefined) {
    room.account_id = roomObject.account_id;
  }
  if (roomObject.external_id !== undefined) {
    room.external_id = roomObject.external_id;
  }

  return room;
};

/**
 * Safely applies partial changes to a Room object
 * Filters out undefined values to avoid overwriting with undefined
 * Uses Immer's draft type for Redux Toolkit compatibility
 */
const applyRoomChanges = (target: Room, changes: Partial<Room>): void => {
  // Type assertion is safe here because we're in an Immer draft context
  const mutableTarget = target as unknown as Record<string, unknown>;
  const mutableChanges = changes as Record<string, unknown>;

  Object.entries(mutableChanges).forEach(([key, value]) => {
    if (value !== undefined) {
      mutableTarget[key] = value;
    }
  });
};

/**
 * Updates a room object in place with changes
 * Used to avoid code duplication across multiple room arrays
 */
const updateRoomInArray = (
  rooms: Room[],
  roomId: string,
  changes: Partial<Room>
): void => {
  const index = rooms.findIndex((room) => room.id === roomId);
  if (index !== -1) {
    applyRoomChanges(rooms[index], changes);
  }
};

/**
 * Check if we're in development mode
 * Follows DRY - single source of truth for environment check
 */
const isDevelopment = (): boolean => {
  /* eslint-disable no-undef */
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
  /* eslint-enable no-undef */
};

/**
 * Log error in development mode only
 * Follows Single Responsibility Principle - dedicated error logging
 */
const logDevError = (message: string, data?: unknown): void => {
  if (isDevelopment() && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console, no-undef
    console.error(message, data ?? '');
  }
};

/**
 * Validates room update payload structure
 */
const validateRoomUpdatePayload = (payload: unknown): payload is { changes: Partial<Room> } => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  
  const { changes } = payload as Record<string, unknown>;
  
  if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
    return false;
  }
  
  return true;
};

/**
 * Validates authorization request update payload
 */
const validateAuthRequestPayload = (payload: unknown): payload is { id: string; changes: Partial<AuthorizationRequest> } => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  
  const { id, changes } = payload as Record<string, unknown>;
  
  if (typeof id !== 'string') {
    return false;
  }
  
  if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
    return false;
  }
  
  return true;
};

const roomSlice = createSlice({
  name: 'room/core',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<SetRoomPayload>) => {
      const { room: roomObject } = action.payload;
      const account = roomObject.account;
      
      state.room = extractRoomFields(roomObject);
      state.account = account ?? null;
    },

    setRoomContext: (state, action: PayloadAction<RoomContext>) => {
      state.roomContext = action.payload;
    },

    setUserRooms: (state, action: PayloadAction<SetUserRoomsPayload>) => {
      const { rooms, hasNextPage, nextCursor, isLoadMore = false } = action.payload;
      if (isLoadMore) {
        state.userRooms = [...state.userRooms, ...rooms];
      } else {
        state.userRooms = rooms;
      }
      state.userRoomsPagination.hasNextPage = hasNextPage;
      state.userRoomsPagination.nextCursor = nextCursor;
      state.userRoomsPagination.isLoadingMore = false;
    },

    setUserRoomsLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.userRoomsPagination.isLoadingMore = action.payload;
    },

    setSearchRoomsQuery: (state, action: PayloadAction<string>) => {
      state.searchRooms.query = action.payload;
      if (!action.payload) {
        // Clear search results when query is empty
        state.searchRooms.results = [];
        state.searchRooms.hasResults = false;
      }
    },

    setSearchRoomsLoading: (state, action: PayloadAction<boolean>) => {
      state.searchRooms.isSearching = action.payload;
    },

    setSearchRoomsResults: (state, action: PayloadAction<Room[]>) => {
      state.searchRooms.results = action.payload;
      state.searchRooms.hasResults = action.payload.length > 0;
      state.searchRooms.isSearching = false;
    },

    roomUpdate: (state, action: PayloadAction<RoomUpdatePayload>) => {
      if (!validateRoomUpdatePayload(action.payload)) {
        logDevError("[roomSlice] Invalid 'changes' in roomUpdate: Must be an object.", {
          received: action.payload,
        });
        return;
      }

      const { changes } = action.payload;

      // Update current room if changes apply
      if (state.room) {
        applyRoomChanges(state.room, changes);
      }

      // Update in userRooms array - using helper function
      if (state.room?.id) {
        updateRoomInArray(state.userRooms, state.room.id, changes);
      }

      // Update in searchRooms results - using helper function
      if (state.room?.id) {
        updateRoomInArray(state.searchRooms.results, state.room.id, changes);
      }
    },

    addAuthorizationRequest: (state, action: PayloadAction<AuthorizationRequest>) => {
      const request = action.payload;
      const existingIndex = state.authorization_requests.findIndex((req) => req.id === request.id);
      if (existingIndex === -1) {
        state.authorization_requests.push(request);
      }
    },

    updateAuthorizationRequest: (state, action: PayloadAction<UpdateAuthorizationRequestPayload>) => {
      if (!validateAuthRequestPayload(action.payload)) {
        logDevError("[roomSlice] Invalid authorization request update payload", {
          received: action.payload,
        });
        return;
      }

      const { id, changes } = action.payload;
      const requestIndex = state.authorization_requests.findIndex((req) => req.id === id);
      
      if (requestIndex !== -1) {
        state.authorization_requests[requestIndex] = {
          ...state.authorization_requests[requestIndex],
          ...changes,
        };
      }
    },

    setAuthorizationRequests: (state, action: PayloadAction<AuthorizationRequest[]>) => {
      const uniqueRequests = action.payload.reduce((acc, request) => {
        if (!acc.find((r) => r.id === request.id)) {
          acc.push(request);
        }
        return acc;
      }, [] as AuthorizationRequest[]);
      state.authorization_requests = uniqueRequests;
    },

    removeAuthorizationRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.authorization_requests = state.authorization_requests.filter(
        (req) => req.id !== requestId,
      );
    },

    clearRoomState: (state) => {
      // Preserve userRooms data when clearing room state (Single Responsibility Principle)
      const preserved = {
        userRooms: [...state.userRooms],
        userRoomsPagination: { ...state.userRoomsPagination },
        searchRooms: { ...state.searchRooms },
      };

      // Reset fields that should be cleared
      state.room = initialState.room;
      state.account = initialState.account;
      state.roomContext = initialState.roomContext;
      state.authorization_requests = initialState.authorization_requests;

      // Restore preserved data
      state.userRooms = preserved.userRooms;
      state.userRoomsPagination = preserved.userRoomsPagination;
      state.searchRooms = preserved.searchRooms;
    },
  },
});

export const {
  setRoom,
  setRoomContext,
  setUserRooms,
  setUserRoomsLoadingMore,
  setSearchRoomsQuery,
  setSearchRoomsLoading,
  setSearchRoomsResults,
  roomUpdate,
  addAuthorizationRequest,
  updateAuthorizationRequest,
  setAuthorizationRequests,
  removeAuthorizationRequest,
  clearRoomState,
} = roomSlice.actions;

export default roomSlice.reducer;

