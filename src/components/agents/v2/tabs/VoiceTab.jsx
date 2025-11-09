import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useEffect } from 'react';

import { VoiceAgentProvider, VoiceCallButton } from '@agents-sdk';

import ElevenlabsVoiceConfig from './ElevenlabsVoiceConfig';
import OpenAIVoiceConfig from './OpenAIVoiceConfig';
import Iconify from '../../../iconify';

// Normalize provider names to handle legacy/variant formats
const normalizeProvider = (provider) => {
  if (!provider) return 'elevenlabs';
  const normalized = provider.toLowerCase().replace(/_/g, '');
  if (normalized.includes('openai')) return 'openai';
  if (normalized.includes('eleven')) return 'elevenlabs';
  return 'elevenlabs'; // default fallback
};

// Helper function to build elevenlabs_config from settings
const buildElevenlabsConfig = (settings) => {
  const elevenlabsFields = [
    'model_id',
    'voice_id',
    'name',
    'preview_url',
    'agent_output_audio_format',
    'optimize_streaming_latency',
    'stability',
    'speed',
    'similarity_boost',
    'pronunciation_dictionary_locators',
  ];

  const config = {};
  elevenlabsFields.forEach((field) => {
    if (settings[field] !== undefined) {
      config[field] = settings[field];
    }
  });
  return config;
};

function VoiceTab({ agentData, onFieldChange }) {
  const [voiceProvider, setVoiceProvider] = useState(
    normalizeProvider(agentData?.voice?.provider),
  );
  const [voiceSettings, setVoiceSettings] = useState(() => {
    // New nested structure: elevenlabs_config and openai_config inside voice object
    const voiceData = agentData?.voice || {};
    const elevenlabsConfig = voiceData?.elevenlabs_config || {
      model_id: 'eleven_flash_v2_5',
      voice_id: 'cjVigY5qzO86Huf0OWal',
      name: '',
      preview_url: null,
      agent_output_audio_format: 'pcm_24000',
      optimize_streaming_latency: 3,
      stability: 0.5,
      speed: 1.0,
      similarity_boost: 0.8,
      pronunciation_dictionary_locators: [],
    };

    const openaiConfig = voiceData?.openai_config || {
      voice_id: 'alloy',
      preview_url: 'https://cdn.openai.com/API/voice-previews/alloy.flac',
      model: 'gpt-realtime',
    };

    const provider = normalizeProvider(voiceData.provider);

    // Combine into a unified settings object for component compatibility
    return {
      provider,
      ...elevenlabsConfig,
      openai_config: openaiConfig,
      meta_data: voiceData.meta_data || {
        language: 'en',
        language_presets: {},
      },
    };
  });

  useEffect(() => {
    // Normalize the provider in agentData if it exists
    const normalizedProvider = normalizeProvider(agentData?.voice?.provider);

    // Update voiceSettings to use normalized provider only if it's different
    if (voiceSettings.provider !== normalizedProvider) {
      const updatedSettings = {
        ...voiceSettings,
        provider: normalizedProvider,
      };
      setVoiceSettings(updatedSettings);
      setVoiceProvider(normalizedProvider);

      // Update voice with nested elevenlabs_config
      onFieldChange({
        voice: {
          provider: normalizedProvider,
          meta_data: updatedSettings.meta_data,
          elevenlabs_config: buildElevenlabsConfig(updatedSettings),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentData?.voice?.provider]);

  const handleSettingChange = (field, value) => {
    const newSettings = { ...voiceSettings, [field]: value };
    setVoiceSettings(newSettings);

    // Build the voice object with nested configs
    const voiceUpdate = {
      provider: newSettings.provider,
      meta_data: newSettings.meta_data,
      elevenlabs_config: buildElevenlabsConfig(newSettings),
    };

    // Add openai_config if changed
    if (field === 'openai_config') {
      voiceUpdate.openai_config = value;
    } else if (newSettings.openai_config) {
      voiceUpdate.openai_config = newSettings.openai_config;
    }

    // Send voice update with nested configs
    onFieldChange({ voice: voiceUpdate });
  };

  const handleProviderChange = (event, newProvider) => {
    if (newProvider !== null) {
      const normalizedProvider = normalizeProvider(newProvider);
      setVoiceProvider(normalizedProvider);
      const newSettings = { ...voiceSettings, provider: normalizedProvider };
      setVoiceSettings(newSettings);

      // Send voice update with nested configs
      onFieldChange({
        voice: {
          provider: normalizedProvider,
          meta_data: newSettings.meta_data,
          elevenlabs_config: buildElevenlabsConfig(newSettings),
          openai_config: newSettings.openai_config,
        },
      });
    }
  };

  // Get agent ID for VoiceAgentProvider
  const agentIdForProvider = agentData?.id || agentData?._id;

  if (!agentIdForProvider) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">No agent ID found</Typography>
      </Box>
    );
  }

  return (
    <VoiceAgentProvider agentId={agentIdForProvider}>
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Left Panel: Configuration */}
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Provider Toggle and Test Button */}
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary' }}
                >
                  Voice Provider
                </Typography>
                {/* Voice Call Button */}
                <Box>
                  <VoiceCallButton
                    startLabel="Test Call"
                    stopLabel="End Call"
                    connectingLabel="Connecting..."
                  />
                </Box>
              </Box>

              <ToggleButtonGroup
                value={voiceProvider}
                exclusive
                onChange={handleProviderChange}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="elevenlabs">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify
                      icon="simple-icons:elevenlabs"
                      width={20}
                    />
                    <span>ElevenLabs</span>
                  </Box>
                </ToggleButton>
                <ToggleButton value="openai">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify
                      icon="simple-icons:openai"
                      width={20}
                    />
                    <span>OpenAI Realtime</span>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Status is handled in OpenAIVoiceConfig */}
            </Box>

            {voiceProvider === 'openai' && (
              <OpenAIVoiceConfig
                settings={voiceSettings}
                onSettingChange={handleSettingChange}
              />
            )}

            {voiceProvider === 'elevenlabs' && (
              <ElevenlabsVoiceConfig
                agentData={agentData}
                settings={voiceSettings}
                onUpdate={(newSettings) => {
                  setVoiceSettings(newSettings);
                  onFieldChange({
                    voice: {
                      provider: newSettings.provider,
                      meta_data: newSettings.meta_data,
                      elevenlabs_config: buildElevenlabsConfig(newSettings),
                      openai_config: newSettings.openai_config,
                    },
                  });
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </VoiceAgentProvider>
  );
}

VoiceTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(VoiceTab);
