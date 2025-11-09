/**
 * Task Operations
 * Contains all task and plan event handlers
 */

import { addTask, updateTask, removeTask, setPlanCompleted } from '../../../../redux/slices/tasks';
import { dispatch } from '../../../../redux/store';

const SOUND_IN = new Audio(
  'https://platform-api.altan.ai/media/ba09b912-2681-489d-bfcf-91cc2f67aef2',
);

/**
 * Handle task.created event
 */
export const handleTaskCreated = (eventData) => {
  dispatch(
    addTask({
      threadId: eventData.mainthread_id,
      task: {
        id: eventData.task_id,
        mainthread_id: eventData.mainthread_id,
        room_id: eventData.room_id,
        task_name: eventData.task_name,
        task_description: eventData.task_description,
        status: eventData.status,
        priority: eventData.priority,
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        subthread_id: eventData.subthread_id,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
        created_at: eventData.created_at,
        started_at: eventData.started_at,
        finished_at: eventData.finished_at,
        updated_at: eventData.updated_at,
        plan_id: eventData?.plan_id || null,
      },
    }),
  );
};

/**
 * Handle task.updated event
 */
export const handleTaskUpdated = (eventData) => {
  dispatch(
    updateTask({
      threadId: eventData.mainthread_id || eventData.room_id,
      taskId: eventData.task_id,
      updates: {
        id: eventData.task_id,
        status: eventData.status,
        task_name: eventData.task_name,
        task_description: eventData.task_description,
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        subthread_id: eventData.subthread_id,
        priority: eventData.priority,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
        created_at: eventData.created_at,
        started_at: eventData.started_at,
        finished_at: eventData.finished_at,
        updated_at: eventData.updated_at,
      },
    }),
  );
};

/**
 * Handle task.deleted event
 */
export const handleTaskDeleted = (eventData) => {
  dispatch(
    removeTask({
      threadId: eventData.mainthread_id || eventData.room_id,
      taskId: eventData.task_id,
    }),
  );
};

/**
 * Handle task.completed event
 */
export const handleTaskCompleted = (eventData) => {
  dispatch(
    updateTask({
      threadId: eventData.mainthread_id || eventData.room_id,
      taskId: eventData.task_id,
      updates: {
        status: 'completed',
        task_name: eventData.task_name,
        task_description: eventData.task_description,
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        subthread_id: eventData.subthread_id,
        priority: eventData.priority,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
        created_at: eventData.created_at,
        started_at: eventData.started_at,
        finished_at: eventData.finished_at,
        updated_at: eventData.updated_at || new Date().toISOString(),
      },
    }),
  );

  // Check if all tasks are completed
  if (eventData.all_tasks_completed) {
    console.log('🎉 All tasks completed! Plan finished:', {
      plan_id: eventData.plan_id,
      mainthread_id: eventData.mainthread_id,
      room_id: eventData.room_id,
    });

    // Play completion sound
    try {
      SOUND_IN.play();
    } catch (error) {
      console.error('Failed to play completion sound:', error);
    }

    // Dispatch plan completed event - use plan_id if available, otherwise mainthread_id
    dispatch(
      setPlanCompleted({
        planId: eventData.plan_id || eventData.mainthread_id,
        threadId: eventData.mainthread_id,
      }),
    );
  }
};

/**
 * Operation registry - maps event types to handlers
 */
export const TASK_OPERATIONS = {
  'task.created': handleTaskCreated,
  'task.updated': handleTaskUpdated,
  'task.deleted': handleTaskDeleted,
  'task.completed': handleTaskCompleted,
};
