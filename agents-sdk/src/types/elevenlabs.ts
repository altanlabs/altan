/**
 * ElevenLabs Conversational AI specific types
 * Based on: https://elevenlabs.io/docs/conversational-ai
 */

// ============================================================================
// ElevenLabs Conversation Hook Interface
// ============================================================================

export interface ElevenLabsConversation {
  startSession(options: { 
    agentId: string; 
    overrides?: ElevenLabsSessionOverrides;
  }): Promise<void>;
  endSession(): Promise<void>;
  status?: string;
  isSpeaking?: boolean;
  setVolume?(volume: number): void;
}

// ============================================================================
// ElevenLabs Session Configuration
// ============================================================================

export interface ElevenLabsSessionOverrides {
  agent?: {
    prompt?: {
      prompt?: string;
      llm?: string;
      temperature?: number;
      max_tokens?: number;
    };
    first_message?: string;
    language?: string;
  };
  tts?: {
    voice_id?: string;
    model_id?: string;
    stability?: number;
    similarity_boost?: number;
    use_speaker_boost?: boolean;
  };
  conversation?: {
    max_duration_seconds?: number;
    client_events?: string[];
    server_events?: string[];
  };
}

// ============================================================================
// ElevenLabs Event Types
// ============================================================================

export interface ElevenLabsEvent {
  type: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

// ============================================================================
// ElevenLabs Voice Settings
// ============================================================================

export interface ElevenLabsVoice {
  voice_id: string;
  name?: string;
  model_id?: string;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    use_speaker_boost?: boolean;
  };
}

// ============================================================================
// ElevenLabs Agent Configuration
// ============================================================================

export interface ElevenLabsAgentConfig {
  agent_id: string;
  name?: string;
  prompt?: string;
  first_message?: string;
  language?: string;
  tts?: {
    voice_id?: string;
    model_id?: string;
  };
  llm?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };
}

