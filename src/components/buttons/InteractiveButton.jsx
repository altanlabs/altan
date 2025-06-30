import { Stack } from '@mui/material';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

import { cn } from '@lib/utils';

// import { MovingComponent } from '../aceternity/buttons/moving-border';
import { HoverBorderGradient } from '../aceternity/buttons/hover-border-gradient.tsx';
import Iconify from '../iconify';

const InteractiveButton = ({
  icon,
  title,
  onClick,
  // duration = 8000,
  containerClassName = '',
  borderClassName = '',
  iconClassName = '',
  titleClassName = '',
  enableBorder = true,
  className = '',
  iconSize = 20,
  disabled = false,
  loading = false,
  // hoverStopAnimate = true,
  loadingIcon = 'svg-spinners:ring-resize',
  ...other
}) => {
  return (
    <HoverBorderGradient
      containerClassName={cn(
        containerClassName,
        (disabled || loading) && 'cursor-not-allowed opacity-50',
      )}
      as="button"
      onClick={!disabled && !loading ? onClick : undefined}
      className={cn(
        'p-2 bg-slate-200 dark:bg-black border border-transparent group-hover:border-slate-700',
        className,
      )}
      disableAnimation={!enableBorder}
      {...other}
    >
      {/* // <MovingComponent
    //   containerClassName={cn(
    //     'relative z-20 group h-fit w-fit transform hover:opacity-100 transition-opacity ease-in-out opacity-75',
    //     enableBorder && 'border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
    //     disabled && 'cursor-not-allowed opacity-50',
    //     loading && 'opacity-100',
    //     containerClassName
    //   )}
    //   borderClassName={cn('overflow-hidden', borderClassName)}
    //   enableBorder={enableBorder && !disabled}
    //   onClick={!disabled && !loading ? onClick : undefined} // Disable interaction if disabled or loading
    //   duration={loading ? 2000 : duration}
    //   hoverStopAnimate={hoverStopAnimate}
    //   className={cn(
    //     'p-2 bg-slate-200 dark:bg-black border border-transparent group-hover:border-slate-700',
    //     disabled && 'cursor-not-allowed opacity-50',
    //     className
    //   )}
    //   { ...other }
    // > */}
      <Stack
        direction="row"
        width="100%"
        spacing={1}
        alignItems="center"
        justifyContent="center"
      >
        <span
          className={cn(
            'inline-flex items-center justify-center transform transition-all duration-300',
            loading ? 'opacity-0 scale-25 absolute' : 'opacity-100 scale-100 relative',
          )}
        >
          {icon && (
            <Iconify
              icon={icon}
              width={iconSize}
              className={iconClassName}
            />
          )}
        </span>
        <span
          className={cn(
            'inline-flex items-center justify-center transform transition-all duration-300',
            loading ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-25 absolute',
          )}
        >
          <Iconify
            icon={loadingIcon}
            width={iconSize - 5}
          />
        </span>
        {title && (
          <span className={cn('font-medium text-gray-700 dark:text-gray-200', titleClassName)}>
            {title}
          </span>
        )}
      </Stack>
    </HoverBorderGradient>
    // {/* </MovingComponent> */ }
  );
};

InteractiveButton.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  duration: PropTypes.number,
  iconSize: PropTypes.number,
  containerClassName: PropTypes.string,
  borderClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  enableBorder: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default memo(InteractiveButton);
