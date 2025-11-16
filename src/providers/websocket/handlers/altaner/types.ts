/**
 * Altaner Event Types
 */

export interface AltanerEventData {
  type: string;
  data: unknown;
}

export interface ExtractedAltanerEvent {
  eventData: unknown;
  eventType: string;
}

export interface AltanerUpdateData {
  id?: string;
  ids?: string[];
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

export type AltanerEventHandler = (eventData: unknown) => void;

export interface AltanerOperationsRegistry {
  [key: string]: AltanerEventHandler;
}

