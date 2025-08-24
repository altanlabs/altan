import { Box, TextField, IconButton, Tooltip, Stack, Typography, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

import CodeToggleButton from './buttons/CodeToggleButton';
import EditToggleButton from './buttons/EditToggleButton';
import Iconify from './iconify';
import { selectPreviewMode, selectEditMode, togglePreviewMode, toggleEditMode } from '../redux/slices/previewControl';
import { useSelector, dispatch } from '../redux/store';

function URLNavigationBar({
  onNavigate,
  onOpenInNewTab,
  onRefresh,
  productionUrl,
  disabled = false,
}) {
  console.log('productionUrl', productionUrl);
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Get preview mode and edit mode from Redux
  const previewMode = useSelector(selectPreviewMode);
  const editMode = useSelector(selectEditMode);

  const handleTogglePreviewMode = () => {
    dispatch(togglePreviewMode());
  };

  const handleToggleEditMode = () => {
    dispatch(toggleEditMode());
  };

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
        height: 40,
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          marginTop: 0.5,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          p: 0.25,
          gap: 0.25,
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
          },
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* Refresh */}
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={disabled}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:refresh"
              sx={{ width: 16, height: 16 }}
            />
          </IconButton>
        </Tooltip>
        {/* Open in New Tab */}
        <Tooltip title="Open in New Tab">
          <IconButton
            size="small"
            onClick={onOpenInNewTab}
            disabled={disabled}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:open-in-new"
              sx={{ width: 16, height: 16 }}
            />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, maxWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              fontWeight: 500,
              mx: 1,
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
                height: 32,
                borderRadius: 1.5,
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

        <Stack
          direction="row"
          spacing={0.25}
          alignItems="center"
        >
          {/* Preview Mode Toggle - Only show if production URL is available */}
          {productionUrl && (
            <Tooltip
              title={`Switch to ${previewMode === 'production' ? 'Development' : 'Production'} Mode`}
            >
              <Chip
                label={previewMode === 'production' ? 'PROD' : 'DEV'}
                size="small"
                onClick={handleTogglePreviewMode}
                disabled={disabled}
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor:
                    previewMode === 'production'
                      ? alpha(theme.palette.success.main, 0.12)
                      : alpha(theme.palette.warning.main, 0.12),
                  color:
                    previewMode === 'production'
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                  border: `1px solid ${
                    previewMode === 'production'
                      ? alpha(theme.palette.success.main, 0.24)
                      : alpha(theme.palette.warning.main, 0.24)
                  }`,
                  '&:hover': {
                    backgroundColor:
                      previewMode === 'production'
                        ? alpha(theme.palette.success.main, 0.16)
                        : alpha(theme.palette.warning.main, 0.16),
                  },
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Tooltip>
          )}
          <EditToggleButton
            editMode={editMode}
            onToggle={handleToggleEditMode}
            disabled={disabled}
          />
          <CodeToggleButton />
        </Stack>
      </Box>
    </Box>
  );
}

URLNavigationBar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onOpenInNewTab: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  productionUrl: PropTypes.string,
  disabled: PropTypes.bool,
};

export default URLNavigationBar;
