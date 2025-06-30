import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
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
    hasError(state, action) {
      const error = action.payload;
      state.isLoading = false;
      state.error = error;
    },
    clearState(state) {
      state.isLoading = false;
      state.error = null;
      state.initialized = false;
      state.media = [];
    },
    setMedia(state, action) {
      const { items, next_cursor, has_next_page } = action.payload;
      state.media = items.map((i) => ({ name: i.file_name, type: i.mime_type, ...i }));
      state.pagination.hasNextPage = has_next_page;
      state.pagination.cursor = next_cursor;
      state.isLoading = false;
      state.initialized = true;
    },
    setModels(state, action) {
      const { items, next_cursor, has_next_page } = action.payload;
      state.models = items;
      state.pagination.hasNextPage = has_next_page;
      state.pagination.cursor = next_cursor;
      state.isLoading = false;
      state.initialized = true;
    },
    addMedia(state, action) {
      const { mode, file } = action.payload;
      if (mode === 'pre') state.media = [file, ...state.media];
      else state.media.push(file);
    },
    deleteMedia(state, action) {
      const mediaId = action.payload;
      state.media = state.media.filter((m) => m.id !== mediaId);
    },
    deleteModel(state, action) {
      const modelId = action.payload;
      state.models = state.models.filter((m) => m.id !== modelId);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setMedia, setModels, clearState: clearMediaState } = slice.actions;

const TARGETED_GQ = {
  '@fields': ['id'],
  media: {
    '@fields': ['@base@exc:meta_data', 'file_name', 'mime_type'],
    '@filter': { is_chat: { _eq: 'false' } },
    '@paginate': { limit: 25, order_by: 'date_creation', desc: 'true' },
  },
  media3D: {
    '@fields': '@all',
    '@paginate': { limit: 25, order_by: 'date_creation', desc: 'true' },
  },
};

export const getMedia = () => async (dispatch, getState) => {
  const { isLoading, initialized } = getState().media;
  try {
    dispatch(slice.actions.startLoading());
    const { account } = getState().general;
    if (!account || isLoading.media || initialized) return Promise.resolve(true);
    if (!account) throw new Error('undefined account');
    const response = await optimai.post(`/account/${account.id}/gq`, TARGETED_GQ);
    const accountBody = response.data;
    if (accountBody.id !== account.id) {
      throw Error('invalid account!');
    }
    console.log(accountBody);
    dispatch(slice.actions.setMedia(accountBody.media));
    dispatch(slice.actions.setModels(accountBody.media3D));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ error: e.message }));
    return Promise.reject(e);
  }
};

export const createMedia =
  ({ fileName, fileContent, fileType }) =>
  async (dispatch, getState) => {
    try {
      const { account } = getState().general;
      if (!account) throw new Error('undefined account');
      const response = await optimai.post(`/account/${account.id}/media`, {
        file_name: fileName,
        mime_type: fileType,
        file_content: fileContent,
      });
      const { media, media_url } = response.data;
      dispatch(slice.actions.addMedia({ mode: 'pre', file: media }));
      console.log('media.media_url', media.media_url);
      return media_url;
    } catch (e) {
      console.error(`error: could not post media: ${e.message}`);
      dispatch(slice.actions.hasError(e.message));
      return Promise.reject(e);
    }
  };

export const deleteMedia =
  ({ mediaId }) =>
  async (dispatch, getState) => {
    if (!mediaId) return Promise.reject('cannot delete invalid widget');
    try {
      await optimai.delete(`/media/${mediaId}`);
      dispatch(slice.actions.deleteMedia(mediaId));
      return Promise.resolve(true);
    } catch (e) {
      console.error(`error: could not delete media: ${e}`);
      return Promise.reject(e);
    }
  };

export const deleteModel =
  ({ modelId }) =>
  async (dispatch, getState) => {
    if (!modelId) return Promise.reject('cannot delete invalid widget');
    try {
      await optimai.delete(`/media/3d/${modelId}`);
      dispatch(slice.actions.deleteModel(modelId));
      return Promise.resolve(true);
    } catch (e) {
      console.error(`error: could not delete media: ${e}`);
      return Promise.reject(e);
    }
  };

export const createModel =
  ({ data }) =>
  async (dispatch, getState) => {
    try {
      const { account } = getState().general;
      if (!account) throw new Error('undefined account');
      const response = await optimai.post(`/media/${account.id}/models`, data);
      const { media } = response.data;
      dispatch(slice.actions.addMedia({ mode: 'pre', file: media }));
      return Promise.resolve('success');
    } catch (e) {
      console.error(`error: could not post media: ${e.message}`);
      dispatch(slice.actions.hasError(e.message));
      return Promise.reject(e);
    }
  };
