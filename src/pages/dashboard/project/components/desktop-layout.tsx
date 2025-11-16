/**
 * Desktop Layout Component
 * Single Responsibility: Orchestrate desktop split-panel layout
 * 
 * Refactored following SOLID principles:
 * - Single Responsibility: Each component has one job
 * - Open/Closed: Extensible through props without modification
 * - Liskov Substitution: Type-safe prop interfaces
 * - Interface Segregation: Focused, minimal prop interfaces
 * - Dependency Inversion: Depends on abstractions (types/interfaces)
 * 
 * Following DRY principles:
 * - No repeated logic or type casting
 * - Centralized utility functions
 * - Reusable sub-components
 */

import React from 'react';
import { PanelGroup } from 'react-resizable-panels';

import type { DesktopLayoutProps } from '../types';
import { ChatPanel } from './panel-chat';
import { PreviewPanel } from './panel-preview';
import { ResizeHandle } from './panel-resize-handle';
import { getRoomId } from '../utils/panel-config';

export function DesktopLayout(props: DesktopLayoutProps): React.ReactElement {
  const {
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
  } = props;

  const roomId = getRoomId(altaner);

  return (
    <div className="flex h-full w-full">
      <main className="flex-1 flex h-full w-full">
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Chat Panel */}
          <ChatPanel
            roomId={roomId}
            isOperateRoute={isOperateRoute}
            panelRef={panelRefs.chat}
            shouldCollapse={shouldCollapsePreview}
          />

          {/* Resize Handle */}
          <ResizeHandle
            displayMode={displayMode}
            shouldCollapsePreview={shouldCollapsePreview}
            operateMode={operateMode}
          />

          {/* Preview Panel */}
          <PreviewPanel
            panelRef={panelRefs.preview}
            shouldCollapse={shouldCollapsePreview}
            isPlansRoute={isPlansRoute}
            planId={planId}
            altanerId={altanerId}
            altaner={altaner}
            operateMode={operateMode}
            currentComponent={currentComponent}
            componentConfig={componentConfig}
            activeComponentId={activeComponentId}
            componentId={componentId}
            itemId={itemId}
            chatIframeRef={chatIframeRef}
          />
        </PanelGroup>
      </main>
    </div>
  );
}

