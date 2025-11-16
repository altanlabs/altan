import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getTaskService } from '../../services';
import type { Task, Plan } from '../../services/types';
import type { RootState, AppThunk } from '../store';

// ----------------------------------------------------------------------

// State shape
interface TasksState {
  tasksByThread: Record<string, Task[]>;
  plansById: Record<string, Plan>;
  plansByRoom: Record<string, Plan[]>;
  planIdByThread: Record<string, string>;
  loading: Record<string, boolean>;
  planLoading: Record<string, boolean>;
  roomPlansLoading: Record<string, boolean>;
  errors: Record<string, string | null>;
  planErrors: Record<string, string | null>;
  roomPlansErrors: Record<string, string | null>;
  initialized: Record<string, boolean>;
  expandedState: Record<string, boolean>;
  threadExpandedState: Record<string, boolean>;
  completedPlanEvent: {
    planId: string;
    threadId?: string;
    timestamp: number;
  } | null;
}

const initialState: TasksState = {
  tasksByThread: {},
  plansById: {},
  plansByRoom: {},
  planIdByThread: {},
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

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    startLoadingTasks(state, action: PayloadAction<{ threadId: string }>) {
      const { threadId } = action.payload;
      state.loading[threadId] = true;
      state.errors[threadId] = null;
    },

    stopLoadingTasks(state, action: PayloadAction<{ threadId: string }>) {
      const { threadId } = action.payload;
      state.loading[threadId] = false;
    },

    setTasksError(state, action: PayloadAction<{ threadId: string; error: string }>) {
      const { threadId, error } = action.payload;
      state.loading[threadId] = false;
      state.errors[threadId] = error;
    },

    setTasks(state, action: PayloadAction<{ threadId: string; tasks: Task[] }>) {
      const { threadId, tasks } = action.payload;
      state.tasksByThread[threadId] = tasks;
      state.loading[threadId] = false;
      state.errors[threadId] = null;
      state.initialized[threadId] = true;
    },

    setPlan(state, action: PayloadAction<{ plan: Plan; threadId?: string }>) {
      const { plan, threadId } = action.payload;
      if (plan && plan.id) {
        // If plan already exists, merge tasks carefully to preserve websocket updates
        const existingPlan = state.plansById[plan.id];
        if (existingPlan?.tasks) {
          // Merge tasks: prefer existing task data if it has a more recent updated_at
          const mergedTasks = plan.tasks.map((newTask) => {
            const existingTask = existingPlan.tasks.find((t) => t.id === newTask.id);
            if (existingTask) {
              const existingTime = new Date(existingTask.updated_at || 0).getTime();
              const newTime = new Date(newTask.updated_at || 0).getTime();

              // Keep the newer task data
              if (existingTime > newTime) {
                return existingTask;
              }
            }
            return newTask;
          });

          plan.tasks = mergedTasks;
        }

        state.plansById[plan.id] = plan;
        if (threadId) {
          state.planIdByThread[threadId] = plan.id;
        }
        state.planLoading[plan.id] = false;
        state.planErrors[plan.id] = null;
      }
    },

    setPlans(state, action: PayloadAction<{ roomId: string; plans: Plan[] }>) {
      const { roomId, plans } = action.payload;
      state.plansByRoom[roomId] = plans;
      // Also store each plan by ID for easy access
      plans.forEach((plan) => {
        if (plan && plan.id) {
          state.plansById[plan.id] = plan;
        }
      });
      state.roomPlansLoading[roomId] = false;
      state.roomPlansErrors[roomId] = null;
    },

    startLoadingRoomPlans(state, action: PayloadAction<{ roomId: string }>) {
      const { roomId } = action.payload;
      state.roomPlansLoading[roomId] = true;
      state.roomPlansErrors[roomId] = null;
    },

    setRoomPlansError(state, action: PayloadAction<{ roomId: string; error: string }>) {
      const { roomId, error } = action.payload;
      state.roomPlansLoading[roomId] = false;
      state.roomPlansErrors[roomId] = error;
    },

    startLoadingPlan(state, action: PayloadAction<{ planId: string }>) {
      const { planId } = action.payload;
      state.planLoading[planId] = true;
      state.planErrors[planId] = null;
    },

    setPlanError(state, action: PayloadAction<{ planId: string; error: string }>) {
      const { planId, error } = action.payload;
      state.planLoading[planId] = false;
      state.planErrors[planId] = error;
    },

    addTask(state, action: PayloadAction<{ threadId: string; task: Task }>) {
      const { threadId, task } = action.payload;
      if (!state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = [];
      }
      state.tasksByThread[threadId].push(task);

      // Mark as initialized so the widget knows there are tasks available
      state.initialized[threadId] = true;

      // Also add task to the plan if it exists for this thread
      const planId = state.planIdByThread[threadId];
      if (planId && state.plansById[planId]) {
        if (!state.plansById[planId].tasks) {
          state.plansById[planId].tasks = [];
        }
        state.plansById[planId].tasks.push(task);
      }
    },

    updateTask(
      state,
      action: PayloadAction<{ threadId: string; taskId: string; updates: Partial<Task> }>
    ) {
      const { threadId, taskId, updates } = action.payload;

      // Filter out null/undefined values from updates to preserve existing data
      const filteredUpdates = Object.entries(updates).reduce<Partial<Task>>((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {});

      // Initialize tasksByThread for this threadId if it doesn't exist
      if (!state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = [];
      }

      const tasks = state.tasksByThread[threadId];
      const taskIndex = tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        // Task exists - update it
        const currentTask = tasks[taskIndex];
        state.tasksByThread[threadId][taskIndex] = {
          ...currentTask,
          ...filteredUpdates,
        };
      } else {
        // Task doesn't exist - create it (this handles late-arriving WebSocket events)
        state.tasksByThread[threadId].push(filteredUpdates as Task);
        // Mark as initialized so the widget knows there are tasks available
        state.initialized[threadId] = true;
      }

      // Also update task within plans
      Object.keys(state.plansById).forEach((planId) => {
        const plan = state.plansById[planId];
        if (plan?.tasks) {
          const planTaskIndex = plan.tasks.findIndex((task) => task.id === taskId);
          if (planTaskIndex !== -1) {
            const currentTask = plan.tasks[planTaskIndex];
            state.plansById[planId].tasks[planTaskIndex] = {
              ...currentTask,
              ...filteredUpdates,
            };
          }
        }
      });
    },

    removeTask(state, action: PayloadAction<{ threadId: string; taskId: string }>) {
      const { threadId, taskId } = action.payload;
      const tasks = state.tasksByThread[threadId];
      if (tasks) {
        state.tasksByThread[threadId] = tasks.filter((task) => task.id !== taskId);
      }

      // Also remove task from plans
      Object.keys(state.plansById).forEach((planId) => {
        const plan = state.plansById[planId];
        if (plan?.tasks) {
          state.plansById[planId].tasks = plan.tasks.filter((task) => task.id !== taskId);
        }
      });
    },

    setTasksExpanded(state, action: PayloadAction<{ threadId: string; expanded: boolean }>) {
      const { threadId, expanded } = action.payload;
      state.expandedState[threadId] = expanded;
    },

    setThreadExpanded(state, action: PayloadAction<{ threadId: string; expanded: boolean }>) {
      const { threadId, expanded } = action.payload;
      state.threadExpandedState[threadId] = expanded;
    },

    clearTasks(state, action: PayloadAction<{ threadId?: string }>) {
      const { threadId } = action.payload;
      if (threadId) {
        delete state.tasksByThread[threadId];
        delete state.planIdByThread[threadId];
        delete state.loading[threadId];
        delete state.errors[threadId];
        delete state.initialized[threadId];
        delete state.expandedState[threadId];
        delete state.threadExpandedState[threadId];
      } else {
        // Clear all tasks
        state.tasksByThread = {};
        state.planIdByThread = {};
        state.loading = {};
        state.errors = {};
        state.initialized = {};
        state.expandedState = {};
        state.threadExpandedState = {};
      }
    },

    setPlanCompleted(state, action: PayloadAction<{ planId: string; threadId?: string }>) {
      const { planId, threadId } = action.payload;
      state.completedPlanEvent = {
        planId,
        threadId,
        timestamp: Date.now(),
      };
    },

    clearPlanCompleted(state) {
      state.completedPlanEvent = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
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
} = slice.actions;

// ----------------------------------------------------------------------

// SELECTORS

const selectTasksState = (state: RootState) => state.tasks;

// Stable empty array reference to avoid creating new references
const EMPTY_ARRAY: Task[] = [];
const EMPTY_PLANS_ARRAY: Plan[] = [];

export const selectTasksByThread = (threadId: string) => (state: RootState): Task[] =>
  selectTasksState(state).tasksByThread[threadId] || EMPTY_ARRAY;

export const selectPlanById = (planId: string) => (state: RootState): Plan | null =>
  selectTasksState(state).plansById[planId] || null;

export const selectPlanByThread = (threadId: string) => (state: RootState): Plan | null => {
  const planId = selectTasksState(state).planIdByThread[threadId];
  return planId ? selectTasksState(state).plansById[planId] : null;
};

export const selectPlanLoading = (planId: string) => (state: RootState): boolean =>
  selectTasksState(state).planLoading[planId] || false;

export const selectPlanError = (planId: string) => (state: RootState): string | null =>
  selectTasksState(state).planErrors[planId] || null;

export const selectTasksLoading = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).loading[threadId] || false;

