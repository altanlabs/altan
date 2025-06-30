import { memo } from 'react';

import { cn } from '@lib/utils';

const StyledChip = memo(({ label, icon, active, variant, isLowCredits, ...other }) => {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-full flex items-center justify-center py-1.5 px-3 text-xs font-medium transition-all duration-200 ease-in-out',
        // Base styles based on variant
        variant === 'upgrade'
          ? cn(
              isLowCredits === true
                ? 'bg-red-500/20 text-red-600 dark:text-red-100 dark:bg-red-500/20 border border-red-500/50 dark:border-transparent'
                : 'bg-gray-700/10 text-gray-700 dark:text-white dark:bg-white/10 border border-gray-400/30 dark:border-transparent',
            )
          : cn(
              'bg-gray-100 dark:bg-white/10',
              active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300',
            ),
        // Hover effects based on variant
        variant === 'upgrade'
          ? cn(
              isLowCredits === true
                ? 'hover:bg-red-500/25 dark:hover:bg-red-500/30'
                : 'hover:bg-gray-700/15 dark:hover:bg-white/15',
            )
          : 'hover:bg-gray-200 dark:hover:bg-white/15',
        'focus:outline-none',
      )}
      {...other}
    >
      {icon && <span className={cn('mr-2 transition-color cursor-context-menu')}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
});

StyledChip.displayName = 'StyledChip';

export default StyledChip;
