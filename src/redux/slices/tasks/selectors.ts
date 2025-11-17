import { createCachedSelector } from 're-reselect';

import type { RootState } from '@/redux/store';
import type { Task, Plan } from '@/services/types';

import type { PlanProgress, PlanStats, TaskStatus, TasksState } from './types';
import { STATUS_PRIORITY, COMPLETED_STATUSES } from './types';

// ----------------------------------------------------------------------
// BASE SELECTORS
// ----------------------------------------------------------------------

const selectTasksState = (state: RootState): TasksState => {
  // Explicitly cast to avoid circular dependency type issues during build
  return (state as { tasks: TasksState }).tasks;
};

// Stable empty array reference
const EMPTY_ARRAY: string[] = [];

// ----------------------------------------------------------------------
// SIMPLE SELECTORS (non-parameterized)
// ----------------------------------------------------------------------

/**
 * Selects the completed plan event
 */
export const selectCompletedPlanEvent = (state: RootState): { planId: string; threadId?: string; timestamp: number } | null =>
  selectTasksState(state).completedPlanEvent;

// ----------------------------------------------------------------------
// PARAMETERIZED BASIC SELECTORS
// ----------------------------------------------------------------------

/**
 * Selects loading state for tasks by thread ID
 */
export const selectTasksLoading = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).loading[threadId] || false;

/**
 * Selects error state for tasks by thread ID
 */
export const selectTasksError = (threadId: string) => (state: RootState): string | null =>
  selectTasksState(state).errors[threadId] || null;

/**
 * Selects initialization state for tasks by thread ID
 */
export const selectTasksInitialized = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).initialized[threadId] || false;

/**
 * Selects expanded state for tasks by thread ID
 */
export const selectTasksExpanded = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).expandedState[threadId] || false;

/**
 * Selects expanded state for thread by thread ID
 */
export const selectThreadExpanded = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).threadExpandedState[threadId] || false;

/**
 * Selects loading state for plan by plan ID
 */
export const selectPlanLoading = (planId: string) => (state: RootState): boolean =>
  selectTasksState(state).planLoading[planId] || false;

/**
 * Selects error state for plan by plan ID
 */
export const selectPlanError = (planId: string) => (state: RootState): string | null =>
  selectTasksState(state).planErrors[planId] || null;

/**
 * Selects loading state for room plans by room ID
 */
export const selectRoomPlansLoading = (roomId: string) => (state: RootState): boolean =>
  selectTasksState(state).roomPlansLoading[roomId] || false;

/**
 * Selects error state for room plans by room ID
 */
export const selectRoomPlansError = (roomId: string) => (state: RootState): string | null =>
  selectTasksState(state).roomPlansErrors[roomId] || null;

/**
 * Selects loading state for room tasks by room ID
 */
export const selectRoomTasksLoading = (roomId: string) => (state: RootState): boolean =>
  selectTasksState(state).roomTasksLoading[roomId] || false;

/**
 * Selects error state for room tasks by room ID
 */
export const selectRoomTasksError = (roomId: string) => (state: RootState): string | null =>
  selectTasksState(state).roomTasksErrors[roomId] || null;

/**
 * Selects task IDs by room ID
 * Returns stable empty array reference if no tasks exist
 */
export const selectTaskIdsByRoom = (state: RootState, roomId: string): string[] => 
  selectTasksState(state).taskIdsByRoom[roomId] || EMPTY_ARRAY;

// ----------------------------------------------------------------------
// CACHED ENTITY SELECTORS
// ----------------------------------------------------------------------

/**
 * Selects a single task by ID (memoized)
 * Returns null if task doesn't exist
 */
export const selectTaskById = createCachedSelector(
  [(state: RootState) => selectTasksState(state).tasksById, (_state: RootState, taskId: string) => taskId],
  (tasksById: Record<string, Task>, taskId: string): Task | null => {
    return tasksById[taskId] || null;
  },
)((_state, taskId) => taskId);

/**
 * Selects tasks by thread ID (memoized)
 * Returns empty array if no tasks exist
 */
