/**
 * Altaner Component Event Types
 */

export interface AltanerComponentEventData {
  type: string;
  data: unknown;
}

export interface ExtractedAltanerComponentEvent {
  eventData: unknown;
  eventType: string;
}

export interface AltanerComponentData {
  id?: string;
  ids?: string[];
  altaner_id: string;
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

export type AltanerComponentEventHandler = (eventData: unknown) => void;

export interface AltanerComponentOperationsRegistry {
  [key: string]: AltanerComponentEventHandler;
}

