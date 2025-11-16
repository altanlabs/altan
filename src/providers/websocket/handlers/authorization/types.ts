/**
 * Authorization Request Event Types
 */

export interface AuthorizationRequest {
  id: string;
  is_completed?: boolean;
  [key: string]: unknown;
}

export interface AuthorizationRequestEventData {
  type: string;
  data: unknown;
}

export interface ExtractedAuthorizationRequestEvent {
  eventData: unknown;
  eventType: string;
}

export interface AuthorizationRequestUpdateData {
  id?: string;
  ids?: string[];
  changes?: Partial<AuthorizationRequest>;
  [key: string]: unknown;
}

export type AuthorizationRequestEventHandler = (eventData: unknown) => void;

export interface AuthorizationOperationsRegistry {
  [key: string]: AuthorizationRequestEventHandler;
}