export const selectTasksByThread = createCachedSelector(
  [
    (state: RootState, threadId: string) => selectTasksState(state).tasksByThread[threadId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (taskIds: string[], tasksById: Record<string, Task>): Task[] => {
    if (taskIds.length === 0) return [];
    return taskIds.map((id) => tasksById[id]).filter(Boolean);
  },
)((_state, threadId) => threadId);

/**
 * Selects plan IDs by room ID
 * Returns stable empty array reference if no plans exist
 */
export const selectPlanIdsByRoom = (state: RootState, roomId: string): string[] => 
  selectTasksState(state).planIdsByRoom[roomId] || EMPTY_ARRAY;

// ----------------------------------------------------------------------
// MEMOIZED PLAN SELECTOR (FIXES RERENDER ISSUE)
// ----------------------------------------------------------------------

/**
 * Selects a plan by ID with its tasks (memoized to prevent unnecessary rerenders)
 * This is the FIXED version that properly memoizes the reconstructed plan
 */
export const selectPlanById = createCachedSelector(
  [
    (state: RootState, planId: string) => selectTasksState(state).plansById[planId],
    (state: RootState, planId: string) => selectTasksState(state).taskIdsByPlan[planId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (plan: Plan | undefined, taskIds: string[], tasksById: Record<string, Task>): Plan | null => {
    if (!plan) return null;
    
    // Reconstruct tasks array from normalized store
    const tasks = taskIds.map((id) => tasksById[id]).filter(Boolean);
    
    return {
      ...plan,
      tasks,
    };
  },
)((_state, planId) => planId);

/**
 * Selects a plan by thread ID (memoized)
 */
export const selectPlanByThread = createCachedSelector(
  [
    (state: RootState, threadId: string) => selectTasksState(state).planIdByThread[threadId],
    (state: RootState) => selectTasksState(state),
  ],
  (planId: string | undefined, tasksState): Plan | null => {
    if (!planId) return null;
    
    const plan = tasksState.plansById[planId];
    if (!plan) return null;
    
    const taskIds = tasksState.taskIdsByPlan[planId] || EMPTY_ARRAY;
    const tasks = taskIds.map((id) => tasksState.tasksById[id]).filter(Boolean);
    
    return {
      ...plan,
      tasks,
    };
  },
)((_state, threadId) => threadId);

/**
 * Selects all plans for a room with their tasks (memoized)
 */
export const selectPlansByRoom = createCachedSelector(
  [
    (state: RootState, roomId: string) => selectTasksState(state).planIdsByRoom[roomId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).plansById,
    (state: RootState) => selectTasksState(state).taskIdsByPlan,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (
    planIds: string[],
    plansById: Record<string, Plan>,
    taskIdsByPlan: Record<string, string[]>,
    tasksById: Record<string, Task>
  ): Plan[] => {
    if (planIds.length === 0) return [];
    
    return planIds
      .map((planId): Plan | null => {
        const plan = plansById[planId];
        if (!plan) return null;
        
        const taskIds = taskIdsByPlan[planId] || EMPTY_ARRAY;
        const tasks = taskIds.map((id: string) => tasksById[id]).filter((t): t is Task => Boolean(t));
        
        return {
          ...plan,
          tasks,
        };
      })
      .filter((p): p is Plan => p !== null);
  },
)((_state, roomId) => roomId);

// ----------------------------------------------------------------------
// PLAN FIELD SELECTORS (granular selectors for specific fields)
// ----------------------------------------------------------------------

/**
 * Selects plan title by ID
 */
export const selectPlanTitle = createCachedSelector(
  [(state: RootState, planId: string) => selectTasksState(state).plansById[planId]],
  (plan: Plan | undefined): string => plan?.title || 'Untitled Plan',
)((_state, planId) => planId);

/**
 * Selects plan description by ID
 */
export const selectPlanDescription = createCachedSelector(
  [(state: RootState, planId: string) => selectTasksState(state).plansById[planId]],
  (plan: Plan | undefined): string | undefined => plan?.description,
)((_state, planId) => planId);

/**
 * Selects plan approval status by ID
 */
export const selectPlanIsApproved = createCachedSelector(
  [(state: RootState, planId: string) => selectTasksState(state).plansById[planId]],
  (plan: Plan | undefined): boolean => plan?.is_approved || false,
)((_state, planId) => planId);

/**
 * Selects plan status by ID
 */
export const selectPlanStatus = createCachedSelector(
  [(state: RootState, planId: string) => selectTasksState(state).plansById[planId]],
  (plan: Plan | undefined): string => plan?.status || 'pending',
)((_state, planId) => planId);

/**
 * Selects plan created_at timestamp by ID
 */
export const selectPlanCreatedAt = createCachedSelector(
  [(state: RootState, planId: string) => selectTasksState(state).plansById[planId]],
  (plan: Plan | undefined): string | undefined => plan?.created_at,
)((_state, planId) => planId);

// ----------------------------------------------------------------------
// TASK FIELD SELECTORS (granular selectors for specific fields)
// ----------------------------------------------------------------------

/**
 * Selects task title by ID
 */
export const selectTaskTitle = createCachedSelector(
  [selectTaskById],
  (task: Task | null): string => task?.title || '',
)((_state, taskId) => taskId);

/**
 * Selects task description by ID
 */
export const selectTaskDescription = createCachedSelector(
  [selectTaskById],
  (task: Task | null): string | undefined => task?.description,
)((_state, taskId) => taskId);

/**
 * Selects task status by ID
 */
export const selectTaskStatus = createCachedSelector(
  [selectTaskById],
  (task: Task | null): TaskStatus => task?.status || 'pending',
)((_state, taskId) => taskId);

/**
 * Selects task thread ID
 */
export const selectTaskThreadId = createCachedSelector(
  [selectTaskById],
  (task: Task | null): string | undefined => task?.thread_id,
)((_state, taskId) => taskId);

// ----------------------------------------------------------------------
// COMPUTED SELECTORS (derived data)
// ----------------------------------------------------------------------

/**
 * Selects sorted task IDs for a plan (memoized)
 * Tasks are sorted by status priority and order
 */
export const selectSortedPlanTaskIds = createCachedSelector(
  [
    (state: RootState, planId: string) => selectTasksState(state).taskIdsByPlan[planId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (taskIds: string[], tasksById: Record<string, Task>): string[] => {
    if (taskIds.length === 0) return [];

    const sortedIds = [...taskIds].sort((aId, bId) => {
      const a = tasksById[aId];
      const b = tasksById[bId];
      
      if (!a || !b) return 0;

      const priorityA = a.status && a.status in STATUS_PRIORITY ? STATUS_PRIORITY[a.status] : 999;
      const priorityB = b.status && b.status in STATUS_PRIORITY ? STATUS_PRIORITY[b.status] : 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return (a.order ?? 999) - (b.order ?? 999);
    });

    return sortedIds;
  },
)((_state, planId) => planId);

/**
 * Selects plan progress (completed/total/percentage) (memoized)
 */
export const selectPlanProgress = createCachedSelector(
  [
    (state: RootState, planId: string) => selectTasksState(state).taskIdsByPlan[planId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (taskIds: string[], tasksById: Record<string, Task>): PlanProgress => {
    if (taskIds.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = taskIds.filter((id) => {
      const task = tasksById[id];
      return task?.status ? (COMPLETED_STATUSES as readonly string[]).includes(task.status) : false;
    }).length;
    
    const total = taskIds.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  },
)((_state, planId) => planId);

/**
 * Selects plan statistics (in_progress/pending counts and estimated time) (memoized)
 */
export const selectPlanStats = createCachedSelector(
  [
    (state: RootState, planId: string) => selectTasksState(state).taskIdsByPlan[planId] || EMPTY_ARRAY,
    (state: RootState) => selectTasksState(state).tasksById,
  ],
  (taskIds: string[], tasksById: Record<string, Task>): PlanStats => {
    if (taskIds.length === 0) {
      return { inProgress: 0, pending: 0, estimatedTime: null };
    }

    const tasks = taskIds.map((id) => tasksById[id]).filter(Boolean);
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;

    const incompleteTasks = tasks.filter(
      (task) => !task?.status || !(COMPLETED_STATUSES as readonly string[]).includes(task.status),
    ).length;

    let estimatedTime: string | null = null;
    if (incompleteTasks > 0) {
      const totalMinutes = incompleteTasks * 2.5;
      if (totalMinutes < 60) {
        estimatedTime = `~${totalMinutes.toFixed(1)}m`;
      } else {
        const hours = totalMinutes / 60;
        estimatedTime = `~${hours.toFixed(1)}h`;
      }
    }

    return { inProgress, pending, estimatedTime };
  },
)((_state, planId) => planId);

