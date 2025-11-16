import type { PlanStatus, TaskStatus } from '@/services/types';

export const STATUS_PRIORITY = {
  in_progress: 1,
  pending: 2,
  completed: 3,
  failed: 4,
  cancelled: 5,
} as const;

type StatusPriorityKey = keyof typeof STATUS_PRIORITY;

export const getPlanStatusColor = (status?: PlanStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
    case 'in_progress':
      return 'bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900';
    case 'pending':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400';
    case 'failed':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
    case 'cancelled':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400';
  }
};

export const getTaskStatusIcon = (status?: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return 'lucide:check-circle-2';
    case 'in_progress':
      return 'lucide:loader-2';
    case 'failed':
      return 'lucide:x-circle';
    default:
      return 'lucide:circle';
  }
};

export const getTaskStatusColor = (status?: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return 'text-neutral-500 dark:text-neutral-400';
    case 'in_progress':
      return 'text-neutral-900 dark:text-neutral-100';
    case 'failed':
      return 'text-neutral-900 dark:text-neutral-100';
    default:
      return 'text-neutral-400 dark:text-neutral-500';
  }
};

export const isTaskCompleted = (status?: TaskStatus): boolean => {
  return status === 'completed';
};