export const selectTasksError = (threadId: string) => (state: RootState): string | null =>
  selectTasksState(state).errors[threadId] || null;

export const selectTasksInitialized = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).initialized[threadId] || false;

export const selectTasksExpanded = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).expandedState[threadId] || false;

export const selectThreadExpanded = (threadId: string) => (state: RootState): boolean =>
  selectTasksState(state).threadExpandedState[threadId] || false;

export const selectCompletedPlanEvent = (state: RootState) =>
  selectTasksState(state).completedPlanEvent;

export const selectPlansByRoom = (roomId: string) => (state: RootState): Plan[] =>
  selectTasksState(state).plansByRoom[roomId] || EMPTY_PLANS_ARRAY;

export const selectRoomPlansLoading = (roomId: string) => (state: RootState): boolean =>
  selectTasksState(state).roomPlansLoading[roomId] || false;

export const selectRoomPlansError = (roomId: string) => (state: RootState): string | null =>
  selectTasksState(state).roomPlansErrors[roomId] || null;

// ----------------------------------------------------------------------

// ASYNC ACTIONS

// Get TaskService instance
const taskService = getTaskService();

// Fetch plan by ID (for PlanWidget)
export const fetchPlan =
  (planId: string): AppThunk<Promise<Plan | undefined>> =>
  async (dispatch, getState) => {
    const state = getState();
    const isLoading = selectPlanLoading(planId)(state);
    const existingPlan = selectPlanById(planId)(state);

    // Don't fetch if already loading or already exists
    if (isLoading) {
      return existingPlan || undefined;
    }

    if (existingPlan) {
      return existingPlan;
    }

    dispatch(startLoadingPlan({ planId }));

    try {
      const plan = await taskService.fetchPlan(planId);
      dispatch(setPlan({ plan }));
      return plan;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch plan';
      dispatch(setPlanError({ planId, error: errorMessage }));
      throw error;
    }
  };

