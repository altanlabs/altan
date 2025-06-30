import { m } from 'framer-motion';
import {
  useState,
  useEffect,
  type PropsWithChildren,
  type ElementType,
  type HTMLAttributes,
  useCallback,
} from 'react';

import { useSettingsContext } from '@components/settings';
import { cn } from '@lib/utils.ts';

// Direction type and related constants
type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT';
const DIRECTIONS: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];

// Precomputed gradients for each direction
const movingMap: Record<Direction, string> = {
  TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  BOTTOM:
    'radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  RIGHT:
    'radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
};

// Highlight gradient when hovered
const highlight =
  'radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)';

// Rotate direction helper
function getNextDirection(current: Direction, clockwise: boolean): Direction {
  const currentIndex = DIRECTIONS.indexOf(current);
  return clockwise
    ? DIRECTIONS[(currentIndex - 1 + DIRECTIONS.length) % DIRECTIONS.length]
    : DIRECTIONS[(currentIndex + 1) % DIRECTIONS.length];
}

export interface HoverBorderGradientProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  containerClassName?: string;
  className?: string;
  duration?: number;
  clockwise?: boolean;
  disableAnimation?: boolean;
}

/**
 * A component that renders a button-like element with a rotating border gradient.
 * When hovered, the gradient highlights. When not hovered, the gradient rotates direction over time.
 * If `disableAnimation` is true, the rotation is disabled and it stays at the initial direction ("TOP").
 */
export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  disableAnimation = false,
  ...props
}: PropsWithChildren<HoverBorderGradientProps>) {
  const { animations } = useSettingsContext();
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>('TOP');

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  // Handle direction rotation only if not hovered and animation is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
  
    if (!hovered && !disableAnimation && animations.all) {
      interval = setInterval(() => {
        setDirection((prev) => getNextDirection(prev, clockwise));
      }, duration * 1000);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hovered, animations.all, disableAnimation, duration, clockwise]);
  

  return (
    <Tag
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative flex w-fit h-min p-px rounded-full border transition duration-500 content-center items-center justify-center flex-col gap-10 bg-black/20 hover:bg-black/10 dark:bg-white/20 overflow-visible',
        containerClassName,
      )}
      {...props}
    >
      <div className={cn('z-10 w-auto text-white bg-black px-4 py-2 rounded-[inherit]', className)}>
        {children}
      </div>
      {((!disableAnimation && animations.all) || hovered) && (
        <m.div
          className="absolute inset-0 z-0 rounded-[inherit] filter blur-sm"
          initial={{ background: movingMap[direction] }}
          animate={{
            background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
          }}
          transition={{ ease: 'linear', duration }}
        />
      )}
      <div className="absolute inset-[2px] z-1 bg-black rounded-[100px]" />
    </Tag>
  );
}
