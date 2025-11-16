/**
 * Agent Service - Business logic layer for agent operations
 */
import { getAgentPort, getPlatformPort } from '../di/index';
import { BaseService } from './BaseService';
import type {
  IAgentPort,
  IPlatformPort,
  AgentRetryData,
  Agent,
  CreateAgentData,
  UpdateAgentData,
  ListVoicesOptions,
  ListVoicesResponse,
  AgentDMResponse,
  AgentRoomsResponse,
  FetchAgentResponse,
} from './types';

/**
 * Agent Service - Handles all agent-related operations
 */
export class AgentService extends BaseService {
  private agentPort: IAgentPort;
  private platformPort: IPlatformPort;

  constructor() {
    super();
    this.agentPort = getAgentPort<IAgentPort>();
    this.platformPort = getPlatformPort<IPlatformPort>();
  }

  // ==================== Agent CRUD Operations ====================

  /**
   * Fetch agent details
   * @param agentId - Agent ID
   * @returns Agent data
   */
  async fetchAgent(agentId: string): Promise<FetchAgentResponse> {
    return this.execute(
      async () => await this.platformPort.fetchAgent(agentId),
      'Error fetching agent',
    );
  }

  /**
   * Create a new agent
   * @param accountId - Account ID
   * @param agentData - Agent configuration
   * @returns Created agent
   */
  async createAgent(accountId: string, agentData: CreateAgentData): Promise<{ agent: Agent }> {
    return this.execute(
      async () => await this.platformPort.createAgent(accountId, agentData),
      'Error creating agent',
    );
  }

  /**
   * Update an existing agent
   * @param agentId - Agent ID
   * @param updates - Agent updates
   * @returns Updated agent
   */
  async updateAgent(agentId: string, updates: UpdateAgentData): Promise<{ agent: Agent }> {
    return this.execute(
      async () => await this.platformPort.updateAgent(agentId, updates),
      'Error updating agent',
    );
  }

  /**
   * Delete an agent
   * @param agentId - Agent ID
   */
  async deleteAgent(agentId: string): Promise<void> {
    return this.execute(
      async () => await this.platformPort.deleteAgent(agentId),
      'Error deleting agent',
    );
  }

  // ==================== Agent Room Operations ====================

  /**
   * Fetch agent DM room
   * @param agentId - Agent ID
   * @param accountId - Account ID
   * @returns DM room data
   */
  async fetchAgentDM(agentId: string, accountId: string): Promise<AgentDMResponse> {
    return this.execute(
      async () => await this.platformPort.fetchAgentDM(agentId, accountId),
      'Error fetching agent DM',
    );
  }

  /**
   * Fetch all rooms associated with an agent
   * @param agentId - Agent ID
   * @returns Agent rooms
   */
  async fetchAgentRooms(agentId: string): Promise<AgentRoomsResponse> {
    return this.execute(
      async () => await this.platformPort.fetchAgentRooms(agentId),
      'Error fetching agent rooms',
    );
  }

  // ==================== Agent Response Operations ====================

  /**
   * Stop an agent's response
   * @param responseId - LLM response ID
   * @returns Response data
   */
  async stopResponse(responseId: string): Promise<unknown> {
    return this.execute(
      async () => await this.agentPort.stopAgentResponse(responseId),
      'Error stopping agent response',
    );
  }

  /**
   * Stop all agent responses in a thread
   * @param threadId - Thread ID
   * @returns Response data
   */
  async stopThreadGeneration(threadId: string): Promise<unknown> {
    return this.execute(
      async () => await this.agentPort.stopThreadGeneration(threadId),
      'Error stopping thread generation',
    );
  }

  /**
   * Retry a failed agent response
   * @param retryData - Retry configuration
   * @returns Response data
   */
  async retryResponse(retryData: AgentRetryData): Promise<unknown> {
    return this.execute(
      async () => await this.agentPort.retryResponse(retryData),
      'Error retrying response',
    );
  }

  // ==================== Voice Operations ====================

  /**
   * List available voices for agents
   * @param options - Query options (search, pagination)
   * @returns List of voices
   */
  async listVoices(options?: ListVoicesOptions): Promise<ListVoicesResponse> {
    return this.execute(
      async () => await this.agentPort.listVoices(options),
      'Error listing voices',
    );
  }
}

// Singleton instance
let agentServiceInstance: AgentService | null = null;

/**
 * Get AgentService singleton instance
 * @returns AgentService instance
 */
export const getAgentService = (): AgentService => {
  if (!agentServiceInstance) {
    agentServiceInstance = new AgentService();
  }
  return agentServiceInstance;
};

