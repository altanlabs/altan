/**
 * Media Slice - Redux state management for media and 3D models
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMediaService } from '../../services';
import type { MediaItem, Media3D, MediaListResponse, Media3DListResponse } from '../../services';
import type { AppThunk, RootState } from '../store';

// ----------------------------------------------------------------------

/**
 * Pagination state
 */
interface PaginationState {
  limit: number;
  order_by: string;
  desc: boolean;
  hasNextPage?: boolean;
  cursor?: string | null;
}

/**
 * Media state structure
 */
interface MediaState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  media: MediaItem[];
  models: Media3D[];
  pagination: PaginationState;
}

const initialState: MediaState = {
  isLoading: false,
  error: null,
  initialized: false,
  media: [],
  models: [],
  pagination: {
    limit: 20,
    order_by: 'date_creation',
    desc: true,
  },
};

const slice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearState(state) {
      state.isLoading = false;
      state.error = null;
      state.initialized = false;
      state.media = [];
    },
    setMedia(state, action: PayloadAction<MediaListResponse>) {
      const { items, next_cursor, has_next_page } = action.payload;
      state.media = items.map((i) => ({ 
        ...i,
        name: i.file_name, 
        type: i.mime_type,
      }));
      state.pagination.hasNextPage = has_next_page;
      state.pagination.cursor = next_cursor;
      state.isLoading = false;
      state.initialized = true;
    },
    setModels(state, action: PayloadAction<Media3DListResponse>) {
      const { items, next_cursor, has_next_page } = action.payload;
      state.models = items;
      state.pagination.hasNextPage = has_next_page;
      state.pagination.cursor = next_cursor;
      state.isLoading = false;
      state.initialized = true;
    },
    addMedia(state, action: PayloadAction<{ mode: 'pre' | 'post'; file: MediaItem }>) {
      const { mode, file } = action.payload;
      if (mode === 'pre') {
        state.media = [file, ...state.media];
      } else {
        state.media.push(file);
      }
    },
    deleteMedia(state, action: PayloadAction<string>) {
      const mediaId = action.payload;
      state.media = state.media.filter((m) => m.id !== mediaId);
    },
    deleteModel(state, action: PayloadAction<string>) {
      const modelId = action.payload;
      state.models = state.models.filter((m) => m.id !== modelId);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setMedia, setModels, clearState: clearMediaState } = slice.actions;

// ----------------------------------------------------------------------

/**
 * Get media selector
 */
export const selectMedia = (state: RootState) => state.media;

// ----------------------------------------------------------------------
// Thunks
// ----------------------------------------------------------------------

/**
 * Fetch account media and 3D models
 */
export const getMedia = (): AppThunk => async (dispatch, getState) => {
  const { isLoading, initialized } = getState().media;
  
  try {
    dispatch(slice.actions.startLoading());
    
    const { account } = getState().general;
    
    if (!account || isLoading || initialized) {
      return Promise.resolve(true);
    }
    
    if (!account.id) {
      throw new Error('undefined account');
    }
    
    const mediaService = getMediaService();
    const { media, media3D } = await mediaService.fetchAccountMedia(account.id);
    
    dispatch(slice.actions.setMedia(media));
    dispatch(slice.actions.setModels(media3D));
    
    return Promise.resolve('success');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`error: could not get media: ${errorMessage}`);
    dispatch(slice.actions.hasError(errorMessage));
    return Promise.reject(error);
  }
};

/**
 * Create/upload media
 */
interface CreateMediaParams {
  fileName: string;
  fileContent: string;
  fileType: string;
}

export const createMedia = ({ 
  fileName, 
  fileContent, 
  fileType 
}: CreateMediaParams): AppThunk<Promise<string>> => 
  async (dispatch, getState) => {
    try {
      const { account } = getState().general;
      
      if (!account || !account.id) {
        throw new Error('undefined account');
      }
      
      const mediaService = getMediaService();
      const { media, mediaUrl } = await mediaService.createMedia(
        account.id,
        fileName,
        fileType,
        fileContent
      );
      
      dispatch(slice.actions.addMedia({ mode: 'pre', file: media }));
      
      return mediaUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`error: could not post media: ${errorMessage}`);
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(error);
    }
  };

/**
 * Delete media
 */
interface DeleteMediaParams {
  mediaId: string;
}

export const deleteMedia = ({ mediaId }: DeleteMediaParams): AppThunk => 
  async (dispatch) => {
    if (!mediaId) {
      return Promise.reject('cannot delete invalid media');
    }
    
    try {
      const mediaService = getMediaService();
      await mediaService.deleteMedia(mediaId);
      
      dispatch(slice.actions.deleteMedia(mediaId));
      
      return Promise.resolve(true);
    } catch (error) {
      console.error(`error: could not delete media: ${error}`);
      return Promise.reject(error);
    }
  };

/**
 * Delete 3D model
 */
interface DeleteModelParams {
  modelId: string;
}

export const deleteModel = ({ modelId }: DeleteModelParams): AppThunk => 
  async (dispatch) => {
    if (!modelId) {
      return Promise.reject('cannot delete invalid model');
    }
    
    try {
      const mediaService = getMediaService();
      await mediaService.deleteMedia3D(modelId);
      
      dispatch(slice.actions.deleteModel(modelId));
      
      return Promise.resolve(true);
    } catch (error) {
      console.error(`error: could not delete model: ${error}`);
      return Promise.reject(error);
    }
  };

/**
 * Create 3D model
 */
interface CreateModelParams {
  data: Record<string, unknown>;
}

export const createModel = ({ data }: CreateModelParams): AppThunk => 
  async (dispatch, getState) => {
    try {
      const { account } = getState().general;
      
      if (!account || !account.id) {
        throw new Error('undefined account');
      }
      
      const mediaService = getMediaService();
      const media = await mediaService.createMedia3D(account.id, data);
      
      dispatch(slice.actions.addMedia({ 
        mode: 'pre', 
        file: media as unknown as MediaItem 
      }));
      
      return Promise.resolve('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`error: could not post model: ${errorMessage}`);
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(error);
    }
  };

