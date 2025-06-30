import { Box, Collapse, IconButton } from '@mui/material';
import { SnackbarProvider as NotistackProvider } from 'notistack';
import PropTypes from 'prop-types';
import { useRef } from 'react';

import { cn } from '@lib/utils';

import StyledNotistack from './styles';
import Iconify from '../iconify';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

SnackbarProvider.propTypes = {
  children: PropTypes.node,
};

export default function SnackbarProvider({ children }) {
  const { themeDirection } = useSettingsContext();
  const isRTL = themeDirection === 'rtl';
  const notistackRef = useRef(null);

  const onClose = (key) => () => {
    if (notistackRef.current) {
      notistackRef.current.closeSnackbar(key);
    }
  };

  return (
    <>
      <StyledNotistack />
      <NotistackProvider
        ref={notistackRef}
        dense
        maxSnack={5}
        preventDuplicate
        autoHideDuration={3000}
        variant="success"
        TransitionComponent={isRTL ? Collapse : undefined}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        // Futuristic icons with a transhumanist vibe
        iconVariant={{
          info: (
            <SnackbarIcon
              icon="eva:info-fill"
              color="info"
            />
          ),
          success: (
            <SnackbarIcon
              icon="eva:checkmark-circle-2-fill"
              color="success"
            />
          ),
          warning: (
            <SnackbarIcon
              icon="eva:alert-triangle-fill"
              color="warning"
            />
          ),
          error: (
            <SnackbarIcon
              icon="eva:alert-circle-fill"
              color="error"
            />
          ),
        }}
        // Default close action (customized with Tailwind styling)
        action={(key) => (
          <IconButton
            size="small"
            onClick={onClose(key)}
            className="p-1 hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        )}
      >
        {children}
      </NotistackProvider>
    </>
  );
}

// ----------------------------------------------------------------------
// Futuristic Snackbar Icon with transhumanist aesthetics
SnackbarIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error']),
};

const colorClasses = {
  info: { text: 'text-blue-400', bg: 'bg-blue-400/20' },
  success: { text: 'text-green-400', bg: 'bg-green-400/20' },
  warning: { text: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  error: { text: 'text-red-400', bg: 'bg-red-400/20' },
  primary: { text: 'text-indigo-400', bg: 'bg-indigo-400/20' },
  secondary: { text: 'text-purple-400', bg: 'bg-purple-400/20' },
};

function SnackbarIcon({ icon, color }) {
  const { text, bg } = colorClasses[color] || colorClasses.info;
  return (
    <Box
      component="span"
      className={cn(
        'mr-2',
        'flex',
        'items-center',
        'justify-center',
        'rounded-xl',
        text,
        bg,
        'p-2',
        'shadow-neon',
        // Dark mode styling with Tailwind’s dark: variant
        'dark:text-white',
        'dark:bg-gray-800',
      )}
      // Optionally add a custom neon glow with inline styles or extra classes
      style={{ boxShadow: '0 0 8px 2px rgba(255,255,255,0.5)' }}
    >
      <Iconify
        icon={icon}
        width={24}
      />
    </Box>
  );
}
