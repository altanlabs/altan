/**
 * Deployment Event Types
 */

export interface DeploymentEventData {
  id: string;
  interface_id?: string;
  deployment_id?: string;
  ids?: string[];
  status?: string;
  url?: string;
  commit_sha?: string;
  meta_data?: unknown;
  interface_name?: string;
  date_creation?: string;
  [key: string]: unknown;
}

export interface WebSocketDeploymentEvent {
  type: string;
  data: DeploymentEventData;
}

export interface ExtractedDeploymentEvent {
  eventData: DeploymentEventData;
  eventType: string;
}

export type DeploymentEventHandler = (eventData: DeploymentEventData) => void;

export interface DeploymentOperationsRegistry {
  [key: string]: DeploymentEventHandler;
}

