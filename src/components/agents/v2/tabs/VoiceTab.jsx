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

  const [selectedLanguageForFirstMessage, setSelectedLanguageForFirstMessage] = useState('en');
  const [isTestingRealtime, setIsTestingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const audioElementRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Ensure ElevenLabs is set as default provider on mount
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
  }, [agentData?.voice?.provider]);

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
    setRealtimeStatus('Initializing WebRTC...');

    try {
      // Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio element to auto-play remote audio from the model
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;
      pc.ontrack = (e) => {
        console.log('Received remote audio track');
        audioEl.srcObject = e.streams[0];
      };

      // Add local audio track for microphone input
      setRealtimeStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      pc.addTrack(stream.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      // Handle data channel events
      dc.addEventListener('open', () => {
        console.log('Data channel opened');
        setRealtimeStatus('Connected! Say something...');
      });

      dc.addEventListener('message', (e) => {
        const event = JSON.parse(e.data);
        console.log('Received event:', event.type);

        if (event.type === 'error') {
          console.error('OpenAI error:', event.error);
          setRealtimeError(event.error.message);
        }
      });

      dc.addEventListener('close', () => {
        console.log('Data channel closed');
        setRealtimeStatus(null);
        setIsTestingRealtime(false);
      });

      // Generate SDP offer
      setRealtimeStatus('Creating WebRTC offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP offer to backend
      setRealtimeStatus('Connecting to OpenAI...');
      const formData = new FormData();
      formData.append('sdp', offer.sdp);

      const response = await optimai.post(
        `/agent/${agentData.id}/openai-realtime-webrtc`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Apply SDP answer from backend
      const answer = {
        type: 'answer',
        sdp: response.data,
      };
      await pc.setRemoteDescription(answer);

      console.log('WebRTC peer connection established');
    } catch (error) {
      console.error('Failed to start WebRTC session:', error);
      setRealtimeError(error.message || 'Failed to start session');
      setIsTestingRealtime(false);

      // Cleanup on error
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const stopRealtimeTest = () => {
    console.log('Stopping WebRTC session...');

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Stop all media tracks (microphone)
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Remove audio element
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setIsTestingRealtime(false);
    setRealtimeStatus(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up WebRTC resources
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        peerConnectionRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
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
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
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
                  Configure latency optimizations for the speech generation. Latency can be
                  optimized at the cost of quality.
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
                  speech, while values above 1.0 will speed it up. Extreme values may affect the
                  quality of the generated speech.
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
                  Higher values will boost the overall clarity and consistency of the voice.
                  Adjusting this value to find the right balance is key.
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
                    onChange={(e) =>
                      handleSettingChange('agent_output_audio_format', e.target.value)
                    }
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
