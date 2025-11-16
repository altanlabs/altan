/**
 * MCP Service - Business logic layer for Model Context Protocol operations
 */
import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

// ==================== MCP Types ====================

export interface MCPServerTransport {
  type: 'sse' | 'stdio';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPServerConfig {
  [key: string]: any;
}

export interface MCPServerMetaData {
  icon?: string;
  [key: string]: any;
}

export interface MCPServer {
  id: string;
  account_id: string;
  name: string;
  description?: string;
  url?: string;
  transport: 'sse' | 'stdio';
  approval_policy: 'auto' | 'manual' | 'hash';
  execution_mode: 'sequential' | 'parallel';
  secret_token?: string | null;
  request_headers?: Record<string, string> | null;
  force_pre_tool_speech?: boolean;
  disable_interruptions?: boolean;
  tool_approval_hashes?: string[] | null;
  config?: MCPServerConfig | null;
  meta_data?: MCPServerMetaData | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MCPConnection {
  agent_id: string;
  mcp_server_id: string;
  access_level: 'user' | 'admin' | 'readonly';
  is_active: boolean;
  agent_config_overrides?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface MCPToolPolicy {
  tool_name: string;
  approval_policy: 'auto' | 'manual' | 'hash';
}

export interface CreateMCPServerData {
  name: string;
  description?: string;
  url?: string;
  serverType: 'sse' | 'stdio';
  approvalMode: 'auto' | 'manual' | 'hash';
  executionMode: 'sequential' | 'parallel';
  secret?: string;
  secretToken?: string;
  headers?: Array<{ key: string; value: string }>;
  forcePreToolSpeech?: boolean;
  disableInterruptions?: boolean;
  toolApprovalHashes?: string[] | null;
  config?: MCPServerConfig | null;
  icon?: string;
}

export interface UpdateMCPServerData extends Partial<CreateMCPServerData> {}

export interface ConnectAgentData {
  accessLevel?: 'user' | 'admin' | 'readonly';
}

export interface UpdateConnectionData {
  accessLevel?: 'user' | 'admin' | 'readonly';
  isActive?: boolean;
  agentConfigOverrides?: Record<string, any>;
}

export interface FetchServersResponse {
  mcp_servers: MCPServer[];
}

export interface FetchServerResponse {
  mcp_server: MCPServer;
}

export interface CreateServerResponse {
  mcp_server: MCPServer;
}

export interface UpdateServerResponse {
  mcp_server: MCPServer;
}

export interface ConnectionResponse {
  connection: MCPConnection;
}

export interface FetchServerAgentsResponse {
  connected_agents: MCPConnection[];
}

export interface DiscoverToolsResponse {
  tools: any[];
}

export interface ConfigureToolsResponse {
  success: boolean;
  configured_tools: string[];
}

/**
 * Helper function to map frontend data to backend schema
 */
const mapToBackendSchema = (data: CreateMCPServerData | UpdateMCPServerData) => {
  // Transform headers array [{key, value}] to dict {key: value}
  let requestHeaders: Record<string, string> | null = null;
  if (data.headers && data.headers.length > 0) {
    requestHeaders = data.headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  const mapped: any = {
    name: data.name,
    description: data.description,
    url: data.url,
    transport: data.serverType,
    approval_policy: data.approvalMode,
    execution_mode: data.executionMode,
    secret_token: data.secret !== 'none' ? data.secretToken : null,
    request_headers: requestHeaders,
    force_pre_tool_speech: data.forcePreToolSpeech,
    disable_interruptions: data.disableInterruptions,
    tool_approval_hashes: data.toolApprovalHashes || null,
    config: data.config || null,
    meta_data: data.icon ? { icon: data.icon } : null,
  };

  // Remove undefined/null values
  return Object.fromEntries(Object.entries(mapped).filter(([, v]) => v !== undefined));
};

/**
 * MCP Service - Handles all Model Context Protocol operations
 */
export class MCPService extends BaseService {
  // ==================== Server Management ====================

  /**
   * Create a new MCP server
   * @param accountId - Account ID
   * @param data - Server configuration data
   * @returns Created MCP server
   */
  async createMCPServer(accountId: string, data: CreateMCPServerData): Promise<MCPServer> {
    return this.execute(async () => {
      const backendData = mapToBackendSchema(data);
      const response = await optimai.post<CreateServerResponse>(
        `/mcp/servers?account_id=${accountId}`,
        backendData
      );
      return response.data.mcp_server;
    }, 'Error creating MCP server');
  }

  /**
   * Fetch all MCP servers for an account
   * @param accountId - Account ID
   * @param activeOnly - Only return active servers
   * @returns List of MCP servers
   */
  async fetchMCPServers(accountId: string, activeOnly: boolean = true): Promise<MCPServer[]> {
    return this.execute(async () => {
      const response = await optimai.get<FetchServersResponse>(
        `/mcp/servers?account_id=${accountId}&active_only=${activeOnly}`
      );
      return response.data.mcp_servers || [];
    }, 'Error fetching MCP servers');
  }

  /**
   * Fetch a single MCP server
   * @param serverId - Server ID
   * @param includeConnections - Include connected agents
   * @returns MCP server details
   */
  async fetchMCPServer(serverId: string, includeConnections: boolean = false): Promise<MCPServer> {
    return this.execute(async () => {
      const response = await optimai.get<FetchServerResponse>(
        `/mcp/servers/${serverId}?include_connections=${includeConnections}`
      );
      return response.data.mcp_server;
    }, 'Error fetching MCP server');
  }

  /**
   * Update an MCP server
   * @param serverId - Server ID
   * @param data - Updated server data
   * @returns Updated MCP server
   */
  async updateMCPServer(serverId: string, data: UpdateMCPServerData): Promise<MCPServer> {
    return this.execute(async () => {
      const backendData = mapToBackendSchema(data);
      const response = await optimai.patch<UpdateServerResponse>(
        `/mcp/servers/${serverId}`,
        backendData
      );
      return response.data.mcp_server;
    }, 'Error updating MCP server');
  }

  /**
   * Delete an MCP server
   * @param serverId - Server ID
   * @param force - Force deletion even if connected
   * @returns void
   */
  async deleteMCPServer(serverId: string, force: boolean = false): Promise<void> {
    return this.execute(async () => {
      await optimai.delete(`/mcp/servers/${serverId}?force=${force}`);
    }, 'Error deleting MCP server');
  }

  // ==================== Agent-Server Connection Management ====================

  /**
   * Connect an agent to an MCP server
   * @param serverId - Server ID
   * @param agentId - Agent ID
   * @param data - Connection configuration
   * @returns Connection details
   */
  async connectAgentToMCPServer(
    serverId: string,
    agentId: string,
    data: ConnectAgentData = {}
  ): Promise<MCPConnection> {
    return this.execute(async () => {
      const connectionData = {
        access_level: data.accessLevel || 'user',
      };
      const response = await optimai.post<ConnectionResponse>(
        `/mcp/servers/${serverId}/connect-agent/${agentId}`,
        connectionData
      );
      return response.data.connection;
    }, 'Error connecting agent to MCP server');
  }

  /**
   * Fetch all MCP servers connected to an agent
   * @param agentId - Agent ID
   * @param activeOnly - Only return active servers
   * @returns List of connected MCP servers
   */
  async fetchAgentMCPServers(agentId: string, activeOnly: boolean = true): Promise<MCPServer[]> {
    return this.execute(async () => {
      const response = await optimai.get<FetchServersResponse>(
        `/mcp/agents/${agentId}/mcp-servers?active_only=${activeOnly}`
      );
      return response.data.mcp_servers || [];
    }, 'Error fetching agent MCP servers');
  }

  /**
   * Fetch all agents connected to an MCP server
   * @param serverId - Server ID
   * @param activeOnly - Only return active connections
   * @returns List of connected agents
   */
  async fetchMCPServerAgents(
    serverId: string,
    activeOnly: boolean = true
  ): Promise<MCPConnection[]> {
    return this.execute(async () => {
      const response = await optimai.get<FetchServerAgentsResponse>(
        `/mcp/servers/${serverId}/agents?active_only=${activeOnly}`
      );
      return response.data.connected_agents || [];
    }, 'Error fetching MCP server agents');
  }

  /**
   * Update an agent-MCP server connection
   * @param serverId - Server ID
   * @param agentId - Agent ID
   * @param data - Updated connection data
   * @returns Updated connection
   */
  async updateAgentMCPConnection(
    serverId: string,
    agentId: string,
    data: UpdateConnectionData
  ): Promise<MCPConnection> {
    return this.execute(async () => {
      const updateData = {
        access_level: data.accessLevel,
        is_active: data.isActive,
        agent_config_overrides: data.agentConfigOverrides,
      };
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([, v]) => v !== undefined)
      );

      const response = await optimai.patch<ConnectionResponse>(
        `/mcp/servers/${serverId}/agents/${agentId}`,
        cleanData
      );
      return response.data.connection;
    }, 'Error updating agent MCP connection');
  }

  /**
   * Disconnect an agent from an MCP server
   * @param serverId - Server ID
   * @param agentId - Agent ID
   * @returns void
   */
  async disconnectAgentFromMCPServer(serverId: string, agentId: string): Promise<void> {
    return this.execute(async () => {
      await optimai.delete(`/mcp/servers/${serverId}/agents/${agentId}`);
    }, 'Error disconnecting agent from MCP server');
  }

  // ==================== Tools Discovery and Configuration ====================

  /**
   * Discover available tools on an MCP server
   * @param serverId - Server ID
   * @returns Discovered tools
   */
  async discoverMCPServerTools(serverId: string): Promise<DiscoverToolsResponse> {
    return this.execute(async () => {
      const response = await optimai.get<DiscoverToolsResponse>(
        `/mcp/servers/${serverId}/discover-tools`
      );
      return response.data;
    }, 'Error discovering MCP server tools');
  }

  /**
   * Configure tool approval policies for an MCP server
   * @param serverId - Server ID
   * @param tools - Tool policies (array or dict)
   * @returns Configuration result
   */
  async configureMCPServerTools(
    serverId: string,
    tools: MCPToolPolicy[] | Record<string, string>
  ): Promise<ConfigureToolsResponse> {
    return this.execute(async () => {
      // Transform array of {tool_name, approval_policy} to dict {tool_name: policy}
      const toolPolicies = Array.isArray(tools)
        ? tools.reduce((acc, tool) => {
            acc[tool.tool_name] = tool.approval_policy;
            return acc;
          }, {} as Record<string, string>)
        : tools; // If already a dict, use as-is

      const response = await optimai.post<ConfigureToolsResponse>(
        `/mcp/servers/${serverId}/configure-tools`,
        { tool_policies: toolPolicies }
      );
      return response.data;
    }, 'Error configuring MCP server tools');
  }
}

// Singleton instance
let mcpServiceInstance: MCPService | null = null;

/**
 * Get MCPService singleton instance
 * @returns MCPService instance
 */
export const getMCPService = (): MCPService => {
  if (!mcpServiceInstance) {
    mcpServiceInstance = new MCPService();
  }
  return mcpServiceInstance;
};

