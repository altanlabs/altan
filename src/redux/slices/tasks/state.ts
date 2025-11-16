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
  loading: {},
  planLoading: {},
  roomPlansLoading: {},
  errors: {},
  planErrors: {},
  roomPlansErrors: {},
  initialized: {},
  expandedState: {},
  threadExpandedState: {},
  completedPlanEvent: null,
};

