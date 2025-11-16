import { TaskPort } from '../../ports/TaskPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Task HTTP Adapter
 * Implements TaskPort using HTTP/REST API for CAGI service
 */
export class TaskHttpAdapter extends TaskPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      baseURL: 'https://cagi.altan.ai',
      version: '', // No version prefix for CAGI endpoints
      withCredentials: false,
      serviceName: 'cagi_task',
      ...config,
    });
  }

  // ==================== Plan Operations ====================

  async fetchPlan(planId, options = {}) {
    const { include_tasks = true } = options;
    let url = `/plans/${planId}`;
    const params = [];
    if (include_tasks) params.push('include_tasks=true');
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.adapter.getRaw(url);
  }

  async fetchPlansByRoom(roomId, options = {}) {
    const {
      include_tasks = true,
      order_by = 'created_at',
      ascending = false,
    } = options;

    const params = [`room_id=${roomId}`];
    if (include_tasks) params.push('include_tasks=true');
    if (order_by) params.push(`order_by=${order_by}`);
    if (ascending !== undefined) params.push(`ascending=${ascending}`);

    const url = `/plans/?${params.join('&')}`;
    return this.adapter.getRaw(url);
  }

  async approvePlan(planId) {
    return this.adapter.postRaw(`/plans/${planId}/approve`, {});
  }

  // ==================== Task Operations ====================

  async fetchTasksByThread(threadId) {
    return this.adapter.getRaw(`/tasks/?mainthread_id=${threadId}`);
  }

  async updateTask(taskId, updates) {
    return this.adapter.patchRaw(`/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId) {
    return this.adapter.deleteRaw(`/tasks/${taskId}`);
  }

  // ==================== Utility Methods ====================

  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

