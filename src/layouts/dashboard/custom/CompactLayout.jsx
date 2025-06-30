import { Capacitor } from '@capacitor/core';
import React, { memo, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';

// Default header heights and spacing (tailor these as needed)
const DEFAULT_HEADER_MOBILE_HEIGHT = HEADER.H_MOBILE;

// Utility function to check if we're on iOS Capacitor platform
const isIOSCapacitor = () => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    console.log('🔍 Platform Detection:', { isNative, platform });
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
}) => {
  const headerVisible = useSelector(selectHeaderVisible);
  const isDesktop = useResponsive('up', 'lg');
  const isMobile = useResponsive('down', 'sm');
  const isIOS = isIOSCapacitor();

  // Debug logging
  useEffect(() => {
    console.log('📱 CompactLayout Debug Info:', {
      isIOS,
      isMobile,
      isDesktop,
      headerVisible,
      hideHeader,
      title,
      userAgent: navigator.userAgent,
    });

    // Check safe area support
    if (typeof CSS !== 'undefined' && CSS.supports) {
      const supportsSafeArea = CSS.supports('padding-top', 'env(safe-area-inset-top)');
      console.log('🛡️ Safe area support:', supportsSafeArea);
    }

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

      console.log('🔒 Safe area inset top:', safeAreaTop);
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
    console.log('📏 Calculated top padding:', calculatedTop, 'px');
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
      };
      console.log('🎯 Style (hideHeader):', style);
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
    };

    console.log('🎯 Final style applied:', style);
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
        <div className={contentClasses.join(' ')}>{children}</div>
      </div>
    </>
  );
};

export default memo(CompactLayout);
