/**
 * Type definitions for ProjectPage
 * Following interface segregation principle - focused, specific types
 */

import { RefObject } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';

import type { Altaner, AltanerComponent } from '../../../services/types';

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
  chat: RefObject<ImperativePanelHandle>;
  preview: RefObject<ImperativePanelHandle>;
}

export interface MobileViewState {
  activeView: 'chat' | 'preview';
}

export type ViewType = 'preview' | 'chat' | 'both';
export type DisplayMode = 'preview' | 'both' | 'chat';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
export interface ProjectPageProps {
  // Reserved for future props if needed
}

export interface ComponentRenderConfig {
  acType: string | null;
  acProps: AltanerComponentProps | null;
}

// Panel-specific types
export interface ChatPanelProps {
  roomId: string;
  isOperateRoute: boolean;
  panelRef: RefObject<ImperativePanelHandle>;
  shouldCollapse: boolean;
}

export interface PreviewPanelProps {
  panelRef: RefObject<ImperativePanelHandle>;
  shouldCollapse: boolean;
  isPlansRoute: boolean;
  planId: string | undefined;
  altanerId: string;
  altaner: Altaner;
  operateMode: boolean;
  currentComponent: AltanerComponent | null;
  componentConfig: ComponentRenderConfig;
  activeComponentId: string | null;
  componentId: string | undefined;
  itemId: string | undefined;
  chatIframeRef: RefObject<HTMLIFrameElement | null>;
}

export interface ResizeHandleProps {
  displayMode: DisplayMode;
  shouldCollapsePreview: boolean;
  operateMode: boolean;
}

export interface DesktopLayoutProps {
  altaner: Altaner;
  panelRefs: PanelRefs;
  shouldCollapsePreview: boolean;
  displayMode: DisplayMode;
  operateMode: boolean;
  isOperateRoute: boolean;
  isPlansRoute: boolean;
  planId: string | undefined;
  altanerId: string;
  componentId: string | undefined;
  itemId: string | undefined;
  activeComponentId: string | null;
  currentComponent: AltanerComponent | null;
  componentConfig: ComponentRenderConfig;
  chatIframeRef: RefObject<HTMLIFrameElement | null>;
}
