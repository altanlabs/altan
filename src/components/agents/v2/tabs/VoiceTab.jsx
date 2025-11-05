import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Chip,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useRef, useEffect } from 'react';

import Iconify from '../../../iconify';
import VoiceSelector from '../components/VoiceSelector';
import { optimai } from '../../../../utils/axios';

const AUDIO_FORMATS = [
  'pcm_8000',
  'pcm_16000',
  'pcm_22050',
  'pcm_24000',
  'pcm_44100',
  'pcm_48000',
  'ulaw_8000',
];

const VOICE_MODELS = [
  { id: 'eleven_turbo_v2', name: 'Turbo v2' },
  { id: 'eleven_flash_v2', name: 'Flash v2' },
  { id: 'eleven_flash_v2_5', name: 'Flash v2.5' },
];

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' },
  { id: 'shimmer', name: 'Shimmer' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇦🇪' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt-br', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
];

function VoiceTab({ agentData, onFieldChange }) {
  const [voiceProvider, setVoiceProvider] = useState(agentData?.voice?.provider || 'elevenlabs');
  const [voiceSettings, setVoiceSettings] = useState(
    agentData?.voice || {
      provider: 'elevenlabs',
      model_id: 'eleven_flash_v2',
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

  const [selectedLanguageForFirstMessage, setSelectedLanguageForFirstMessage] = useState('en');
  const [isTestingRealtime, setIsTestingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const realtimeConnectionRef = useRef(null);
  const audioContextRef = useRef(null);

  const handleSettingChange = (field, value) => {
    const newSettings = { ...voiceSettings, [field]: value };
    setVoiceSettings(newSettings);
    onFieldChange('voice', newSettings);
  };

  const handleMetaDataChange = (field, value) => {
    const newMetaData = { ...voiceSettings.meta_data, [field]: value };
    const newSettings = { ...voiceSettings, meta_data: newMetaData };
    setVoiceSettings(newSettings);
    onFieldChange('voice', newSettings);
  };

  const handleModelChange = (e) => {
    handleSettingChange('model_id', e.target.value);
  };

  const handleLanguageChange = (e) => {
    handleMetaDataChange('language', e.target.value);
  };

  const handleAdditionalLanguagesChange = (e) => {
    const selectedLanguages = e.target.value;
    let languagesToProcess = [];

    // Handle "All" and "None" special cases
    if (selectedLanguages.includes('__ALL__')) {
      // Select all languages except the default one
      languagesToProcess = LANGUAGES.filter(
        (lang) => lang.code !== voiceSettings.meta_data?.language,
      ).map((lang) => lang.code);
    } else if (selectedLanguages.includes('__NONE__') || selectedLanguages.length === 0) {
      // Clear all selections
      languagesToProcess = [];
    } else {
      // Filter out special values and use selected languages
      languagesToProcess = selectedLanguages.filter((lang) => !lang.startsWith('__'));
    }

    const newLanguagePresets = {};
    languagesToProcess.forEach((langCode) => {
      if (langCode !== voiceSettings.meta_data?.language) {
        newLanguagePresets[langCode] = {
          overrides: {
            tts: null,
            conversation: null,
            agent: {
              first_message: null,
              language: null,
              prompt: null,
            },
          },
        };
      }
    });

    handleMetaDataChange('language_presets', newLanguagePresets);
  };

  const handleFirstMessageChange = (language, value) => {
    const currentLanguagePresets = voiceSettings.meta_data?.language_presets || {};
    const defaultFirstMessage = agentData?.first_message || '';
    const defaultLanguage = voiceSettings.meta_data?.language || 'en';

    // Treat all languages the same way - store everything in language_presets
    const updatedPresets = { ...currentLanguagePresets };

    // Create or update the language preset with proper deep copying
    const existingPreset = updatedPresets[language];
    updatedPresets[language] = {
      overrides: {
        tts: existingPreset?.overrides?.tts || null,
        conversation: existingPreset?.overrides?.conversation || null,
        agent: {
          first_message: value,
          language: existingPreset?.overrides?.agent?.language || null,
          prompt: existingPreset?.overrides?.agent?.prompt || null,
        },
      },
      first_message_translation: {
        source_hash: JSON.stringify({
          firstMessage: defaultFirstMessage,
          language: defaultLanguage,
        }),
        text: value,
      },
    };

    const newMetaData = {
      ...voiceSettings.meta_data,
      language_presets: updatedPresets,
    };
    const newSettings = { ...voiceSettings, meta_data: newMetaData };
    setVoiceSettings(newSettings);
    onFieldChange('voice', newSettings);
  };

  const getModelName = (modelId) => {
    const model = VOICE_MODELS.find((m) => m.id === modelId);
    return model ? model.name : modelId;
  };

  const getLanguageName = (langCode) => {
    const language = LANGUAGES.find((l) => l.code === langCode);
    return language ? `${language.flag} ${language.name}` : langCode;
  };

  const getAdditionalLanguages = () => {
    const selectedLanguages = Object.keys(voiceSettings.meta_data?.language_presets || {});
    const availableLanguages = LANGUAGES.filter(
      (lang) => lang.code !== voiceSettings.meta_data?.language,
    ).map((lang) => lang.code);

    // If all available languages are selected, return all the individual language codes
    if (
      selectedLanguages.length === availableLanguages.length &&
      availableLanguages.every((lang) => selectedLanguages.includes(lang))
    ) {
      return selectedLanguages;
    }

    return selectedLanguages;
  };

  const getFirstMessageForLanguage = (language) => {
    const languagePresets = voiceSettings.meta_data?.language_presets || {};
    const defaultFirstMessage = agentData?.first_message || '';

    // Try to get from language_presets first, fallback to default first_message for default language
    const presetMessage = languagePresets[language]?.overrides?.agent?.first_message;

    if (presetMessage) {
      return presetMessage;
    }

    // If it's the default language and no preset exists, return the default first_message
    const defaultLanguage = voiceSettings.meta_data?.language || 'en';
    if (language === defaultLanguage) {
      return defaultFirstMessage;
    }

    return '';
  };

  const getAvailableLanguagesForFirstMessage = () => {
    const defaultLanguage = voiceSettings.meta_data?.language || 'en';
    const selectedAdditionalLanguages = Object.keys(
      voiceSettings.meta_data?.language_presets || {},
    );

    // Create a unique array with default language first, then additional languages
    const allLanguages = [defaultLanguage, ...selectedAdditionalLanguages];
    return Array.from(new Set(allLanguages));
  };

  const handleProviderChange = (event, newProvider) => {
    if (newProvider !== null) {
      setVoiceProvider(newProvider);
      const newSettings = { ...voiceSettings, provider: newProvider };
      setVoiceSettings(newSettings);
      onFieldChange('voice', newSettings);
    }
  };

  const handleOpenAIVoiceChange = (e) => {
    handleSettingChange('openai', e.target.value);
  };

  const handleTestRealtime = async () => {
    setIsTestingRealtime(true);
    setRealtimeError(null);
    setRealtimeStatus('Initializing session...');

    try {
      // Call the backend endpoint to get session using axios
      const response = await optimai.get(`/agent/${agentData.id}/openai-realtime`);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create session');
      }

      setRealtimeStatus('Connecting to OpenAI...');

      // Connect to OpenAI Realtime API using WebSocket
      // Note: Browser WebSocket doesn't support custom headers, so we use the ephemeral token approach
      const ws = new WebSocket(
        `${data.websocket_url}?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${data.session.client_secret.value}`],
      );

      realtimeConnectionRef.current = ws;

      ws.onopen = () => {
        setRealtimeStatus('Connected! Say something...');
        console.log('WebSocket connected');

        // Send session update with voice
        ws.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              voice: voiceSettings.openai || 'alloy',
              turn_detection: {
                type: 'server_vad',
              },
            },
          }),
        );

        // Request microphone access and start audio capture
        startAudioCapture(ws);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received:', message);

        if (message.type === 'response.audio.delta') {
          // Handle audio playback
          playAudioChunk(message.delta);
        } else if (message.type === 'error') {
          setRealtimeError(message.error.message);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setRealtimeError('WebSocket connection error');
        setIsTestingRealtime(false);
      };

      ws.onclose = () => {
        setRealtimeStatus(null);
        setIsTestingRealtime(false);
        console.log('WebSocket closed');
      };
    } catch (error) {
      console.error('Failed to test realtime:', error);
      setRealtimeError(error.message);
      setIsTestingRealtime(false);
    }
  };

  const stopRealtimeTest = () => {
    if (realtimeConnectionRef.current) {
      realtimeConnectionRef.current.close();
      realtimeConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsTestingRealtime(false);
    setRealtimeStatus(null);
  };

  const startAudioCapture = async (ws) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16.buffer)));

        // Send audio chunk
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64,
            }),
          );
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error('Failed to capture audio:', error);
      setRealtimeError('Microphone access denied');
    }
  };

  const playAudioChunk = (base64Audio) => {
    // Implement audio playback logic here
    // This is a simplified version - you may want to use a proper audio queue
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeConnectionRef.current) {
        realtimeConnectionRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Provider Toggle and Test Button */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: 'text.primary' }}
              >
                Voice Provider
              </Typography>
              {voiceProvider === 'openai' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={isTestingRealtime ? stopRealtimeTest : handleTestRealtime}
                  disabled={isTestingRealtime && !realtimeStatus}
                  startIcon={
                    isTestingRealtime ? (
                      <Iconify
                        icon="mdi:stop"
                        width={16}
                      />
                    ) : (
                      <Iconify
                        icon="mdi:play"
                        width={16}
                      />
                    )
                  }
                  color={isTestingRealtime ? 'error' : 'primary'}
                >
                  {isTestingRealtime ? 'Stop Test' : 'Test Realtime'}
                </Button>
              )}
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
                    icon="mdi:voice"
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

            {voiceProvider === 'openai' && realtimeStatus && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
              >
                {realtimeStatus}
              </Alert>
            )}

            {voiceProvider === 'openai' && realtimeError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
              >
                {realtimeError}
              </Alert>
            )}
          </Box>

          {/* OpenAI Voice Selection (only shown when OpenAI is selected) */}
          {voiceProvider === 'openai' && (
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
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
                Select the OpenAI voice for realtime conversations.
              </Typography>
              <FormControl fullWidth>
                <Select
                  size="small"
                  value={voiceSettings.openai || 'alloy'}
                  onChange={handleOpenAIVoiceChange}
                >
                  {OPENAI_VOICES.map((voice) => (
                    <MenuItem
                      key={voice.id}
                      value={voice.id}
                    >
                      {voice.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Voice Card (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Voice
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Select the voice you want to use for the agent. Hover over a voice to preview it.
            </Typography>
            <VoiceSelector
              value={voiceSettings}
              onChange={(voice) => {
                // Create a new voice settings object with all required properties
                const newVoiceSettings = {
                  ...voiceSettings,
                  voice_id: voice.voice_id,
                  name: voice.name,
                  preview_url: voice.preview_url,
                };
                // Update the voice settings in a single operation
                setVoiceSettings(newVoiceSettings);
                onFieldChange('voice', newVoiceSettings);
              }}
            />
          </Box>
          )}

          {/* Agent Language Card (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Agent Language
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Choose the default language the agent will communicate in.
            </Typography>
            <FormControl fullWidth>
              <Select
                size="small"
                value={voiceSettings.meta_data?.language || 'en'}
                onChange={handleLanguageChange}
                renderValue={(selected) => getLanguageName(selected)}
              >
                {LANGUAGES.map((language) => (
                  <MenuItem
                    key={language.code}
                    value={language.code}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          )}

          {/* Additional Languages Card (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Additional Languages
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Specify additional languages which callers can choose from.
            </Typography>
            <FormControl fullWidth>
              <Select
                size="small"
                multiple
                value={(() => {
                  const selectedLanguages = getAdditionalLanguages();
                  const availableLanguages = LANGUAGES.filter(
                    (lang) => lang.code !== voiceSettings.meta_data?.language,
                  ).map((lang) => lang.code);

                  // If all languages are selected, include the "__ALL__" value to show it as selected
                  if (
                    selectedLanguages.length === availableLanguages.length &&
                    availableLanguages.every((lang) => selectedLanguages.includes(lang))
                  ) {
                    return [...selectedLanguages, '__ALL__'];
                  }

                  return selectedLanguages;
                })()}
                onChange={handleAdditionalLanguagesChange}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        Add additional languages
                      </Typography>
                    );
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected
                        .filter((lang) => !lang.startsWith('__'))
                        .map((value) => (
                          <Chip
                            key={value}
                            label={getLanguageName(value)}
                            size="small"
                          />
                        ))}
                    </Box>
                  );
                }}
                displayEmpty
              >
                <MenuItem value="__ALL__">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="__NONE__">
                  <em>None</em>
                </MenuItem>
                {LANGUAGES.filter((lang) => lang.code !== voiceSettings.meta_data?.language).map(
                  (language) => (
                    <MenuItem
                      key={language.code}
                      value={language.code}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </Box>
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Box>
          )}

          {/* First Message Card (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary', mb: 1 }}
                >
                  First Message
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Customize the first message for different languages. Switch between languages to
                  view and edit translations.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:translation-outline" />}
                sx={{ flexShrink: 0, ml: 2 }}
                disabled
              >
                Translate all
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Language Selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ minWidth: 'fit-content' }}
                >
                  Language:
                </Typography>
                <FormControl
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  <Select
                    value={selectedLanguageForFirstMessage}
                    onChange={(e) => setSelectedLanguageForFirstMessage(e.target.value)}
                    renderValue={(selected) => getLanguageName(selected)}
                  >
                    {getAvailableLanguagesForFirstMessage().map((language) => (
                      <MenuItem
                        key={language}
                        value={language}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{LANGUAGES.find((l) => l.code === language)?.flag || '🏳️'}</span>
                          <span>
                            {LANGUAGES.find((l) => l.code === language)?.name || language}
                          </span>
                          {language === (voiceSettings.meta_data?.language || 'en') && (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* First Message Input */}
              <TextField
                fullWidth
                multiline
                rows={3}
                value={getFirstMessageForLanguage(selectedLanguageForFirstMessage)}
                onChange={(e) => {
                  handleFirstMessageChange(selectedLanguageForFirstMessage, e.target.value);
                }}
                placeholder={`Enter the first message in ${getLanguageName(selectedLanguageForFirstMessage)}...`}
                variant="outlined"
                size="small"
              />

            </Box>
          </Box>
          )}

          {/* Model Selection (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary', mb: 1 }}
                >
                  Voice Model
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 2 }}
                >
                  Select the voice model to use for text-to-speech. Flash models are optimized for
                  low latency, while Turbo models provide higher quality at the cost of higher
                  latency.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.primary', mb: 1 }}
                >
                  Model
                </Typography>
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={voiceSettings.model_id}
                    onChange={handleModelChange}
                  >
                    {VOICE_MODELS.map((model) => (
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
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Currently selected:{' '}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {getModelName(voiceSettings.model_id)}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>
          )}

          {/* Pronunciation Dictionaries */}
          {/* {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                  Pronunciation Dictionaries
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Lexicon dictionary files will apply pronunciation replacements to agent responses.
                  Currently, the phoneme function of the pronunciation dictionaries only works with
                  the Turbo v2 model, while the alias function works with all models.
                </Typography>
              </Box>
              <Button variant="outlined" size="small" sx={{ flexShrink: 0, ml: 2 }}>
                Add dictionary
              </Button>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                textAlign: 'right',
                mt: 2
              }}
            >
              .pls .txt .xml Max 1.6 MB
            </Typography>
          </Box>
          )} */}

          {/* Sliders (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Optimize streaming latency
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Configure latency optimizations for the speech generation. Latency can be optimized at
              the cost of quality.
            </Typography>
            <Slider
              value={voiceSettings.optimize_streaming_latency}
              onChange={(e, value) => handleSettingChange('optimize_streaming_latency', value)}
              min={0}
              max={4}
              step={1}
              marks
              sx={{ mt: 1 }}
            />
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Stability
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Higher values will make speech more consistent, but it can also make it sound
              monotone. Lower values will make speech sound more expressive, but may lead to
              instabilities.
            </Typography>
            <Slider
              value={voiceSettings.stability}
              onChange={(e, value) => handleSettingChange('stability', value)}
              min={0}
              max={1}
              step={0.01}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Speed
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Controls the speed of the generated speech. Values below 1.0 will slow down the
              speech, while values above 1.0 will speed it up. Extreme values may affect the quality
              of the generated speech.
            </Typography>
            <Slider
              value={voiceSettings.speed}
              onChange={(e, value) => handleSettingChange('speed', value)}
              min={0.7}
              max={1.2}
              step={0.01}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Similarity
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Higher values will boost the overall clarity and consistency of the voice. Adjusting
              this value to find the right balance is key.
            </Typography>
            <Slider
              value={voiceSettings.similarity_boost}
              onChange={(e, value) => handleSettingChange('similarity_boost', value)}
              min={0}
              max={1}
              step={0.01}
              sx={{ mt: 1 }}
            />
          </Box>
          </>
          )}

          {/* TTS output format (only shown for ElevenLabs) */}
          {voiceProvider === 'elevenlabs' && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary', mb: 1 }}
                >
                  TTS output format
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Select the output format you want to use for ElevenLabs text to speech.
                </Typography>
              </Box>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={voiceSettings.agent_output_audio_format}
                  onChange={(e) => handleSettingChange('agent_output_audio_format', e.target.value)}
                  size="small"
                >
                  {AUDIO_FORMATS.map((format) => (
                    <MenuItem
                      key={format}
                      value={format}
                    >
                      {format.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
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
