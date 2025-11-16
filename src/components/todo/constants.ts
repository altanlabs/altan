/**
 * Constants for the Todo Widget
 * Centralized configuration values
 */

import { TaskStatus } from './types';

export const API_BASE_URL = 'https://cagi.altan.ai';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.READY]: 'Ready',
  [TaskStatus.RUNNING]: 'Running',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.PENDING]: 'Pending',
};

export const TASK_STATUS_PRIORITY: Record<string, number> = {
  [TaskStatus.RUNNING]: 1,
  [TaskStatus.READY]: 2,
  [TaskStatus.TODO]: 3,
  todo: 3,
  [TaskStatus.PENDING]: 3,
  [TaskStatus.COMPLETED]: 4,
  [TaskStatus.DONE]: 4,
};

export const EMPTY_ARRAY: readonly never[] = [];

