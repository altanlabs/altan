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
  const getPlanStatusColor = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between px-3 py-1.5 rounded-t-3xl bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-lg text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-[#1c1c1c]/95 hover:border-gray-300/40 dark:hover:border-gray-600/40">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 cursor-pointer flex-1"
        >
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-150"
          />
          <Iconify
            icon="mdi:format-list-checks"
            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
          />
          <span className="text-xs font-medium">
            {isExpanded && statusFilter !== 'all' && filteredTasksCount !== totalTasksCount
              ? `${filteredTasksCount} of ${totalTasksCount} Task${totalTasksCount !== 1 ? 's' : ''}`
              : `${totalTasksCount} Task${totalTasksCount !== 1 ? 's' : ''}`}
          </span>
          {plan?.title && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              · {plan.title}
            </span>
          )}
          {plan?.status && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getPlanStatusColor(plan.status)}`}>
              {plan.status}
            </span>
          )}
          {plan?.is_approved && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Iconify
                    icon="mdi:check-decagram"
                    className="w-3 h-3 text-green-600 dark:text-green-400"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Plan Approved</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Status Filter Toggle - only show when expanded */}
        {isExpanded && (
          <TaskStatusFilters currentFilter={statusFilter} onFilterChange={onFilterChange} />
        )}
      </div>
    </TooltipProvider>
  );
};

