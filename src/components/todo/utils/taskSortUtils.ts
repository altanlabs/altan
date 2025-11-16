/**
 * Task Sorting Utilities
 * Logic for sorting and filtering tasks
 */

import { TASK_STATUS_PRIORITY } from '../constants';
import { Task, TaskFilterStatus } from '../types';
import { taskMatchesFilter } from './taskStatusUtils';

/**
 * Sorts tasks by status priority
 * Priority order: running -> ready -> to-do -> completed
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const priorityA = TASK_STATUS_PRIORITY[a.status?.toLowerCase()] ?? 5;
    const priorityB = TASK_STATUS_PRIORITY[b.status?.toLowerCase()] ?? 5;
    return priorityA - priorityB;
  });
};

/**
 * Filters tasks by plan_id (excludes tasks with plan_id)
 */
export const filterTasksWithoutPlan = (tasks: Task[]): Task[] => {
  return tasks.filter((task) => !task.plan_id);
};

/**
 * Filters and sorts tasks based on status filter
 */
export const getFilteredAndSortedTasks = (
  tasks: Task[],
  statusFilter: TaskFilterStatus
): Task[] => {
  const tasksWithoutPlan = filterTasksWithoutPlan(tasks);
  const filteredTasks = tasksWithoutPlan.filter((task) =>
    taskMatchesFilter(task, statusFilter)
  );
  return sortTasksByPriority(filteredTasks);
};

/**
 * Finds the first running task from a list
 */
export const findFirstRunningTask = (tasks: Task[]): Task | null => {
  const tasksWithoutPlan = filterTasksWithoutPlan(tasks);
  return tasksWithoutPlan.find((task) => task.status?.toLowerCase() === 'running') ?? null;
};

/**
 * Checks if any tasks in the list are running
 */
export const hasRunningTasks = (tasks: Task[]): boolean => {
  return findFirstRunningTask(tasks) !== null;
};

