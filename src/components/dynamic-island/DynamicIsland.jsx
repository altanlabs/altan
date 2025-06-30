// DynamicIsland.js
import React, { memo } from 'react';

import { cn } from '@lib/utils';

import { useDynamicIslandContext } from './DynamicIslandContext';

export const DynamicIsland = memo(
  ({ children, saveButton, offset = 0, offsetY = 0, className = '' }) => {
    const islandContext = useDynamicIslandContext();
    const actualSaveButton =
      saveButton !== undefined ? saveButton : islandContext?.islandState?.saveButton;

    if (!children && !actualSaveButton) {
      return null;
    }

    return (
      <div
        className={cn(
          'fixed z-[999] transform -translate-x-1/2 pt-1 pb-1 pl-2 pr-2 bottom-[8.5%] sm:bottom-[5%] rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg backdrop-blur-xl before:backdrop-hack',
          offsetY && 'mb-[offsetY]',
          className,
        )}
        style={{ left: `calc(50% + ${offset}px)` }}
      >
        <div className="flex flex-col space-y-1">
          {actualSaveButton}
          {children}
        </div>
      </div>
    );
  },
);
