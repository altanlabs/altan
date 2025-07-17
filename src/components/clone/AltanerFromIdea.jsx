import { LinearProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { createAltaner } from '../../redux/slices/altaners.js';
import { TextShimmer } from '../aceternity/text/text-shimmer';
import CustomDialog from '../dialogs/CustomDialog.jsx';

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  width: '300px',
  height: '2px',
  borderRadius: '1px',
  marginTop: '2rem',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  '& .MuiLinearProgress-bar': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : theme.palette.primary.main,
    transition: 'transform 0.8s ease',
  },
}));

const LoaderStep = ({ step, isActive, isCompleted }) => {
  const theme = useTheme();
  const textColor = theme.palette.mode === 'dark' ? 'white' : 'black';
  return (
    <m.div
      className="flex items-center justify-center gap-3 w-full"
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: isActive ? 1 : isCompleted ? 0.7 : 0.2,
        x: 0,
      }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      }}
    >
      <m.div
        animate={
          isActive
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="flex-shrink-0"
      >
        {isCompleted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 ${isActive ? `text-${textColor}` : `text-${textColor}/70`}`}
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <m.div
            initial={{ rotate: 0 }}
            animate={isActive ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 text-${theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </m.div>
        )}
      </m.div>
      <div
        style={{
          color: theme.palette.mode === 'dark'
            ? isActive ? 'rgba(255, 255, 255, 1)' : isCompleted ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.2)'
            : isActive ? theme.palette.text.primary : isCompleted ? theme.palette.text.secondary : theme.palette.text.disabled,
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
  const [progress, setProgress] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (!idea || isCreating) return;

    const steps = [
      'Finding a computer',
      'Assembling your AI team',
      'Creating main components',
      'Creating repository',
      'Creating database',
      'Redirecting to your project',
    ];

    setProgress(steps);
    setIsCreating(true);
    setCurrentStep(0);
    setProgressValue(0);

    let isSubscribed = true;

    const totalDuration = 17000;
    const stepDuration = totalDuration / steps.length;
    let step = 0;

    const interval = setInterval(() => {
      if (!isSubscribed) {
        clearInterval(interval);
        return;
      }

      if (step < steps.length - 1) {
        step++;
        setCurrentStep(step);
        setProgressValue((step + 1) * (100 / steps.length));
      } else {
        clearInterval(interval);
        setProgressValue(100);
      }
    }, stepDuration);

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
      clearInterval(interval); // ✅ Always clean up the interval
    };
  }, [idea]);

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
            background: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.97)'
              : 'rgba(245, 245, 245, 0.97)',
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

              <div className="flex flex-col items-stretch space-y-3">
                {progress.map((step, index) => (
                  <LoaderStep
                    key={step}
                    step={step}
                    isActive={index === currentStep}
                    isCompleted={index <= currentStep}
                  />
                ))}

                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center w-full pt-8"
                >
                  <StyledLinearProgress
                    variant="determinate"
                    value={progressValue}
                  />
                </m.div>
              </div>
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    </CustomDialog>
  );
}

export default memo(AltanerFromIdea);
