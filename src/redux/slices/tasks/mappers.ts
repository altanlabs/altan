import type { Task, Plan, TaskStatus, PlanStatus } from '@/services/types';

/**
 * API response types for tasks and plans
 * These represent the shape of data coming from the API
 */
export interface ApiTask {
  id: string;
  task_name?: string;
  title?: string;
  task_description?: string;
  description?: string;
  status?: string;
  plan_id?: string;
  mainthread_id?: string;
  subthread_id?: string;
  thread_id?: string;
  priority?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
  finished_at?: string;
}

export interface ApiPlan {
  id: string;
  title: string;
  description?: string;
  status: string;
  is_approved?: boolean;
  estimated_minutes?: number;
  room_id: string;
  tasks?: ApiTask[];
  created_at?: string;
  updated_at?: string;
  finished_at?: string;
}

/**
 * Validates and normalizes task status
 */
const normalizeTaskStatus = (status: string | undefined): TaskStatus => {
  const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
  return validStatuses.includes(status as TaskStatus) ? (status as TaskStatus) : 'pending';
};

/**
 * Validates and normalizes plan status
 */
const normalizePlanStatus = (status: string): PlanStatus => {
  const validStatuses: PlanStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];
  return validStatuses.includes(status as PlanStatus) ? (status as PlanStatus) : 'pending';
};

/**
 * Maps API task response to internal Task type
 * API returns different field names than our internal Task type expects
 */
export const mapApiTaskToInternal = (apiTask: ApiTask): Task => {
  const now = new Date().toISOString();
  const description = apiTask.task_description || apiTask.description;
  const threadId = apiTask.subthread_id || apiTask.thread_id;
  
  const task: Task = {
    id: apiTask.id,
    title: apiTask.task_name || apiTask.title || '',
    status: normalizeTaskStatus(apiTask.status),
    created_at: apiTask.created_at || now,
    updated_at: apiTask.updated_at || now,
  };
  
  // Only add optional properties if they have values
  if (description !== undefined) task.description = description;
  if (apiTask.plan_id !== undefined) task.plan_id = apiTask.plan_id;
  if (apiTask.mainthread_id !== undefined) task.mainthread_id = apiTask.mainthread_id;
  if (threadId !== undefined) task.thread_id = threadId;
  
  const order = apiTask.priority ?? apiTask.order;
  if (order !== undefined) task.order = order;
  
  if (apiTask.finished_at !== undefined) task.finished_at = apiTask.finished_at;
  
  return task;
};

/**
 * Maps API plan response to internal Plan type with normalized tasks
 */
export const mapApiPlanToInternal = (apiPlan: ApiPlan): Plan => {
  const now = new Date().toISOString();
  const tasks = Array.isArray(apiPlan.tasks)
    ? apiPlan.tasks.map(mapApiTaskToInternal)
    : [];

  const plan: Plan = {
    id: apiPlan.id,
    title: apiPlan.title,
    status: normalizePlanStatus(apiPlan.status),
    is_approved: apiPlan.is_approved ?? false,
    room_id: apiPlan.room_id,
    tasks,
    created_at: apiPlan.created_at || now,
    updated_at: apiPlan.updated_at || now,
  };
  
  // Only add optional properties if they have values
  if (apiPlan.description !== undefined) plan.description = apiPlan.description;
  if (apiPlan.estimated_minutes !== undefined) plan.estimated_minutes = apiPlan.estimated_minutes;
  if (apiPlan.finished_at !== undefined) plan.finished_at = apiPlan.finished_at;
  
  return plan;
};

