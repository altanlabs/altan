import { useState, useRef } from 'react';
import { Box, TextField, IconButton, Tooltip, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

import Iconify from './iconify';

function URLNavigationBar({
  onNavigate,
  onToggleViewMode,
  onOpenInNewTab,
  onRefresh,
  viewMode = 'desktop',
  disabled = false,
}) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onNavigate) {
      const path = `/${inputValue.trim()}`;
      onNavigate(path);
      setInputValue('');
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.75,
        py: 0.25,
        borderRadius: 0.75,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
        },
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, maxWidth: 250 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '0.875rem',
            fontWeight: 500,
            mr: 0.5,
          }}
        >
          /
        </Typography>
        <TextField
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="about-us"
          size="small"
          disabled={disabled}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              height: 24,
              borderRadius: 0.5,
              backgroundColor: 'transparent',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.875rem',
              py: 0,
              px: 0,
              '&::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.5),
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      <Stack direction="row" spacing={0.25} alignItems="center">
        {/* Open in New Tab */}
        <Tooltip title="Open in New Tab">
          <IconButton
            size="small"
            onClick={onOpenInNewTab}
            disabled={disabled}
            sx={{
              width: 24,
              height: 24,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:open-in-new"
              sx={{ width: 14, height: 14 }}
            />
          </IconButton>
        </Tooltip>

        {/* Refresh */}
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={disabled}
            sx={{
              width: 24,
              height: 24,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:refresh"
              sx={{ width: 14, height: 14 }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

URLNavigationBar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onToggleViewMode: PropTypes.func.isRequired,
  onOpenInNewTab: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['mobile', 'desktop']),
  disabled: PropTypes.bool,
};

export default URLNavigationBar; 