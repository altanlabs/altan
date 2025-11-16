import type { Plan, Task } from '@/services/types';

import { isTaskCompleted, STATUS_PRIORITY } from './plan-status';

export interface Progress {
  completed: number;
  total: number;
  percentage: number;
}

export const calculateProgress = (tasks?: Task[]): Progress => {
  if (!tasks || tasks.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = tasks.filter((task) => isTaskCompleted(task?.status)).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
};

export const sortTasksByPriority = (tasks?: Task[]): Task[] => {
  if (!tasks || tasks.length === 0) return [];

  return [...tasks].sort((a, b) => {
    const priorityA = (a.status && a.status in STATUS_PRIORITY) 
      ? STATUS_PRIORITY[a.status as keyof typeof STATUS_PRIORITY]
      : 999;
    const priorityB = (b.status && b.status in STATUS_PRIORITY)
      ? STATUS_PRIORITY[b.status as keyof typeof STATUS_PRIORITY]
      : 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return (a.order ?? 999) - (b.order ?? 999);
  });
};

export const calculateEstimatedTime = (tasks?: Task[]): string | null => {
  if (!tasks || tasks.length === 0) return null;

  const incompleteTasks = tasks.filter((task) => !isTaskCompleted(task?.status)).length;
  
  if (incompleteTasks === 0) return null;

  const totalMinutes = incompleteTasks * 2.5;

  if (totalMinutes < 60) {
    return `~${totalMinutes.toFixed(1)}m`;
  }
  
  const hours = totalMinutes / 60;
  return `~${hours.toFixed(1)}h`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const enrichPlanWithProgress = (plan: Plan): Plan & { progress: Progress } => {
  const progress = calculateProgress(plan.tasks);
  return { ...plan, progress };
};

