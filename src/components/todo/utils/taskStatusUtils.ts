/**
 * Task Status Utilities
 * Centralized logic for task status rendering and behavior
 */

import { TaskStatus, TaskFilterStatus } from '../types';

export interface TaskStatusConfig {
  icon: string;
  iconColor: string;
  textStyle: string;
}

/**
 * Gets the icon name for a given task status
 */
export const getTaskIcon = (status?: TaskStatus | string): string => {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.COMPLETED:
    case TaskStatus.DONE:
      return 'mdi:check-circle';
    default:
      return 'mdi:circle-outline';
  }
};

/**
 * Gets the icon color classes for a given task status
 */
export const getTaskIconColor = (status?: TaskStatus | string): string => {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.COMPLETED:
    case TaskStatus.DONE:
      return 'text-green-600 dark:text-green-400';
    case TaskStatus.READY:
      return 'text-amber-600 dark:text-amber-400';
    case TaskStatus.RUNNING:
      return 'text-blue-600 dark:text-blue-400';
    case TaskStatus.TODO:
    case 'todo':
    case TaskStatus.PENDING:
      return 'text-gray-500 dark:text-gray-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

/**
 * Gets the text style classes for a given task status
 */
export const getTaskTextStyle = (status?: TaskStatus | string): string => {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case TaskStatus.COMPLETED:
    case TaskStatus.DONE:
      return 'text-gray-600 dark:text-gray-400 line-through';
    case TaskStatus.READY:
      return 'text-amber-700 dark:text-amber-300 font-medium';
    case TaskStatus.TODO:
    case 'todo':
    case TaskStatus.PENDING:
    case TaskStatus.RUNNING:
      return 'text-gray-900 dark:text-gray-100';
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
};

/**
 * Gets complete status configuration in one call
 */
export const getTaskStatusConfig = (status?: TaskStatus | string): TaskStatusConfig => ({
  icon: getTaskIcon(status),
  iconColor: getTaskIconColor(status),
  textStyle: getTaskTextStyle(status),
});

/**
 * Checks if a task matches the given filter
 */
export const taskMatchesFilter = (
  task: { status?: TaskStatus | string },
  filter: TaskFilterStatus
): boolean => {
  if (filter === 'all') return true;
  
  const taskStatus = task.status?.toLowerCase();
  
  switch (filter) {
    case 'running':
      return taskStatus === TaskStatus.RUNNING;
    case 'todo':
      return [
        TaskStatus.TODO,
        'todo',
        TaskStatus.PENDING,
        TaskStatus.READY,
      ].includes(taskStatus as TaskStatus);
    case 'completed':
      return [TaskStatus.COMPLETED, TaskStatus.DONE].includes(
        taskStatus as TaskStatus
      );
    default:
      return true;
  }
};

/**
 * Checks if a task is currently running
 */
export const isTaskRunning = (task: { status?: TaskStatus | string }): boolean => {
  return task.status?.toLowerCase() === TaskStatus.RUNNING;
};

/**
 * Checks if a task is completed
 */
export const isTaskCompleted = (task: { status?: TaskStatus | string }): boolean => {
  const status = task.status?.toLowerCase();
  return status === TaskStatus.COMPLETED || status === TaskStatus.DONE;
};

/**
 * Checks if a task is active (not completed)
 */
export const isTaskActive = (task: { status?: TaskStatus | string }): boolean => {
  return !isTaskCompleted(task);
};

