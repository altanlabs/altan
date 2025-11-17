/**
 * Action Cockpit Types
 * Shared types for the unified action cockpit
 */

export type SectionType = 'authorization' | 'plans' | 'tasks' | 'questions';

export interface SectionInfo {
  type: SectionType;
  count: number;
  hasUrgent?: boolean;
}

export interface CockpitState {
  isExpanded: boolean;
  activeSections: SectionInfo[];
}

export interface ActionCockpitProps {
  threadId: string;
  roomId: string;
}

