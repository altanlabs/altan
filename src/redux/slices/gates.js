import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';
// utils

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  initialized: false,
  gates: [],
};

const slice = createSlice({
  name: 'gates',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action) {
      const error = action.payload;
      state.error = error;
      state.isLoading = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setGates(state, action) {
      state.gates = action.payload;
      state.initialized = true;
      state.isLoading = false;
    },
    addGate(state, action) {
      const gate = action.payload;
      state.gates = [gate, ...state.gates];
    },
    updateGate(state, action) {
      const updatedGate = action.payload;
      const gate = state.gates.find((g) => g.id === updatedGate.id);
      Object.assign(gate, updatedGate);
    },
    deleteGateById(state, action) {
      const gateId = action.payload;
      state.gates = state.gates.filter((gate) => gate.id !== gateId);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { addGate, setGates, clearState: clearGateState } = slice.actions;

// ----------------------------------------------------------------------

const TARGETED_GQ = {
  '@fields': ['id'],
  gates: {
    '@fields': '@all',
    policy: {
      '@fields': '@all',
    },
  },
};

export const getGates = () => async (dispatch, getState) => {
  const { isLoading, initialized } = getState().media;
  try {
    dispatch(slice.actions.startLoading());
    const { account } = getState().general;
    if (!account || isLoading.gates || initialized) return Promise.resolve(true);
    if (!account) throw new Error('undefined account');
    const response = await optimai.post(`/account/${account.id}/gq`, TARGETED_GQ);
    const { id, gates } = response.data;
    if (id !== account.id) {
      throw Error('invalid account!');
    }
    dispatch(slice.actions.setGates(gates.items));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ error: e.message }));
    return Promise.reject(e);
  }
};

export const createGate = (data) => async (dispatch, getState) => {
  const { account } = getState().general;
  if (!account) throw Error('undefined account');
  try {
    const response = await optimai.post(`/account/${account.id}/gate`, data);
    const { gate } = response.data;
    dispatch(slice.actions.addGate(gate));
    return Promise.resolve('success');
  } catch (e) {
    dispatch(slice.actions.hasError(e));
    console.error(`error: could not create portal: ${e}`);
    return Promise.reject(e);
  }
};

export const editGate = (data, gateId) => async (dispatch, getState) => {
  try {
    const response = await optimai.patch(`/gate/${gateId}`, data);
    const { gate } = response.data;
    dispatch(slice.actions.updateGate(gate));
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteGate = (gateId) => async (dispatch, getState) => {
  try {
    await optimai.delete(`/gate/${gateId}`);
    dispatch(slice.actions.deleteGateById(gateId));
    return Promise.resolve('success');
  } catch (e) {
    return Promise.reject(e);
  }
};
