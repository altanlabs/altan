/**
 * Commit Event Types
 */

export interface CommitEventData {
  id: string;
  interface_id: string;
  ids?: string[];
  changes?: {
    interface_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface WebSocketCommitEvent {
  type: string;
  data: CommitEventData;
}

export interface ExtractedCommitEvent {
  eventData: CommitEventData;
  eventType: string;
}

export type CommitEventHandler = (eventData: CommitEventData) => void;

export interface CommitOperationsRegistry {
  [key: string]: CommitEventHandler;
}

