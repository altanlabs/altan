import { IconButton } from '@mui/material';
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
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark'
          ? '#1f2937' // gray-800
          : '#f3f4f6', // gray-100
      color: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      transition: 'colors 150ms cubic-bezier(.33,0,.2,1), background-color 150ms cubic-bezier(.33,0,.2,1)',
      '&:hover': {
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? '#374151' // gray-700
            : '#e5e7eb', // gray-200
        color: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 1)'
            : 'rgba(0, 0, 0, 1)',
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
