import { Tooltip } from '@mui/material';
import React, { memo, useCallback } from 'react';

import { cn } from '@lib/utils';

import Iconify from '../../../../components/iconify/Iconify';

// Simple minimalistic button using Tailwind CSS
const MinimalisticListButton = memo(
  ({ component, onTabChange, selected = false, isCollapsed = false, isSorting, onContextMenu }) => {
    const onButtonClick = useCallback(() => {
      component.type === 'external_link'
        ? window.open(component.params?.url, '_blank')
        : onTabChange(component.id);
    }, [component, onTabChange]);

    const onContextMenuClick = useCallback(
      (e) => onContextMenu(e, component),
      [component, onContextMenu],
    );

    return (
      <Tooltip
        title={isCollapsed ? component.name : ''}
        placement="right"
        arrow
      >
        <div
          onClick={onButtonClick}
          onContextMenu={onContextMenuClick}
          className={cn(
            // Base styles
            'flex items-center w-full h-11 px-3 rounded-lg text-sm cursor-pointer transition-all duration-200 ease-out mb-1',
            // Justify content based on collapsed state
            isCollapsed ? 'justify-center' : 'justify-start gap-4',
            // Selected state - clean background like your image
            selected
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
              : 'text-gray-700 dark:text-gray-400 font-normal',
            // Hover state
            'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            // Scale on hover when collapsed
            isCollapsed && 'hover:scale-105',
            // Active state
            'active:scale-95',
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <Iconify
              icon={
                isSorting
                  ? 'mi:drag'
                  : component.icon ||
                    (component.type === 'external_link'
                      ? 'akar-icons:link-out'
                      : 'iconamoon:component')
              }
              width={20}
            />
          </div>
          {!isCollapsed && <span className="truncate flex-1 text-left">{component.name}</span>}
        </div>
      </Tooltip>
    );
  },
);

// Replacement for the static navigation buttons (Room, Settings, etc.)
const MinimalisticNavButton = memo(
  ({ icon, label, onClick, selected = false, isCollapsed = false }) => {
    return (
      <Tooltip
        title={isCollapsed ? label : ''}
        placement="right"
        arrow
      >
        <div
          onClick={onClick}
          className={cn(
            // Base styles
            'flex items-center w-full h-11 px-3 rounded-lg text-sm cursor-pointer transition-all duration-200 ease-out mb-1',
            // Justify content based on collapsed state
            isCollapsed ? 'justify-center' : 'justify-start gap-4',
            // Selected state - clean background like your image
            selected
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
              : 'text-gray-700 dark:text-gray-400 font-normal',
            // Hover state
            'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            // Scale on hover when collapsed
            isCollapsed && 'hover:scale-105',
            // Active state
            'active:scale-95',
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <Iconify
              icon={icon}
              width={20}
            />
          </div>
          {!isCollapsed && <span className="truncate flex-1 text-left">{label}</span>}
        </div>
      </Tooltip>
    );
  },
);

// Replacement for the create component button
const MinimalisticCreateButton = memo(({ onClick, isCollapsed = false }) => {
  return (
    <Tooltip
      title={isCollapsed ? 'Add Component' : ''}
      placement="right"
      arrow
    >
      <div
        onClick={onClick}
        className={cn(
          // Base styles
          'flex items-center w-full h-11 px-3 rounded-lg text-sm cursor-pointer transition-all duration-200 ease-out mb-1',
          // Justify content based on collapsed state
          isCollapsed ? 'justify-center' : 'justify-start gap-4',
          // Dashed border styling
          'border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400',
          // Hover state
          'hover:border-gray-400 dark:hover:border-gray-500 hover:border-solid hover:text-gray-900 dark:hover:text-white',
          // Scale on hover when collapsed
          isCollapsed && 'hover:scale-105',
          // Active state
          'active:scale-95',
        )}
      >
        <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
          <Iconify
            icon="mdi:plus"
            width={20}
          />
        </div>
        {!isCollapsed && <span className="truncate flex-1 text-left">Add Component</span>}
      </div>
    </Tooltip>
  );
});

export { MinimalisticListButton, MinimalisticNavButton, MinimalisticCreateButton };
