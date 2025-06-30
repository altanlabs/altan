import { createSelector, createSlice } from '@reduxjs/toolkit';

// utils
import { selectAccount } from './general';
import { optimai, optimai_integration } from '../../utils/axios';
import { checkArraysEqualsProperties } from '../helpers/memoize';

// ----------------------------------------------------------------------

const initialState = {
  current: null,
  initialized: {},
  loading: {},
  connections: {},
  error: {},
  pagination: {
    cursor: {},
    hasNextPage: {},
    limit: 1000,
    order_by: 'date_creation',
    desc: 'true',
  },
  types: [],
};

const slice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    startLoading(state, action) {
      const accountId = action.payload;
      state.loading[accountId] = true;
    },
    stopLoading(state, action) {
      const accountId = action.payload;
      state.loading[accountId] = false;
    },
    hasError(state, action) {
      const { error, accountId } = action.payload;
      state.error[accountId] = error;
      state.loading[accountId] = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setConnections(state, action) {
      const { accountId, items, nextCursor, hasNextPage } = action.payload;
      state.connections[accountId] = items;
      state.pagination.cursor[accountId] = nextCursor || null;
      state.pagination.hasNextPage[accountId] = hasNextPage || null;
      state.loading[accountId] = false;
      state.initialized[accountId] = true;
    },
    addConnection(state, action) {
      const connection = action.payload;
      const accountId = connection.account_id;
      if (!(accountId in state.connections)) {
        state.connections[accountId] = [];
      }
      state.connections[accountId].push(connection);
    },
    setConnectionTypes(state, action) {
      const types = action.payload;
      state.initialized.types = true;
      state.types = [...state.types, ...types];
    },
    addConnectionType(state, action) {
      const connectionType = action.payload;
      state.types.push(connectionType);
    },
    deleteConnection(state, action) {
      const accountId = action.payload.account_id;
      const connectionId = action.payload.data.ids[0];
      if (!(accountId in state.connections)) {
        return;
      }
      state.connections[accountId] = state.connections[accountId].filter(
        (connection) => connection.id !== connectionId,
      );
    },

    updateConnection(state, action) {
      const { id, account_id, ...changes } = action.payload;
      let accountId = account_id;
      if (!!accountId) {
        if (!(account_id in state.connections)) {
          return;
        }
      } else {
        accountId = Object.keys(state.connections).find((accId) =>
          state.connections[accId].some((c) => c.id === id),
        );
      }
      const connection = state.connections[account_id].find((c) => c.id === id);
      if (!connection) return;
      Object.keys(changes).forEach((key) => {
        connection[key] = changes[key];
      });
    },

    // TOOLS
    addTool(state, action) {
      const { accountId, connectionId, tool } = action.payload;
      const connectionIndex = state.connections.findIndex((c) => c.id === connectionId);
      if (connectionIndex !== -1) {
        if (!state.connections[connectionIndex].tools) {
          state.connections[connectionIndex].tools = { items: [] };
        }
        state.connections[connectionIndex].tools.items.push(tool);
      }
    },
    deleteTool(state, action) {
      const { connectionId, toolId } = action.payload;
      const connectionIndex = state.connections.findIndex((c) => c.id === connectionId);
      if (connectionIndex !== -1 && state.connections[connectionIndex].tools?.items) {
        state.connections[connectionIndex].tools.items = state.connections[
          connectionIndex
        ].tools.items.filter((tool) => tool.id !== toolId);
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  addConnection,
  updateConnection,
  setConnections,
  setDialogActive,
  setDialogHidden,
  deleteConnection,
  addTool,
  deleteTool,
  clearState: clearConnectionsState,
} = slice.actions;

// ----------------------------------------------------------------------

const TARGETED_GQ = {
  '@fields': ['id'],
  connections: {
    '@fields': ['@base', 'name', 'details', 'user_id'],
    connection_type: {
      '@fields': ['id', 'name', 'icon'],
      external_app: {
        '@fields': ['id', 'name', 'icon'],
      },
    },
    tools: {
      '@fields': '@all',
    },
    resources: {
      '@fields': '@all',
    },
  },
};

export const getUserConnections = () => async (dispatch, getState) => {
  const { loading, initialized } = getState().connections;
  if (loading.me || initialized.me) return Promise.resolve(true);
  try {
    dispatch(slice.actions.startLoading('me'));
    const response = await optimai.get('/user/me/connections');
    const { connections } = response.data;
    dispatch(
      slice.actions.setConnections({ accountId: 'me', items: connections, hasNextPage: false }),
    );
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ accountId: 'me', error: e.message }));
    return Promise.reject(e);
  }
};

export const getConnectionTypes = () => async (dispatch, getState) => {
  const { loading, initialized } = getState().connections;
  if (loading.types || initialized.types) {
    return Promise.resolve(true);
  }
  try {
    dispatch(slice.actions.startLoading('types'));
    const response = await optimai_integration.get('/connection-type/all');
    const { items } = response.data;
    dispatch(slice.actions.setConnectionTypes(items));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ accountId: 'types', error: e.message }));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading('types'));
  }
};

export const getConnections = (accountId) => async (dispatch, getState) => {
  const state = getState();
  const initialized = selectAccountConnectionsInitialized(state);
  const loading = selectAccountConnectionsLoading(state);
  if (loading || initialized) {
    return Promise.resolve(true);
  }
  if (!accountId) {
    console.warn('cannot get connections from undefined account');
    return;
  }
  try {
    dispatch(slice.actions.startLoading(accountId));
    const response = await optimai.post(`/account/${accountId}/gq`, TARGETED_GQ);
    const { id, connections } = response.data;
    if (id !== accountId) {
      throw Error('invalid account!');
    }
    dispatch(slice.actions.setConnections({ accountId, ...connections }));
    return Promise.resolve('success');
  } catch (e) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ accountId, error: e.message }));
    return Promise.reject(e);
  }
};

