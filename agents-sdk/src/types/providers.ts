/**
 * Provider and context types
 */

import { ReactNode } from 'react';
import type { 
  AgentConfig, 
  VoiceProvider, 
  ConnectionStatus, 
  VoiceClient,
  ClientTools,
  SessionOptions
} from './common';
import type { OpenAIRealtimeEvent } from './openai';

// ============================================================================
// Provider Context Types
// ============================================================================

export interface VoiceAgentContextValue {
  // Agent data
  agentId: string;
  agentName?: string;
  agentConfig: AgentConfig | null;
  provider: VoiceProvider | null;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: ConnectionStatus;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startConversation: (options?: Partial<SessionOptions>) => Promise<boolean>;
  stopConversation: () => Promise<boolean>;
  
  // Client reference (for advanced usage)
  client: VoiceClient | null;
}

// ============================================================================
// Provider Props Types
// ============================================================================

export interface VoiceAgentProviderProps {
  agentId: string;
  clientTools?: ClientTools;
  overrides?: Record<string, unknown>;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onToolCall?: (toolName: string, args: Record<string, unknown>, result?: unknown) => void;
  onMessage?: (event: OpenAIRealtimeEvent) => void;
  children: ReactNode;
}

