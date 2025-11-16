/**
 * Task Filtering Hook
 * Manages task filtering state and logic
 */

import { useState, useMemo, useEffect } from 'react';

import { Task, TaskFilterStatus } from '../types';
import { getFilteredAndSortedTasks, hasRunningTasks, filterTasksWithoutPlan } from '../utils/taskSortUtils';

interface UseTaskFilteringProps {
  tasks: Task[];
  isLoading: boolean;
}

interface UseTaskFilteringReturn {
  statusFilter: TaskFilterStatus;
  setStatusFilter: (filter: TaskFilterStatus) => void;
  filteredTasks: Task[];
  totalTasksCount: number;
}

/**
 * Hook to manage task filtering state and computed values
 * Follows Single Responsibility Principle - only handles filtering logic
 */
export const useTaskFiltering = ({
  tasks,
  isLoading,
}: UseTaskFilteringProps): UseTaskFilteringReturn => {
  const [statusFilter, setStatusFilter] = useState<TaskFilterStatus>('all');
  const [hasSetInitialFilter, setHasSetInitialFilter] = useState(false);

  // Calculate total tasks count (excluding plan tasks)
  const totalTasksCount = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;
    return filterTasksWithoutPlan(tasks).length;
  }, [tasks]);

  // Get filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return getFilteredAndSortedTasks(tasks, statusFilter);
  }, [tasks, statusFilter]);

  // Set initial filter based on whether there are running tasks
  useEffect(() => {
    if (!hasSetInitialFilter && tasks && tasks.length > 0 && !isLoading) {
      const shouldShowRunning = hasRunningTasks(tasks);
      setStatusFilter(shouldShowRunning ? 'running' : 'all');
      setHasSetInitialFilter(true);
    }
  }, [tasks, isLoading, hasSetInitialFilter]);

  return {
    statusFilter,
    setStatusFilter,
    filteredTasks,
    totalTasksCount,
  };
};

