import { createSlice } from '@reduxjs/toolkit';
import { batch } from 'react-redux';

import { optimai, optimai_room } from '@utils/axios';

import { paginateCollection } from './utils/collections';

const initialState = {
  error: {
    gates: null,
    rooms: null,
    gate: null,
    connecting: null,
  },
  isConnectingGate: false,
  dm: null,
  loading: {
    gates: false,
    rooms: false,
    gate: false,
    connecting: false,
  },
  initialized: {
    gates: false,
    rooms: false,
    gate: false,
    connecting: false,
  },
  accountId: null,
  gates: {
    byId: {},
    allIds: [],
  },
  gate: null,
  space: null,
  layout: null,
  rooms: {
    byId: {},
    allIds: [],
    byName: {},
  },
  messages: {
    byId: {},
    allIds: [],
  },
  language: null,
  account: null,
};

const slice = createSlice({
  name: 'gate',
  initialState,
  reducers: {
    startLoading(state, action) {
      state.loading[action.payload] = true;
    },
    hasError(state, action) {
      const { attribute, error } = action.payload;
      state.error[attribute] = error;
      state.loading[attribute] = error;
    },
    setAccountId(state, action) {
      state.accountId = action.payload;
    },
    setGates(state, action) {
      state.gates = paginateCollection({ items: action.payload });
      state.initialized.gates = true;
      state.loading.gates = false;
    },
    addGate(state, action) {
      const gate = action.payload;
      const gateId = gate.id;
      state.gates.allIds.insert(0, gateId);
      state.gates.byId[gateId] = gate;
    },
    updateGate(state, action) {
      const updatedGate = action.payload;
      const gate = state.gates.byId[updatedGate.id];
      Object.assign(gate, updatedGate);
    },
    deleteGateById(state, action) {
      const gateId = action.payload;
      state.gates = state.gates.allIds.filter(id => id !== gateId);
      if (!(gateId in state.gates.byId)) {
        return;
      }
      delete state.gates.byId[gateId];
    },
    setGate: (state, action) => {
        const gate = action.payload;
        state.gate = gate;
        state.initialized.gate = true;
        state.loading.gate = false;
        Object.assign(state.rooms, initialState.rooms);
        state.initialized.rooms = false;
        state.loading.rooms = false;
      },
    finishedConnectingGate: (state, action) => {
        state.initialized.connecting = true;
        state.loading.connecting = false;
      },
    setGateDM: (state, action) => {
        state.dm = action.payload;
      },
    clearGate: (state, action) => {
        state.initialized.gate = false;
        state.loading.gate = false;
        state.initialized.rooms = false;
        state.loading.rooms = false;
      },
    addGateRoom: (state, action) => {
        const room = action.payload;
        const roomId = room.id;
        if (!(roomId in state.rooms.allIds)) {
          state.rooms.allIds.splice(0, 0, roomId);
        }
        state.rooms.byId[roomId] = room;
        state.initialized.rooms = true;
        state.loading.rooms = false;

        // const urlFriendlyName = makeUrlFriendly(room.name);
        // const existingRoom = Object.values(state.rooms.byId).find(r => makeUrlFriendly(r.name) === urlFriendlyName);

        // state.rooms.allIds.push(room.id);
        // state.rooms.byId[room.id] = room;
        // // If the name is repeated, append "-<room.id.slice(0, 5)>" to the end
        // const finalUrlFriendlyName = existingRoom ? `${urlFriendlyName}-${room.id.slice(0, 5)}` : urlFriendlyName;
        // state.rooms.byName[finalUrlFriendlyName] = room.id;
        // state.rooms.byId[room.id]._byName = finalUrlFriendlyName;
      },
    setGateRooms: (state, action) => {
        const rooms = action.payload;
        state.rooms = paginateCollection(rooms);// , true);
        // state.rooms.items = rooms.items;
        state.initialized.rooms = true;
        state.loading.rooms = false;
      },
    setLanguage: (state, action) => {
        state.language = action.payload;
      },
    clearState: (state) => {
        Object.assign(state, initialState);
      },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  setGate,
  addGateRoom,
  setLanguage,
  clearState: clearGateState,
  clearGate,
} = slice.actions;

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

export const getGates = (accountId) => async (dispatch, getState) => {
  try {
    dispatch(slice.actions.startLoading('gates'));
    const response = await optimai.post(
      `/account/${accountId}/gq`,
      TARGETED_GQ,
    );
    const { id, gates } = response.data;
    console.log('gates from server', gates);
    dispatch(slice.actions.setGates(gates.items));
    // if (gates.items.length) {
    //   dispatch(slice.actions.setGate(gates.items[0]));
    // }
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ attribute: 'gates', error: e.message }));
    return Promise.reject(e);
  }
};

export const createGate = (data) => async (dispatch, getState) => {
  try {
    const response = await optimai.post(`/account/${account.id}/gate`, data);
    const { gate } = response.data;
    dispatch(slice.actions.addGate(gate));
    return Promise.resolve('success');
  } catch (e) {
    const message = `error: could not create gate: ${e}`;
    console.error(message);
    return Promise.reject(message);
  }
};

