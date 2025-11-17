import type { Task, Plan } from '@/services/types';

/**
 * Normalized state shape for tasks and plans
 * Uses entity normalization pattern for optimal performance
 */
export interface TasksState {
  // Normalized entities
  tasksById: Record<string, Task>;
  plansById: Record<string, Plan>;
  
  // Relationships
  taskIdsByPlan: Record<string, string[]>;
  planIdsByRoom: Record<string, string[]>;
  planIdByThread: Record<string, string>;
  tasksByThread: Record<string, string[]>; // Stores IDs instead of full tasks
  taskIdsByRoom: Record<string, string[]>; // All tasks for a room
  
  // UI state
  loading: Record<string, boolean>;
  planLoading: Record<string, boolean>;
  roomPlansLoading: Record<string, boolean>;
  roomTasksLoading: Record<string, boolean>;
  errors: Record<string, string | null>;
  planErrors: Record<string, string | null>;
  roomPlansErrors: Record<string, string | null>;
  roomTasksErrors: Record<string, string | null>;
  initialized: Record<string, boolean>;
  expandedState: Record<string, boolean>;
  threadExpandedState: Record<string, boolean>;
  
  // Events
  completedPlanEvent: PlanCompletedEvent | null;
}

export interface PlanCompletedEvent {
  planId: string;
  threadId?: string;
  timestamp: number;
}

/**
 * Plan progress metrics
 */
export interface PlanProgress {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Plan statistics
 */
export interface PlanStats {
  inProgress: number;
  pending: number;
  estimatedTime: string | null;
}

/**
 * Task status type
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * Status priority mapping for sorting
 */
export const STATUS_PRIORITY: Record<string, number> = {
  in_progress: 1,
  pending: 2,
  completed: 3,
  failed: 4,
} as const;

/**
 * Completed status values
 */
export const COMPLETED_STATUSES = ['completed', 'done', 'success'] as const;

