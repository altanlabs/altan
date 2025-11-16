/**
 * Task Service - Business logic layer for task and plan operations
 * Implements Single Responsibility Principle by handling task/plan-specific business logic
 */
import { getTaskPort } from '../di/index.ts';
import { BaseService } from './BaseService';
import type { ITaskPort, Task, Plan } from './types';

/**
 * Task Service - Handles all task and plan-related operations
 */
export class TaskService extends BaseService {
  private port: ITaskPort;

  constructor() {
    super();
    this.port = getTaskPort<ITaskPort>();
  }

  /**
   * Fetch a plan by ID with optional tasks
   * @param planId - Plan ID
   * @param includeTasks - Include tasks in response (default: true)
   * @returns Plan data
   */
  async fetchPlan(planId: string, includeTasks: boolean = true): Promise<Plan> {
    return this.execute(async () => {
      const response = await this.port.fetchPlan(planId, { include_tasks: includeTasks });
      const planData = response.data || response;
      
      return this.transformPlan(planData);
    }, 'Error fetching plan');
  }

  /**
   * Fetch all plans for a room
   * @param roomId - Room ID
   * @param includeTasks - Include tasks in response (default: true)
   * @param orderBy - Field to order by (default: 'created_at')
   * @param ascending - Sort order (default: false)
   * @returns Array of plans
   */
  async fetchPlansByRoom(
    roomId: string,
    includeTasks: boolean = true,
    orderBy: string = 'created_at',
    ascending: boolean = false
  ): Promise<Plan[]> {
    return this.execute(async () => {
      const response = await this.port.fetchPlansByRoom(roomId, {
        include_tasks: includeTasks,
        order_by: orderBy,
        ascending,
      });

      const plansData = response.data || response || [];
      const plans = Array.isArray(plansData) ? plansData : [plansData];

      return plans.map((plan) => this.transformPlan(plan));
    }, 'Error fetching plans by room');
  }

  /**
   * Approve a plan
   * @param planId - Plan ID
   */
  async approvePlan(planId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.approvePlan(planId);
    }, 'Error approving plan');
  }

  /**
   * Fetch standalone tasks (tasks without a plan_id) for a thread
   * @param threadId - Thread ID (mainthread_id)
   * @returns Array of standalone tasks
   */
  async fetchTasksByThread(threadId: string): Promise<Task[]> {
    return this.execute(async () => {
      const response = await this.port.fetchTasksByThread(threadId);
      
      const responseData = response.data || response || [];
      const tasks = Array.isArray(responseData) ? responseData : [responseData];

      // Filter to only include tasks without a plan_id (standalone tasks)
      return tasks.filter((task) => !task.plan_id);
    }, 'Error fetching tasks by thread');
  }

  /**
   * Update a task
   * @param taskId - Task ID
   * @param updates - Task updates
   * @returns Updated task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return this.execute(async () => {
      const response = await this.port.updateTask(taskId, updates);
      return response.data || response;
    }, 'Error updating task');
  }

  /**
   * Delete a task
   * @param taskId - Task ID
   */
  async deleteTask(taskId: string): Promise<void> {
    return this.execute(async () => {
      await this.port.deleteTask(taskId);
    }, 'Error deleting task');
  }

  /**
   * Transform plan data to ensure consistent structure
   * @param planData - Raw plan data from API
   * @returns Transformed plan
   */
  private transformPlan(planData: any): Plan {
    return {
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
  }
}

// Singleton instance
let taskServiceInstance: TaskService | null = null;

/**
 * Get or create TaskService instance
 * @returns TaskService instance
 */
export const getTaskService = (): TaskService => {
  if (!taskServiceInstance) {
    taskServiceInstance = new TaskService();
  }
  return taskServiceInstance;
};

