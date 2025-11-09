import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, Slider, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useEffect } from 'react';
// @mui

// components
import { StyledRoot, StyledSectionBg } from './styles';
import Logo from '../../components/logo';

//

// ----------------------------------------------------------------------

const EPIC_INTRO = new Audio(
  'https://platform-api.altan.ai/media/502fee25-9334-46ac-b7cb-55b4614adde6',
);

const AnimatedVideoLayout = ({ children, disableVolume = false, style = {} }) => {
  const [audioSettings, setAudioSettings] = useState({
    volume: disableVolume ? 0 : 60, // Start with 60% volume
    lastVolume: disableVolume ? 0 : 60,
    muted: true, // Start with audio not muted
  });

  const toggleMute = () => {
    // Toggle the muted state and preserve the lastVolume if unmuting
    setAudioSettings((prev) => ({
      ...prev,
      muted: !prev.muted,
      volume: !prev.muted ? 0 : prev.lastVolume,
    }));
  };

  const handleVolumeChange = (_, newValue) => {
    setAudioSettings({
      ...audioSettings,
      volume: newValue,
      lastVolume: newValue,
      muted: newValue === 0,
    });
  };

  useEffect(() => {
    // This effect handles playing the audio and updating its properties based on state changes
    EPIC_INTRO.volume = audioSettings.volume / 100; // Convert volume to a range between 0 and 1
    EPIC_INTRO.muted = audioSettings.muted;

    // Only play the audio if it's not already playing and not muted
    if (EPIC_INTRO.paused && !audioSettings.muted) {
      EPIC_INTRO.play().catch((error) => console.error('Error playing audio:', error));
    }
  }, [audioSettings.volume, audioSettings.muted]); // Depend on volume and muted state

  // This effect ensures the audio plays upon user interaction
  useEffect(() => {
    const handleDocumentClick = () => {
      // Play audio on first user interaction
      EPIC_INTRO.play().catch((error) => console.error('Error playing audio:', error));
      // Set volume to 10% after 5 seconds
      const timeoutId = setTimeout(() => {
        setAudioSettings((prev) => ({ ...prev, volume: 10, lastVolume: 10 }));
      }, 5000);

      // Cleanup the timeout to avoid memory leaks
      document.removeEventListener('click', handleDocumentClick);
      return () => clearTimeout(timeoutId);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <StyledRoot
      style={{
        ...style,
      }}
    >
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      {/* <StyledSection sx={{ backgroundColor: 'black' }}> */}
      <video
        autoPlay
        playsInline
        loop
        muted
        style={{ maxWidth: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
      >
        <source
          src="/assets/videos/abstract.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {!disableVolume && (
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            bottom: 20,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            '&:hover': {
              '& .slider-volume': {
                display: 'block',
              },
            },
          }}
        >
          <Slider
            value={audioSettings.volume}
            onChange={handleVolumeChange}
            orientation="vertical"
            className="slider-volume"
            sx={{
              height: 100,
              width: 10,
              display: 'none',
            }}
          />
          <IconButton
            sx={{
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
            onClick={toggleMute}
          >
            {audioSettings.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
      )}
      <StyledSectionBg />
      {/* </StyledSection> */}

      {/* <StyledContent>
        <Stack sx={{
          px: 4,
          width: { xs: '100%', md: '400px', lg: '700px' } // Adjusts width based on screen size
        }}> */}
      {children}
      {/* </Stack>
      </StyledContent> */}
    </StyledRoot>
  );
};

AnimatedVideoLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};

export default memo(AnimatedVideoLayout);
