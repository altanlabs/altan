/**
 * Task Operations
 * Contains all task and plan event handlers
 */

import { addTask, updateTask, removeTask, setPlanCompleted } from '../../../../redux/slices/tasks';
import { dispatch } from '../../../../redux/store';

const SOUND_IN = new Audio(
  'https://platform-api.altan.ai/media/ba09b912-2681-489d-bfcf-91cc2f67aef2',
);

interface TaskEventData {
  task_id: string;
  mainthread_id: string;
  room_id: string;
  task_name?: string;
  task_description?: string;
  status: string;
  priority?: number;
  assigned_agent?: string;
  assigned_agent_name?: string;
  subthread_id?: string;
  dependencies?: string[];
  summary?: string;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
  updated_at?: string;
  plan_id?: string | null;
  all_tasks_completed?: boolean;
}

/**
 * Handle task.created event
 * Maps API field names to internal Task structure
 */
export const handleTaskCreated = (eventData: TaskEventData): void => {
  dispatch(
    addTask({
      threadId: eventData.mainthread_id,
      task: {
        id: eventData.task_id,
        // Map API field names to Task interface
        title: eventData.task_name || '',
        description: eventData.task_description,
        status: eventData.status,
        order: eventData.priority,
        thread_id: eventData.subthread_id,
        mainthread_id: eventData.mainthread_id,
        plan_id: eventData.plan_id || undefined,
        created_at: eventData.created_at || new Date().toISOString(),
        updated_at: eventData.updated_at || new Date().toISOString(),
        finished_at: eventData.finished_at,
        // Additional fields (not in base Task type but useful to preserve)
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
      },
    }),
  );
};

/**
 * Handle task.updated event
 * Only includes fields that changed
 */
export const handleTaskUpdated = (eventData: TaskEventData): void => {
  dispatch(
    updateTask({
      threadId: eventData.mainthread_id || eventData.room_id,
      taskId: eventData.task_id,
      updates: {
        id: eventData.task_id,
        // Map API field names to Task interface
        title: eventData.task_name,
        description: eventData.task_description,
        status: eventData.status,
        order: eventData.priority,
        thread_id: eventData.subthread_id,
        updated_at: eventData.updated_at || new Date().toISOString(),
        finished_at: eventData.finished_at,
        // Additional fields
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
      },
    }),
  );
};

/**
 * Handle task.deleted event
 */
export const handleTaskDeleted = (eventData: TaskEventData): void => {
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
export const handleTaskCompleted = (eventData: TaskEventData): void => {
  dispatch(
    updateTask({
      threadId: eventData.mainthread_id || eventData.room_id,
      taskId: eventData.task_id,
      updates: {
        status: 'completed',
        // Map API field names to Task interface
        title: eventData.task_name,
        description: eventData.task_description,
        order: eventData.priority,
        thread_id: eventData.subthread_id,
        finished_at: eventData.finished_at || new Date().toISOString(),
        updated_at: eventData.updated_at || new Date().toISOString(),
        // Additional fields
        assigned_agent: eventData.assigned_agent,
        assigned_agent_name: eventData.assigned_agent_name,
        dependencies: eventData.dependencies,
        summary: eventData.summary,
      },
    }),
  );

  // Check if all tasks are completed
  if (eventData.all_tasks_completed) {
    // eslint-disable-next-line no-console
    console.log('🎉 All tasks completed! Plan finished:', {
      plan_id: eventData.plan_id,
      mainthread_id: eventData.mainthread_id,
      room_id: eventData.room_id,
    });

    // Play completion sound
    void SOUND_IN.play().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to play completion sound:', error);
    });

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
export const TASK_OPERATIONS: Record<string, (eventData: TaskEventData) => void> = {
  'task.created': handleTaskCreated,
  'task.updated': handleTaskUpdated,
  'task.deleted': handleTaskDeleted,
  'task.completed': handleTaskCompleted,
};
