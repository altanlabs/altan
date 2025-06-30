import { Typography } from '@mui/material';
import { AnimatePresence, m } from 'framer-motion';
import React, { memo, useEffect, useState } from 'react';

import ProgressBar from '../progress-bar';

// ----------------------------------------------------------------------

const TranshumanistLoader = memo(() => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : 100));
    }, 150);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="relative w-64 h-6 rounded-full overflow-visible shadow-2xl">
      {/* Outer glowing effect */}
      <div className="absolute -inset-3 blur-3xl opacity-80 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse pointer-events-none"></div>

      {/* Main container with shadow */}
      <div className="relative w-full h-full bg-transparent rounded-full shadow-inner overflow-hidden">
        {/* Progress bar */}
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-300 ease-out opacity-40 backdrop-blur-sm"
          style={{ width: `${progress}%`, borderRadius: '50px' }}
        >
          {/* Inner translucent wavy glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 via-purple-500 to-transparent opacity-60 blur-lg animate-[wave_2s_infinite] rounded-full"></div>
        </div>

        {/* Overlay for glowing waves */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 pointer-events-none animate-[glow-wave_4s_infinite] rounded-full"
          style={{ backgroundSize: '300% 100%' }}
        >
        </div>
      </div>

      {/* Extra glows beyond the container */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-3 left-1/2 w-10 h-10 bg-pink-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      </div>
    </div>
  );
});

TranshumanistLoader.displayName = 'TranshumanistLoader';

const AltanLogo = ({
  wrapped = false,
  fixed = false,
  messages = null,
  showProgress = false,
  showElapsedTime = false,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timeInterval;

    if (showElapsedTime) {
      timeInterval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timeInterval);
    };
  }, [showProgress, showElapsedTime]);

  const loader = (
    <>
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center z-[10000] loading-container backdrop-blur-md">
        <m.svg
          width="145"
          height="125"
          viewBox="0 0 84 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            filter: 'blur(10px)',
            scale: 0.5,
            transition: {
              duration: 3,
              ease: 'easeOut',
            },
          }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative w-[150px] z-[10003] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          <m.path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M83.5643 71.9914L42 0L0.435791 71.9914C9.40753 67.1723 24.6747 64 42 64C59.3253 64 74.5925 67.1723 83.5643 71.9914Z"
            className="fill-black/60 dark:fill-white/40"
          />
        </m.svg>
      </div>
      <div className="flex relative flex-col items-center justify-center space-y-4 z-[10000]">
        {!!messages?.length && (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/3 -translate-x-1/2 w-full h-full flex flex-row items-center justify-center z-[10001]">
            <Typography variant="caption">{messages}</Typography>
          </div>
        )}
        {!!showProgress && <TranshumanistLoader />}
        {showElapsedTime && (
          <div className="text-sm text-gray-500">
            {elapsedTime} second{elapsedTime !== 1 && 's'} elapsed
          </div>
        )}
      </div>
    </>
  );
  return (
    <>
      <ProgressBar />

      <AnimatePresence>
        {!!wrapped ? (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${fixed ? 'fixed inset-0' : ''} absolute inset-0 flex grow items-center justify-center`}
          >
            {loader}
          </m.div>
        ) : (
          loader
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(AltanLogo);
