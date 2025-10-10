import { Tooltip, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';

import { toggleIframeViewMode, selectIframeViewMode } from '../../redux/slices/previewControl';
import Iconify from '../iconify';

/**
 * A toggle button for cycling through desktop, tablet, and mobile view modes
 * Designed to match the styling in URLNavigationBar
 */
function ViewModeToggle({ disabled = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const iframeViewMode = useSelector(selectIframeViewMode);

  const handleToggle = () => {
    dispatch(toggleIframeViewMode());
  };

  // Define view mode configurations
  const viewModeConfig = {
    desktop: {
      icon: 'mdi:monitor',
      tooltip: 'Desktop View (Click for Tablet)',
    },
    tablet: {
      icon: 'mdi:tablet',
      tooltip: 'Tablet View (Click for Mobile)', 
    },
    mobile: {
      icon: 'mdi:cellphone',
      tooltip: 'Mobile View (Click for Desktop)',
    },
  };

  const currentConfig = viewModeConfig[iframeViewMode];

  return (
    <Tooltip title={currentConfig.tooltip}>
      <IconButton
        size="small"
        onClick={handleToggle}
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
          '&:disabled': {
            color: theme.palette.text.disabled,
          },
        }}
      >
        <Iconify
          icon={currentConfig.icon}
          sx={{ width: 16, height: 16 }}
        />
      </IconButton>
    </Tooltip>
  );
}

export default ViewModeToggle;
