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
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      color: (theme) => theme.palette.text.primary,
      backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
      backdropFilter: 'blur(8px)',
      transition: 'colors 150ms cubic-bezier(.33,0,.2,1), background-color 150ms cubic-bezier(.33,0,.2,1)',
      '&:hover': {
        backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.24),
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
