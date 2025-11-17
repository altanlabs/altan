import { Task as ServiceTask, Plan as ServicePlan } from '@/services/types';

// Extended task type that includes API-only fields not in normalized state
export interface ApiTask extends ServiceTask {
  task_name?: string;
  assigned_agent_name?: string;
  subthread_id?: string;
}

// Extended plan type
export interface Plan extends ServicePlan {
  tasks: ApiTask[];
}

export interface PlanWidgetProps {
  planId: string;
  onDiscard?: (planId: string) => void;
}

