import {
  m,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import React, { memo, useRef } from 'react';

import { cn } from '@lib/utils.ts';

const MovingBorder = memo(
  ({ children, duration = 4000, rx = '0px', ry = '0px', className, ...otherProps }) => {
    const pathRef = useRef(null);
    const progress = useMotionValue(0);

    useAnimationFrame((time) => {
      if (!pathRef.current) return;
      const length = pathRef.current.getTotalLength();
      if (length) {
        const pxPerMillisecond = length / duration;
        progress.set((time * pxPerMillisecond) % length);
      }
    });

    const x = useTransform(progress, (val) => {
      if (!pathRef.current) return 0;
      const point = pathRef.current.getPointAtLength(val);
      return point.x;
    });

    const y = useTransform(progress, (val) => {
      if (!pathRef.current) return 0;
      const point = pathRef.current.getPointAtLength(val);
      return point.y;
    });

    const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

    return (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={cn('absolute h-full w-full', className)}
          width="100%"
          height="100%"
          {...otherProps}
        >
          <rect
            fill="none"
            width="100%"
            height="100%"
            rx={rx}
            ry={ry}
            ref={pathRef}
          />
        </svg>
        <m.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline-block',
            transform,
          }}
        >
          {children}
        </m.div>
      </>
    );
  },
);

MovingBorder.displayName = 'MovingBorder';

const MovingComponent = memo(
  ({
    borderRadius = '1.75rem',
    children,
    as: Component = 'button',
    containerClassName,
    borderClassName,
    duration,
    className,
    enableBorder = true,
    hoverStopAnimate = false, // New prop to control hover stop effect
    ...otherProps
  }) => {
    // const [hovered, setHovered] = useState(false);

    // // Event handlers for hover state
    // const handleMouseEnter =
    //   enableBorder && hoverStopAnimate ? () => setHovered(true) : undefined;
    // const handleMouseLeave =
    //   enableBorder && hoverStopAnimate ? () => setHovered(false) : undefined;

    return (
      <Component
        className={cn(
          'bg-transparent relative text-xl h-16 w-40 p-[1px] overflow-hidden',
          containerClassName,
        )}
        style={{
          borderRadius: borderRadius,
        }}
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        {...otherProps}
      >
        {enableBorder && (
          <div
            className="absolute inset-0"
            style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
          >
            <MovingBorder
              duration={duration}
              rx="30%"
              ry="30%"
              // paused={hovered} // Pass hover state to control animation
            >
              <div
                className={cn(
                  'h-20 w-20 opacity-[0.8] bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)]',
                  borderClassName,
                )}
              />
            </MovingBorder>
          </div>
        )}
        <div
          className={cn(
            'relative bg-slate-300/[0.8] dark:bg-slate-900/[0.8] border border-slate-800 backdrop-blur-xl flex items-center justify-center w-full h-full text-sm antialiased',
            className,
          )}
          style={{
            borderRadius: `calc(${borderRadius} * 0.96)`,
          }}
        >
          {children}
        </div>
      </Component>
    );
  },
);

MovingComponent.displayName = 'MovingComponent';

export { MovingBorder, MovingComponent };
