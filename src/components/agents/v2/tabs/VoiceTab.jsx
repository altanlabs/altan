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

function VoiceTab({ agentData, onFieldChange }) {
  const [voiceProvider, setVoiceProvider] = useState(
    normalizeProvider(agentData?.voice?.provider),
  );
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const settings = agentData?.voice || {
      provider: 'elevenlabs',
      model_id: 'eleven_flash_v2_5',
      voice_id: 'cjVigY5qzO86Huf0OWal',
      openai_config: {
        voice_id: 'alloy',
        preview_url: 'https://cdn.openai.com/API/voice-previews/alloy.flac',
      },
      supported_voices: [],
      agent_output_audio_format: 'pcm_24000',
      optimize_streaming_latency: 3,
      stability: 0.5,
      speed: 1.0,
      similarity_boost: 0.8,
      pronunciation_dictionary_locators: [],
      meta_data: {
        language: 'en',
        language_presets: {},
      },
    };
    // Normalize the provider
    return {
      ...settings,
      provider: normalizeProvider(settings.provider),
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
      onFieldChange('voice', updatedSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentData?.voice?.provider]);

  // Migrate legacy `openai` string to `openai_config`
  useEffect(() => {
    if (voiceSettings?.openai && !voiceSettings?.openai_config) {
      const id = voiceSettings.openai;
      const migrated = {
        ...voiceSettings,
        openai_config: {
          voice_id: id,
          preview_url: `https://cdn.openai.com/API/voice-previews/${id}.flac`,
        },
      };
      delete migrated.openai;
      setVoiceSettings(migrated);
      onFieldChange('voice', migrated);
    }
  }, [voiceSettings, onFieldChange]);

  const handleSettingChange = (field, value) => {
    const newSettings = { ...voiceSettings, [field]: value };
    setVoiceSettings(newSettings);
    onFieldChange('voice', newSettings);
  };

  const handleProviderChange = (event, newProvider) => {
    if (newProvider !== null) {
      const normalizedProvider = normalizeProvider(newProvider);
      setVoiceProvider(normalizedProvider);
      const newSettings = { ...voiceSettings, provider: normalizedProvider };
      setVoiceSettings(newSettings);
      onFieldChange('voice', newSettings);
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
                agentData={agentData}
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
                  onFieldChange('voice', newSettings);
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
