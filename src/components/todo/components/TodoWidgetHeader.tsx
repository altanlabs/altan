/**
 * Todo Widget Header Component
 * Header with expand/collapse, task count, and filters
 */

import type React from 'react';

import { TaskStatusFilters } from './TaskStatusFilters';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Iconify from '../../iconify/Iconify';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Plan, TaskFilterStatus } from '../types';

interface TodoWidgetHeaderProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  filteredTasksCount: number;
  totalTasksCount: number;
  statusFilter: TaskFilterStatus;
  onFilterChange: (filter: TaskFilterStatus) => void;
  plan?: Plan | null;
}

/**
 * Header component for the todo widget
 * Follows Single Responsibility Principle - only handles header UI
 */
export const TodoWidgetHeader = ({
  isExpanded,
  onToggleExpand,
  filteredTasksCount,
  totalTasksCount,
  statusFilter,
  onFilterChange,
  plan,
}: TodoWidgetHeaderProps): React.JSX.Element => {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between px-2 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 cursor-pointer flex-1"
        >
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-3 h-3 text-neutral-500 dark:text-neutral-400 transition-transform duration-150"
          />
          <div className="flex items-center justify-center w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-900">
            <Iconify
              icon="mdi:format-list-checks"
              className="w-3 h-3 text-neutral-600 dark:text-neutral-400"
            />
          </div>
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {totalTasksCount} Task{totalTasksCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Status Filter Toggle - only show when expanded */}
        {isExpanded && (
          <TaskStatusFilters currentFilter={statusFilter} onFilterChange={onFilterChange} />
        )}
      </div>
    </TooltipProvider>
  );
};

