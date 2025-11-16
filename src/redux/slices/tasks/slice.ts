import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Task, Plan } from '@/services/types';

import { mapApiTaskToInternal, mapApiPlanToInternal, type ApiTask } from './mappers';
import { initialState } from './state';

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
      
      // Normalize tasks by ID
      const taskIds: string[] = [];
      tasks.forEach((task) => {
        const normalizedTask = mapApiTaskToInternal(task);
        state.tasksById[normalizedTask.id] = normalizedTask;
        taskIds.push(normalizedTask.id);
      });
      
      state.tasksByThread[threadId] = taskIds;
      state.loading[threadId] = false;
      state.errors[threadId] = null;
      state.initialized[threadId] = true;
    },

    setPlan(state, action: PayloadAction<{ plan: Plan; threadId?: string }>) {
      const { threadId } = action.payload;
      const plan = mapApiPlanToInternal(action.payload.plan);
      
      if (plan && plan.id) {
        // Normalize tasks into tasksById
        const taskIds: string[] = [];
        if (plan.tasks && plan.tasks.length > 0) {
          plan.tasks.forEach((task) => {
            const existingTask = state.tasksById[task.id];
            
            // Merge with existing task if it has newer data
            if (existingTask) {
              const existingTime = new Date(existingTask.updated_at || 0).getTime();
              const newTime = new Date(task.updated_at || 0).getTime();
              
              if (newTime >= existingTime) {
                state.tasksById[task.id] = task;
              }
            } else {
              state.tasksById[task.id] = task;
            }
            
            taskIds.push(task.id);
          });
        }
        
        // Store plan without embedded tasks (already normalized)
        state.plansById[plan.id] = {
          ...plan,
          tasks: [], // Empty array, tasks are in tasksById
        };
        
        // Store task IDs relationship
        state.taskIdsByPlan[plan.id] = taskIds;
        
        if (threadId) {
          state.planIdByThread[threadId] = plan.id;
        }
        
        state.planLoading[plan.id] = false;
        state.planErrors[plan.id] = null;
      }
    },

    setPlans(state, action: PayloadAction<{ roomId: string; plans: Plan[] }>) {
      const { roomId, plans } = action.payload;
      const planIds: string[] = [];
      
      plans.forEach((apiPlan) => {
        const plan = mapApiPlanToInternal(apiPlan);
        if (plan && plan.id) {
          // Normalize tasks
          const taskIds: string[] = [];
          if (plan.tasks && plan.tasks.length > 0) {
            plan.tasks.forEach((task) => {
              state.tasksById[task.id] = task;
              taskIds.push(task.id);
            });
          }
          
          // Store plan without embedded tasks
          state.plansById[plan.id] = {
            ...plan,
            tasks: [],
          };
          
          state.taskIdsByPlan[plan.id] = taskIds;
          planIds.push(plan.id);
        }
      });
      
      state.planIdsByRoom[roomId] = planIds;
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

    addTask(state, action: PayloadAction<{ threadId: string; task: ApiTask }>) {
      const { threadId, task: apiTask } = action.payload;
      const task = mapApiTaskToInternal(apiTask);
      
      // Add to normalized tasks
      state.tasksById[task.id] = task;
      
      // Add to thread's task list
      if (!state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = [];
      }
      if (!state.tasksByThread[threadId].includes(task.id)) {
        state.tasksByThread[threadId].push(task.id);
      }
      
      // Mark as initialized
      state.initialized[threadId] = true;
      
      // Add to plan's task list if task belongs to a plan
      if (task.plan_id && state.taskIdsByPlan[task.plan_id]) {
        if (!state.taskIdsByPlan[task.plan_id].includes(task.id)) {
          state.taskIdsByPlan[task.plan_id].push(task.id);
        }
      }
    },

    updateTask(
      state,
      action: PayloadAction<{ threadId: string; taskId: string; updates: Partial<ApiTask> }>
    ) {
      const { threadId, taskId, updates } = action.payload;
      
      const existingTask = state.tasksById[taskId];
      
      if (existingTask) {
        // Update existing task
        const mappedUpdates = mapApiTaskToInternal({ ...existingTask, ...updates });
        state.tasksById[taskId] = mappedUpdates;
      } else {
        // Create new task if it doesn't exist
        const newTask = mapApiTaskToInternal({ id: taskId, ...updates });
        state.tasksById[taskId] = newTask;
        
        // Add to thread's task list
        if (!state.tasksByThread[threadId]) {
          state.tasksByThread[threadId] = [];
        }
        if (!state.tasksByThread[threadId].includes(taskId)) {
          state.tasksByThread[threadId].push(taskId);
        }
        
        state.initialized[threadId] = true;
        
        // Add to plan if applicable
        if (newTask.plan_id && state.taskIdsByPlan[newTask.plan_id]) {
          if (!state.taskIdsByPlan[newTask.plan_id].includes(taskId)) {
            state.taskIdsByPlan[newTask.plan_id].push(taskId);
          }
        }
      }
    },

    removeTask(state, action: PayloadAction<{ threadId: string; taskId: string }>) {
      const { threadId, taskId } = action.payload;
      
      // Remove from normalized tasks
      delete state.tasksById[taskId];
      
      // Remove from thread
      if (state.tasksByThread[threadId]) {
        state.tasksByThread[threadId] = state.tasksByThread[threadId].filter(
          (id) => id !== taskId
        );
      }
      
      // Remove from all plans
      Object.keys(state.taskIdsByPlan).forEach((planId) => {
        state.taskIdsByPlan[planId] = state.taskIdsByPlan[planId].filter(
          (id) => id !== taskId
        );
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
        // Remove tasks for this thread
        const taskIds = state.tasksByThread[threadId] || [];
        taskIds.forEach((taskId) => {
          delete state.tasksById[taskId];
        });
        
        delete state.tasksByThread[threadId];
        delete state.planIdByThread[threadId];
        delete state.loading[threadId];
        delete state.errors[threadId];
        delete state.initialized[threadId];
        delete state.expandedState[threadId];
        delete state.threadExpandedState[threadId];
      } else {
        // Clear all tasks
        state.tasksById = {};
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
      const event: {
        planId: string;
        threadId?: string;
        timestamp: number;
      } = {
        planId,
        timestamp: Date.now(),
      };
      if (threadId !== undefined) {
        event.threadId = threadId;
      }
      state.completedPlanEvent = event;
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

