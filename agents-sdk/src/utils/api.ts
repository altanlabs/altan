/**
 * API utilities for fetching public agent configurations
 */

import type { AgentConfig, VoiceProvider, VoiceSettings } from '../types';

const ALTAN_API_BASE = 'https://platform-api.altan.ai';

/**
 * Fetch public agent configuration
 */
export async function fetchAgentConfig(agentId: string): Promise<AgentConfig> {
  try {
    const response = await fetch(`${ALTAN_API_BASE}/agent/${agentId}/public`);

    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }

    const data = await response.json();

    // API returns { "agent": { ... } } - unwrap it
    return data.agent || data;
  } catch (error) {
    console.error('Error fetching agent config:', error);
    throw error;
  }
}

/**
 * Detect voice provider from agent configuration
 */
export function detectVoiceProvider(agentConfig: AgentConfig): VoiceProvider {
  const voiceConfig = agentConfig?.voice;

  if (!voiceConfig) {
    return 'openai'; // Default to OpenAI (better quality)
  }

  if (voiceConfig.provider) {
    const normalizedProvider = voiceConfig.provider.toLowerCase().replace(/_/g, '');

    console.log('[SDK] Raw provider:', voiceConfig.provider);
    console.log('[SDK] Normalized provider:', normalizedProvider);

    if (normalizedProvider === 'elevenlabs') {
      return 'elevenlabs';
    }
    if (normalizedProvider === 'openai') {
      return 'openai';
    }
  }

  // Check if ElevenLabs agent ID is present
  const hasElevenLabsId = !!(
    agentConfig?.elevenlabs_id ||
    agentConfig?.elevenlabs_agent_id ||
    voiceConfig?.elevenlabs_agent_id ||
    agentConfig?.meta_data?.elevenlabs_agent_id
  );

  if (hasElevenLabsId) {
    return 'elevenlabs';
  }

  // Check for OpenAI config
  if (voiceConfig.openai_config) {
    return 'openai';
  }

  // Default to OpenAI (ChatGPT quality)
  return 'openai';
}

/**
 * Get ElevenLabs agent ID from agent configuration
 */
export function getElevenLabsAgentId(agentConfig: AgentConfig): string | null {
  // Try multiple possible locations for the ElevenLabs agent ID
  return (
    agentConfig?.elevenlabs_id ||
    agentConfig?.elevenlabs_agent_id ||
    agentConfig?.voice?.elevenlabs_agent_id ||
    agentConfig?.meta_data?.elevenlabs_agent_id ||
    null
  );
}

/**
 * Get voice settings for the active provider
 */
export function getVoiceSettings(agentConfig: AgentConfig, provider: VoiceProvider): VoiceSettings {
  const voiceConfig = agentConfig?.voice || {};

  if (provider === 'openai') {
    const openaiConfig = voiceConfig.openai_config || {};
    return {
      voice: openaiConfig.voice_id || 'alloy',
      model: openaiConfig.model || 'gpt-realtime',
    };
  }

  // ElevenLabs settings
  const elevenlabsConfig = voiceConfig.elevenlabs_config || {};
  return {
    voice_id: elevenlabsConfig.voice_id,
    model_id: elevenlabsConfig.model_id || 'eleven_flash_v2_5',
  };
}
