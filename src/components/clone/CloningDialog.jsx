import { Box, CircularProgress, Dialog, DialogContent, Typography, useTheme } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import React, { memo, useState, useEffect } from 'react';

import { cn } from '@lib/utils';

import { BackgroundBeams } from '../aceternity/background-beams';
import { MovingBorderGradient } from '../aceternity/buttons/moving-border-gradient';
import { TextGenerateEffect } from '../aceternity/text/text-generate-effect';
import Iconify from '../iconify';

const loadingStates = [
  'Initializing clone process...',
  'Setting up environment...',
  'Copying interface files...',
  'Configuring settings...',
  'Almost there...',
];

const CloningDialog = ({ open }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [currentLoadingState, setCurrentLoadingState] = useState(0);
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (!open) {
      setCurrentLoadingState(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentLoadingState((prev) => (prev + 1) % loadingStates.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
      }}
      PaperProps={{
        className: 'bg-transparent shadow-none',
        sx: { overflow: 'hidden' },
      }}
    >
      <DialogContent className="p-0 overflow-hidden relative min-h-[400px] flex items-center justify-center">
        <BackgroundBeams />

        <Box className="relative z-10 text-center">
          <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MovingBorderGradient
              containerClassName="p-1"
              duration={3000}
              rx="16px"
              ry="16px"
            >
              <Box
                className={cn(
                  'relative rounded-xl px-8 py-8',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-white/90',
                )}
              >
                {/* Main Title with Typing Effect */}
                <TextGenerateEffect
                  words="Cloning your interface..."
                  className={cn(
                    'text-2xl font-bold tracking-tight mb-6',
                    isDark ? 'text-white' : 'text-gray-800',
                  )}
                />

                {/* Loading Spinner */}
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <CircularProgress
                      size={60}
                      thickness={4}
                      sx={{
                        color: isDark ? 'primary.light' : 'primary.main',
                      }}
                    />
                    <m.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Iconify
                        icon="solar:copy-bold-duotone"
                        width={24}
                        className={isDark ? 'text-blue-300' : 'text-blue-600'}
                      />
                    </m.div>
                  </div>
                </m.div>

                {/* Loading States with Animation */}
                <Box sx={{ minHeight: '3rem' }}>
                  <AnimatePresence mode="wait">
                    <m.div
                      key={currentLoadingState}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}
                      >
                        {loadingStates[currentLoadingState]}
                      </Typography>
                    </m.div>
                  </AnimatePresence>
                </Box>

                {/* Progress Dots */}
                <Box className="flex justify-center gap-1 mt-4">
                  {loadingStates.map((_, index) => (
                    <m.div
                      key={index}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        currentLoadingState === index
                          ? isDark
                            ? 'bg-blue-400'
                            : 'bg-blue-600'
                          : isDark
                            ? 'bg-gray-700'
                            : 'bg-gray-300',
                      )}
                      animate={{
                        scale: currentLoadingState === index ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: currentLoadingState === index ? Infinity : 0,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </MovingBorderGradient>
          </m.div>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default memo(CloningDialog);
