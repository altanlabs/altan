/**
 * Common types shared across all providers
 */

// ============================================================================
// Agent Configuration Types
// ============================================================================

export interface VoiceConfig {
  provider?: string;
  voice_id?: string;
  model_id?: string;
  openai?: string;
  openai_config?: Record<string, unknown>;
  elevenlabs_agent_id?: string;
  meta_data?: {
    language?: string;
    [key: string]: unknown;
  };
}

export interface AgentConfig {
  id: string;
  name: string;
  voice?: VoiceConfig;
  elevenlabs_id?: string;
  elevenlabs_agent_id?: string;
  meta_data?: {
    elevenlabs_agent_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ============================================================================
// Provider Types
// ============================================================================

export type VoiceProvider = 'openai' | 'elevenlabs';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type AgentState = 'listening' | 'thinking' | 'talking' | 'speaking' | null;

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

// ============================================================================
// Client Tools Types
// ============================================================================

export type ClientToolFunction = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export interface ClientTools {
  [toolName: string]: ClientToolFunction;
}

// ============================================================================
// Client Interface (Provider-agnostic)
// ============================================================================

export interface VoiceClient {
  startSession(callbacks?: ClientCallbacks): Promise<boolean>;
  stopSession(): Promise<boolean>;
  getConnectionState(): ConnectionStatus | string;
  setMuted?(muted: boolean): void;
  toggleMute?(): boolean;
  sendUserMessage?(text: string): void;
  createUserMessage?(text: string): void;
}

// ============================================================================
// Callback Types (Provider-agnostic)
// ============================================================================

export interface ClientCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onToolCall?: (toolName: string, args: Record<string, unknown>, result?: unknown) => void;
  onMessage?: (event: any) => void; // Generic - providers have specific event types
  language?: string;
  prompt?: string;
  firstMessage?: string;
  tts?: Record<string, unknown>;
  conversation?: Record<string, unknown>;
}

// ============================================================================
// Session Options Types
// ============================================================================

export interface SessionOptions extends ClientCallbacks {
  agentId?: string;
  overrides?: Record<string, unknown>;
}

// ============================================================================
// Voice Settings Types (Base)
// ============================================================================

export interface OpenAIVoiceSettings {
  voice: string;
  model: string;
}

export interface ElevenLabsVoiceSettings {
  voice_id?: string;
  model_id: string;
}

export type VoiceSettings = OpenAIVoiceSettings | ElevenLabsVoiceSettings;

