import {
  Chip,
  Popover,
  Box,
  Typography,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { selectRoomId } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';
import Iconify from '../../iconify/Iconify.jsx';

const MODE_OPTIONS = [
  {
    id: 'auto',
    label: 'Auto',
    icon: 'mdi:infinity',
    description: 'Automatically choose best mode',
  },
  {
    id: 'instant',
    label: 'Instant',
    icon: 'mdi:lightning-bolt',
    description: 'Direct agent delegation',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'mdi:file-tree',
    description: 'Multi-step execution',
  },
  {
    id: 'chat',
    label: 'Ask',
    icon: 'mingcute:chat-3-line',
    description: 'Simple conversation mode',
  },
];

const ModeSelectionChip = ({
  selectedMode = 'auto',
  onModeSelect,
  isVoiceActive = false,
}) => {
  const [modeMenuAnchor, setModeMenuAnchor] = useState(null);
  const roomId = useSelector(selectRoomId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // LocalStorage key for this room's selected mode
  const getStorageKey = () => `selectedMode_${roomId}`;

  // Load persisted mode selection for this room
  useEffect(() => {
    if (roomId && !selectedMode) {
      try {
        const savedMode = localStorage.getItem(getStorageKey());
        if (savedMode && MODE_OPTIONS.find(m => m.id === savedMode)) {
          onModeSelect(savedMode);
        }
      } catch (error) {
        console.warn('Error loading saved mode selection:', error);
      }
    }
  }, [roomId, selectedMode, onModeSelect]);

  const handleModeMenuOpen = (event) => {
    event.preventDefault();
    setModeMenuAnchor(event.currentTarget);
  };

  const handleModeMenuClose = () => {
    setModeMenuAnchor(null);
  };

  const handleModeSelect = (mode) => {
    // Save selection to localStorage for this room
    try {
      localStorage.setItem(getStorageKey(), mode.id);
    } catch (error) {
      console.warn('Error saving mode selection:', error);
    }
    onModeSelect(mode.id);
    setModeMenuAnchor(null);
  };

  // Don't show if voice is active
  if (isVoiceActive) {
    return null;
  }

  // Get current mode object
  const currentMode = MODE_OPTIONS.find(m => m.id === selectedMode) || MODE_OPTIONS[0];

  // Get label based on mobile state
  const getLabel = () => {
    return isMobile ? '' : currentMode.label;
  };

  return (
    <>
      <Chip
        icon={<Iconify icon={currentMode.icon} />}
        label={getLabel()}
        size="small"
        variant="soft"
        onClick={handleModeMenuOpen}
        sx={{
          borderRadius: '12px',
          fontSize: '0.75rem',
          height: '28px',
          minWidth: isMobile ? '28px' : 'auto',
          '& .MuiChip-icon': {
            fontSize: '14px',
            marginLeft: '4px',
          },
          '& .MuiChip-label': {
            paddingLeft: isMobile ? 0 : undefined,
            paddingRight: isMobile ? 0 : undefined,
          },
        }}
      />

      {/* Mode Menu */}
      <Popover
        open={Boolean(modeMenuAnchor)}
        anchorEl={modeMenuAnchor}
        onClose={handleModeMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxWidth: '280px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box p={1}>
          <Typography
            variant="caption"
            sx={{ px: 1, py: 0.5, color: 'text.secondary', display: 'block' }}
          >
            Select execution mode
          </Typography>
          {MODE_OPTIONS.map((mode) => (
            <MenuItem
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              selected={mode.id === selectedMode}
              sx={{
                borderRadius: '8px',
                margin: '2px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Iconify
                  icon={mode.icon}
                  sx={{ mr: 1, fontSize: '18px' }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  {mode.label}
                </Typography>
                {mode.id === selectedMode && (
                  <Iconify
                    icon="mdi:check"
                    sx={{ ml: 'auto', color: 'primary.main', fontSize: '16px' }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{ 
                  color: 'text.secondary', 
                  ml: 3.5,
                  fontSize: '0.7rem',
                }}
              >
                {mode.description}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default ModeSelectionChip;

