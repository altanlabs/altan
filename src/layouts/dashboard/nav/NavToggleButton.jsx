import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
// @mui

// hooks
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings';
import useResponsive from '../../../hooks/useResponsive';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// config
// components

// ----------------------------------------------------------------------

NavToggleButton.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  sx: PropTypes.object,
};

export default function NavToggleButton({ isOpen, onToggle, sx, ...other }) {
  const theme = useTheme();

  const { themeLayout, onToggleLayout } = useSettingsContext();

  const isDesktop = useResponsive('up', 'lg');

  if (!isDesktop) {
    return null;
  }

  const handleToggle = (event) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <IconButton
      size="small"
      onClick={handleToggle}
      sx={{
        p: 0.5,
        width: 32,
        height: 32,
        position: 'absolute',
        right: -16,
        borderRadius: '50%',
        color: theme.palette.text.primary,
        bgcolor: theme.palette.background.default,
        border: `solid 1px ${theme.palette.divider}`,
        ...bgBlur({ color: theme.palette.background.default }),
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
        ...sx,
      }}
      {...other}
    >
      <Iconify
        width={16}
        icon={isOpen ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'}
      />
    </IconButton>
  );
}
