import type { AppThunk } from '@/redux/store';
import { getTaskService } from '@/services';
import type { Task, Plan } from '@/services/types';

import {
  selectTasksLoading,
  selectTasksInitialized,
  selectPlanLoading,
  selectPlanById,
  selectRoomPlansLoading,
  selectPlansByRoom,
} from './selectors';
import {
  startLoadingTasks,
  setTasksError,
  setTasks,
  startLoadingPlan,
  setPlanError,
  setPlan,
  startLoadingRoomPlans,
  setRoomPlansError,
  setPlans,
} from './slice';

// Get TaskService instance
const taskService = getTaskService();

// ----------------------------------------------------------------------
// PLAN THUNKS
// ----------------------------------------------------------------------

/**
 * Fetches a plan by ID
 * Used by PlanWidget to load individual plan data
 */
export const fetchPlan =
  (planId: string): AppThunk<Promise<Plan | undefined>> =>
  async (dispatch, getState) => {
    const state = getState();
    const isLoading = selectPlanLoading(planId)(state);
    const existingPlan = selectPlanById(state, planId);

    // Don't fetch if already loading
    if (isLoading) {
      return existingPlan || undefined;
    }

    // Return existing plan if it exists
    if (existingPlan) {
      return existingPlan;
    }

    dispatch(startLoadingPlan({ planId }));

    try {
      const plan = await taskService.fetchPlan(planId);
      dispatch(setPlan({ plan }));
      return plan;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to fetch plan';
      dispatch(setPlanError({ planId, error: errorMessage }));
      throw error;
    }
  };

/**
 * Fetches all plans for a room by room ID
 * Used to display all plans associated with a room
 */
export const fetchPlansByRoomId =
  (roomId: string): AppThunk<Promise<Plan[] | undefined>> =>
  async (dispatch, getState) => {
    const state = getState();
    const isLoading = selectRoomPlansLoading(roomId)(state);
    const existingPlans = selectPlansByRoom(state, roomId);

    // Don't fetch if already loading
    if (isLoading) {
      return existingPlans;
    }

    dispatch(startLoadingRoomPlans({ roomId }));

    try {
      const plans = await taskService.fetchPlansByRoom(roomId);
      dispatch(setPlans({ roomId, plans }));
      return plans;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to fetch plans';
      dispatch(setRoomPlansError({ roomId, error: errorMessage }));
      throw error;
    }
  };

// ----------------------------------------------------------------------
// TASK THUNKS
// ----------------------------------------------------------------------

/**
 * Fetches standalone tasks by thread ID (tasks without a plan_id)
 * Used by TodoWidget to load individual tasks
 */
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
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to fetch tasks';
      dispatch(setTasksError({ threadId, error: errorMessage }));
      throw error;
    }
  };

/**
 * Forces a refresh of tasks for a thread
 * Clears the initialization state and refetches
 */
export const refreshTasks =
  (threadId: string): AppThunk<Promise<Task[] | undefined>> =>
  async (dispatch) => {
    // Force refresh by refetching tasks
    // The fetchTasks function will handle the state update
    return dispatch(fetchTasks(threadId));
  };

