/**
 * Voice Service - Business logic layer for voice conversation operations
 * Implements Single Responsibility Principle by handling voice-specific business logic
 */

import type { VoiceConversation, VoiceConversationsState } from './types';

/**
 * Voice Service - Handles voice conversation state and business logic
 */
export class VoiceService {
  /**
   * Create voice conversation configuration
   * @param threadId - Thread ID
   * @param agentId - Agent ID
   * @param elevenlabsId - ElevenLabs voice ID
   * @param conversation - Conversation object
   * @returns Voice conversation configuration
   */
  createVoiceConversation(
    threadId: string,
    agentId: string,
    elevenlabsId: string,
    conversation: unknown
  ): VoiceConversation {
    return {
      isActive: true,
      agentId,
      elevenlabsId,
      conversation,
      startedAt: new Date().toISOString(),
      threadId,
    };
  }

  /**
   * Validate voice conversation configuration
   * @param config - Voice configuration to validate
   * @returns Whether the configuration is valid
   */
  validateVoiceConfiguration(config: unknown): config is VoiceConversation {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const voiceConfig = config as Partial<VoiceConversation>;

    // Required fields
    if (!voiceConfig.threadId || !voiceConfig.agentId) {
      return false;
    }

    return true;
  }

  /**
   * Check if voice is active for a thread
   * @param voiceState - Voice conversations state
   * @param threadId - Thread ID to check
   * @returns Whether voice is active
   */
  isVoiceActiveForThread(voiceState: VoiceConversationsState, threadId: string): boolean {
    return !!voiceState.byThreadId[threadId]?.isActive;
  }

  /**
   * Get voice conversation for thread
   * @param voiceState - Voice conversations state
   * @param threadId - Thread ID
   * @returns Voice conversation or null
   */
  getVoiceConversation(
    voiceState: VoiceConversationsState,
    threadId: string
  ): VoiceConversation | null {
    return voiceState.byThreadId[threadId] || null;
  }

  /**
   * Calculate voice conversation duration
   * @param conversation - Voice conversation
   * @returns Duration in milliseconds
   */
  getConversationDuration(conversation: VoiceConversation): number {
    if (!conversation.startedAt) {
      return 0;
    }

    const startTime = new Date(conversation.startedAt).getTime();
    const now = Date.now();
    return now - startTime;
  }

  /**
   * Format voice conversation duration
   * @param duration - Duration in milliseconds
   * @returns Formatted duration (e.g., "2:34")
   */
  formatDuration(duration: number): string {
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Singleton instance
let voiceServiceInstance: VoiceService | null = null;

/**
 * Get or create VoiceService instance
 * @returns VoiceService instance
 */
export const getVoiceService = (): VoiceService => {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new VoiceService();
  }
  return voiceServiceInstance;
};

