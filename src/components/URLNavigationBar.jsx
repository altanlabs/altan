import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import CodeToggleButton from './buttons/CodeToggleButton';
import Iconify from './iconify';
import {
  selectPreviewMode,
  togglePreviewMode,
  navigateToPath,
  refreshIframe,
  openInNewTab,
} from '../redux/slices/previewControl';
import { useSelector } from '../redux/store';

function URLNavigationBar({ productionUrl, disabled = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const [showPublishedTooltip, setShowPublishedTooltip] = useState(false);
  const inputRef = useRef(null);

  // Get preview mode from Redux
  const previewMode = useSelector(selectPreviewMode);

  // Navigation handlers using Redux actions directly
  const handleNavigateToPath = useCallback(
    (path) => {
      dispatch(navigateToPath(path));
    },
    [dispatch],
  );

  const handleOpenIframeInNewTab = useCallback(() => {
    dispatch(openInNewTab());
  }, [dispatch]);

  const handleRefreshIframe = useCallback(() => {
    dispatch(refreshIframe());
  }, [dispatch]);

  // Show tooltip when in production mode for the first time
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('publishedVersionTooltipSeen') === 'true';

    if (previewMode === 'production' && productionUrl && !disabled && !hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowPublishedTooltip(true);
      }, 500); // Small delay to ensure smooth transition

      // Auto-hide after 10 seconds
      const autoHideTimer = setTimeout(() => {
        setShowPublishedTooltip(false);
      }, 10500); // 500ms delay + 10s display

      return () => {
        clearTimeout(timer);
        clearTimeout(autoHideTimer);
      };
    }
  }, [previewMode, productionUrl, disabled]);

  const handleTogglePreviewMode = () => {
    dispatch(togglePreviewMode());
    // Hide tooltip when switching modes
    setShowPublishedTooltip(false);
  };

  const handleUnderstoodTooltip = () => {
    // Store in localStorage that user has seen this tooltip
    localStorage.setItem('publishedVersionTooltipSeen', 'true');
    setShowPublishedTooltip(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const path = `/${inputValue.trim()}`;
      handleNavigateToPath(path);
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
        height: 42,
        px: 2,
        gap: 1.5,
      }}
    >
      {/* Navigation Bar - Glassmorphic Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: 38,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border:
            theme.palette.mode === 'light'
              ? `1px solid ${alpha(theme.palette.divider, 0.12)}`
              : 'none',
          overflow: 'hidden',
          px: 1.5,
          gap: 1.5,
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* Refresh */}
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={handleRefreshIframe}
            disabled={disabled}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              p: 0,
              minWidth: 28,
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
            onClick={handleOpenIframeInNewTab}
            disabled={disabled}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              p: 0,
              minWidth: 28,
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

        {/* URL Path Input */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '0.875rem',
            fontWeight: 500,
            flexShrink: 0,
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
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              height: 32,
              backgroundColor: 'transparent',
              '& fieldset': {
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

      {/* Action Buttons - Outside navigation bar */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {/* Preview Mode Toggle - Only show if production URL is available */}
        {productionUrl && (
          <Tooltip
            open={showPublishedTooltip}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            placement="bottom"
            arrow
            title={
              <Box sx={{ p: 1, maxWidth: 280 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  Showing the last published version
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    lineHeight: 1.4,
                    fontSize: '0.8rem',
                    opacity: 0.9,
                  }}
                >
                  This is your live version that users see. Click the &quot;Live&quot; button to
                  switch to development mode.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUnderstoodTooltip}
                  startIcon={
                    <Iconify
                      icon="mdi:check"
                      sx={{ width: 14, height: 14 }}
                    />
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main} 0%, 
                      ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.dark} 0%, 
                        ${theme.palette.primary.main} 100%)`,
                    },
                  }}
                >
                  Understood
                </Button>
              </Box>
            }
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                  maxWidth: 320,
                  p: 0,
                },
              },
            }}
          >
            <IconButton
              size="small"
              onClick={handleTogglePreviewMode}
              disabled={disabled}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                color: previewMode === 'production'
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                backgroundColor: previewMode === 'production'
                  ? alpha(theme.palette.success.main, 0.12)
                  : alpha(theme.palette.warning.main, 0.12),
                backdropFilter: 'blur(10px)',
                border: previewMode === 'production'
                  ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  : `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: theme.transitions.create(['all'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  backgroundColor: previewMode === 'production'
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.warning.main, 0.2),
                  border: previewMode === 'production'
                    ? `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                    : `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {previewMode === 'production' ? 'Live' : 'Dev'}
              </Typography>
            </IconButton>
          </Tooltip>
        )}

        {/* Code Toggle Button */}
        <CodeToggleButton />
      </Stack>
    </Box>
  );
}

URLNavigationBar.propTypes = {
  productionUrl: PropTypes.string,
  disabled: PropTypes.bool,
};

export default URLNavigationBar;
