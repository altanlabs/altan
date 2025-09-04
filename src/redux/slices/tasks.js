import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// ----------------------------------------------------------------------

const initialState = {
  tasksByThread: {}, // Store tasks keyed by threadId
  loading: {}, // Track loading state per threadId
  errors: {}, // Track errors per threadId
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

    addTask(state, action) {
      const { threadId, task } = action.payload;
      if (!state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = [];
      }
      state.tasksByThread[threadId].push(task);
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
    },

    removeTask(state, action) {
      const { threadId, taskId } = action.payload;
      const tasks = state.tasksByThread[threadId];
      if (tasks) {
        state.tasksByThread[threadId] = tasks.filter(task => task.id !== taskId);
      }
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
        delete state.loading[threadId];
        delete state.errors[threadId];
        delete state.initialized[threadId];
        delete state.expandedState[threadId];
        delete state.threadExpandedState[threadId];
      } else {
        // Clear all tasks
        state.tasksByThread = {};
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

// ----------------------------------------------------------------------

// ASYNC ACTIONS

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
    const response = await axios.post('https://api.altan.ai/galaxia/hook/IHsbsY', {
      thread_id: threadId,
    });

    const tasks = response.data.tasks || [];

    dispatch(setTasks({ threadId, tasks }));
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
