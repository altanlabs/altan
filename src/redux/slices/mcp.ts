import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';

import analytics from '../../lib/analytics';
import { getMCPService } from '../../services/MCPService';
import type {
  MCPServer,
  MCPConnection,
  CreateMCPServerData,
  UpdateMCPServerData,
  ConnectAgentData,
  UpdateConnectionData,
  MCPToolPolicy,
} from '../../services/MCPService';

// ==================== State Types ====================

interface ConnectionsState {
  isLoading: boolean;
  error: string | null;
  items: MCPConnection[];
}

interface MCPState {
  isLoading: boolean;
  error: string | null;
  servers: MCPServer[];
  currentServer: MCPServer | null;
  connections: ConnectionsState;
}

const initialState: MCPState = {
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

// ==================== Slice ====================

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

    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setServers(state, action: PayloadAction<MCPServer[]>) {
      state.servers = action.payload;
      state.isLoading = false;
    },

    setCurrentServer(state, action: PayloadAction<MCPServer>) {
      state.currentServer = action.payload;
      state.isLoading = false;
    },

    addServer(state, action: PayloadAction<MCPServer>) {
      state.servers = [...state.servers, action.payload];
    },

    updateServer(state, action: PayloadAction<MCPServer>) {
      const updatedServer = action.payload;
      state.servers = state.servers.map((server) =>
        server.id === updatedServer.id ? updatedServer : server
      );
      if (state.currentServer && state.currentServer.id === updatedServer.id) {
        state.currentServer = updatedServer;
      }
    },

    deleteServer(state, action: PayloadAction<string>) {
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

    hasConnectionError(state, action: PayloadAction<string>) {
      state.connections.isLoading = false;
      state.connections.error = action.payload;
    },

    setConnections(state, action: PayloadAction<MCPConnection[]>) {
      state.connections.items = action.payload;
      state.connections.isLoading = false;
    },

    addConnection(state, action: PayloadAction<MCPConnection>) {
      state.connections.items = [...state.connections.items, action.payload];
    },

    updateConnection(state, action: PayloadAction<MCPConnection>) {
      const updatedConnection = action.payload;
      state.connections.items = state.connections.items.map((conn) =>
        conn.agent_id === updatedConnection.agent_id &&
        conn.mcp_server_id === updatedConnection.mcp_server_id
          ? updatedConnection
          : conn
      );
    },

    removeConnection(state, action: PayloadAction<{ agentId: string; serverId: string }>) {
      const { agentId, serverId } = action.payload;
      state.connections.items = state.connections.items.filter(
        (conn) => !(conn.agent_id === agentId && conn.mcp_server_id === serverId)
      );
    },
  },
});

export const { reducer } = slice;

export default reducer;

// ==================== Server Management Actions ====================

const mcpService = getMCPService();

export const createMCPServer =
  (accountId: string, data: CreateMCPServerData): AppThunk<Promise<MCPServer>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const mcpServer = await mcpService.createMCPServer(accountId, data);
      dispatch(slice.actions.addServer(mcpServer));

      // Track MCP server creation
      analytics.track('created_mcp_server', {
        server_id: mcpServer.id,
        server_type: data.serverType,
        has_env_vars: !!(data.config && Object.keys(data.config).length > 0),
        has_args: !!(data.headers && data.headers.length > 0),
      });

      return Promise.resolve(mcpServer);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const fetchMCPServers =
  (accountId: string, activeOnly: boolean = true): AppThunk<Promise<MCPServer[]>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const mcpServers = await mcpService.fetchMCPServers(accountId, activeOnly);
      dispatch(slice.actions.setServers(mcpServers));
      return Promise.resolve(mcpServers);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const fetchMCPServer =
  (serverId: string, includeConnections: boolean = false): AppThunk<Promise<MCPServer>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const mcpServer = await mcpService.fetchMCPServer(serverId, includeConnections);
      dispatch(slice.actions.setCurrentServer(mcpServer));
      return Promise.resolve(mcpServer);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const updateMCPServer =
  (serverId: string, data: UpdateMCPServerData): AppThunk<Promise<MCPServer>> =>
  async (dispatch) => {
    try {
      const mcpServer = await mcpService.updateMCPServer(serverId, data);
      dispatch(slice.actions.updateServer(mcpServer));

      // Track MCP server update
      analytics.track('updated_mcp_server', {
        server_id: serverId,
        updated_fields: Object.keys(data),
      });

      return Promise.resolve(mcpServer);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

export const deleteMCPServer =
  (serverId: string, force: boolean = false): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      await mcpService.deleteMCPServer(serverId, force);
      dispatch(slice.actions.deleteServer(serverId));
      return Promise.resolve();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

// ==================== Agent-Server Connection Management Actions ====================

export const connectAgentToMCPServer =
  (serverId: string, agentId: string, data: ConnectAgentData = {}): AppThunk<Promise<MCPConnection>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingConnections());
    try {
      const connection = await mcpService.connectAgentToMCPServer(serverId, agentId, data);
      dispatch(slice.actions.addConnection(connection));

      // Track agent-server connection
      analytics.track('connected_agent_to_mcp_server', {
        server_id: serverId,
        agent_id: agentId,
        access_level: data.accessLevel || 'user',
      });

      return Promise.resolve(connection);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasConnectionError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoadingConnections());
    }
  };

export const fetchAgentMCPServers =
  (agentId: string, activeOnly: boolean = true): AppThunk<Promise<MCPServer[]>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const mcpServers = await mcpService.fetchAgentMCPServers(agentId, activeOnly);
      dispatch(slice.actions.setServers(mcpServers));
      return Promise.resolve(mcpServers);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasError(errorMessage));
      return Promise.reject(errorMessage);
    } finally {
      dispatch(slice.actions.stopLoading());
    }
  };

export const fetchMCPServerAgents =
  (serverId: string, activeOnly: boolean = true): AppThunk<Promise<MCPConnection[]>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingConnections());
    try {
      const connectedAgents = await mcpService.fetchMCPServerAgents(serverId, activeOnly);
      dispatch(slice.actions.setConnections(connectedAgents));
      return Promise.resolve(connectedAgents);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      dispatch(slice.actions.hasConnectionError(errorMessage));
      return Promise.reject(errorMessage);
    }
  };

export const updateAgentMCPConnection =
  (serverId: string, agentId: string, data: UpdateConnectionData): AppThunk<Promise<MCPConnection>> =>
  async (dispatch) => {
    try {
      const connection = await mcpService.updateAgentMCPConnection(serverId, agentId, data);
      dispatch(slice.actions.updateConnection(connection));
      return Promise.resolve(connection);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

export const disconnectAgentFromMCPServer =
  (serverId: string, agentId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      await mcpService.disconnectAgentFromMCPServer(serverId, agentId);
      dispatch(slice.actions.removeConnection({ agentId, serverId }));
      return Promise.resolve();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

// ==================== MCP Tools Discovery and Configuration ====================

export const discoverMCPServerTools =
  (serverId: string): AppThunk<Promise<any>> =>
  async () => {
    try {
      const result = await mcpService.discoverMCPServerTools(serverId);
      return Promise.resolve(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

export const configureMCPServerTools =
  (serverId: string, tools: MCPToolPolicy[] | Record<string, string>): AppThunk<Promise<any>> =>
  async () => {
    try {
      const result = await mcpService.configureMCPServerTools(serverId, tools);
      return Promise.resolve(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      return Promise.reject(errorMessage);
    }
  };