// Fetch standalone tasks by threadId (for TodoWidget) - tasks without a plan_id
export const fetchTasks =
  (threadId: string): AppThunk<Promise<Task[] | undefined>> =>
  async (dispatch, getState) => {
    const state = getState();
    const isLoading = selectTasksLoading(threadId)(state);
    const isInitialized = selectTasksInitialized(threadId)(state);

    // Don't fetch if already loading or already initialized
    if (isLoading || isInitialized) {
      return;
    }

    dispatch(startLoadingTasks({ threadId }));

    try {
      const standaloneTasks = await taskService.fetchTasksByThread(threadId);
      dispatch(setTasks({ threadId, tasks: standaloneTasks }));
      return standaloneTasks;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch tasks';
      dispatch(setTasksError({ threadId, error: errorMessage }));
      throw error;
    }
  };

export const refreshTasks =
  (threadId: string): AppThunk<Promise<Task[] | undefined>> =>
  async (dispatch, getState) => {
    // Force refresh by clearing initialization state
    const state = getState();
    const currentState = { ...state.tasks };
    if (currentState.initialized[threadId]) {
      delete currentState.initialized[threadId];
    }

    return dispatch(fetchTasks(threadId));
  };

// Fetch all plans by room ID
export const fetchPlansByRoomId =
  (roomId: string): AppThunk<Promise<Plan[] | undefined>> =>
  async (dispatch, getState) => {
    const state = getState();
    const isLoading = selectRoomPlansLoading(roomId)(state);
    const existingPlans = selectPlansByRoom(roomId)(state);

    // Don't fetch if already loading
    if (isLoading) {
      return existingPlans;
    }

    dispatch(startLoadingRoomPlans({ roomId }));

    try {
      const plans = await taskService.fetchPlansByRoom(roomId);
      dispatch(setPlans({ roomId, plans }));
      return plans;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch plans';
      dispatch(setRoomPlansError({ roomId, error: errorMessage }));
      throw error;
    }
  };

