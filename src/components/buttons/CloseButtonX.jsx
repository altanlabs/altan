import { memo } from 'react';

import { cn } from '@lib/utils';

const CloseButtonX = ({ onClick, disabled = false, enableBorderAnimation = true }) => {
  return (
    <button
      className={cn(
        'relative inline-flex h-12 w-12 items-center justify-center border bg-[length:200%_200%] p-[2px] text-gray-400 transition-all focus:outline-none overflow-hidden rounded-full shadow-xl',
        disabled
          ? 'pointer-events-none opacity-50 focus:ring-0 border-gray-400 bg-gray-300dark:border-gray-800 dark:bg-gray-700'
          : 'focus:ring-red-300 focus:ring-offset-gray-100 dark:focus:ring-red-500 dark:focus:ring-offset-gray-800 border-gray-300 bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,#e6e6e6_100%)] dark:border-gray-700 dark:bg-[radial-gradient(circle_at_50%_50%,#1e1e2f_0%,#0d0d14_100%)]',
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {/* Animated border effect */}
      {!disabled && enableBorderAnimation && (
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFC2C2_0%,#B23333_50%,#FFC2C2_100%)]" />
      )}
      <span
        className={cn(
          'inline-flex h-full w-full items-center justify-center rounded-full px-3 py-1 text-xl font-bold tracking-wide backdrop-blur-3xl',
          disabled
            ? 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
            : 'bg-white/[0.8] text-black dark:bg-gray-900/[0.8] dark:text-white',
          !disabled && enableBorderAnimation ? 'animate-shimmer' : '',
        )}
      >
        ✕
      </span>
    </button>
  );
};

export default memo(CloseButtonX);
