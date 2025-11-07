/**
 * @altan/agents-sdk - Type definitions
 * 
 * Organized by concern for maintainability and scalability:
 * - common: Provider-agnostic shared types
 * - openai: OpenAI Realtime API specific types
 * - elevenlabs: ElevenLabs Conversational AI specific types
 * - components: React component prop types
 * - providers: Provider and context types
 */

// ============================================================================
// Common Types (Provider-agnostic)
// ============================================================================

export type {
  // Agent configuration
  VoiceConfig,
  AgentConfig,
  
  // Provider types
  VoiceProvider,
  ConnectionStatus,
  AgentState,
  
  // Messages
  Message,
  
  // Client tools
  ClientToolFunction,
  ClientTools,
  
  // Client interface
  VoiceClient,
  
  // Callbacks
  ClientCallbacks,
  SessionOptions,
  
  // Voice settings
  OpenAIVoiceSettings,
  ElevenLabsVoiceSettings,
  VoiceSettings,
} from './common';

// ============================================================================
// OpenAI Realtime API Types
// ============================================================================

export type {
  OpenAIRealtimeEvent,
  OpenAISessionConfig,
  OpenAIEventType,
} from './openai';

export { OpenAIEventTypes } from './openai';

// ============================================================================
// ElevenLabs Types
// ============================================================================

export type {
  ElevenLabsConversation,
  ElevenLabsSessionOverrides,
  ElevenLabsEvent,
  ElevenLabsVoice,
  ElevenLabsAgentConfig,
} from './elevenlabs';

// ============================================================================
// Component Types
// ============================================================================

export type {
  OrbProps,
  AgentOrbProps,
  VoiceCallButtonProps,
  VoiceCallCardProps,
  ConversationProps,
  ConversationWithMessagesProps,
  ConversationBarProps,
  LiveWaveformProps,
} from './components';

// ============================================================================
// Provider Types
// ============================================================================

export type {
  VoiceAgentContextValue,
  VoiceAgentProviderProps,
} from './providers';

