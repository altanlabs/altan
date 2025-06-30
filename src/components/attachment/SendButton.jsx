import Tooltip from '@mui/material/Tooltip';
import { m, useAnimation } from 'framer-motion';
import { memo, useState, useRef, useCallback } from 'react';

import { cn } from '@lib/utils';

import { AltanAnimatedSvg } from './AttachmentHandler.jsx';

const SendButton = ({ onSendMessage, isDisabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();
  const buttonRef = useRef(null);

  const handleClick = useCallback(async () => {
    if (isDisabled) return;

    // Start the animation
    if (!isAnimating) {
      onSendMessage?.();
    }
    setIsAnimating(true);
    if (!!buttonRef.current) {
      buttonRef.current.focus();
    }

    // Animate the entire button (pop + slight upward movement)
    // await controls.start({
    //   scale: [1, 1.2, 0.9, 0.8, 0.5, 0.4, 0.2, 0.5, 0.4, 0.2, 1],
    //   y: [0, -5, -10, 0, -5, -10, -20, -40, -50, -100, 0],
    //   opacity: [1, 0.7, 1, 0.7, 1, 0.5, 0.7, 0.4, 0.2, 0, 1],
    //   transition: {
    //     duration: 1.6,
    //     ease: 'easeInOut',
    //   },
    // });
    await controls.start({
      scale: [1, 1.3, 2.3, 1.5, 0.5, 0.1, 0, 0],
      y: [0, -20, -30, -70, -120, -200],
      x: [0, 10, 20, 10, -20, -50, -30],
      rotate: [0, 5, 0, -5, -15, -10, -15, -10, 0],
      opacity: [1, 1, 0.85, 0.6, 0.4, 0.3, 0.1, 0, 0],
      transition: {
        duration: 1.5, // Slightly longer for a graceful flight
        // ease: [0.42, 0, 0.58, 1], // Smooth cubic-bezier ease for natural motion
        ease: 'easeInOut',
      },
    });

    // Reset the animation after it finishes
    setTimeout(() => {
      controls.start({
        scale: 1,
        y: 0,
        x: 0,
        rotate: 0,
        opacity: 1,
      });
      // Reset animation state
      setIsAnimating(false);
      if (!!buttonRef.current) {
        buttonRef.current.blur();
      }
    }, 750); // Matches the animation duration
  }, [controls, isAnimating, isDisabled, onSendMessage]);

  return (
    <Tooltip title={isAnimating ? null : 'Send message'}>
      <span>
        {/* Motion-enabled button using custom animation controls */}
        <m.button
          onClick={handleClick}
          disabled={isDisabled && !isAnimating}
          ref={buttonRef}
          // Optional whileTap if you want the immediate press feedback
          whileTap={{ scale: 0.80 }}
          aria-label="Send message"
          className="relative inline-flex h-10 w-10 items-center justify-center
                  rounded-full bg-gradient-to-br from-gray-100/90 to-gray-300 dark:from-gray-500/20 dark:to-gray-600
                  shadow-lg ring-0 transition-all hover:ring-2
                  duration-300 hover:from-blue-200/40 hover:to-blue-300
                  dark:hover:from-blue-700/90 dark:hover:to-blue-800
                  active:shadow-md disabled:cursor-not-allowed disabled:opacity-50
                  focus:outline-none focus:ring-4 focus:ring-blue-300 group border-none"
        >
          {/* The send icon */}
          {
            isAnimating && (
              <span
                className={`
                absolute inset-0 flex items-center justify-center rounded-full 
                animate-spin
                bg-gradient-to-br from-purple-500 via-blue-500 to-transparent
                [mask-image:radial-gradient(circle,transparent 60%,white 65%)]
                shadow-[0_0_15px_5px_rgba(102,126,234,0.8)]
                before:absolute before:inset-0 before:rounded-full 
                before:border-2 before:border-t-purple-500 before:border-transparent 
              `}
              >
              </span>
            )
          }
          <m.span
            animate={controls}
            className="size-full rounded-full absolute inset-0 -z-1 transition transition-transform group-hover:scale-110"
          >
            <AltanAnimatedSvg
              size={32}
              className={cn(
                'p-[4px] relative inset-1 bg-transparent ',
                isDisabled && 'opacity-50',
              )}
              pathClassName=""
            />
          </m.span>

          {/* Bubble expansion effect (only visible during animation) */}
          {isAnimating && (
            <m.div
              className="absolute inset-0 rounded-full bg-blue-400"
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.4, 0],
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}
        </m.button>
      </span>
    </Tooltip>
  );
};

export default memo(SendButton);
