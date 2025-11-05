/**
 * @altan/agents-sdk
 * Easy-to-use SDK for integrating Altan AI voice agents
 */

// Provider and Hook
export { VoiceAgentProvider, useVoiceAgent } from './providers/VoiceAgentProvider';

// Components
export { Orb } from './components/Orb';
export { AgentOrb } from './components/AgentOrb';
export { VoiceCallButton } from './components/VoiceCallButton';
export { VoiceCallCard } from './components/VoiceCallCard';
export { Conversation } from './components/Conversation';
export { ConversationWithMessages } from './components/ConversationWithMessages';
export { ConversationBar } from './components/ConversationBar';
export { SimpleExample } from './components/SimpleExample';

// Clients (for advanced usage)
export { ElevenLabsClient } from './clients/ElevenLabsClient';
export { OpenAIRealtimeClient } from './clients/OpenAIRealtimeClient';

// Utils (for advanced usage)
export { fetchAgentConfig, detectVoiceProvider, getElevenLabsAgentId, getVoiceSettings } from './utils/api';

// Types
export type {
  // Core types
  AgentConfig,
  VoiceConfig,
  VoiceProvider,
  ConnectionStatus,
  AgentState,
  
  // Message types
  Message,
  OpenAIRealtimeEvent,
  
  // Client types
  ClientTools,
  ClientToolFunction,
  ClientCallbacks,
  SessionOptions,
  VoiceClient,
  ElevenLabsConversation,
  
  // Component prop types
  OrbProps,
  AgentOrbProps,
  VoiceCallButtonProps,
  VoiceCallCardProps,
  ConversationProps,
  ConversationWithMessagesProps,
  ConversationBarProps,
  LiveWaveformProps,
  
  // Context types
  VoiceAgentContextValue,
  VoiceAgentProviderProps,
  
  // Voice settings
  VoiceSettings,
  OpenAIVoiceSettings,
  ElevenLabsVoiceSettings,
} from './types';

