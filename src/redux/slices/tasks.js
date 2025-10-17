import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// ----------------------------------------------------------------------

const initialState = {
  tasksByThread: {}, // Store tasks keyed by threadId
  plansById: {}, // Store plans keyed by plan_id
  plansByRoom: {}, // Store all plans keyed by room_id
  planIdByThread: {}, // Map threadId to plan_id
  loading: {}, // Track loading state per threadId
  planLoading: {}, // Track loading state per plan_id
  roomPlansLoading: {}, // Track loading state per room_id
  errors: {}, // Track errors per threadId
  planErrors: {}, // Track errors per plan_id
  roomPlansErrors: {}, // Track errors per room_id
  initialized: {}, // Track initialization per threadId
  expandedState: {}, // Track expanded state per threadId
  threadExpandedState: {}, // Track thread area expanded state per threadId
};

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    startLoadingTasks(state, action) {
      const { threadId } = action.payload;
      state.loading[threadId] = true;
      state.errors[threadId] = null;
    },

    stopLoadingTasks(state, action) {
      const { threadId } = action.payload;
      state.loading[threadId] = false;
    },

    setTasksError(state, action) {
      const { threadId, error } = action.payload;
      state.loading[threadId] = false;
      state.errors[threadId] = error;
    },

    setTasks(state, action) {
      const { threadId, tasks } = action.payload;
      state.tasksByThread[threadId] = tasks;
      state.loading[threadId] = false;
      state.errors[threadId] = null;
      state.initialized[threadId] = true;
    },

    setPlan(state, action) {
      const { plan, threadId } = action.payload;
      if (plan && plan.id) {
        state.plansById[plan.id] = plan;
        if (threadId) {
          state.planIdByThread[threadId] = plan.id;
        }
        state.planLoading[plan.id] = false;
        state.planErrors[plan.id] = null;
      }
    },

    setPlans(state, action) {
      const { roomId, plans } = action.payload;
      state.plansByRoom[roomId] = plans;
      // Also store each plan by ID for easy access
      plans.forEach(plan => {
        if (plan && plan.id) {
          state.plansById[plan.id] = plan;
        }
      });
      state.roomPlansLoading[roomId] = false;
      state.roomPlansErrors[roomId] = null;
    },

    startLoadingRoomPlans(state, action) {
      const { roomId } = action.payload;
      state.roomPlansLoading[roomId] = true;
      state.roomPlansErrors[roomId] = null;
    },

    setRoomPlansError(state, action) {
      const { roomId, error } = action.payload;
      state.roomPlansLoading[roomId] = false;
      state.roomPlansErrors[roomId] = error;
    },

    startLoadingPlan(state, action) {
      const { planId } = action.payload;
      state.planLoading[planId] = true;
      state.planErrors[planId] = null;
    },

    setPlanError(state, action) {
      const { planId, error } = action.payload;
      state.planLoading[planId] = false;
      state.planErrors[planId] = error;
    },

    addTask(state, action) {
      const { threadId, task } = action.payload;
      if (!state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = [];
      }
      state.tasksByThread[threadId].push(task);

      // Also add task to the plan if it exists for this thread
      const planId = state.planIdByThread[threadId];
      if (planId && state.plansById[planId]) {
        if (!state.plansById[planId].tasks) {
          state.plansById[planId].tasks = [];
        }
        state.plansById[planId].tasks.push(task);
      }
    },

    updateTask(state, action) {
      const { threadId, taskId, updates } = action.payload;
      const tasks = state.tasksByThread[threadId];
      if (tasks) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasksByThread[threadId][taskIndex] = {
            ...tasks[taskIndex],
            ...updates,
          };
        }
      }

      // Also update task within plans
      Object.keys(state.plansById).forEach(planId => {
        const plan = state.plansById[planId];
        if (plan?.tasks) {
          const planTaskIndex = plan.tasks.findIndex(task => task.id === taskId);
          if (planTaskIndex !== -1) {
            state.plansById[planId].tasks[planTaskIndex] = {
              ...plan.tasks[planTaskIndex],
              ...updates,
            };
          }
        }
      });
    },

    removeTask(state, action) {
      const { threadId, taskId } = action.payload;
      const tasks = state.tasksByThread[threadId];
      if (tasks) {
        state.tasksByThread[threadId] = tasks.filter(task => task.id !== taskId);
      }

      // Also remove task from plans
      Object.keys(state.plansById).forEach(planId => {
        const plan = state.plansById[planId];
        if (plan?.tasks) {
          state.plansById[planId].tasks = plan.tasks.filter(task => task.id !== taskId);
        }
      });
    },

    setTasksExpanded(state, action) {
      const { threadId, expanded } = action.payload;
      state.expandedState[threadId] = expanded;
    },

    setThreadExpanded(state, action) {
      const { threadId, expanded } = action.payload;
      state.threadExpandedState[threadId] = expanded;
    },

    clearTasks(state, action) {
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
} = slice.actions;

// ----------------------------------------------------------------------

// SELECTORS

const selectTasksState = (state) => state.tasks;

export const selectTasksByThread = (threadId) => (state) =>
  selectTasksState(state).tasksByThread[threadId] || [];

export const selectPlanById = (planId) => (state) =>
  selectTasksState(state).plansById[planId] || null;

export const selectPlanByThread = (threadId) => (state) => {
  const planId = selectTasksState(state).planIdByThread[threadId];
  return planId ? selectTasksState(state).plansById[planId] : null;
};

