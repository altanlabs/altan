/**
 * Connection Event Types
 */

export interface ConnectionEventData {
  id?: string;
  ids?: string[];
  changes?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface WebSocketConnectionEvent {
  type: string;
  data: ConnectionEventData;
}

export interface ExtractedConnectionEvent {
  eventData: ConnectionEventData;
  eventType: string;
}

export type ConnectionEventHandler = (eventData: ConnectionEventData) => void;

export interface ConnectionOperationsRegistry {
  [key: string]: ConnectionEventHandler;
}

