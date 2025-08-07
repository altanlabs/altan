import { Capacitor } from '@capacitor/core';
// @mui
import { Stack, AppBar, Toolbar, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo, useState, useEffect } from 'react';

import ChatDrawer from './ChatDrawer';
import HeaderActions from './HeaderActions';
import MobileNavSidebar from './MobileNavSidebar';
import { useAuthContext } from '../../../auth/useAuthContext';
import { StyledChart } from '../../../components/chart';
import Iconify from '../../../components/iconify';
import Logo from '../../../components/logo/Logo';
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
  const headerVisible = useSelector(selectHeaderVisible);
  const isIOS = isIOSCapacitor();

  // Initialize persistent drawer state from localStorage
  const [chatDrawerOpen, setChatDrawerOpen] = useState(() => {
    if (!user) return false; // Don't open for unauthenticated users
    const savedState = localStorage.getItem('chatDrawerOpen');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Mobile navigation sidebar state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Update localStorage whenever drawer state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chatDrawerOpen', JSON.stringify(chatDrawerOpen));
    }
  }, [chatDrawerOpen, user]);

  // Reset drawer state when user changes
  useEffect(() => {
    if (!user) {
      setChatDrawerOpen(false);
      localStorage.removeItem('chatDrawerOpen');
    }
  }, [user]);

  const handleMobileNavToggle = () => {
    setMobileNavOpen(!mobileNavOpen);
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
      px: 1,
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

            '&.MuiToolbar-root': {
              padding: '4px !important',
              paddingLeft: '4px !important',
              paddingRight: '4px !important',
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
          >
            {/* Mobile navigation button - only show on mobile */}
            {!isDesktop && user && (
              <IconButton
                onClick={handleMobileNavToggle}
                sx={{
                  mr: 1,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Iconify icon="mynaui:sidebar-solid" width={24} />
              </IconButton>
            )}

            <Logo minimal />
            {/* <img
                alt="Altan Logo Header"
                onClick={() => history.replace('/')}
                style={{ cursor: 'pointer' }}
                src={
                  theme.palette.mode === 'dark'
                    ? '/logos/horizontalWhite.png'
                    : '/logos/horizontalBlack.png'
                }
                height={17}
              /> */}
          </Stack>

          <StyledChart />
          <HeaderActions
            user={user}
            isDesktop={isDesktop}
          />
        </Toolbar>
      </AppBar>
      {user && (
        <ChatDrawer
          open={chatDrawerOpen}
          onClose={() => setChatDrawerOpen(false)}
          persistent={true}
        />
      )}

      {/* Mobile Navigation Sidebar */}
      <MobileNavSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}

export default memo(Header);
