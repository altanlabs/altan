import { Capacitor } from '@capacitor/core';
// @mui
import {
  Stack,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ChatDrawer from './ChatDrawer';
import HeaderActions from './HeaderActions';
import { useAuthContext } from '../../../auth/useAuthContext';
import { StyledChart } from '../../../components/chart';
import Iconify from '../../../components/iconify';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';

// Utility function to check if we're on iOS Capacitor platform
const isIOSCapacitor = () => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    return isNative && platform === 'ios';
  } catch {
    return false;
  }
};

// ----------------------------------------------------------------------

function Header() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const isDesktop = useResponsive('up', 'md');
  const history = useHistory();
  const headerVisible = useSelector(selectHeaderVisible);
  const isIOS = isIOSCapacitor();
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  const handleChatDrawerOpen = () => {
    setChatDrawerOpen(true);
  };

  const handleChatDrawerClose = () => {
    setChatDrawerOpen(false);
  };

  if (!headerVisible) {
    return null;
  }

  // Calculate safe area aware styles for iOS
  const getHeaderStyles = () => {
    const baseStyles = {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      height: HEADER.H_MOBILE,
      zIndex: 3,
      transition: theme.transitions.create(['height'], {
        duration: theme.transitions.duration.shorter,
      }),
    };

    if (isIOS) {
      // Add safe area inset to top padding for iOS
      return {
        ...baseStyles,
        paddingTop: 'env(safe-area-inset-top)',
        height: `calc(${HEADER.H_MOBILE}px + env(safe-area-inset-top))`,
      };
    }

    return baseStyles;
  };

  return (
    <>
      <AppBar sx={getHeaderStyles()}>
        <Toolbar
          variant="dense"
          sx={{
            zIndex: 5,
            height: HEADER.H_MOBILE,
            px: { lg: 5 },
            pl: { lg: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {user && (
              <IconButton
                onClick={handleChatDrawerOpen}
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Iconify icon="eva:menu-2-fill" />
              </IconButton>
            )}

            <Stack maxWidth={100}>
              <img
                alt="Altan Logo Header"
                onClick={() => history.replace('/')}
                style={{ cursor: 'pointer' }}
                src={
                  theme.palette.mode === 'dark'
                    ? '/logos/horizontalWhite.png'
                    : '/logos/horizontalBlack.png'
                }
                height={17}
              />
            </Stack>
          </Stack>

          <StyledChart />
          <HeaderActions
            user={user}
            isDesktop={isDesktop}
          />
        </Toolbar>
      </AppBar>

      <ChatDrawer
        open={chatDrawerOpen}
        onClose={handleChatDrawerClose}
      />
    </>
  );
}

export default memo(Header);
