import { useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { AnimatePresence } from 'framer-motion';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@lib/utils';

import useResponsive from '../../hooks/useResponsive';
import Iconify from '../iconify/Iconify';

// import { bgBlur } from '../../utils/cssStyles';

const CustomDialog = ({
  dialogOpen = false,
  onClose = null,
  blur = true,
  // sx = null,
  // paperSx = null,
  fullWidth = false,
  alwaysFullWidth = false, // Deprecated: use fullWidth instead
  fullViewportWidth = false, // For true 100% viewport width
  alwaysFullScreen = false,
  hideBackdrop = false,
  // height = '80vh',
  overflowHidden = false,
  className,
  children,
  showCloseButton = true,
  ...other
}) => {
  const theme = useTheme();
  const isSmallScreen = useResponsive('down', 'sm');

  // Stabilize the screen size check to prevent flickering
  const isMobile = useMemo(() => isSmallScreen && !alwaysFullScreen, [isSmallScreen, alwaysFullScreen]);

  // Support both fullWidth and alwaysFullWidth for backward compatibility
  const shouldUseFullWidth = useMemo(() => fullWidth || alwaysFullWidth, [fullWidth, alwaysFullWidth]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Prevent body scroll when dialog is open on mobile
  useEffect(() => {
    if (isMobile && dialogOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile, dialogOpen]);

  // Mobile bottom sheet content - memoized to prevent re-renders
  const MobileBottomSheet = useMemo(() => {
    if (!isMobile) return null;

    const portalContent = (
      <AnimatePresence mode="wait">
        {dialogOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Bottom Sheet */}
            <div
              className={cn(
                'fixed bottom-0 left-0 right-0 z-[9999] max-h-[90vh] min-h-[40vh] w-full',
                'rounded-t-2xl border-t border-gray-300 dark:border-gray-700 shadow-2xl',
                'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
                overflowHidden && 'overflow-hidden',
                className,
              )}
              style={{
                backdropFilter: blur ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: blur ? 'blur(20px)' : 'none',
              }}
            >
              {/* Drag Handle */}
              <div className="flex w-full justify-center pt-2 pb-1">
                <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1 px-4 pb-4 pt-2',
                  overflowHidden ? 'overflow-hidden' : 'overflow-y-auto',
                )}
                style={{
                  maxHeight: 'calc(90vh - 60px)', // Account for drag handle and padding
                }}
              >
                {children}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    );

    return createPortal(portalContent, document.body);
  }, [isMobile, dialogOpen, handleClose, blur, overflowHidden, className, children]);

  // Desktop Dialog - memoized to prevent re-renders
  const DesktopDialog = useMemo(() => {
    if (isMobile) return null;

    return (
      <Dialog
        open={dialogOpen}
        onClose={onClose}
        fullScreen={alwaysFullScreen}
        fullWidth={shouldUseFullWidth}
        maxWidth={shouldUseFullWidth ? false : 'sm'}
        hideBackdrop={hideBackdrop}
        container={document.body}
        // Remove transitions to prevent flickering
        TransitionProps={{
          timeout: 0,
        }}
        PaperProps={{
          sx: {
            ...(blur && {
              backgroundColor: 'transparent',
            }),
            ...(overflowHidden && { overflow: 'hidden' }),
            ...(shouldUseFullWidth && {
              width: fullViewportWidth ? '100vw' : '90vw',
              maxWidth: 'none',
            }),
          },
          className: cn(
            shouldUseFullWidth
              ? 'overflow-hidden relative h-fit max-h-full rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg before:backdrop-blur-xl before:backdrop-hack gap-2'
              : 'w-fit overflow-hidden relative h-fit max-h-full rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg before:backdrop-blur-xl before:backdrop-hack gap-2',
            className,
          ),
        }}
        sx={{
          zIndex: 9999,
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(10px)',
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          },
        }}
        {...other}
      >
        {/* Close Button for Desktop */}
        {showCloseButton && onClose && (
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10000,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.2)',
              },
            }}
          >
            <Iconify
              icon="mingcute:close-line"
              width={20}
              sx={{
                color: theme.palette.text.primary,
              }}
            />
          </IconButton>
        )}
        {children}
      </Dialog>
    );
  }, [isMobile, dialogOpen, onClose, alwaysFullScreen, shouldUseFullWidth, fullViewportWidth, hideBackdrop, blur, overflowHidden, className, theme, handleClose, showCloseButton, children, other]);

  // Return the appropriate dialog based on screen size
  if (isMobile) {
    return MobileBottomSheet;
  }

  return DesktopDialog;
};

export default memo(CustomDialog);
