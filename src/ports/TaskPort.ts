/**
 * Task Port - Domain interface for task and plan operations
 * Defines all task/plan-related operations without implementation details
 */

export interface Plan {
  id: string;
  room_id: string;
  status: string;
  tasks?: Task[];
  [key: string]: unknown;
}

export interface Task {
  id: string;
  plan_id: string;
  status: string;
  title: string;
  [key: string]: unknown;
}

export interface FetchPlanOptions {
  include_tasks?: boolean;
  [key: string]: unknown;
}

export interface FetchPlansOptions {
  include_tasks?: boolean;
  order_by?: string;
  ascending?: boolean;
  [key: string]: unknown;
}

export interface PlansResponse {
  plans: Plan[];
  total?: number;
  [key: string]: unknown;
}

export interface TasksResponse {
  tasks: Task[];
  total?: number;
  [key: string]: unknown;
}

export interface TaskUpdates {
  status?: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * Abstract base class for task and plan operations
 */
export abstract class TaskPort {
  // ==================== Plan Operations ====================

  /**
   * Fetch plan by ID
   * @param planId - Plan ID
   * @param options - Fetch options
   * @returns Plan data with optional tasks
   */
  abstract fetchPlan(planId: string, options?: FetchPlanOptions): Promise<Plan>;

  /**
   * Fetch plans by room ID
   * @param roomId - Room ID
   * @param options - Fetch options
   * @returns Plans data
   */
  abstract fetchPlansByRoom(roomId: string, options?: FetchPlansOptions): Promise<PlansResponse>;

  /**
   * Approve a plan
   * @param planId - Plan ID
   */
  abstract approvePlan(planId: string): Promise<void>;

  // ==================== Task Operations ====================

  /**
   * Fetch tasks by thread ID
   * @param threadId - Thread ID (mainthread_id)
   * @returns Tasks data
   */
  abstract fetchTasksByThread(threadId: string): Promise<TasksResponse>;

  /**
   * Update a task
   * @param taskId - Task ID
   * @param updates - Task updates
   * @returns Updated task
   */
  abstract updateTask(taskId: string, updates: TaskUpdates): Promise<Task>;

  /**
   * Delete a task
   * @param taskId - Task ID
   */
  abstract deleteTask(taskId: string): Promise<void>;

  /**
   * Get the underlying axios instance (for backward compatibility)
   * @returns Axios instance
   */
  abstract getAxiosInstance(): unknown;
}

