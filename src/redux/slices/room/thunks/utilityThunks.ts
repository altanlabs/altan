/**
 * Utility Thunks
 * Misc async actions that don't fit other categories
 */
import { getRoomService } from '../../../../services/RoomService';
import type { MediaData } from '../../../../services/types';
import type { AppDispatch, RootState } from '../../../store';
import type { CombinedRoomState } from '../combinedReducer';
import type { Room } from '../types/state';

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for creating media in a room
 */
interface CreateMediaParams {
  fileName: string;
  fileContent: string;
  fileType: string;
}

/**
 * Type-safe accessor for room state from persisted RootState
 * Handles the redux-persist wrapper types properly
 */
interface AppRootState {
  room: CombinedRoomState;
  [key: string]: unknown;
}

// ============================================================================
// Helper Functions (DRY Principle)
// ============================================================================

/**
 * Ensures a room is selected and returns it
 * Throws an error with a descriptive message if no room is selected
 * 
 * @param state - The root Redux state
 * @returns The current room
 * @throws {Error} When no room is currently selected
 */
const ensureRoomSelected = (state: AppRootState): Room => {
  const room = state.room._room.room;
  if (!room) {
    throw new Error('No room selected. Please select a room before performing this action.');
  }
  return room;
};

/**
 * Transforms file parameters into a media creation request
 * Single Responsibility: Transform domain objects to API requests
 * 
 * @param params - The file parameters
 * @returns The formatted media creation request
 */
const buildMediaCreationRequest = (params: CreateMediaParams): MediaData => {
  return {
    file_name: params.fileName,
    mime_type: params.fileType,
    file_content: params.fileContent,
  };
};

// ============================================================================
// Thunks
// ============================================================================

/**
 * Create media (upload file to room)
 * 
 * This thunk handles uploading a file to the currently selected room.
 * It will throw an error if no room is currently selected.
 * 
 * @param params - The file parameters (fileName, fileContent, fileType)
 * @returns Promise resolving to the created media object
 * @throws {Error} When no room is selected or upload fails
 * 
 * @example
 * ```ts
 * dispatch(createMedia({
 *   fileName: 'document.pdf',
 *   fileContent: base64String,
 *   fileType: 'application/pdf'
 * }));
 * ```
 */
export const createMedia =
  (params: CreateMediaParams) =>
  async (_dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState() as unknown as AppRootState;
    const room = ensureRoomSelected(state);
    const request = buildMediaCreationRequest(params);
    
    const roomService = getRoomService();
    return await roomService.createMedia(room.id, request);
  };

