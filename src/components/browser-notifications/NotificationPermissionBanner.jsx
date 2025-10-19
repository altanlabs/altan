import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Box, Button, IconButton, Typography, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Iconify from '../iconify';
import {
  isBrowserNotificationSupported,
  getNotificationPermission,
  hasRequestedPermission,
  requestNotificationPermission,
} from '../../utils/browserNotifications';

/**
 * Elegant glassmorphic banner to request notification permissions
 * Only shows when:
 * - Browser supports notifications
 * - Permission is not yet granted or denied
 * - User hasn't dismissed the banner permanently
 */
export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    if (!isBrowserNotificationSupported()) {
      return;
    }

    const permission = getNotificationPermission();
    const alreadyRequested = hasRequestedPermission();

    // Show banner if permission is default and we haven't asked yet
    if (permission === 'default' && !alreadyRequested) {
      // Small delay before showing for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        // Success! Hide banner
        setShow(false);
      } else {
        // User denied or dismissed - hide banner
        setShow(false);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    // Mark as requested to not show again
    setShow(false);
    // We'll ask again in future sessions if they didn't explicitly deny
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          maxWidth: 500,
          width: 'calc(100% - 32px)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: (theme) => theme.customShadows.z20,
            backdropFilter: 'blur(20px)',
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ p: 2, position: 'relative' }}
          >
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Iconify
                icon="solar:bell-bing-bold-duotone"
                width={28}
              />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Stay Updated with Notifications
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                Get notified about mentions, assignments, and important updates
              </Typography>
            </Box>

            {/* Actions */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexShrink: 0 }}
            >
              <Button
                variant="contained"
                size="small"
                disabled={isRequesting}
                onClick={handleEnable}
                sx={{
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                {isRequesting ? 'Enabling...' : 'Enable'}
              </Button>
              <IconButton
                size="small"
                onClick={handleDismiss}
                disabled={isRequesting}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <Iconify
                  icon="mingcute:close-line"
                  width={20}
                />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </m.div>
    </AnimatePresence>
  );
}