export const editGate = (data, gateId) => async (dispatch, getState) => {
  try {
    const response = await optimai.patch(`/gate/${gateId}`,
      data);
    const { gate } = response.data;
    dispatch(slice.actions.updateGate(gate));
    return Promise.resolve('success');
  } catch (e) {
    const message = `error: could not update gate: ${e}`;
    console.error(message);
    return Promise.reject(message);
  }
};

export const deleteGate = (gateId) => async (dispatch, getState) => {
  try {
    await optimai.delete(`/gate/${gateId}`);
    dispatch(slice.actions.deleteGateById(gateId));
    return Promise.resolve('success');
  } catch (e) {
    const message = `error: could not delete gate: ${e}`;
    console.error(message);
    return Promise.reject(message);
  }
};

// ----------------------------------------------------------------------

export const fetchGate = ({ gateId }) => async (dispatch, getState) => {
  const loading = selectGateStateLoading('gate')(getState());
  const initialized = selectGateStateInitialized('gate')(getState());
  if (loading || initialized) {
    return;
  }
  try {
    dispatch(slice.actions.startLoading('gate'));
    const response = await optimai.get(`/gate/${gateId}`);
    dispatch(slice.actions.setGate(response.data));
    return Promise.resolve(response.data);
  } catch (e) {
    const message = `error: could not fetch gate: ${e}`;
    dispatch(slice.actions.hasError({ attribute: 'gate', error: e.message }));
    console.error(message);
    return Promise.reject(message);
  }
};

export const fetchGateRooms = ({ gateId, onlyPublic = false }) => async (dispatch, getState) => {
  const loading = selectGateStateLoading('rooms')(getState());
  const initialized = selectGateStateInitialized('rooms')(getState());
  if (loading || initialized) {
    return;
  }
  try {
    console.log('fetching gate rooms!', onlyPublic);
    const response = await optimai.get(`/gate/${gateId}/${onlyPublic ? 'public-' : ''}rooms`);
    const { rooms } = response.data;
    dispatch(slice.actions.setGateRooms(rooms));
    return Promise.resolve('success');
  } catch (e) {
    const message = `error: could not fetch gate rooms: ${e}`;
    dispatch(slice.actions.hasError({ attribute: 'rooms', error: e.message }));
    console.error(message);
    return Promise.reject(message);
  }
};

export const getPersonCustomer = ({ accountId }) => async (dispatch) => {
  try {
    const response = await optimai.get(`/person/check-customer?account_id=${accountId}`);
    return response.data.is_customer;
  } catch (e) {
    console.error(`error: checking customer: ${e}`);
    return Promise.reject(e.message);
  }
};

export const connectGate = () => async (dispatch, getState) => {
  const state = getState();
  const gateId = selectGateAttribute('id')(state);
  const connecting = selectGateStateLoading('connecting')(state);
  const connected = selectGateStateInitialized('connecting')(state);
  if (connected || connecting) {
    return;
  }

  try {
    if (!gateId) {
      throw Error('cannot connect to undefined gate');
    }
    dispatch(slice.actions.startLoading('connecting'));
    const response = await optimai_room.post(`/gate/${gateId}/connect`);
    const { room } = response.data;
    batch(() => {
      dispatch(addGateRoom(room));
      dispatch(slice.actions.finishedConnectingGate());
    });
    return room;
  } catch (e) {
    const message = `error: could not connect to gate: ${e}`;
    dispatch(slice.actions.hasError({ attribute: 'connecting', error: e.message }));
    console.error(message);
    return Promise.reject(message);
  }
};

export const selectGateState = (state) => state.gate;

export const selectGateStateInitialized = (attribute) => (state) => selectGateState(state).initialized[attribute];

export const selectGateStateLoading = (attribute) => (state) => selectGateState(state).loading[attribute];

export const selectGate = (state) => selectGateState(state).gate;

export const selectGateId = (state) => selectGate(state)?.id;

export const selectGates = (state) => selectGateState(state).gates;

export const selectGatesById = (state) => selectGates(state)?.byId ?? {};

export const selectGatesIds = (state) => selectGates(state)?.allIds ?? [];

export const selectGateRooms = (state) => selectGateState(state).rooms;

export const selectGateRoomsById = (state) => selectGateRooms(state).byId;

export const selectGateRoomsByName = (state) => selectGateRooms(state).byName;

export const selectGateRoomsIds = (state) => selectGateRooms(state).allIds;

export const selectGateRoomsInitialized = (state) => selectGateStateInitialized(state)('rooms');

export const selectGateRoomsLoading = (state) => selectGateStateLoading(state)('rooms');

export const selectGateAttribute = (attribute) => (state) => selectGate(state)?.[attribute];

export const selectGatesAttribute = (attribute) => (state) => selectGates(state)?.[attribute];

export const selectGateStateAttribute = (attribute) => (state) => selectGateState(state)?.[attribute];
