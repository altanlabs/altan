import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import CodeToggleButton from './buttons/CodeToggleButton';
import PreviewModeToggle from './buttons/PreviewModeToggle';
import Iconify from './iconify';
import {
  selectPreviewMode,
  togglePreviewMode,
  navigateToPath,
  refreshIframe,
  openInNewTab,
} from '../redux/slices/previewControl.ts';
import { useSelector } from '../redux/store.ts';

function URLNavigationBar({ productionUrl, disabled = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
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

  // Save preview mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('previewMode', previewMode);
  }, [previewMode]);

  const handleTogglePreviewMode = () => {
    dispatch(togglePreviewMode());
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
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 42,
        px: 1.5,
        gap: 1.5,
      }}
    >
      {/* Preview Mode Toggle - Left Side */}
      {productionUrl && (
        <PreviewModeToggle
          previewMode={previewMode}
          onToggle={handleTogglePreviewMode}
          disabled={disabled}
          productionUrl={productionUrl}
        />
      )}

      {/* Navigation Bar - Glassmorphic Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: 36,
          borderRadius: 2.5,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border:
            theme.palette.mode === 'light'
              ? `1px solid ${alpha(theme.palette.divider, 0.12)}`
              : 'none',
          overflow: 'hidden',
          px: .5,
          gap: .5,
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
              width: 26,
              height: 26,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              p: 0,
              minWidth: 26,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:refresh"
              sx={{ width: 15, height: 15 }}
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
              width: 26,
              height: 26,
              borderRadius: 1.5,
              color: theme.palette.text.secondary,
              p: 0,
              minWidth: 26,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.primary,
              },
            }}
          >
            <Iconify
              icon="mdi:open-in-new"
              sx={{ width: 15, height: 15 }}
            />
          </IconButton>
        </Tooltip>

        {/* URL Path Input */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '0.8rem',
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
            minWidth: 100,
            maxWidth: 180,
            '& .MuiOutlinedInput-root': {
              height: 28,
              backgroundColor: 'transparent',
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8rem',
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
