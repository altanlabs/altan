import React, { memo } from 'react';

import { cn } from '@lib/utils';

import { MovingBorder } from './moving-border';

const MovingBorderGradient = memo(
  ({
    children,
    containerClassName,
    duration = 2000,
    rx = '0px',
    ry = '0px',
    borderWidth = '2px',
    className,
    ...otherProps
  }) => {
    return (
      <div className={cn('relative p-[1px] overflow-hidden', containerClassName)}>
        <div className="absolute inset-0">
          <MovingBorder
            duration={duration}
            rx={rx}
            ry={ry}
            className="h-full w-full"
            {...otherProps}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600" />
          </MovingBorder>
        </div>

        <div className={cn('relative', className)}>{children}</div>
      </div>
    );
  },
);

MovingBorderGradient.displayName = 'MovingBorderGradient';

export { MovingBorderGradient };
export default MovingBorderGradient;
