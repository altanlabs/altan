import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';

import Iconify from '../../../iconify';

const OPENAI_MODELS = [
  { id: 'gpt-realtime', name: 'GPT Realtime' },
  { id: 'gpt-realtime-mini', name: 'GPT Realtime Mini' },
];

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'ash', name: 'Ash' },
  { id: 'ballad', name: 'Ballad' },
  { id: 'cedar', name: 'Cedar' },
  { id: 'coral', name: 'Coral' },
  { id: 'echo', name: 'Echo' },
  { id: 'marin', name: 'Marin' },
  { id: 'sage', name: 'Sage' },
  { id: 'shimmer', name: 'Shimmer' },
  { id: 'verse', name: 'Verse' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' },
];

// Attempt preview from OpenAI CDN following the alloy pattern
const getPreviewUrl = (voiceId) => `https://cdn.openai.com/API/voice-previews/${voiceId}.flac`;

export default function OpenAIVoiceConfig({ settings, onSettingChange }) {
  const currentAudioRef = useRef(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [hoveredVoice, setHoveredVoice] = useState(null);

  const playPreview = useCallback(
    (url) => {
      if (!url) return;

      if (playingUrl === url && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
        setPlayingUrl(null);
        return;
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setPlayingUrl(url);

      audio.play().catch(() => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      });

      audio.onended = () => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      };
      audio.onerror = () => {
        currentAudioRef.current = null;
        setPlayingUrl(null);
      };
    },
    [playingUrl],
  );

  const handleVoiceChange = (voiceId) => {
    const prev = settings.openai_config || {};
    onSettingChange('openai_config', {
      ...prev,
      voice_id: voiceId,
      preview_url: getPreviewUrl(voiceId),
    });
  };

  const handleModelChange = (modelId) => {
    const prev = settings.openai_config || {};
    onSettingChange('openai_config', {
      ...prev,
      model: modelId,
    });
  };

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
    };
  }, []);

  const selectedVoiceId = settings.openai_config?.voice_id || 'alloy';
  const selectedModel = settings.openai_config?.model || 'gpt-realtime';

  return (
    <>
      {/* Model Selection */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: 'text.primary', mb: 1 }}
        >
          OpenAI Model
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Select the OpenAI Realtime model to use.
        </Typography>
        <FormControl
          fullWidth
          size="small"
        >
          <Select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {OPENAI_MODELS.map((model) => (
              <MenuItem
                key={model.id}
                value={model.id}
              >
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Voice Selection */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 0 }}>
        <Typography
          variant="h6"
          sx={{ color: 'text.primary', mb: 1 }}
        >
          OpenAI Voice
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Select the voice for your agent. Hover to preview.
        </Typography>
        <FormControl
          fullWidth
          size="small"
        >
          <Select
            value={selectedVoiceId}
            onChange={(e) => handleVoiceChange(e.target.value)}
          >
            {OPENAI_VOICES.map((voice) => {
              const url = getPreviewUrl(voice.id);
              const isPlaying = playingUrl === url;
              const isHovered = hoveredVoice === voice.id;

              return (
                <MenuItem
                  key={voice.id}
                  value={voice.id}
                  onMouseEnter={() => setHoveredVoice(voice.id)}
                  onMouseLeave={() => setHoveredVoice(null)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{voice.name}</span>
                  {(isHovered || isPlaying) && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreview(url);
                      }}
                      color={isPlaying ? 'primary' : 'default'}
                      sx={{ ml: 1 }}
                    >
                      <Iconify
                        icon={isPlaying ? 'heroicons:pause' : 'heroicons:play'}
                        width={16}
                      />
                    </IconButton>
                  )}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </>
  );
}

OpenAIVoiceConfig.propTypes = {
  settings: PropTypes.object.isRequired,
  onSettingChange: PropTypes.func.isRequired,
};
