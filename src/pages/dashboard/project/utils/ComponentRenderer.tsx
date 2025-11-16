/**
 * Component renderer utility
 * Single Responsibility: Component rendering logic
 */

import React, { RefObject } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// @ts-expect-error - JSX components without type definitions
import Cloud from '../../../../components/cloud/Cloud';
// @ts-expect-error - JSX components without type definitions
import LoadingFallback from '../../../../components/LoadingFallback';
// @ts-expect-error - JSX components without type definitions
import AltanerComponent from '../../altaners/components/AltanerComponent';
import type { AltanerComponent as AltanerComponentType, ComponentRenderConfig } from '../types';

interface ComponentRendererProps {
  config: ComponentRenderConfig;
  currentComponent: AltanerComponentType | null;
  altanerId: string;
  activeComponentId: string | null;
  componentId: string | undefined;
  itemId: string | undefined;
  chatIframeRef: RefObject<HTMLIFrameElement | null>;
}

export function ComponentRenderer({
  config,
  currentComponent,
  altanerId,
  activeComponentId,
  componentId,
  itemId,
  chatIframeRef,
}: ComponentRendererProps): React.ReactElement | null {
  const history = useHistory() as { replace: (path: string) => void };
  const location = useLocation() as { pathname: string };
  const { acType, acProps } = config;

  if (!acType || !currentComponent) return null;

  // Handle cloud/base components
  if (acType === 'cloud' || acType === 'base') {
    const params = currentComponent.params as { ids?: string[]; [key: string]: unknown };
    const instanceId = (currentComponent as { cloud_id?: string }).cloud_id || params?.ids?.[0];

    if (!instanceId) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-neutral-500 dark:text-neutral-400">
          No cloud ID found
        </div>
      );
    }

    // Navigate to cloud path if not already there
    const currentPath: string = location.pathname;
    if (!currentPath.includes(`/cloud/${instanceId}`)) {
      history.replace(`/project/${altanerId}/c/${componentId}/cloud/${instanceId}`);
      return <LoadingFallback />;
    }

    return (
      <div className="w-full h-full min-w-0 overflow-hidden flex flex-col">
        <Cloud />
      </div>
    );
  }

  // Determine if component needs item ID
  const isFlowType = ['flows', 'flow', 'setup_flow'].includes(acType);
  const isAgentType = ['agents', 'agent'].includes(acType);
  const needsItemId = isFlowType || isAgentType;

  // Build props without duplication
  const { altanerComponentId, ...restAcProps } = acProps || {};

  // Render standard component
  return (
    <AltanerComponent
      key={`${currentComponent.id}_${acType}_${altanerId}_${activeComponentId}_${itemId || ''}`}
      altanerComponentType={acType}
      altanerComponentId={currentComponent.id || acType}
      {...(needsItemId && itemId ? { id: itemId } : {})}
      altanerProps={{
        altanerId,
        altanerComponentId: currentComponent.id,
      }}
      chatIframeRef={chatIframeRef}
      {...restAcProps}
    />
  );
}
