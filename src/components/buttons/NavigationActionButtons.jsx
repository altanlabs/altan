import { Tooltip, IconButton, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

import Iconify from '../iconify';

function NavigationActionButtons({ onRefresh, onOpenInNewTab, disabled = false }) {
  const theme = useTheme();

  const buttonStyles = {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.text.primary,
    },
    '&:disabled': {
      color: theme.palette.text.disabled,
    },
  };

  return (
    <Stack direction="row" spacing={0.25}>
      {/* Refresh */}
      <Tooltip title="Refresh">
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={disabled}
          sx={buttonStyles}
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
          sx={buttonStyles}
        >
          <Iconify
            icon="mdi:open-in-new"
            sx={{ width: 16, height: 16 }}
          />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

NavigationActionButtons.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  onOpenInNewTab: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default NavigationActionButtons;
