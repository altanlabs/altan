import { Box, Typography, Tooltip, Button } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Iconify from '../iconify';

/**
 * Toggle switch for Dev/Live preview modes
 * Only shows text for the selected option, icon only for the other
 */
function PreviewModeToggle({ previewMode, onToggle, disabled = false, productionUrl }) {
  const theme = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip when in production mode for the first time
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('publishedVersionTooltipSeen') === 'true';

    if (previewMode === 'production' && productionUrl && !disabled && !hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 500);

      const autoHideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 10500);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoHideTimer);
      };
    }
  }, [previewMode, productionUrl, disabled]);

  const handleUnderstoodTooltip = () => {
    localStorage.setItem('publishedVersionTooltipSeen', 'true');
    setShowTooltip(false);
  };

  const handleClick = () => {
    if (!disabled) {
      onToggle();
      setShowTooltip(false);
    }
  };

  return (
    <Tooltip
      open={showTooltip}
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
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 36,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          padding: '2px',
          gap: '2px',
          cursor: disabled ? 'default' : 'pointer',
          transition: theme.transitions.create(['all'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': disabled
            ? {}
            : {
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                transform: 'translateY(-1px)',
              },
        }}
      >
        {/* Dev Option */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            height: 32,
            minWidth: 32,
            px: previewMode === 'development' ? 1.25 : 0.75,
            borderRadius: 1.5,
            backgroundColor:
              previewMode === 'development' ? alpha(theme.palette.warning.main, 0.15) : 'transparent',
            color:
              previewMode === 'development' ? theme.palette.warning.main : theme.palette.text.secondary,
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <Iconify icon="mdi:code-braces" sx={{ width: 16, height: 16 }} />
          {previewMode === 'development' && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              Dev
            </Typography>
          )}
        </Box>

        {/* Live Option */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            height: 32,
            minWidth: 32,
            px: previewMode === 'production' ? 1.25 : 0.75,
            borderRadius: 1.5,
            backgroundColor:
              previewMode === 'production' ? alpha(theme.palette.success.main, 0.15) : 'transparent',
            color:
              previewMode === 'production' ? theme.palette.success.main : theme.palette.text.secondary,
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <Iconify icon="mdi:web" sx={{ width: 16, height: 16 }} />
          {previewMode === 'production' && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              Live
            </Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}

PreviewModeToggle.propTypes = {
  previewMode: PropTypes.oneOf(['development', 'production']).isRequired,
  onToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  productionUrl: PropTypes.string,
};

export default PreviewModeToggle;

