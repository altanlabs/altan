import type { TasksState } from './types';

/**
 * Initial state for tasks slice
 */
export const initialState: TasksState = {
  tasksById: {},
  plansById: {},
  taskIdsByPlan: {},
  planIdsByRoom: {},
  planIdByThread: {},
  tasksByThread: {},
  taskIdsByRoom: {},
  loading: {},
  planLoading: {},
  roomPlansLoading: {},
  roomTasksLoading: {},
  errors: {},
  planErrors: {},
  roomPlansErrors: {},
  roomTasksErrors: {},
  initialized: {},
  expandedState: {},
  threadExpandedState: {},
  completedPlanEvent: null,
};

