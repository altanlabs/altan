import { createSlice } from '@reduxjs/toolkit';

// utils
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});

// Reducer
export default slice.reducer;

// Actions
export const {} = slice.actions;

// ----------------------------------------------------------------------

export const changeUserPassword = (payload) => async (dispatch, _) => {
  try {
    const response = await optimai.post('/auth/user/edit/pwd', payload);
    const { msg, user } = response.data;
    const { id, email } = user;
    // console.log(`Password updated ${msg}: ${JSON.stringify(user)}`);
    return Promise.resolve(email);
  } catch (e) {
    // console.error(`error: could not update password: ${e}`);
    return Promise.reject(e);
  } finally {
    // dispatch(slice.actions.stopLoading());
  }
};
