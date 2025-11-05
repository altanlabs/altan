import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Slider,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';
import Iconify from '../../../iconify';
import VoiceSelector from '../components/VoiceSelector';

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

function getModelName(modelId) {
  const model = VOICE_MODELS.find((m) => m.id === modelId);
  return model ? model.name : modelId;
}

function getLanguageName(langCode) {
  const language = LANGUAGES.find((l) => l.code === langCode);
  return language ? `${language.flag} ${language.name}` : langCode;
}

export default function ElevenlabsVoiceConfig({ agentData, settings, onUpdate }) {
  const [selectedLanguageForFirstMessage, setSelectedLanguageForFirstMessage] = useState('en');

  const availableLanguagesForFirstMessage = useMemo(() => {
    const def = settings.meta_data?.language || 'en';
    const selectedAdditional = Object.keys(settings.meta_data?.language_presets || {});
    return Array.from(new Set([def, ...selectedAdditional]));
  }, [settings]);

  const getAdditionalLanguages = () => {
    const selectedLanguages = Object.keys(settings.meta_data?.language_presets || {});
    const availableLanguages = LANGUAGES.filter(
      (lang) => lang.code !== settings.meta_data?.language,
    ).map((l) => l.code);
    if (
      selectedLanguages.length === availableLanguages.length &&
      availableLanguages.every((l) => selectedLanguages.includes(l))
    ) {
      return selectedLanguages;
    }
    return selectedLanguages;
  };

  const updateSetting = (field, value) => {
    const newSettings = { ...settings, [field]: value };
    onUpdate(newSettings);
  };

  const updateMeta = (field, value) => {
    const newMeta = { ...settings.meta_data, [field]: value };
    const newSettings = { ...settings, meta_data: newMeta };
    onUpdate(newSettings);
  };

  const handleLanguageChange = (e) => updateMeta('language', e.target.value);

  const handleAdditionalLanguagesChange = (e) => {
    const selectedLanguages = e.target.value;
    let languagesToProcess = [];
    if (selectedLanguages.includes('__ALL__')) {
      languagesToProcess = LANGUAGES.filter(
        (lang) => lang.code !== settings.meta_data?.language,
      ).map((lang) => lang.code);
    } else if (selectedLanguages.includes('__NONE__') || selectedLanguages.length === 0) {
      languagesToProcess = [];
    } else {
      languagesToProcess = selectedLanguages.filter((lang) => !lang.startsWith('__'));
    }

    const newLanguagePresets = {};
    languagesToProcess.forEach((langCode) => {
      if (langCode !== settings.meta_data?.language) {
        newLanguagePresets[langCode] = {
          overrides: {
            tts: null,
            conversation: null,
            agent: { first_message: null, language: null, prompt: null },
          },
        };
      }
    });
    updateMeta('language_presets', newLanguagePresets);
  };

  const getFirstMessageForLanguage = (language) => {
    const languagePresets = settings.meta_data?.language_presets || {};
    const defaultFirstMessage = agentData?.first_message || '';
    const presetMessage = languagePresets[language]?.overrides?.agent?.first_message;
    if (presetMessage) return presetMessage;
    const defaultLanguage = settings.meta_data?.language || 'en';
    if (language === defaultLanguage) return defaultFirstMessage;
    return '';
  };

  const handleFirstMessageChange = (language, value) => {
    const currentLanguagePresets = settings.meta_data?.language_presets || {};
    const defaultFirstMessage = agentData?.first_message || '';
    const defaultLanguage = settings.meta_data?.language || 'en';
    const updatedPresets = { ...currentLanguagePresets };
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
    const newMeta = { ...settings.meta_data, language_presets: updatedPresets };
    onUpdate({ ...settings, meta_data: newMeta });
  };

  return (
    <>
      {/* Voice Selector */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
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
          value={settings}
          onChange={(voice) => {
            const newVoiceSettings = {
              ...settings,
              voice_id: voice.voice_id,
              name: voice.name,
              preview_url: voice.preview_url,
            };
            onUpdate(newVoiceSettings);
          }}
        />
      </Box>

      {/* Agent Language */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
            value={settings.meta_data?.language || 'en'}
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

      {/* Additional Languages */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
                (lang) => lang.code !== settings.meta_data?.language,
              ).map((lang) => lang.code);
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
            {LANGUAGES.filter((lang) => lang.code !== settings.meta_data?.language).map(
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

      {/* First Message */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
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
              Customize the first message for different languages. Switch between languages to view
              and edit translations.
            </Typography>
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              ml: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: 0.5,
            }}
          >
            <Iconify icon="solar:translation-outline" />
            <Typography variant="caption">Translate all</Typography>
          </Box>
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
                {availableLanguagesForFirstMessage.map((language) => (
                  <MenuItem
                    key={language}
                    value={language}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{LANGUAGES.find((l) => l.code === language)?.flag || '🏳️'}</span>
                      <span>{LANGUAGES.find((l) => l.code === language)?.name || language}</span>
                      {language === (settings.meta_data?.language || 'en') && (
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
            onChange={(e) =>
              handleFirstMessageChange(selectedLanguageForFirstMessage, e.target.value)
            }
            placeholder={`Enter the first message in ${getLanguageName(selectedLanguageForFirstMessage)}...`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* Model Selection */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
              Select the voice model to use for text-to-speech. Flash models are optimized for low
              latency, while Turbo models provide higher quality at the cost of higher latency.
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
                value={settings.model_id}
                onChange={(e) => updateSetting('model_id', e.target.value)}
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
                {getModelName(settings.model_id)}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Sliders */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
          Configure latency optimizations for the speech generation. Latency can be optimized at the
          cost of quality.
        </Typography>
        <Slider
          value={settings.optimize_streaming_latency}
          onChange={(e, value) => updateSetting('optimize_streaming_latency', value)}
          min={0}
          max={4}
          step={1}
          marks
          sx={{ mt: 1 }}
        />
      </Box>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
          Higher values will make speech more consistent, but it can also make it sound monotone.
          Lower values will make speech sound more expressive, but may lead to instabilities.
        </Typography>
        <Slider
          value={settings.stability}
          onChange={(e, value) => updateSetting('stability', value)}
          min={0}
          max={1}
          step={0.01}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
          Controls the speed of the generated speech. Values below 1.0 will slow down the speech,
          while values above 1.0 will speed it up. Extreme values may affect the quality of the
          generated speech.
        </Typography>
        <Slider
          value={settings.speed}
          onChange={(e, value) => updateSetting('speed', value)}
          min={0.7}
          max={1.2}
          step={0.01}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
          Higher values will boost the overall clarity and consistency of the voice. Adjusting this
          value to find the right balance is key.
        </Typography>
        <Slider
          value={settings.similarity_boost}
          onChange={(e, value) => updateSetting('similarity_boost', value)}
          min={0}
          max={1}
          step={0.01}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* TTS output format */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
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
              value={settings.agent_output_audio_format}
              onChange={(e) => updateSetting('agent_output_audio_format', e.target.value)}
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
    </>
  );
}

ElevenlabsVoiceConfig.propTypes = {
  agentData: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
