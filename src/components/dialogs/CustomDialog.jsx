import { useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { memo } from 'react';

import { cn } from '@lib/utils';

import useResponsive from '../../hooks/useResponsive';

// import { bgBlur } from '../../utils/cssStyles';

const CustomDialog = ({
  dialogOpen = false,
  onClose = null,
  blur = true,
  // sx = null,
  // paperSx = null,
  alwaysFullWidth = false,
  alwaysFullScreen = false,
  hideBackdrop = false,
  // height = '80vh',
  overflowHidden = false,
  className,
  children,
  ...other
}) => {
  const theme = useTheme();
  const isSmallScreen = useResponsive('down', 'sm');
  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      fullScreen={alwaysFullScreen || isSmallScreen}
      fullWidth={!isSmallScreen || alwaysFullWidth}
      hideBackdrop={hideBackdrop}
      PaperProps={{
        sx: {
          ...(blur && {
            backgroundColor: 'transparent',
          }),
          ...(overflowHidden && { overflow: 'hidden' }),
        },
        className: cn(
          // "w-fit overflow-hidden bg-transparent relative h-fit max-h-full rounded-2xl bg-gradient-to-br from-transparent via-[rgb(255,255,255)]/25 to-gray-200 border dark:via-[rgb(0,0,0)]/50 dark:to-black border-gray-300 dark:border-gray-700 shadow-lg backdrop-blur-md gap-2",
          'w-fit overflow-hidden relative h-fit max-h-full rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg before:backdrop-blur-xl before:backdrop-hack gap-2',
          className,
        ),
        // sx: {
        //   // backdropFilter: 'blur(2px)',
        //   // WebkitBackdropFilter: 'blur(10px)',
        //   backgroundColor: 'transparent',
        //   // height,
        //   minWidth: '50vw',
        //   // ...(!!blur && bgBlur({ opacity: blur })),
        //   ...paperSx
        // },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        },
        // '& .MuiDialog-paperFullScreen': {
        //   margin: 0,
        //   ...sx
        // },
      }}
      {...other}
    >
      {children}
    </Dialog>
  );
};

export default memo(CustomDialog);
