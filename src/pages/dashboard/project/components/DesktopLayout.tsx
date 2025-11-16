/**
 * Desktop layout component with resizable panels
 * Single Responsibility: Desktop split-panel layout
 * Theme-aware with transparent backgrounds and minimal padding
 */

import React, { RefObject } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import RoomContainer from '../../../../components/new-room/RoomContainer';
// @ts-expect-error - JSX components without type definitions
import OperateView from '../../OperateView';
// @ts-expect-error - JSX components without type definitions
import Plan from '../../Plan';
// @ts-expect-error - JSX components without type definitions
import PlansList from '../../PlansList';
import type {
  Altaner,
  AltanerComponent,
  DisplayMode,
  ComponentRenderConfig,
  PanelRefs,
} from '../types';
import { ComponentRenderer } from '../utils/ComponentRenderer';

interface DesktopLayoutProps {
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

export function DesktopLayout({
  altaner,
  panelRefs,
  shouldCollapsePreview,
  displayMode,
  operateMode,
  isOperateRoute,
  isPlansRoute,
  planId,
  altanerId,
  componentId,
  itemId,
  activeComponentId,
  currentComponent,
  componentConfig,
  chatIframeRef,
}: DesktopLayoutProps): React.ReactElement {
  return (
    <div className="flex h-full w-full">
      <main className="flex-1 flex h-full w-full">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Chat Panel */}
          <Panel
            ref={panelRefs.chat}
            id="chat-panel"
            order={1}
            defaultSize={shouldCollapsePreview ? 100 : 30}
            minSize={shouldCollapsePreview ? 100 : 20}
            maxSize={shouldCollapsePreview ? 100 : 65}
            collapsible={true}
            collapsedSize={0}
            className="overflow-hidden"
          >
            <div className="h-full relative rounded-none overflow-hidden bg-transparent border-r border-neutral-200 dark:border-neutral-800">
              <RoomContainer
                key={`room-${(altaner as { room_id?: string }).room_id}`}
                roomId={(altaner as { room_id?: string }).room_id as string}
                mode={isOperateRoute ? 'ephemeral' : 'tabs'}
                showSettings={!isOperateRoute}
                showConversationHistory={true}
                showMembers={true}
                renderCredits={true}
                renderFeedback={true}
              />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle
            className={`relative w-px group ${
              displayMode === 'both' && !shouldCollapsePreview && !operateMode
                ? 'cursor-ew-resize'
                : 'pointer-events-none opacity-0'
            }`}
          >
            {displayMode === 'both' && !shouldCollapsePreview && !operateMode && (
              <>
                <div className="absolute inset-y-0 left-0 right-0 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-100 transition-colors duration-150" />
                <div className="absolute inset-y-[20%] left-0 right-0 bg-transparent group-hover:shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_4px_rgba(255,255,255,0.1)] transition-shadow duration-150" />
              </>
            )}
          </PanelResizeHandle>

          {/* Preview Panel */}
          <Panel
            ref={panelRefs.preview}
            id="preview-panel"
            order={2}
            defaultSize={shouldCollapsePreview ? 0 : 70}
            minSize={shouldCollapsePreview ? 0 : 35}
            collapsible={true}
            collapsedSize={0}
            className="overflow-auto min-w-0"
          >
            <div
              className="h-full relative bg-transparent"
              data-tour={`component-preview-${currentComponent?.type || 'default'}`}
            >
              {isPlansRoute ? (
                planId ? (
                  <Plan planId={planId} altanerId={altanerId} />
                ) : (
                  <PlansList roomId={(altaner as { room_id?: string }).room_id as string} />
                )
              ) : operateMode ? (
                <OperateView altaner={altaner} />
              ) : (
                !shouldCollapsePreview &&
                currentComponent && (
                  <ComponentRenderer
                    config={componentConfig}
                    currentComponent={currentComponent}
                    altanerId={altanerId}
                    activeComponentId={activeComponentId}
                    componentId={componentId}
                    itemId={itemId}
                    chatIframeRef={chatIframeRef}
                  />
                )
              )}
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
