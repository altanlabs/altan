import { Capacitor } from '@capacitor/core';
import React, { memo, useMemo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';

// Default header heights and spacing (tailor these as needed)
const DEFAULT_HEADER_MOBILE_HEIGHT = HEADER.H_MOBILE;
const DRAWER_WIDTH = 275; // Match the actual drawer width from ChatDrawer

// Utility function to check if we're on iOS Capacitor platform
const isIOSCapacitor = () => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    return isNative && platform === 'ios';
  } catch (error) {
    console.log('❌ Platform detection error:', error);
    return false;
  }
};

const CompactLayout = ({
  children,
  title,
  overflowHidden = false,
  breadcrumb = null,
  toolbarChildren = null,
  noPadding = false,
  // paddingTop = 0,
  fullWidth = false,
  headerMobileHeight = DEFAULT_HEADER_MOBILE_HEIGHT,
  // subToolbarHeight = DEFAULT_SUBTOOLBAR_HEIGHT,
  hideHeader = false,
  drawerVisible = true,
}) => {
  const headerVisible = useSelector(selectHeaderVisible);
  const isDesktop = useResponsive('up', 'lg');
  const isMobile = useResponsive('down', 'sm');
  const isIOS = isIOSCapacitor();
  const { user } = useAuthContext();
  const location = useLocation();

  // Define paths where gradient background should be shown
  const allowedPaths = ['/', '/agents', '/flows', '/usage', '/pricing'];
  const shouldShowGradient = allowedPaths.includes(location.pathname);

  // Track drawer state from localStorage
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Listen for drawer state changes
  useEffect(() => {
    if (!user) {
      setDrawerOpen(false);
      return;
    }

    const checkDrawerState = () => {
      const savedState = localStorage.getItem('chatDrawerOpen');
      setDrawerOpen(savedState ? JSON.parse(savedState) : false);
    };

    // Initial check
    checkDrawerState();

    // Listen for localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === 'chatDrawerOpen') {
        checkDrawerState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for direct changes (same tab)
    const interval = setInterval(checkDrawerState, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Debug logging
  useEffect(() => {
    // Try to get safe area values
    if (isIOS) {
      const testElement = document.createElement('div');
      testElement.style.paddingTop = 'env(safe-area-inset-top)';
      testElement.style.position = 'fixed';
      testElement.style.top = '0';
      testElement.style.visibility = 'hidden';
      document.body.appendChild(testElement);

      const computedStyle = getComputedStyle(testElement);
      const safeAreaTop = computedStyle.paddingTop;

      document.body.removeChild(testElement);
    }
  }, [isIOS, isMobile, isDesktop, headerVisible, hideHeader, title]);

  // This logic replicates the original top calculation:
  // If breadcrumb or toolbar exists, double the header height, else 0.75 of it.
  // Add 15px plus an extra 40px if mobile and toolbarChildren exists.
  const top = useMemo(() => {
    if (hideHeader) return 0;
    const baseMultiplier = breadcrumb || toolbarChildren ? 2 : 0.75;
    const calculatedTop =
      headerMobileHeight * baseMultiplier + 15 + (isMobile && toolbarChildren ? 40 : 0);
    return calculatedTop;
  }, [breadcrumb, isMobile, toolbarChildren, headerMobileHeight, hideHeader]);

  const wrapperClasses = [
    'fixed',
    'top-0',
    'left-0',
    'right-0',
    'bottom-0',
    'flex',
    'flex-col',
    'space-y-3',
    'overflow-x-hidden',
    'transition-all',
    'duration-200',
  ];

  // If we want overflow hidden on main area, else auto
  if (overflowHidden) {
    wrapperClasses.push('overflow-hidden');
  } else {
    wrapperClasses.push('overflow-y-auto');
  }

  // For full width, we already have left-0, right-0
  // If not fullWidth, you could add container classes (optional)
  // Just leave as is for now.

  const contentClasses = ['w-full', 'h-full'];

  if (!noPadding) {
    if (fullWidth && isDesktop) {
      // Some padding if fullWidth and desktop
      contentClasses.push('px-6', 'py-4');
    } else {
      // Default padding
      contentClasses.push('p-4');
    }
  }

  // Calculate safe area aware padding for iOS
  const getSafeAreaStyle = () => {
    if (hideHeader) {
      const style = {
        paddingTop: isIOS ? 'env(safe-area-inset-top)' : 0,
        paddingBottom: noPadding ? 0 : '1.25rem',
        // Adjust for persistent drawer only if drawerVisible is true
        paddingLeft: user && drawerOpen && isDesktop && drawerVisible ? `${DRAWER_WIDTH}px` : 0,
        marginLeft: user && drawerOpen && isDesktop && drawerVisible ? 0 : 0,
      };
      return style;
    }

    let paddingTop;
    if (headerVisible) {
      if (isIOS) {
        // Use CSS calc to combine safe area with calculated top value
        paddingTop = `calc(env(safe-area-inset-top) + ${top}px)`;
      } else {
        paddingTop = `${top}px`;
      }
    } else {
      paddingTop = isIOS ? 'env(safe-area-inset-top)' : 0;
    }

    const style = {
      paddingTop,
      paddingBottom: noPadding ? 0 : '1.25rem',
      // Adjust for persistent drawer only if drawerVisible is true
      paddingLeft: user && drawerOpen && isDesktop && drawerVisible ? `${DRAWER_WIDTH}px` : 0,
      marginLeft: user && drawerOpen && isDesktop && drawerVisible ? 0 : 0,
    };

    return style;
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div
        className={wrapperClasses.join(' ')}
        style={getSafeAreaStyle()}
      >
        {shouldShowGradient && (
          <div
            className="fixed left-1/2 aspect-square w-[350%] -translate-x-1/2 overflow-hidden md:w-[190%] lg:w-[190%] xl:w-[190%] 2xl:mx-auto pointer-events-none"
            style={{
              backgroundImage: isMobile
                ? 'url("https://api.altan.ai/platform/media/28c8847e-c46a-4b0e-b602-d374e0fd4e08?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285")'
                : 'url("https://api.altan.ai/platform/media/a9182a1d-fa44-4da0-88d1-7ebd51e78427?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285")',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              mask: 'linear-gradient(transparent 0%, black 5%, black 100%)',
              WebkitMask: 'linear-gradient(transparent 0%, black 5%, black 100%)',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              willChange: 'transform',
              animation: 'fadeInGradient 1.5s ease-in forwards',
              opacity: 0,
              top: 0,
              bottom: 0,
              maxHeight: '100dvh',
              zIndex: -1,
            }}
          />
        )}
        <div className={contentClasses.join(' ')}>{children}</div>
      </div>
    </>
  );
};

export default memo(CompactLayout);
