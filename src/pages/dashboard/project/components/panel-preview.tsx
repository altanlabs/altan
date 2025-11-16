/**
 * Preview Panel Component
 * Single Responsibility: Renders preview content based on route state
 */

import React from 'react';
import { Panel } from 'react-resizable-panels';

// @ts-expect-error - JSX components without type definitions
import OperateView from '../../OperateView';
// @ts-expect-error - JSX components without type definitions
import Plan from '../../Plan';
// @ts-expect-error - JSX components without type definitions
import PlansList from '../../PlansList';
import type { PreviewPanelProps } from '../types';
import { ComponentRenderer } from '../utils/ComponentRenderer';
import { getPreviewPanelConfig, getRoomId } from '../utils/panel-config';

export function PreviewPanel({
  panelRef,
  shouldCollapse,
  isPlansRoute,
  planId,
  altanerId,
  altaner,
  operateMode,
  currentComponent,
  componentConfig,
  activeComponentId,
  componentId,
  itemId,
  chatIframeRef,
}: PreviewPanelProps): React.ReactElement {
  const panelConfig = getPreviewPanelConfig(shouldCollapse);
  const roomId = getRoomId(altaner);

  return (
    <Panel
      ref={panelRef}
      id="preview-panel"
      order={2}
      defaultSize={panelConfig.defaultSize}
      minSize={panelConfig.minSize}
      collapsible={true}
      collapsedSize={0}
      className="overflow-auto min-w-0"
    >
      <div
        className="h-full relative bg-transparent"
        data-tour={`component-preview-${currentComponent?.type || 'default'}`}
      >
        <PreviewContent
          isPlansRoute={isPlansRoute}
          planId={planId}
          altanerId={altanerId}
          roomId={roomId}
          operateMode={operateMode}
          altaner={altaner}
          shouldCollapse={shouldCollapse}
          currentComponent={currentComponent}
          componentConfig={componentConfig}
          activeComponentId={activeComponentId}
          componentId={componentId}
          itemId={itemId}
          chatIframeRef={chatIframeRef}
        />
      </div>
    </Panel>
  );
}

/**
 * Preview Content Component
 * Single Responsibility: Determine and render appropriate preview content
 * Follows Open/Closed Principle - extensible content types
 */
interface PreviewContentProps {
  isPlansRoute: boolean;
  planId: string | undefined;
  altanerId: string;
  roomId: string;
  operateMode: boolean;
  altaner: PreviewPanelProps['altaner'];
  shouldCollapse: boolean;
  currentComponent: PreviewPanelProps['currentComponent'];
  componentConfig: PreviewPanelProps['componentConfig'];
  activeComponentId: PreviewPanelProps['activeComponentId'];
  componentId: PreviewPanelProps['componentId'];
  itemId: PreviewPanelProps['itemId'];
  chatIframeRef: PreviewPanelProps['chatIframeRef'];
}

function PreviewContent({
  isPlansRoute,
  planId,
  altanerId,
  roomId,
  operateMode,
  altaner,
  shouldCollapse,
  currentComponent,
  componentConfig,
  activeComponentId,
  componentId,
  itemId,
  chatIframeRef,
}: PreviewContentProps): React.ReactElement | null {
  // Plans route - show plan or plans list
  if (isPlansRoute) {
    return planId ? (
      <Plan planId={planId} altanerId={altanerId} />
    ) : (
      <PlansList roomId={roomId} />
    );
  }

  // Operate mode - show operate view
  if (operateMode) {
    return <OperateView altaner={altaner} />;
  }

  // Component preview - show component renderer
  if (!shouldCollapse && currentComponent) {
    return (
      <ComponentRenderer
        config={componentConfig}
        currentComponent={currentComponent}
        altanerId={altanerId}
        activeComponentId={activeComponentId}
        componentId={componentId}
        itemId={itemId}
        chatIframeRef={chatIframeRef}
      />
    );
  }

  // No content to display
  return null;
}

