import { createSlice } from '@reduxjs/toolkit';

// utils
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

// const hasObjectById = (list, id) => {
//   if (list.length === 0) {
//     return false;
//   }
//   let result = false
//   list.forEach((item) => {
//     if (item.id === id) {
//       result = true;
//     }
//   })
//   return result;
// }

// function moveDictToEnd(arr, id) {
//   let index = arr.findIndex(dict => dict.id === id);
//   if (index !== -1) {
//       let dict = arr.splice(index, 1)[0];
//       arr.push(dict);
//   }
// }

const initialState = {
  isLoading: false,
  error: null,
  userId: null,
  account: null, // business or personal account
};

const slice = createSlice({
  name: 'share',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action) {
      const { fileId, error } = action.payload;
      state.isLoading = false;
      state.filesUploading[fileId].error = error;
    },
    setUserId(state, action) {
      const userId = action.payload;
      state.userId = userId;
    },
    setAccount(state, action) {
      const account = action.payload;
      state.account = account;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setUserId, setAccount } = slice.actions;

// ----------------------------------------------------------------------

export const shareFile = (inviteEmail, fileId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  const { id: accountId } = getState().general.account;
  const data = { inviteEmail, fileId }; // construct the data object
  try {
    const response = await optimai.post(`/account/${accountId}/file/share`, data);
    return Promise.resolve(response.data);
  } catch (e) {
    console.error(`error: could not update info: ${e}`);

    const errorMessage =
      e.response && e.response.data ? e.response.data.detail : 'An unexpected error occurred';

    return Promise.reject(errorMessage);
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const shareChatbot = (data) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  const { id: accountId } = getState().general.account;
  try {
    const response = await optimai.post(`/account/${accountId}/file/share`, data);
    return response.data;
  } catch (e) {
    console.error(`error: could not update info: ${e}`);
    dispatch(slice.actions.hasError(e.toString()));
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};