export const selectPlanLoading = (planId) => (state) =>
  selectTasksState(state).planLoading[planId] || false;

export const selectPlanError = (planId) => (state) =>
  selectTasksState(state).planErrors[planId] || null;

export const selectTasksLoading = (threadId) => (state) =>
  selectTasksState(state).loading[threadId] || false;

export const selectTasksError = (threadId) => (state) =>
  selectTasksState(state).errors[threadId] || null;

export const selectTasksInitialized = (threadId) => (state) =>
  selectTasksState(state).initialized[threadId] || false;

export const selectTasksExpanded = (threadId) => (state) =>
  selectTasksState(state).expandedState[threadId] || false;

export const selectThreadExpanded = (threadId) => (state) =>
  selectTasksState(state).threadExpandedState[threadId] || false;

export const selectPlansByRoom = (roomId) => (state) =>
  selectTasksState(state).plansByRoom[roomId] || [];

export const selectRoomPlansLoading = (roomId) => (state) =>
  selectTasksState(state).roomPlansLoading[roomId] || false;

export const selectRoomPlansError = (roomId) => (state) =>
  selectTasksState(state).roomPlansErrors[roomId] || null;

// ----------------------------------------------------------------------

// ASYNC ACTIONS

// Fetch plan by ID (for PlanWidget)
export const fetchPlan = (planId) => async (dispatch, getState) => {
  const state = getState();
  const isLoading = selectPlanLoading(planId)(state);
  const existingPlan = selectPlanById(planId)(state);

  // Don't fetch if already loading or already exists
  if (isLoading || existingPlan) {
    return existingPlan;
  }

  dispatch(startLoadingPlan({ planId }));

  try {
    const response = await axios.get(
      `https://cagi.altan.ai/plans/${planId}?include_tasks=true`,
    );
    const planData = response.data.data || {};

    // Extract plan metadata
    const plan = {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      status: planData.status,
      is_approved: planData.is_approved,
      estimated_minutes: planData.estimated_minutes,
      created_at: planData.created_at,
      updated_at: planData.updated_at,
      finished_at: planData.finished_at,
      room_id: planData.room_id,
      tasks: planData.tasks || [],
    };

    dispatch(setPlan({ plan }));
    return plan;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch plan';
    dispatch(setPlanError({ planId, error: errorMessage }));
    throw error;
  }
};

// Fetch plan by threadId (for TodoWidget)
export const fetchTasks = (threadId) => async (dispatch, getState) => {
  const state = getState();
  const isLoading = selectTasksLoading(threadId)(state);
  const isInitialized = selectTasksInitialized(threadId)(state);

  // Don't fetch if already loading or already initialized
  if (isLoading || isInitialized) {
    return;
  }

  dispatch(startLoadingTasks({ threadId }));

  try {
    const response = await axios.get(
      `https://cagi.altan.ai/plans/?mainthread_id=${threadId}&order_by=created_at&ascending=false&include_tasks=true`,
    );
    const planData = response.data.data || {};
    const tasks = planData.tasks || [];

    // Extract plan metadata
    const plan = {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      status: planData.status,
      is_approved: planData.is_approved,
      estimated_minutes: planData.estimated_minutes,
      created_at: planData.created_at,
      updated_at: planData.updated_at,
      finished_at: planData.finished_at,
      room_id: planData.room_id,
      tasks: tasks,
    };

    dispatch(setTasks({ threadId, tasks }));
    dispatch(setPlan({ plan, threadId }));
    return tasks;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch tasks';
    dispatch(setTasksError({ threadId, error: errorMessage }));
    throw error;
  }
};

export const refreshTasks = (threadId) => async (dispatch, getState) => {
  // Force refresh by clearing initialization state
  const state = getState();
  const currentState = { ...state.tasks };
  if (currentState.initialized[threadId]) {
    delete currentState.initialized[threadId];
  }

  return dispatch(fetchTasks(threadId));
};

// Fetch all plans by room ID
export const fetchPlansByRoomId = (roomId) => async (dispatch, getState) => {
  const state = getState();
  const isLoading = selectRoomPlansLoading(roomId)(state);
  const existingPlans = selectPlansByRoom(roomId)(state);

  // Don't fetch if already loading
  if (isLoading) {
    return existingPlans;
  }

  dispatch(startLoadingRoomPlans({ roomId }));

  try {
    const response = await axios.get(
      `https://cagi.altan.ai/plans/?room_id=${roomId}&include_tasks=true&order_by=created_at&ascending=false`,
    );
    const plansData = response.data.data || [];

    // Ensure plansData is an array
    const plans = Array.isArray(plansData) ? plansData : [plansData];

    // Transform plans to our format
    const transformedPlans = plans.map((planData) => ({
      id: planData.id,
      title: planData.title,
      description: planData.description,
      status: planData.status,
      is_approved: planData.is_approved,
      estimated_minutes: planData.estimated_minutes,
      created_at: planData.created_at,
      updated_at: planData.updated_at,
      finished_at: planData.finished_at,
      room_id: planData.room_id,
      tasks: planData.tasks || [],
    }));

    dispatch(setPlans({ roomId, plans: transformedPlans }));
    return transformedPlans;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch plans';
    dispatch(setRoomPlansError({ roomId, error: errorMessage }));
    throw error;
  }
};
