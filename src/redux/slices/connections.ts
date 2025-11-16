import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';


// services
import { selectAccount } from './general/index';
import { updateCurrentTool } from './spaces';
import { getConnectionService } from '../../services';
import type {
  Connection,
  ConnectionType,
  ConnectionGQQuery,
  CreateConnectionData,
  CreateToolData,
  Tool,
} from '../../services';
// utils
import { checkArraysEqualsProperties } from '../helpers/memoize';
import type { AppThunk, RootState } from '../store';

// ----------------------------------------------------------------------

interface ConnectionsState {
  current: string | null;
  initialized: Record<string, boolean>;
  loading: Record<string, boolean>;
  connections: Record<string, Connection[]>;
  error: Record<string, string | null>;
  pagination: {
    cursor: Record<string, string | null>;
    hasNextPage: Record<string, boolean | null>;
    limit: number;
    order_by: string;
    desc: string;
  };
  types: ConnectionType[];
}

const initialState: ConnectionsState = {
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

interface SetConnectionsPayload {
  accountId: string;
  items: Connection[];
  nextCursor?: string | null;
  hasNextPage?: boolean | null;
}

interface HasErrorPayload {
  accountId: string;
  error: string;
}

interface UpdateConnectionPayload extends Partial<Connection> {
  id: string;
  account_id?: string;
}

interface DeleteConnectionPayload {
  account_id: string;
  data: {
    ids: string[];
  };
}

interface AddToolPayload {
  accountId: string;
  connectionId: string;
  tool: Tool;
}

interface DeleteToolPayload {
  connectionId: string;
  toolId: string;
}

const slice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    startLoading(state, action: PayloadAction<string>) {
      const accountId = action.payload;
      state.loading[accountId] = true;
    },
    stopLoading(state, action: PayloadAction<string>) {
      const accountId = action.payload;
      state.loading[accountId] = false;
    },
    hasError(state, action: PayloadAction<HasErrorPayload>) {
      const { error, accountId } = action.payload;
      state.error[accountId] = error;
      state.loading[accountId] = false;
    },
    clearState(state) {
      Object.assign(state, initialState);
    },
    setConnections(state, action: PayloadAction<SetConnectionsPayload>) {
      const { accountId, items, nextCursor, hasNextPage } = action.payload;
      state.connections[accountId] = items;
      state.pagination.cursor[accountId] = nextCursor || null;
      state.pagination.hasNextPage[accountId] = hasNextPage || null;
      state.loading[accountId] = false;
      state.initialized[accountId] = true;
    },
    addConnection(state, action: PayloadAction<Connection>) {
      const connection = action.payload;
      const accountId = connection.account_id;
      if (!(accountId in state.connections)) {
        state.connections[accountId] = [];
      }
      state.connections[accountId].push(connection);
    },
    setConnectionTypes(state, action: PayloadAction<ConnectionType[]>) {
      const types = action.payload;
      state.initialized.types = true;
      state.types = [...state.types, ...types];
    },
    addConnectionType(state, action: PayloadAction<ConnectionType>) {
      const connectionType = action.payload;
      state.types.push(connectionType);
    },
    deleteConnection(state, action: PayloadAction<DeleteConnectionPayload>) {
      const accountId = action.payload.account_id;
      const connectionId = action.payload.data.ids[0];
      if (!(accountId in state.connections)) {
        return;
      }
      state.connections[accountId] = state.connections[accountId].filter(
        (connection) => connection.id !== connectionId,
      );
    },

    updateConnection(state, action: PayloadAction<UpdateConnectionPayload>) {
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
      if (!accountId) return;
      const connection = state.connections[accountId].find((c) => c.id === id);
      if (!connection) return;
      Object.keys(changes).forEach((key) => {
        (connection as any)[key] = changes[key as keyof typeof changes];
      });
    },

    // TOOLS
    addTool(state, action: PayloadAction<AddToolPayload>) {
      const { accountId, connectionId, tool } = action.payload;
      const connections = state.connections[accountId];
      if (!connections) return;
      const connectionIndex = connections.findIndex((c) => c.id === connectionId);
      if (connectionIndex !== -1) {
        if (!connections[connectionIndex].tools) {
          connections[connectionIndex].tools = { items: [] };
        }
        connections[connectionIndex].tools.items.push(tool);
      }
    },
    deleteTool(state, action: PayloadAction<DeleteToolPayload>) {
      const { connectionId, toolId } = action.payload;
      // Find the connection across all accounts
      for (const accountId in state.connections) {
        const connectionIndex = state.connections[accountId].findIndex((c) => c.id === connectionId);
        if (connectionIndex !== -1 && state.connections[accountId][connectionIndex].tools?.items) {
          state.connections[accountId][connectionIndex].tools.items = state.connections[accountId][
            connectionIndex
          ].tools.items.filter((tool) => tool.id !== toolId);
          break;
        }
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
  deleteConnection,
  addTool,
  deleteTool,
  clearState: clearConnectionsState,
} = slice.actions;

// ----------------------------------------------------------------------

export const selectConnectionsState = (state: RootState): ConnectionsState => state.connections;

export const selectAccountConnectionsInitialized = (state: RootState): boolean | undefined =>
  selectConnectionsState(state)?.initialized[selectAccount(state)?.id];

export const selectAccountConnectionsLoading = (state: RootState): boolean | undefined =>
  selectConnectionsState(state)?.loading[selectAccount(state)?.id];

const TARGETED_GQ: ConnectionGQQuery = {
  '@fields': ['id'],
  connections: {
    '@fields': ['@base', 'name', 'details', 'user_id'],
    connection_type: {
      '@fields': ['id', 'name', 'icon'],
      external_app: {
        '@fields': ['id', 'name', 'icon'],
      },
    },
    // tools: {
    //   '@fields': '@all',
    // },
    // resources: {
    //   '@fields': '@all',
    // },
  },
};

/**
 * Fetch user connections (for 'me' account)
 */
export const getUserConnections = (): AppThunk => async (dispatch, getState) => {
  const { loading, initialized } = getState().connections;
  if (loading.me || initialized.me) return Promise.resolve(true);
  
  try {
    dispatch(slice.actions.startLoading('me'));
    const connectionService = getConnectionService();
    const connections = await connectionService.fetchUserConnections();
    dispatch(
      slice.actions.setConnections({ accountId: 'me', items: connections, hasNextPage: false }),
    );
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not get connections: ${e.message}`);
    dispatch(slice.actions.hasError({ accountId: 'me', error: e.message }));
    return Promise.reject(e);
  }
};

/**
 * Fetch all connection types
 */
export const getConnectionTypes = (): AppThunk => async (dispatch, getState) => {
  const { loading, initialized } = getState().connections;
  if (loading.types || initialized.types) {
    return Promise.resolve(true);
  }
  
  try {
    dispatch(slice.actions.startLoading('types'));
    const connectionService = getConnectionService();
    const types = await connectionService.fetchConnectionTypes(false);
    dispatch(slice.actions.setConnectionTypes(types));
    return Promise.resolve('success');
  } catch (e: any) {
    console.error(`error: could not get connection types: ${e.message}`);
    dispatch(slice.actions.hasError({ accountId: 'types', error: e.message }));
    return Promise.reject(e);
  } finally {
    dispatch(slice.actions.stopLoading('types'));
  }
};

/**
 * Fetch connections for a specific account
 */
export const getConnections =
  (accountId: string, forceRefresh = false): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const initialized = selectAccountConnectionsInitialized(state);
    const loading = selectAccountConnectionsLoading(state);
    
    if (!forceRefresh && (loading || initialized)) {
      return Promise.resolve(true);
    }
    
    if (!accountId) {
      console.warn('cannot get connections from undefined account');
      return;
    }
    
    try {
      dispatch(slice.actions.startLoading(accountId));
      const connectionService = getConnectionService();
      const connectionsData = await connectionService.fetchAccountConnections(accountId, TARGETED_GQ);
      dispatch(slice.actions.setConnections({ accountId, ...connectionsData }));
      return Promise.resolve('success');
    } catch (e: any) {
      console.error(`error: could not get connections: ${e.message}`);
      dispatch(slice.actions.hasError({ accountId, error: e.message }));
      return Promise.reject(e);
    }
  };

/**
 * Fetch account-specific connection type
 */
export const fetchAccountConnectionType =
  (connTypeId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const { account } = getState().room;
      if (!account?.id) {
        throw new Error('No account found');
      }
      
      const connectionService = getConnectionService();
      const connectionType = await connectionService.fetchAccountConnectionType(account.id, connTypeId);
      return { data: { connection_type: connectionType } };
    } catch (e: any) {
      dispatch(slice.actions.hasError({ accountId: 'types', error: e.message }));
      console.error(`error: could not fetch connection type: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Create a new connection
 */
export const newConnection =
  (account: { id: string } | null, data: CreateConnectionData): AppThunk =>
  async (dispatch, getState) => {
    const accountId = account?.id;
    if (!accountId) {
      console.warn('cannot create connection in undefined account');
      return;
    }
    
    try {
      const connectionService = getConnectionService();
      const connection = await connectionService.createConnection(accountId, data);
      dispatch(slice.actions.addConnection(connection));
      return Promise.resolve(connection);
    } catch (e: any) {
      dispatch(slice.actions.hasError({ error: e.message, accountId }));
      console.error(`error: could not create connection: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Delete a connection
 */
export const killConnection =
  (accountId: string, connectionId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const connectionService = getConnectionService();
      await connectionService.deleteConnection(connectionId);
      dispatch(slice.actions.deleteConnection({ account_id: accountId, data: { ids: [connectionId] } }));
      return Promise.resolve('success');
    } catch (e: any) {
      dispatch(slice.actions.hasError({ error: e.message, accountId }));
      console.error(`error: could not delete connection: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Rename a connection
 */
export const renameConnection =
  (connectionId: string, accountId: string, name: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const connectionService = getConnectionService();
      await connectionService.renameConnection(connectionId, name);
      return Promise.resolve('success');
    } catch (e: any) {
      dispatch(slice.actions.hasError({ error: e.message, accountId }));
      console.error(`error: could not rename connection: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Execute an action on a connection
 */
export const executeAction =
  (connectionId: string, actionTypeId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const connectionService = getConnectionService();
      const result = await connectionService.executeAction(connectionId, actionTypeId);
      return result;
    } catch (e: any) {
      dispatch(slice.actions.hasError({ accountId: 'actions', error: e.message }));
      console.error(`error: could not execute action: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Create a resource for a connection
 */
export const createResource =
  (connectionId: string, resourceTypeId: string, url: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const connectionService = getConnectionService();
      const resource = await connectionService.createResource(connectionId, resourceTypeId, { url });
      // Note: addDataSource is not imported - keeping the original behavior
      // dispatch(addDataSource(resource));
      return { resource };
    } catch (e: any) {
      dispatch(slice.actions.hasError({ accountId: 'resources', error: e.message }));
      console.error(`error: could not create resource: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Create a tool for a connection
 */
export const createTool =
  ({ connectionId, formData }: { connectionId: string; formData: CreateToolData }): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading('tools'));
      const connectionService = getConnectionService();
      const tool = await connectionService.createTool(connectionId, formData);
      return Promise.resolve(tool);
    } catch (e: any) {
      dispatch(slice.actions.hasError({ accountId: 'tools', error: e.message }));
      console.error(`error: could not create tool: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Edit a tool
 */
export const editTool =
  ({ toolId, formData }: { toolId: string; formData: unknown }): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading('tools'));
      const connectionService = getConnectionService();
      const tool = await connectionService.updateTool(toolId, formData);
      dispatch(updateCurrentTool(tool));
      return Promise.resolve(tool);
    } catch (e: any) {
      dispatch(slice.actions.hasError({ accountId: 'tools', error: e.message }));
      console.error(`error: could not update tool: ${e}`);
      return Promise.reject(e);
    }
  };

/**
 * Fetch a single connection type
 */
export const fetchConnectionType =
  (connectionTypeId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(slice.actions.startLoading('types'));
      const connectionService = getConnectionService();
      const connectionType = await connectionService.fetchConnectionType(connectionTypeId);
      dispatch(slice.actions.addConnectionType(connectionType));
      return Promise.resolve(connectionType);
    } catch (error: any) {
      console.log(`Error fetching connection type: ${error}`);
      dispatch(slice.actions.hasError({ accountId: 'types', error: error.message }));
      return Promise.reject(error);
    }
  };

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

export const selectConnections = (state: RootState): Record<string, Connection[]> =>
  selectConnectionsState(state).connections;

export const selectAccountConnections = (state: RootState): Connection[] | undefined =>
  selectConnections(state)?.[selectAccount(state)?.id];

export const selectAccountConnectionsByType = (typeId: string | null) =>
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

export const selectConnectionTypes = (state: RootState): ConnectionType[] =>
  selectConnectionsState(state).types;

export const selectWebhooks = createSelector([selectConnectionTypes], (types) =>
  types.flatMap((type) => type.webhooks?.items ?? []),
);

const selectAccountWebhooks = (state: RootState) => state.general.account.webhooks;

export const selectAllWebhooks = createSelector(
  [selectWebhooks, selectAccountWebhooks],
  (webhooks, accountWebhooks) => [...(webhooks ?? []), ...(accountWebhooks ?? [])],
);

