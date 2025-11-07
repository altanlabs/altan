import { Capacitor } from '@capacitor/core';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
// hooks
import { useSettingsContext } from '../../components/settings';
import { HEADER, NAV } from '../../config-global';
import useResponsive from '../../hooks/useResponsive';
// config
// components
// ----------------------------------------------------------------------

const SPACING = 8;

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

Main.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
};

export default function Main({ children, sx, ...other }) {
  const { themeLayout } = useSettingsContext();
  const isNavHorizontal = themeLayout === 'horizontal';
  const isNavMini = themeLayout === 'mini';
  const isDesktop = useResponsive('up', 'lg');
  const isIOS = isIOSCapacitor();

  // Calculate header height with iOS safe area
  const getHeaderHeight = (baseHeight) => {
    if (isIOS) {
      return `calc(${baseHeight}px + env(safe-area-inset-top))`;
    }
    return `${baseHeight}px`;
  };

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          pt: `calc(${getHeaderHeight(HEADER.H_MOBILE)} + ${SPACING}px)`,
          pb: `calc(${getHeaderHeight(HEADER.H_MOBILE)} + ${SPACING}px)`,
          ...(isDesktop && {
            px: 2,
            pt: `calc(${getHeaderHeight(HEADER.H_DASHBOARD_DESKTOP)} + 80px)`,
            pb: `calc(${getHeaderHeight(HEADER.H_DASHBOARD_DESKTOP)} + ${SPACING}px)`,
          }),
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        overflowY: 'hidden',
        py: `calc(${getHeaderHeight(HEADER.H_MOBILE)} + ${SPACING}px)`,
        ...(isDesktop && {
          px: 2,
          py: `calc(${getHeaderHeight(HEADER.H_DASHBOARD_DESKTOP)} + ${SPACING}px)`,
          left: NAV.W_DASHBOARD,
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          ...(isNavMini && {
            left: NAV.W_DASHBOARD_MINI,
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
