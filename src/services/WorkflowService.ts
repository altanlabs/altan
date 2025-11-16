/**
 * Workflow Service - Business logic layer for workflow execution operations
 */
import { BaseService } from './BaseService';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  [key: string]: any;
}

/**
 * Workflow Service - Handles all workflow execution operations
 * Note: This service currently doesn't have direct API calls
 * but provides a structure for future workflow operations
 */
export class WorkflowService extends BaseService {
  /**
   * Transform workflow execution data
   * @param execution - Raw execution data
   * @returns Transformed execution
   */
  transformExecution(execution: any): WorkflowExecution {
    return {
      id: execution.id,
      workflow_id: execution.workflow_id,
      status: execution.status,
      ...execution,
    };
  }
}

// Singleton instance
let workflowServiceInstance: WorkflowService | null = null;

/**
 * Get WorkflowService singleton instance
 * @returns WorkflowService instance
 */
export const getWorkflowService = (): WorkflowService => {
  if (!workflowServiceInstance) {
    workflowServiceInstance = new WorkflowService();
  }
  return workflowServiceInstance;
};

