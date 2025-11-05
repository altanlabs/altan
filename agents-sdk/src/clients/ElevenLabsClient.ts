/**
 * ElevenLabs Conversational AI Client
 * Wrapper around @elevenlabs/react useConversation
 */

import type { AgentConfig, ClientCallbacks, ElevenLabsConversation, VoiceClient } from '../types';

export class ElevenLabsClient implements VoiceClient {
  private elevenlabsAgentId: string;
  private agentConfig: AgentConfig;
  private conversation: ElevenLabsConversation;

  constructor(elevenlabsAgentId: string, agentConfig: AgentConfig, conversationHook: ElevenLabsConversation) {
    this.elevenlabsAgentId = elevenlabsAgentId;
    this.agentConfig = agentConfig;
    
    // Store the conversation hook instance (from provider)
    this.conversation = conversationHook;
  }

  /**
   * Start ElevenLabs conversation
   */
  async startSession(callbacks: ClientCallbacks = {}): Promise<boolean> {
    try {
      console.log('[ElevenLabs] Starting session with agent:', this.elevenlabsAgentId);

      // Get language from overrides or agent config
      const defaultLanguage = this.agentConfig.voice?.meta_data?.language || 'en';
      const language = callbacks.language || defaultLanguage;

      // Prepare overrides
      const sessionOverrides = {
        agent: {
          language,
          ...(callbacks.prompt && { 
            prompt: { 
              prompt: callbacks.prompt 
            } 
          }),
          ...(callbacks.firstMessage && { first_message: callbacks.firstMessage }),
        },
        ...(callbacks.tts && { tts: callbacks.tts }),
        ...(callbacks.conversation && { conversation: callbacks.conversation }),
      };

      console.log('[ElevenLabs] Session overrides:', sessionOverrides);

      // Start conversation with ElevenLabs
      // Note: Callbacks are handled in the provider's useConversation hook
      await this.conversation.startSession({
        agentId: this.elevenlabsAgentId,
        overrides: sessionOverrides,
      });

      return true;
    } catch (error) {
      console.error('[ElevenLabs] Failed to start session:', error);
      return false;
    }
  }

  /**
   * Stop the conversation
   */
  async stopSession(): Promise<boolean> {
    try {
      await this.conversation.endSession();
      return true;
    } catch (error) {
      console.error('[ElevenLabs] Error stopping session:', error);
      return false;
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.conversation.status || 'idle';
  }
}

