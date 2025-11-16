/**
 * Task and Plan Type Definitions
 * Defines the core data structures for the task management system
 */

export enum TaskStatus {
  TODO = 'to-do',
  READY = 'ready',
  RUNNING = 'running',
  COMPLETED = 'completed',
  DONE = 'done',
  PENDING = 'pending',
}

export enum PlanStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subthread_id?: string;
  assigned_agent_name?: string;
  plan_id?: string;
}

export interface Plan {
  id: string;
  title: string;
  status: PlanStatus;
  is_approved: boolean;
}

export interface TaskUpdates {
  status?: TaskStatus;
  title?: string;
  assigned_agent_name?: string;
}

export type TaskFilterStatus = 'all' | 'running' | 'todo' | 'completed';

export interface TodoWidgetProps {
  threadId: string;
  mode?: 'standard' | 'mini';
}

export interface TaskItemProps {
  task: Task;
  onOpenSubthread: (task: Task) => void;
  onUpdateTask: (taskId: string, updates: TaskUpdates) => void;
  onDeleteTask: (taskId: string) => void;
}

export interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: TaskUpdates) => void;
  onDeleteTask: (taskId: string) => void;
}

