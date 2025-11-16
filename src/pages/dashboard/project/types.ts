/**
 * Type definitions for ProjectPage
 * Following interface segregation principle - focused, specific types
 */

import { RefObject } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

// Re-export types from services for consistency
export type { Altaner, AltanerComponent } from '../../../services/types';

export interface ComponentTypeMap {
  interface: 'interface';
  base: 'base';
  cloud: 'cloud';
  flows: 'flows';
  agents: 'agents';
}

export interface TypeSpecificProps {
  cloud_id?: string;
  altanerComponentType?: string;
  ids?: string[];
  filterIds?: string[];
  altanerPreviewUrl?: string | null;
  altanerLiveUrl?: string | null;
}

export interface AltanerComponentProps extends TypeSpecificProps {
  altanerComponentId: string;
  operateMode?: boolean;
  [key: string]: unknown;
}

export interface RouteParams {
  altanerId: string;
  componentId?: string;
  itemId?: string;
  planId?: string;
}

export interface PanelRefs {
  chat: RefObject<ImperativePanelHandle | null>;
  preview: RefObject<ImperativePanelHandle | null>;
}

export interface MobileViewState {
  activeView: 'chat' | 'preview';
}

export type ViewType = 'preview' | 'chat' | 'both';
export type DisplayMode = 'preview' | 'both' | 'chat';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProjectPageProps {
  // Reserved for future props if needed
}

export interface ComponentRenderConfig {
  acType: string | null;
  acProps: AltanerComponentProps | null;
}
