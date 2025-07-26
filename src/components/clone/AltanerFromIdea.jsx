import { LinearProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { createAltaner } from '../../redux/slices/altaners.js';
import { TextShimmer } from '../aceternity/text/text-shimmer';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify';

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  width: '300px',
  height: '2px',
  borderRadius: '1px',
  marginTop: '2rem',
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  '& .MuiLinearProgress-bar': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    transition: 'transform 0.8s ease',
  },
}));

const LoaderStep = ({ step, icon, opacity, scale, yOffset }) => {
  const theme = useTheme();
  return (
    <m.div
      className="flex items-center justify-center gap-3 w-full absolute inset-0"
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity,
        y: yOffset,
        scale,
      }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}
    >
      <div className="flex-shrink-0">
        <Iconify
          icon={icon}
          width={20}
          sx={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
          }}
        />
      </div>
      <div
        style={{
          color:
            theme.palette.mode === 'dark'
              ? `rgba(255, 255, 255, ${opacity})`
              : `rgba(0, 0, 0, ${opacity})`,
        }}
        className="font-medium text-sm flex-1 text-center"
      >
        {step}
      </div>
    </m.div>
  );
};

function AltanerFromIdea({ idea, onClose }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isCreating, setIsCreating] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const steps = [
    {
      text: 'Finding a computer',
      icon: 'heroicons:computer-desktop',
    },
    {
      text: 'Assembling your AI team',
      icon: 'heroicons:users',
    },
    {
      text: 'Creating main components',
      icon: 'heroicons:code-bracket',
    },
    {
      text: 'Creating repository',
      icon: 'heroicons:folder',
    },
    {
      text: 'Creating database',
      icon: 'heroicons:circle-stack',
    },
    {
      text: 'Preparing your project',
      icon: 'heroicons:rocket-launch',
    },
  ];

  useEffect(() => {
    if (!idea || isCreating) return;

    setIsCreating(true);

    let isSubscribed = true;

    // Start the continuous cycling animation
    const cycleInterval = setInterval(() => {
      if (!isSubscribed) {
        clearInterval(cycleInterval);
        return;
      }
      setCycleIndex((prev) => (prev + 1) % (steps.length * 2)); // Cycle through steps
    }, 1500); // Change step every 1.5 seconds

    // Start the actual creation process
    dispatch(createAltaner({ name: 'My First App' }, idea))
      .then((response) => {
        if (!isSubscribed || !response || !response.id) return;
        window.location.href = `/project/${response.id}`;
      })
      .catch((error) => {
        if (!isSubscribed) return;
        console.error('Failed to create altaner:', error);
      });

    return () => {
      isSubscribed = false;
      clearInterval(cycleInterval);
    };
  }, [idea]);

  // Calculate positions and opacities for the sliding effect
  const getStepProps = (stepIndex) => {
    const currentPosition = cycleIndex % steps.length;
    const relativePosition = (stepIndex - currentPosition + steps.length) % steps.length;
    let opacity = 0;
    let yOffset = 0;
    let scale = 0.9;

    if (relativePosition === 0) {
      // Current active step
      opacity = 1;
      yOffset = 0;
      scale = 1;
    } else if (relativePosition === 1) {
      // Next step coming in
      opacity = 0.6;
      yOffset = 30;
      scale = 0.95;
    } else if (relativePosition === steps.length - 1) {
      // Previous step going out
      opacity = 0.3;
      yOffset = -30;
      scale = 0.95;
    } else if (relativePosition === 2) {
      // Step after next
      opacity = 0.2;
      yOffset = 60;
      scale = 0.9;
    }

    return { opacity, yOffset, scale };
  };

  if (!idea) return null;

  return (
    <CustomDialog
      dialogOpen={!!idea}
      onClose={onClose}
      alwaysFullScreen={true}
      height="100vh"
    >
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background:
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.97)' : 'rgba(245, 245, 245, 0.97)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[400px] px-4">
              <div className="text-center mb-12">
                <TextShimmer
                  className="text-2xl font-medium tracking-tight"
                  duration={2}
                >
                  Creating your project...
                </TextShimmer>
              </div>

              {/* Steps container with relative positioning for sliding effect */}
              <div className="relative h-40 flex items-center justify-center overflow-hidden">
                {steps.map((step, index) => {
                  const stepProps = getStepProps(index);
                  return (
                    <LoaderStep
                      key={step.text}
                      step={step.text}
                      icon={step.icon}
                      {...stepProps}
                    />
                  );
                })}
              </div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center w-full pt-8"
              >
                <StyledLinearProgress variant="indeterminate" />
              </m.div>
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    </CustomDialog>
  );
}

export default memo(AltanerFromIdea);
