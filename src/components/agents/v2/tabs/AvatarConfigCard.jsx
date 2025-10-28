import { Box, Typography, TextField, Button, ButtonGroup } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useEffect, useCallback } from 'react';

import Iconify from '@components/iconify';

import { uploadMedia } from '../../../../utils/media';
import { UploadAvatar } from '../../../upload';
import { AgentOrbAvatar } from '../../AgentOrbAvatar';

const AvatarConfigCard = ({ agentData, onFieldChange, agentId }) => {
  // Determine initial mode based on avatar_url
  const getInitialMode = () => {
    if (agentData?.avatar_url) return 'link';
    return 'orb';
  };

  const [mode, setMode] = useState(getInitialMode());
  const [imageUrl, setImageUrl] = useState(agentData?.avatar_url || '');
  const [firstColor, setFirstColor] = useState(
    agentData?.meta_data?.avatar_orb?.colors?.[0] || '#2792dc',
  );
  const [secondColor, setSecondColor] = useState(
    agentData?.meta_data?.avatar_orb?.colors?.[1] || '#9ce6e6',
  );

  useEffect(() => {
    setImageUrl(agentData?.avatar_url || '');
    if (agentData?.avatar_url) {
      setMode('link');
    }
  }, [agentData?.avatar_url]);

  const handleModeChange = (newMode) => {
    setMode(newMode);

    if (newMode === 'orb') {
      // Switch to orb mode - clear avatar_url
      onFieldChange('avatar_url', null);
      onFieldChange('meta_data', {
        ...agentData?.meta_data,
        avatar_orb: {
          colors: [firstColor, secondColor],
          enabled: true,
        },
      });
    } else if (newMode === 'link' || newMode === 'image') {
      // Switch to image modes - update meta_data
      onFieldChange('meta_data', {
        ...agentData?.meta_data,
        avatar_orb: {
          ...agentData?.meta_data?.avatar_orb,
          enabled: false,
        },
      });
    }
  };

  const handleImageUrlChange = (url) => {
    setImageUrl(url);
    onFieldChange('avatar_url', url);
  };

  const handleColorChange = (colorIndex, color) => {
    const newColors = [firstColor, secondColor];
    newColors[colorIndex] = color;

    if (colorIndex === 0) {
      setFirstColor(color);
    } else {
      setSecondColor(color);
    }

    onFieldChange('meta_data', {
      ...agentData?.meta_data,
      avatar_orb: {
        colors: newColors,
        enabled: true,
      },
    });
  };

  const handleDropSingleFile = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          const mediaUrl = await uploadMedia(file);
          setImageUrl(mediaUrl);
          onFieldChange('avatar_url', mediaUrl);
          setMode('image');
        } catch (error) {
          console.error('Error uploading avatar:', error);
        }
      }
    },
    [onFieldChange],
  );

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="h6"
          sx={{ color: 'text.primary' }}
        >
          Avatar
        </Typography>
        <ButtonGroup
          size="small"
          sx={{ bgcolor: 'background.paper' }}
        >
          <Button
            variant={mode === 'orb' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('orb')}
            sx={{ textTransform: 'none', minWidth: 70 }}
          >
            Orb
          </Button>
          <Button
            variant={mode === 'link' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('link')}
            sx={{ textTransform: 'none', minWidth: 70 }}
          >
            Link
          </Button>
          <Button
            variant={mode === 'image' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('image')}
            sx={{ textTransform: 'none', minWidth: 70 }}
          >
            Image
          </Button>
        </ButtonGroup>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 3 }}
      >
        Configure the voice orb or provide your own avatar.
      </Typography>

      {/* Orb Mode */}
      {mode === 'orb' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 80, height: 80 }}>
                <AgentOrbAvatar
                  size={80}
                  agentId={agentId}
                  agentState={null}
                  colors={[firstColor, secondColor]}
                  isStatic={false}
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  First color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    component="input"
                    type="color"
                    value={firstColor}
                    onChange={(e) => handleColorChange(0, e.target.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                  />
                  <TextField
                    size="small"
                    value={firstColor}
                    onChange={(e) => handleColorChange(0, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Second color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    component="input"
                    type="color"
                    value={secondColor}
                    onChange={(e) => handleColorChange(1, e.target.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                  />
                  <TextField
                    size="small"
                    value={secondColor}
                    onChange={(e) => handleColorChange(1, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Link Mode */}
      {mode === 'link' && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify
              icon="mdi:link"
              width={24}
              sx={{ color: 'text.secondary' }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
            >
              Image URL
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="https://example.com/avatar.png"
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
            />
          </Box>
        </Box>
      )}

      {/* Image Upload Mode */}
      {mode === 'image' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <UploadAvatar
              sx={{ width: 120, height: 120 }}
              file={agentData.avatar_url}
              onDrop={handleDropSingleFile}
              onDelete={() => {
                handleImageUrlChange('');
                setMode('orb');
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}
          >
            Click or drag a file to upload
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}
          >
            Recommended resolution: 172 × 172 pixels.
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}
          >
            Maximum size: 2MB.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

AvatarConfigCard.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  agentId: PropTypes.string.isRequired,
};

export default memo(AvatarConfigCard);
