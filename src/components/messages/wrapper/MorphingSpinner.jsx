import { m } from 'framer-motion';
import React, { memo, useCallback } from 'react';

import { cn } from '@lib/utils';

import Iconify from '../../iconify/Iconify.jsx';

const MorphingSpinner = ({ onClick }) => {
  const [isStopping, setIsStopping] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isStopping) {
      setIsClicked(true);
      onClick?.();
      // Reset click state after animation
      const timeoutId = setTimeout(() => {
        setIsStopping(true);
        setIsClicked(false);
      }, 600);

      return () => clearTimeout(timeoutId); // Cleanup timeout properly
    }
  }, [isStopping, onClick]);

  return (
    <m.div
      initial={{ width: '15px' }}
      whileHover={{
        width: '80px',
        backgroundColor: '#EF4444',
        backgroundImage: 'none',
        maskImage: 'none',
        boxShadow: '0 0 15px 5px rgba(239,68,68,0.3)',
      }}
      // animate={
      //   isClicked ? {
      //     boxShadow: [
      //       '0 0 15px 5px rgba(239,68,68,0.3)',
      //       '0 0 20px 8px rgba(239,68,68,0.8)',
      //       '0 0 15px 5px rgba(239,68,68,0.3)',
      //     ],
      //   } : {}
      // }
      transition={{
        duration: 0.3,
        boxShadow: { duration: 0.6 },
      }}
      onClick={handleClick}
      className="relative h-[20px] w-[20px] flex items-center justify-center rounded-full cursor-pointer group"
    // Note: We intentionally do NOT set overflow-hidden so the splash effect can expand outside.
    >
      {/* Spinning border element */}
      <span
        className={cn(
          'absolute inset-0 group-hover:opacity-0 w-[20px] h-[20px] flex items-center justify-center rounded-full animate-spin bg-gradient-to-br to-transparent [mask-image:radial-gradient(circle,transparent 60%,white 65%)] before:absolute before:inset-0 before:rounded-full before:border-2 before:border-t-purple-500 before:border-transparent',
          isStopping ? 'from-red-400 via-red-600 shadow-[0_0_15px_5px_rgba(255,80,234,0.7)]' : 'from-white via-gray-800 dark:from-black dark:via-gray-800 shadow-[0_0_15px_5px_rgba(102,126,234,0.8)]',
        )}
      >
      </span>

      {/* Content that is NOT spinning */}
      <m.div
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="absolute flex flex-row items-center gap-1 px-3"
      >
        <span className="text-xs font-medium text-white dark:text-gray-900">
          {isStopping ? 'stopping...' : 'Stop'}
        </span>
        {
          !isStopping && (
            <Iconify
              icon="mdi:stop"
              className="w-3 h-3 text-white dark:text-gray-900"
            />
          )
        }
      </m.div>

      {/* Click splash / glow effect */}
      {isClicked && (
        <m.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          // Use a negative inset so that the splash expands beyond the button.
          className="absolute z-[999] -inset-2 rounded-full bg-white dark:bg-purple-500"
        // style={{ zIndex: -1 }}
        />
      )}
    </m.div>
  );
};

export default memo(MorphingSpinner);
