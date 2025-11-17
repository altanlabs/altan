import { ApiTask } from './types';
import { TaskStatus } from '@/services/types';
import { 
  CheckCircle2, 
  Loader2, 
  Circle,
  type LucideIcon
} from 'lucide-react';

const STATUS_PRIORITY: Record<string, number> = {
  in_progress: 1,
  pending: 2,
  completed: 3,
  failed: 4,
  cancelled: 5,
};

export const sortTasksByPriority = (tasks: ApiTask[]): ApiTask[] => {
  if (!tasks || tasks.length === 0) return [];

  return [...tasks].sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status] || 999;
    const priorityB = STATUS_PRIORITY[b.status] || 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return (a.order || 999) - (b.order || 999);
  });
};

export const getTaskIcon = (status: TaskStatus): LucideIcon => {
  switch (status) {
    case 'completed':
      return CheckCircle2;
    case 'in_progress':
      return Loader2;
    case 'failed':
    case 'cancelled':
    case 'pending':
    default:
      return Circle;
  }
};

export const getTaskIconClass = (status: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return 'text-neutral-900 dark:text-neutral-100';
    case 'in_progress':
      return 'text-neutral-900 dark:text-neutral-100';
    case 'failed':
      return 'text-neutral-600 dark:text-neutral-400';
    case 'cancelled':
      return 'text-neutral-500 dark:text-neutral-500';
    case 'pending':
    default:
      return 'text-neutral-500 dark:text-neutral-400';
  }
};

export const getTaskTextClass = (status: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return 'text-neutral-600 dark:text-neutral-400 line-through';
    case 'in_progress':
      return 'text-neutral-900 dark:text-neutral-100 font-medium';
    case 'failed':
      return 'text-neutral-600 dark:text-neutral-400 line-through opacity-60';
    case 'cancelled':
      return 'text-neutral-500 dark:text-neutral-500 line-through';
    case 'pending':
    default:
      return 'text-neutral-900 dark:text-neutral-100';
  }
};

