import { createSlice } from '@reduxjs/toolkit';

import { optimai } from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: null,
  servers: [],
  currentServer: null,
  connections: {
    isLoading: false,
    error: null,
    items: [],
  },
};

const slice = createSlice({
  name: 'mcp',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setServers(state, action) {
      state.servers = action.payload;
      state.isLoading = false;
    },

    setCurrentServer(state, action) {
      state.currentServer = action.payload;
      state.isLoading = false;
    },

    addServer(state, action) {
      state.servers = [...state.servers, action.payload];
    },

    updateServer(state, action) {
      const updatedServer = action.payload;
      state.servers = state.servers.map((server) =>
        server.id === updatedServer.id ? updatedServer : server
      );
      if (state.currentServer && state.currentServer.id === updatedServer.id) {
        state.currentServer = updatedServer;
      }
    },

    deleteServer(state, action) {
      state.servers = state.servers.filter((server) => server.id !== action.payload);
      if (state.currentServer && state.currentServer.id === action.payload) {
        state.currentServer = null;
      }
    },

    // Connection management reducers
    startLoadingConnections(state) {
      state.connections.isLoading = true;
      state.connections.error = null;
    },

    stopLoadingConnections(state) {
      state.connections.isLoading = false;
    },

    hasConnectionError(state, action) {
      state.connections.isLoading = false;
      state.connections.error = action.payload;
    },

    setConnections(state, action) {
      state.connections.items = action.payload;
      state.connections.isLoading = false;
    },

    addConnection(state, action) {
      state.connections.items = [...state.connections.items, action.payload];
    },

    updateConnection(state, action) {
      const updatedConnection = action.payload;
      state.connections.items = state.connections.items.map((conn) =>
        conn.agent_id === updatedConnection.agent_id &&
        conn.mcp_server_id === updatedConnection.mcp_server_id
          ? updatedConnection
          : conn
      );
    },

    removeConnection(state, action) {
      const { agentId, serverId } = action.payload;
      state.connections.items = state.connections.items.filter(
        (conn) => !(conn.agent_id === agentId && conn.mcp_server_id === serverId)
      );
    },
  },
});

export const { reducer } = slice;

export default reducer;

// Helper function to map frontend data to backend schema
const mapToBackendSchema = (data) => {
  const mapped = {
    name: data.name,
    description: data.description,
    url: data.url,
    transport: data.serverType,
    approval_policy: data.approvalMode,
    execution_mode: data.executionMode,
    secret_token: data.secret !== 'none' ? data.secretToken : null,
    request_headers: data.headers && data.headers.length > 0 ? data.headers : null,
    force_pre_tool_speech: data.forcePreToolSpeech,
    disable_interruptions: data.disableInterruptions,
    tool_approval_hashes: data.toolApprovalHashes || null,
    config: data.config || null,
  };

  // Remove undefined/null values
  return Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
};

// Server Management Actions

export const createMCPServer = (accountId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const backendData = mapToBackendSchema(data);
    const response = await optimai.post(`/mcp/servers?account_id=${accountId}`, backendData);
    const { mcp_server } = response.data;
    dispatch(slice.actions.addServer(mcp_server));
    return Promise.resolve(mcp_server);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    dispatch(slice.actions.hasError(errorMessage));
    return Promise.reject(errorMessage);
  } finally {
    dispatch(slice.actions.stopLoading());
  }
};

export const fetchMCPServers =
  (accountId, activeOnly = true) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await optimai.get(
        `/mcp/servers?account_id=${accountId}&active_only=${activeOnly}`
      );
      const { mcp_servers } = response.data;
      dispatch(slice.actions.setServers(mcp_servers || []));
      return Promise.resolve(mcp_servers);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const fetchMCPServer =
  (serverId, includeConnections = false) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await optimai.get(
        `/mcp/servers/${serverId}?include_connections=${includeConnections}`
      );
      const { mcp_server } = response.data;
      dispatch(slice.actions.setCurrentServer(mcp_server));
      return Promise.resolve(mcp_server);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const updateMCPServer = (serverId, data) => async (dispatch) => {
  try {
    const backendData = mapToBackendSchema(data);
    const response = await optimai.patch(`/mcp/servers/${serverId}`, backendData);
    const { mcp_server } = response.data;
    dispatch(slice.actions.updateServer(mcp_server));
    return Promise.resolve(mcp_server);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject(errorMessage);
  }
};

export const deleteMCPServer =
  (serverId, force = false) =>
  async (dispatch) => {
    try {
      await optimai.delete(`/mcp/servers/${serverId}?force=${force}`);
      dispatch(slice.actions.deleteServer(serverId));
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

// Agent-Server Connection Management Actions

export const connectAgentToMCPServer = (serverId, agentId, data = {}) => async (dispatch) => {
  dispatch(slice.actions.startLoadingConnections());
  try {
    const connectionData = {
      access_level: data.accessLevel || 'user',
    };
    const response = await optimai.post(
      `/mcp/servers/${serverId}/connect-agent/${agentId}`,
      connectionData
    );
    const { connection } = response.data;
    dispatch(slice.actions.addConnection(connection));
    return Promise.resolve(connection);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    dispatch(slice.actions.hasConnectionError(errorMessage));
    return Promise.reject(errorMessage);
  } finally {
    dispatch(slice.actions.stopLoadingConnections());
  }
};

export const fetchAgentMCPServers =
  (agentId, activeOnly = true) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await optimai.get(
        `/mcp/agents/${agentId}/mcp-servers?active_only=${activeOnly}`
      );
      const { mcp_servers } = response.data;
      dispatch(slice.actions.setServers(mcp_servers || []));
      return Promise.resolve(mcp_servers);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const fetchMCPServerAgents =
  (serverId, activeOnly = true) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingConnections());
    try {
      const response = await optimai.get(
        `/mcp/servers/${serverId}/agents?active_only=${activeOnly}`
      );
      const { connected_agents } = response.data;
      dispatch(slice.actions.setConnections(connected_agents || []));
      return Promise.resolve(connected_agents);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasConnectionError(errorMessage));
      return Promise.reject(errorMessage);
    }
  };

export const updateAgentMCPConnection = (serverId, agentId, data) => async (dispatch) => {
  try {
    const updateData = {
      access_level: data.accessLevel,
      is_active: data.isActive,
      agent_config_overrides: data.agentConfigOverrides,
    };
    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const response = await optimai.patch(
      `/mcp/servers/${serverId}/agents/${agentId}`,
      cleanData
    );
    const { connection } = response.data;
    dispatch(slice.actions.updateConnection(connection));
    return Promise.resolve(connection);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject(errorMessage);
  }
};

export const disconnectAgentFromMCPServer = (serverId, agentId) => async (dispatch) => {
  try {
    await optimai.delete(`/mcp/servers/${serverId}/agents/${agentId}`);
    dispatch(slice.actions.removeConnection({ agentId, serverId }));
    return Promise.resolve();
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject(errorMessage);
  }
};

// MCP Tools Discovery and Configuration

export const discoverMCPServerTools = (serverId) => async () => {
  try {
    const response = await optimai.get(`/mcp/servers/${serverId}/discover-tools`);
    return Promise.resolve(response.data);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject(errorMessage);
  }
};

export const configureMCPServerTools = (serverId, tools) => async () => {
  try {
    const response = await optimai.post(`/mcp/servers/${serverId}/configure-tools`, {
      tools,
    });
    return Promise.resolve(response.data);
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    return Promise.reject(errorMessage);
  }
};

