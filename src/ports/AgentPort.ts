/**
 * Agent Port - Domain interface for AI agent operations
 * Defines all agent-related operations without implementation details
 */

export interface RetryData {
  responseId?: string;
  threadId?: string;
  messageId?: string;
  [key: string]: unknown;
}

export interface VoiceOptions {
  search?: string;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface VoicesResponse {
  voices: Voice[];
  total?: number;
  [key: string]: unknown;
}

export interface Voice {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface AgentResponse {
  success: boolean;
  [key: string]: unknown;
}

/**
 * Abstract base class for agent operations
 */
export abstract class AgentPort {
  /**
   * Stop an agent response
   * @param responseId - LLM response ID
   * @returns Result
   */
  abstract stopAgentResponse(responseId: string): Promise<AgentResponse>;

  /**
   * Stop all agent responses in a thread
   * @param threadId - Thread ID
   * @returns Result
   */
  abstract stopThreadGeneration(threadId: string): Promise<AgentResponse>;

  /**
   * Retry a failed agent response
   * @param retryData - Retry configuration
   * @returns Result
   */
  abstract retryResponse(retryData: RetryData): Promise<AgentResponse>;

  /**
   * List available voices
   * @param options - Query options (search, pagination)
   * @returns Voices data
   */
  abstract listVoices(options?: VoiceOptions): Promise<VoicesResponse>;
}

