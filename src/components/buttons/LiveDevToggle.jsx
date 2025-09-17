import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Button, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { selectPreviewMode, togglePreviewMode } from '../../redux/slices/previewControl';
import { useSelector, dispatch } from '../../redux/store';
import Iconify from '../iconify';

function LiveDevToggle({ productionUrl, disabled = false }) {
  const theme = useTheme();
  const [showPublishedTooltip, setShowPublishedTooltip] = useState(false);

  // Get preview mode from Redux
  const previewMode = useSelector(selectPreviewMode);
  const isLive = previewMode === 'production';

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

  // Don't render if no production URL is available
  if (!productionUrl) {
    return null;
  }

  return (
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
            This is your live version that users see. Click to switch to development mode.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleUnderstoodTooltip}
            startIcon={<Iconify icon="mdi:check" sx={{ width: 14, height: 14 }} />}
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
      <ToggleButtonGroup
        value={isLive ? 'live' : 'dev'}
        exclusive
        onChange={handleTogglePreviewMode}
        disabled={disabled}
        sx={{
          height: 32,
          borderRadius: 1.5,
          overflow: 'hidden',
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0,
            border: 'none',
            borderRadius: 0,
            '&:not(:first-of-type)': {
              borderLeft: 'none',
            },
            '&:first-of-type': {
              borderTopLeftRadius: 1.5,
              borderBottomLeftRadius: 1.5,
            },
            '&:last-of-type': {
              borderTopRightRadius: 1.5,
              borderBottomRightRadius: 1.5,
            },
          },
        }}
      >
        {/* Development Mode */}
        <Tooltip title="Development Mode - Work in progress version">
          <ToggleButton
            value="dev"
            size="small"
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              maxWidth: 32,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: !isLive
                ? alpha(theme.palette.warning.main, 0.12)
                : 'transparent',
              color: !isLive
                ? theme.palette.warning.main
                : theme.palette.text.secondary,
              border: `1px solid ${!isLive
                ? alpha(theme.palette.warning.main, 0.24)
                : alpha(theme.palette.divider, 0.12)}`,
              '&:hover': {
                backgroundColor: !isLive
                  ? alpha(theme.palette.warning.main, 0.16)
                  : alpha(theme.palette.warning.main, 0.08),
                color: theme.palette.warning.main,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.main, 0.16),
                },
              },
              '&.Mui-disabled': {
                color: theme.palette.text.disabled,
                backgroundColor: 'transparent',
              },
              transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            <Iconify
              icon="mdi:code-braces"
              sx={{ width: 16, height: 16 }}
            />
          </ToggleButton>
        </Tooltip>

        {/* Live/Production Mode */}
        <Tooltip title="Live Mode - Published version that users see">
          <ToggleButton
            value="live"
            size="small"
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              maxWidth: 32,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isLive
                ? alpha(theme.palette.success.main, 0.12)
                : 'transparent',
              color: isLive
                ? theme.palette.success.main
                : theme.palette.text.secondary,
              border: `1px solid ${isLive
                ? alpha(theme.palette.success.main, 0.24)
                : alpha(theme.palette.divider, 0.12)}`,
              '&:hover': {
                backgroundColor: isLive
                  ? alpha(theme.palette.success.main, 0.16)
                  : alpha(theme.palette.success.main, 0.08),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.24)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.success.main, 0.16),
                },
              },
              '&.Mui-disabled': {
                color: theme.palette.text.disabled,
                backgroundColor: 'transparent',
              },
              transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            <Iconify
              icon="mdi:earth"
              sx={{ width: 16, height: 16 }}
            />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Tooltip>
  );
}

LiveDevToggle.propTypes = {
  productionUrl: PropTypes.string,
  disabled: PropTypes.bool,
};

export default LiveDevToggle;
