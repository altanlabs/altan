/**
 * ProjectPage - Main project view with chat and preview panels
 * 
 * Architecture:
 * - SOLID principles: Single responsibility, dependency injection
 * - DRY: Extracted hooks for business logic, reusable components
 * - TypeScript: Full type safety
 * - Minimalistic B&W design: Transparent backgrounds, theme-aware
 */

import React, { useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { MobileLayout, DesktopLayout } from './components';
import {
  useRouteManagement,
  usePanelManagement,
  useInterfaceData,
  useInitialMessage,
  useComponentConfig,
  useProjectEffects,
} from './hooks';
import type { RouteParams } from './types';
// @ts-expect-error - JSX components without type definitions
import LoadingScreen from '../../../components/loading-screen/LoadingScreen';
// @ts-expect-error - JSX components without type definitions
import useResponsive from '../../../hooks/useResponsive';
// @ts-expect-error - JSX components without type definitions
import { CompactLayout } from '../../../layouts/dashboard';
import {
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  selectDisplayMode,
  selectViewType,
} from '../../../redux/slices/altaners';
import { selectMainThread } from '../../../redux/slices/room/selectors/threadSelectors';
import { useSelector } from '../../../redux/store';
import type { AltanerComponent } from '../../../services/types';
// @ts-expect-error - JSX components without type definitions
import useGetInterfaceServerStatus from '../interfaces/hooks/useGetInterfaceServerStatus';

/**
 * Main ProjectPage component
 * Orchestrates all hooks and delegates rendering to layout components
 */
export default function ProjectPage(): React.ReactElement {
  // Refs
  const chatIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Route params
  const params = useParams<RouteParams>();
  const { altanerId, componentId, itemId, planId } = params;

  // Redux selectors
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const displayMode = useSelector(selectDisplayMode);
  const viewType = useSelector(selectViewType);
  const mainThreadId = useSelector(selectMainThread);
  const accountId = useSelector((state: { general?: { account?: { id?: string } } }) => state.general?.account?.id);
  const workflowsInitialized = useSelector((state: { general?: { accountAssetsInitialized?: { workflows?: boolean } } }) => state.general?.accountAssetsInitialized?.workflows ?? false);
  const workflowsLoading = useSelector((state: { general?: { accountAssetsLoading?: { workflows?: boolean } } }) => state.general?.accountAssetsLoading?.workflows ?? false);

  // Responsive
  const isMobile = useResponsive('down', 'md');

  // Custom hooks for business logic
  const { isPlansRoute, isOperateRoute, operateMode, activeComponentId } = useRouteManagement(params);

  // Get current component
  const currentComponent = useMemo<AltanerComponent | null>(() => {
    if (operateMode || !activeComponentId || !sortedComponents) return null;
    return sortedComponents[activeComponentId] || null;
  }, [activeComponentId, sortedComponents, operateMode]);

  // Interface data management
  const { interfaceId, isInterfaceWithNoCommits } = useInterfaceData(
    currentComponent,
    operateMode,
    altaner ?? null,
  );

  // Determine if preview should collapse
  const shouldCollapsePreview = isInterfaceWithNoCommits && !isPlansRoute && !operateMode;

  // Panel management
  const panelRefs = usePanelManagement({
    displayMode,
    shouldCollapsePreview,
    altaner: altaner ?? null,
  });

  // Component configuration
  const componentConfig = useComponentConfig(altaner ?? null, currentComponent, operateMode);

  // Project lifecycle effects
  useProjectEffects({
    altanerId,
    altaner: altaner ?? null,
    currentComponent,
    sortedComponents,
    accountId,
    workflowsInitialized,
    workflowsLoading,
    isPlansRoute,
  });

  // Initial message handling
  useInitialMessage(altaner ?? null, mainThreadId);

  // Interface server status polling
  useGetInterfaceServerStatus(interfaceId, viewType === 'preview');

  // Mobile view state
  const [mobileActiveView] = React.useState<'chat' | 'preview'>('chat');
  const isFullscreenMobile = isMobile && mobileActiveView === 'preview';

  // Loading state
  if (!altaner || !(altaner as { room_id?: string }).room_id) {
    return <LoadingScreen />;
  }

  // Mobile layout
  if (isMobile && (altaner as { room_id?: string }).room_id) {
    return (
      <MobileLayout
        altaner={altaner}
        isOperateRoute={isOperateRoute}
        isFullscreenMobile={isFullscreenMobile}
      />
    );
  }

  // Desktop layout
  return (
    <CompactLayout
      title={altaner.name || 'Project'}
      noPadding
      drawerVisible={false}
      hideHeader={operateMode}
    >
      <DesktopLayout
        altaner={altaner}
        panelRefs={panelRefs}
        shouldCollapsePreview={shouldCollapsePreview}
        displayMode={displayMode}
        operateMode={operateMode}
        isOperateRoute={isOperateRoute}
        isPlansRoute={isPlansRoute}
        planId={planId}
        altanerId={altanerId}
        componentId={componentId}
        itemId={itemId}
        activeComponentId={activeComponentId}
        currentComponent={currentComponent}
        componentConfig={componentConfig}
        chatIframeRef={chatIframeRef}
      />
    </CompactLayout>
  );
}
