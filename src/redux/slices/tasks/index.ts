/**
 * Tasks Redux Module
 * 
 * This module manages tasks and plans in a normalized state structure.
 * It uses entity normalization for optimal performance and proper memoization
 * to prevent unnecessary rerenders.
 * 
 * @module tasks
 */

// Export reducer as default
export { default } from './slice';

// Export all actions
export {
  startLoadingTasks,
  stopLoadingTasks,
  setTasksError,
  setTasks,
  setPlan,
  setPlans,
  startLoadingPlan,
  setPlanError,
  startLoadingRoomPlans,
  setRoomPlansError,
  addTask,
  updateTask,
  removeTask,
  setTasksExpanded,
  setThreadExpanded,
  clearTasks,
  setPlanCompleted,
  clearPlanCompleted,
} from './slice';

// Export all selectors
export {
  // Simple selectors
  selectCompletedPlanEvent,
  selectTasksLoading,
  selectTasksError,
  selectTasksInitialized,
  selectTasksExpanded,
  selectThreadExpanded,
  selectPlanLoading,
  selectPlanError,
  selectRoomPlansLoading,
  selectRoomPlansError,
  
  // Entity selectors
  selectTaskById,
  selectTasksByThread,
  selectPlanById,
  selectPlanByThread,
  selectPlansByRoom,
  selectPlanIdsByRoom,
  
  // Field selectors
  selectPlanTitle,
  selectPlanDescription,
  selectPlanIsApproved,
  selectPlanStatus,
  selectPlanCreatedAt,
  selectTaskTitle,
  selectTaskDescription,
  selectTaskStatus,
  selectTaskThreadId,
  
  // Computed selectors
  selectSortedPlanTaskIds,
  selectPlanProgress,
  selectPlanStats,
} from './selectors';

// Export all thunks
export {
  fetchPlan,
  fetchPlansByRoomId,
  fetchTasks,
  refreshTasks,
} from './thunks';

// Export types
export type {
  TasksState,
  PlanCompletedEvent,
  PlanProgress,
  PlanStats,
  TaskStatus,
} from './types';

export {
  STATUS_PRIORITY,
  COMPLETED_STATUSES,
} from './types';

