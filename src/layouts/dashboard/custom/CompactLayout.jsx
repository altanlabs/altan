import React, { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';

// Default header heights and spacing (tailor these as needed)
const DEFAULT_HEADER_MOBILE_HEIGHT = HEADER.H_MOBILE;

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

  // This logic replicates the original top calculation:
  // If breadcrumb or toolbar exists, double the header height, else 0.75 of it.
  // Add 15px plus an extra 40px if mobile and toolbarChildren exists.
  const top = useMemo(() => {
    if (hideHeader) return 0;
    const baseMultiplier = breadcrumb || toolbarChildren ? 2 : 0.75;
    return headerMobileHeight * baseMultiplier + 15 + (isMobile && toolbarChildren ? 40 : 0);
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

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div
        className={wrapperClasses.join(' ')}
        style={{
          paddingTop: hideHeader ? 0 : headerVisible ? `${top}px` : 0,
          paddingBottom: noPadding ? 0 : '1.25rem',
        }}
      >
        <div className={contentClasses.join(' ')}>{children}</div>
      </div>
    </>
  );
};

export default memo(CompactLayout);
