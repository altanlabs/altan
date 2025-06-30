import { m } from 'framer-motion';
import React, { memo } from 'react';

import { cn } from '@lib/utils.ts';

/**
 * LampContainer Props
 */
interface LampContainerProps {
  /** Content to render inside the lamp container */
  children: React.ReactNode;
  /** Optional className to append to the container */
  className?: string;
  /**
   * Base background color (Tailwind class)
   * @default "bg-slate-950"
   */
  backgroundColor?: string;
  /**
   * The highlight color used in gradients and elements (Tailwind class)
   * @default "bg-cyan-500"
   */
  highlightColor?: string;
  /**
   * Delay before the lamp animations start (in seconds)
   * @default 0.3
   */
  animationDelay?: number;
  /**
   * Duration of the lamp animations (in seconds)
   * @default 0.8
   */
  animationDuration?: number;
  /**
   * Whether to apply rounded corners to the container
   * @default false
   */
  roundedCorners?: boolean;
  /**
   * Whether the container should span the full viewport height
   * @default true
   */
  fullViewportHeight?: boolean;
  /**
   * Class name of the children. Useful if you need the content to appear higher or lower.
   * Tailwind class expected, e.g., "-translate-y-80" or "translate-y-0".
   * @default "-translate-y-80"
   */
  childrenClassName?: string;
}

/**
 * LampContainer provides a decorative lamp-like background with animated conic gradients and blurred elements.
 * It serves as a decorative wrapper component.
 */
const LampContainer = ({
  children,
  className,
  backgroundColor = 'bg-slate-100 dark:bg-slate-950',
  highlightColor = 'bg-cyan-500',
  animationDelay = 0.3,
  animationDuration = 0.8,
  roundedCorners = false,
  fullViewportHeight = true,
  // childrenClassName = "-translate-y-0",
}: LampContainerProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden w-full z-0',
        backgroundColor,
        roundedCorners ? 'rounded-md' : '',
        fullViewportHeight ? 'min-h-screen' : '',
        className,
      )}
    >
      {/* Decorative Lamp Layers */}
      <div className="absolute inset top-0 flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 mt-40">
        {/* Left Conic Gradient */}
        <m.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{
            delay: animationDelay,
            duration: animationDuration,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: 'conic-gradient(from_70deg_at_center_top, var(--tw-gradient-stops))',
          }}
          className={cn(
            'absolute right-1/2 h-56 w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent',
            '[--conic-position:from_70deg_at_center_top]',
          )}
        >
          <div className="absolute left-0 w-full h-40 bottom-0 z-20 bg-slate-100 dark:bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute left-0 w-40 h-full bottom-0 z-20 bg-slate-100 dark:bg-slate-950 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </m.div>

        {/* Right Conic Gradient */}
        <m.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{
            delay: animationDelay,
            duration: animationDuration,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: 'conic-gradient(from_290deg_at_center_top, var(--tw-gradient-stops))',
          }}
          className={cn(
            'absolute left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500',
            '[--conic-position:from_290deg_at_center_top]',
          )}
        >
          <div className="absolute right-0 w-40 h-full bottom-0 z-20 bg-slate-100 dark:bg-slate-950 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute right-0 w-full h-40 bottom-0 z-20 bg-slate-100 dark:bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </m.div>

        {/* Dark Blur Layer */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-100 dark:bg-slate-950 blur-2xl"></div>

        {/* Slight Backdrop Blur */}
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>

        {/* Highlight Circle */}
        <div
          className={cn(
            'absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl',
            highlightColor,
          )}
        ></div>

        {/* Blur Oval */}
        <m.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '16rem' }}
          transition={{
            delay: animationDelay,
            duration: animationDuration,
            ease: 'easeInOut',
          }}
          className={cn(
            'absolute inset-auto z-30 h-36 -translate-y-[6rem] rounded-full blur-2xl',
            'bg-cyan-400',
          )}
        ></m.div>

        {/* Horizontal Highlight Line */}
        <m.div
          initial={{ width: '15rem' }}
          whileInView={{ width: '30rem' }}
          transition={{
            delay: animationDelay,
            duration: animationDuration,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400"
        ></m.div>

        {/* Top Mask Strip */}
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-100 dark:bg-slate-950"></div>
      </div>

      {/* Children Section */}
      {children}
    </div>
  );
};

export default memo(LampContainer);
