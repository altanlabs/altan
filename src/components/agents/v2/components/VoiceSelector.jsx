import { Icon } from '@iconify/react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  ClickAwayListener,
  useTheme,
  IconButton,
} from '@mui/material';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchVoices } from '../../../../redux/slices/agents';

const VoiceSelector = ({ value, onChange }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items: voices, loading, hasMore } = useSelector((state) => state.agents.voices);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [hoveredVoice, setHoveredVoice] = useState(null);
  const currentAudioRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Generate consistent filter styles based on voice ID
  const getVoiceStyle = (voiceId) => {
    if (!voiceId) return {};

    // Create a hash from the voice ID to generate consistent values
    let hash = 0;
    for (let i = 0; i < voiceId.length; i++) {
      const char = voiceId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Generate values based on the hash
    const hue = Math.abs(hash) % 360;
    const saturation = 100 + (Math.abs(hash >> 8) % 50); // 100-150%
    const rotation = Math.abs(hash >> 16) % 360;

    return {
      filter: `hue-rotate(${hue}deg) saturate(${saturation}%)`,
      transform: `rotate(${rotation}deg)`,
    };
  };

  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setPlayingUrl(null);
    }
  }, []);

  const playPreview = useCallback((url) => {
    if (!url) return;

    // If clicking the same URL that's currently playing, stop it
    if (playingUrl === url) {
      stopCurrentAudio();
      return;
    }

    // Always stop any currently playing audio first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Create and immediately start new audio
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    setPlayingUrl(url);

    // Start playing
    audio.play().catch((error) => {
      console.log('Audio play failed:', error);
      currentAudioRef.current = null;
      setPlayingUrl(null);
    });

    // Set up event listeners
    audio.onended = () => {
      currentAudioRef.current = null;
      setPlayingUrl(null);
    };

    audio.onerror = () => {
      currentAudioRef.current = null;
      setPlayingUrl(null);
    };
  }, [playingUrl, stopCurrentAudio]);

  // Load voices when search changes (debounced)
  const loadVoices = useCallback(() => {
    if (isOpen) {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // If search is empty, load immediately, otherwise debounce
      if (!search.trim()) {
        dispatch(fetchVoices(search));
      } else {
        searchTimeoutRef.current = setTimeout(() => {
          dispatch(fetchVoices(search));
        }, 300);
      }
    }
  }, [isOpen, dispatch, search]);

  // Load initial voices
  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  // Set selected voice when value changes
  useEffect(() => {
    if (value) {
      // If value is a string, find the voice in the voices list
      if (typeof value === 'string') {
        if (voices.length > 0) {
          const voice = voices.find((v) => v.voice_id === value);
          if (voice) {
            setSelectedVoice(voice);
          }
        }
      } else {
        // If value is an object, use it directly
        setSelectedVoice({
          voice_id: value.voice_id,
          name: value.name,
          preview_url: value.preview_url,
          labels: value.labels || { gender: '', accent: '' },
        });
      }
    } else {
      setSelectedVoice(null);
    }
  }, [value, voices]);

  // Cleanup audio when component unmounts or dropdown closes
  useEffect(() => {
    if (!isOpen) {
      stopCurrentAudio();
      setHoveredVoice(null);
    }
  }, [isOpen, stopCurrentAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [stopCurrentAudio]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(fetchVoices(query));
    }, 300); // 300ms delay
  };

  const handleSelectVoice = (voice) => {
    setSelectedVoice(voice);
    // Pass the entire voice object to the onChange handler
    onChange(voice);
    setIsOpen(false);
  };

  const getLanguageLabel = (locale) => {
    if (!locale) return '';
    const [language] = locale.split('-');
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(language) || locale;
  };

  const VoiceAvatar = ({ voice, size = 32 }) => {
    const style = getVoiceStyle(voice.voice_id);

    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="https://elevenlabs.io/app_assets/image_assets/_next/image?url=%2Fapp_assets%2F_next%2Fstatic%2Fmedia%2Forb-3.9d387d1c.png&w=128&q=75"
          alt={voice.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            ...style,
          }}
        />
      </Box>
    );
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box
        sx={{ position: 'relative', width: '100%' }}
        ref={dropdownRef}
      >
        <Box
          onClick={() => !loading && setIsOpen(!isOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            px: 1.5,
            py: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
            border: 1,
            borderColor: isOpen ? 'primary.main' : 'divider',
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: isOpen ? 'primary.main' : 'text.secondary',
            },
            ...(isOpen && {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: -1,
            }),
          }}
        >
          {selectedVoice ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VoiceAvatar voice={selectedVoice} />
              <Box sx={{ ml: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'medium', color: 'text.primary' }}
                >
                  {selectedVoice.name}
                </Typography>
                {selectedVoice.labels?.gender || selectedVoice.labels?.accent ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {[selectedVoice.labels.gender, selectedVoice.labels.accent]
                      .filter(Boolean)
                      .join(' • ')}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>Select a voice</Typography>
          )}
          <Icon
            icon={isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'}
            style={{ width: 20, height: 20, color: theme.palette.text.secondary }}
          />
        </Box>

        {isOpen && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              zIndex: 10,
              width: '100%',
              mt: 0.5,
              maxHeight: 400,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search voices..."
                value={search}
                onChange={handleSearch}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="heroicons:magnifying-glass"
                        style={{ width: 16, height: 16, color: theme.palette.text.secondary }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              {loading && voices.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                  }}
                >
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              ) : voices.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No voices found
                  </Typography>
                </Box>
              ) : (
                voices.map((voice) => (
                  <Box
                    key={voice.voice_id}
                    sx={{
                      p: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor:
                        selectedVoice?.voice_id === voice.voice_id
                          ? theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.100'
                          : 'transparent',
                      '&:hover': {
                        bgcolor:
                          selectedVoice?.voice_id === voice.voice_id
                            ? theme.palette.mode === 'dark'
                              ? 'grey.700'
                              : 'grey.200'
                            : theme.palette.mode === 'dark'
                              ? 'grey.800'
                              : 'grey.50',
                      },
                      transition: 'background-color 0.15s',
                    }}
                    onClick={() => handleSelectVoice(voice)}
                    onMouseEnter={() => setHoveredVoice(voice)}
                    onMouseLeave={() => setHoveredVoice(null)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ position: 'relative' }}>
                        <VoiceAvatar
                          voice={voice}
                          size={40}
                        />
                        {(hoveredVoice?.voice_id === voice.voice_id ||
                          playingUrl === voice.preview_url) && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              playPreview(voice.preview_url);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 40,
                              height: 40,
                              bgcolor:
                                playingUrl === voice.preview_url
                                  ? 'primary.main'
                                  : 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor:
                                  playingUrl === voice.preview_url
                                    ? 'primary.dark'
                                    : 'rgba(0, 0, 0, 0.7)',
                              },
                            }}
                          >
                            <Icon
                              icon={
                                playingUrl === voice.preview_url
                                  ? 'heroicons:pause'
                                  : 'heroicons:play'
                              }
                              style={{ width: 16, height: 16 }}
                            />
                          </IconButton>
                        )}
                      </Box>
                      <Box sx={{ ml: 1.5, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'medium' }}
                          >
                            {voice.name}
                          </Typography>
                          {voice.sharing?.featured && (
                            <Chip
                              label="Featured"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', mt: 0.5 }}
                        >
                          {voice.labels?.gender} • {voice.labels?.accent}
                        </Typography>

                        {voice.verified_languages && voice.verified_languages.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {voice.verified_languages.slice(0, 3).map((lang, index) => (
                              <Button
                                key={`${voice.voice_id}-${lang.locale}-${index}`}
                                size="small"
                                variant={
                                  playingUrl === (lang.preview_url || voice.preview_url)
                                    ? 'contained'
                                    : 'outlined'
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playPreview(lang.preview_url || voice.preview_url);
                                }}
                                startIcon={
                                  <Icon
                                    icon={
                                      playingUrl === (lang.preview_url || voice.preview_url)
                                        ? 'heroicons:pause'
                                        : 'heroicons:play'
                                    }
                                    style={{ width: 12, height: 12 }}
                                  />
                                }
                                sx={{
                                  minWidth: 'auto',
                                  px: 1,
                                  py: 0.25,
                                  fontSize: '0.75rem',
                                  textTransform: 'none',
                                }}
                              >
                                {getLanguageLabel(lang.locale)}
                              </Button>
                            ))}
                            {voice.verified_languages.length > 3 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  alignSelf: 'center',
                                  color: 'text.secondary',
                                  px: 1,
                                }}
                              >
                                +{voice.verified_languages.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}

              {hasMore && (
                <Button
                  fullWidth
                  onClick={() => dispatch(fetchVoices(search, true))}
                  disabled={loading}
                  sx={{
                    py: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    borderRadius: 0,
                    color: 'primary.main',
                  }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Icon
                        icon="heroicons:arrow-down"
                        style={{ width: 16, height: 16 }}
                      />
                    )
                  }
                >
                  {loading ? 'Loading...' : 'Load more voices'}
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default VoiceSelector;
