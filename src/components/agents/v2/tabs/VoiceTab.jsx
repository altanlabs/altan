import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useEffect } from 'react';

import ElevenlabsVoiceConfig from './ElevenlabsVoiceConfig';
import OpenAIVoiceConfig from './OpenAIVoiceConfig';
import Iconify from '../../../iconify';

function VoiceTab({ agentData, onFieldChange }) {
  const [voiceProvider, setVoiceProvider] = useState(agentData?.voice?.provider || 'elevenlabs');
  const [voiceSettings, setVoiceSettings] = useState(
    agentData?.voice || {
      provider: 'elevenlabs',
      model_id: 'eleven_flash_v2_5',
      voice_id: 'cjVigY5qzO86Huf0OWal',
      openai: 'alloy', // Default OpenAI voice
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
    },
  );

  useEffect(() => {
    // Always ensure provider is set to elevenlabs if not explicitly set to something else
    if (!agentData?.voice?.provider || agentData?.voice?.provider === 'elevenlabs') {
      const defaultSettings = {
        ...voiceSettings,
        provider: 'elevenlabs',
      };
      // Only update if not already set
      if (voiceSettings.provider !== 'elevenlabs') {
        setVoiceSettings(defaultSettings);
        setVoiceProvider('elevenlabs');
        onFieldChange('voice', defaultSettings);
      }
    }
  }, [agentData?.voice?.provider, onFieldChange, voiceSettings]);

  const handleSettingChange = (field, value) => {
    const newSettings = { ...voiceSettings, [field]: value };
    setVoiceSettings(newSettings);
    onFieldChange('voice', newSettings);
  };

  const handleProviderChange = (event, newProvider) => {
    if (newProvider !== null) {
      setVoiceProvider(newProvider);
      const newSettings = { ...voiceSettings, provider: newProvider };
      setVoiceSettings(newSettings);
      onFieldChange('voice', newSettings);
    }
  };

  return (
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
  );
}

VoiceTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(VoiceTab);
