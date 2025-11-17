/**
 * Task Status Filters Component
 * Filter buttons for different task statuses
 */

import type React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Iconify from '../../iconify/Iconify';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { TaskFilterStatus } from '../types';

interface TaskStatusFiltersProps {
  currentFilter: TaskFilterStatus;
  onFilterChange: (filter: TaskFilterStatus) => void;
}

/**
 * Filter buttons for task statuses
 * Follows Single Responsibility Principle - only handles filter UI
 */
export const TaskStatusFilters = ({
  currentFilter,
  onFilterChange,
}: TaskStatusFiltersProps): React.JSX.Element => {
  const filters = [
    {
      value: 'all' as TaskFilterStatus,
      label: 'All tasks',
      icon: 'mdi:view-list',
      activeClass: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
      inactiveClass: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    },
    {
      value: 'running' as TaskFilterStatus,
      label: 'Running tasks',
      icon: 'mdi:play-circle',
      activeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      inactiveClass: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    },
    {
      value: 'todo' as TaskFilterStatus,
      label: 'Todo tasks',
      icon: 'mdi:circle-outline',
      activeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      inactiveClass: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    },
    {
      value: 'completed' as TaskFilterStatus,
      label: 'Completed tasks',
      icon: 'mdi:check-circle',
      activeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      inactiveClass: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    },
  ];

  return (
    <TooltipProvider>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-0.5 ml-1"
      >
        {filters.map((filter) => (
          <Tooltip key={filter.value}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onFilterChange(filter.value)}
                className={`px-1 py-0.5 rounded text-[10px] font-medium transition-all ${
                  currentFilter === filter.value ? filter.activeClass : filter.inactiveClass
                }`}
              >
                <Iconify icon={filter.icon} className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{filter.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

