import { Capacitor } from '@capacitor/core';
import React, { memo, useMemo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useAuthContext } from '../../../auth/useAuthContext.ts';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general/index.ts';
import { useSelector } from '../../../redux/store.ts';

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

const SEOCompactLayout = ({
  children,
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  structuredData,
  additionalMeta = {},
  overflowHidden = false,
  breadcrumb = null,
  toolbarChildren = null,
  noPadding = false,
  fullWidth = false,
  headerMobileHeight = DEFAULT_HEADER_MOBILE_HEIGHT,
  hideHeader = false,
  drawerVisible = true,
}) => {
  const headerVisible = useSelector(selectHeaderVisible);
  const isDesktop = useResponsive('up', 'lg');
  const isMobile = useResponsive('down', 'sm');
  const isIOS = isIOSCapacitor();
  const { user } = useAuthContext();

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
      paddingLeft: user && drawerOpen && isDesktop && drawerVisible ? `${DRAWER_WIDTH}px` : 0,
      marginLeft: user && drawerOpen && isDesktop && drawerVisible ? 0 : 0,
    };

    return style;
  };

  // Generate default meta tags if not provided
  const defaultTitle = title || 'Altan';
  const defaultDescription = description || 'Build intelligent software with AI';
  const defaultOgImage = ogImage || 'https://www.altan.ai/opengraph.jpeg';

  return (
    <>
      <Helmet>
        <title>{defaultTitle}</title>
        <meta name="description" content={defaultDescription} />
        
        {/* Keywords */}
        {keywords && <meta name="keywords" content={keywords} />}
        
        {/* Canonical URL */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Open Graph tags */}
        <meta property="og:title" content={defaultTitle} />
        <meta property="og:description" content={defaultDescription} />
        <meta property="og:type" content={ogType} />
        <meta property="og:image" content={defaultOgImage} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="Altan" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={defaultTitle} />
        <meta name="twitter:description" content={defaultDescription} />
        <meta name="twitter:image" content={defaultOgImage} />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Additional custom meta tags */}
        {Object.entries(additionalMeta).map(([key, value]) => (
          <meta key={key} name={key} content={value} />
        ))}
        
        {/* Structured data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
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

export default memo(SEOCompactLayout); 