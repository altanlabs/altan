import { IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

/**
 * HeaderIconButton - A styled icon button component for header actions
 *
 * @component
 */
const HeaderIconButton = forwardRef(({ children, sx, ...other }, ref) => (
  <IconButton
    ref={ref}
    size="small"
    sx={{
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 1.5,
      color: (theme) => theme.palette.text.secondary,
      backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
      backdropFilter: 'blur(8px)',
      transition: 'colors 150ms cubic-bezier(.33,0,.2,1), background-color 150ms cubic-bezier(.33,0,.2,1)',
      '&:hover': {
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
        color: (theme) => theme.palette.text.primary,
      },
      ...sx,
    }}
    {...other}
  >
    {children}
  </IconButton>
));

HeaderIconButton.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};

HeaderIconButton.displayName = 'HeaderIconButton';

export default HeaderIconButton;