export const fetchAccountConnectionType = (connTypeId) => async (dispatch, getState) => {
  try {
    const { account } = getState().room;
    const response = await optimai_integration.get(
      `/account/${account?.id}/connection_type/${connTypeId}`,
    );
    // dispatch(slice.actions.addConnections(response.data.connections));
    return response;
  } catch (e) {
    dispatch(slice.actions.hasError(e));
    console.error(`error: could not delete connection: ${e}`);
    return Promise.reject(e);
  }
};

export const newConnection = (account, data) => async (dispatch, getState) => {
  const accountId = account?.id;
  if (!accountId) {
    console.warn('cannot create connection in undefined account');
    return;
  }
  try {
    const response = await optimai_integration.post(
      `/account/${accountId}/standard-connection`,
      data,
    );
    const { connection } = response.data;
    dispatch(slice.actions.addConnection({ connection, accountId }));
    return Promise.resolve(connection);
  } catch (e) {
    dispatch(slice.actions.hasError({ error: e, accountId }));
    console.error(`error: could not create connection: ${e}`);
    return Promise.reject(e);
  }
};

export const killConnection = (accountId, connectionId) => async (dispatch, getState) => {
  try {
    await optimai_integration.delete(`/connections/${connectionId}`);
    dispatch(slice.actions.deleteConnection({ accountId, connectionId }));
    return Promise.resolve('success');
  } catch (e) {
    dispatch(slice.actions.hasError({ error: e, accountId }));
    console.error(`error: could not delete connection: ${e}`);
    return Promise.reject(e);
  }
};

export const renameConnection = (connectionId, accountId, name) => async (dispatch, getState) => {
  try {
    const response = await optimai_integration.patch(`/connection/${connectionId}/rename`, {
      name: name,
    });
    const { connection } = response.data;
    return Promise.resolve('success');
  } catch (e) {
    dispatch(slice.actions.hasError({ error: e, accountId }));
    console.error(`error: could not rename connection: ${e}`);
    return Promise.reject(e);
  }
};

export const executeAction = (connectionId, actionTypeId) => async (dispatch, getState) => {
  try {
    const response = await optimai_integration.get(
      `/connection/${connectionId}/${actionTypeId}/execute`,
    );
    return response.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e));
    console.error(`error: could not execute action: ${e}`);
    return Promise.reject(e);
  }
};

export const createResource = (connectionId, resourceTypeId, url) => async (dispatch, getState) => {
  try {
    const response = await optimai_integration.post(
      `/connection/${connectionId}/resource/${resourceTypeId}/create`,
      { url: url },
    );
    const { resource } = response.data;
    dispatch(addDataSource(resource));
    return response.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e));
    console.error(`error: could not get account channels: ${e}`);
    return Promise.reject(e);
  }
};

export const createTool =
  ({ connectionId, formData }) =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await optimai_integration.post(`/connection/${connectionId}/tool`, formData);
      const { tool } = response.data;
      // dispatch(slice.actions.addTool(tool));
      return Promise.resolve(tool);
    } catch (e) {
      dispatch(slice.actions.hasError(e));
      console.error(`error: could not create tool: ${e}`);
      return Promise.reject(e);
    }
  };

export const editTool =
  ({ toolId, formData }) =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());

      const response = await optimai_integration.patch(`/tool/${toolId}`, formData);
      const { tool } = response.data;
      // dispatch(slice.actions.addTool(tool));
      return Promise.resolve(tool);
    } catch (e) {
      dispatch(slice.actions.hasError(e));
      console.error(`error: could not create tool: ${e}`);
      return Promise.reject(e);
    }
  };

export const fetchConnectionType = (connectionTypeId) => async (dispatch, getState) => {
  try {
    dispatch(slice.actions.startLoading());
    const response = await optimai_integration.get(`/connection-type/${connectionTypeId}`);
    const { connection_type } = response.data;
    getConnections();
    dispatch(slice.actions.addConnectionType(connection_type));
    return Promise.resolve(connection_type);
  } catch (error) {
    console.log(`Error fetching connections: ${error}`);
  }
};

export const selectConnectionsState = (state) => state.connections;

export const selectConnections = (state) => selectConnectionsState(state).connections;

export const selectAccountConnections = (state) =>
  selectConnections(state)?.[selectAccount(state)?.id];

export const selectAccountConnectionsByType = (typeId) =>
  createSelector(
    [selectAccountConnections],
    (connections) => {
      if (!typeId) {
        return null;
      }
      if (!connections?.length) {
        return null;
      }
      return connections.filter((conn) => conn?.connection_type?.id === typeId);
    },
    {
      memoizeOptions: {
        resultEqualityCheck: checkArraysEqualsProperties(),
      },
    },
  );
export const selectAccountConnectionsInitialized = (state) =>
  selectConnectionsState(state)?.initialized[selectAccount(state)?.id];

export const selectAccountConnectionsLoading = (state) =>
  selectConnectionsState(state)?.loading[selectAccount(state)?.id];

export const selectConnectionTypes = (state) => selectConnectionsState(state).types;

export const selectWebhooks = createSelector([selectConnectionTypes], (types) =>
  types.flatMap((type) => type.webhooks?.items ?? []),
);

const selectAccountWebhooks = (state) => state.general.account.webhooks;

export const selectAllWebhooks = createSelector(
  [selectWebhooks, selectAccountWebhooks],
  (webhooks, accountWebhooks) => [...(webhooks ?? []), ...(accountWebhooks ?? [])],
);
