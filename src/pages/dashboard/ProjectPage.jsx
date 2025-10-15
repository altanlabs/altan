import { Box } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useParams, useHistory } from 'react-router-dom';

import Base from '../../components/databases/base/Base.jsx';
import FloatingTextArea from '../../components/FloatingTextArea.jsx';
import Room from '../../components/room/Room.jsx';
import useResponsive from '../../hooks/useResponsive';
import { CompactLayout } from '../../layouts/dashboard';
import {
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  selectDisplayMode,
  getAltanerById,
  clearCurrentAltaner,
  loadDisplayModeForProject,
} from '../../redux/slices/altaners';
import { selectMainThread } from '../../redux/slices/room';
import { useSelector, dispatch } from '../../redux/store';
import AltanerComponent from './altaners/components/AltanerComponent.jsx';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
import ProjectOnboardingTour from '../../components/onboarding/ProjectOnboardingTour.jsx';

const COMPONENTS_PROPS_MAP = {
  agents: { ids: 'filterIds' },
  flows: { ids: 'filterIds' },
  forms: { ids: 'filterIds' },
};

const transformProps = (type, props) => {
  const transformedProps = {};
  const tranformations = COMPONENTS_PROPS_MAP[type];
  if (!tranformations) return props;

  for (const [key, prop] of Object.entries(props)) {
    transformedProps[key in tranformations ? tranformations[key] : key] = prop;
  }
  return transformedProps;
};

const selectAltanersIsLoading = (state) => state.altaners.isLoading;

export default function ProjectPage() {
  // console.log('ProjectPage re-render');
  const chatIframeRef = React.useRef(null);
  const mobileContainerRef = React.useRef(null);
  const chatPanelRef = React.useRef(null);
  const history = useHistory();
  const { altanerId, componentId, itemId } = useParams();
  const isLoading = useSelector(selectAltanersIsLoading);
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const displayMode = useSelector(selectDisplayMode);
  const mainThreadId = useSelector(selectMainThread);
  const isMobile = useResponsive('down', 'md');
  const [mobileActiveView, setMobileActiveView] = React.useState('chat');

  // Programmatically collapse/expand chat panel based on display mode
  React.useEffect(() => {
    if (chatPanelRef.current) {
      if (displayMode === 'preview') {
        chatPanelRef.current.collapse();
      } else {
        chatPanelRef.current.expand();
      }
    }
  }, [displayMode]);

  const handleMobileToggle = React.useCallback((view) => {
    setMobileActiveView(view);
  }, []);

  // Handle item selection for flows/agents
  const handleItemSelect = React.useCallback((selectedItemId) => {
    history.push(`/project/${altanerId}/c/${componentId}/i/${selectedItemId}`);
  }, [history, altanerId, componentId]);

  // Check if we're in fullscreen mobile mode
  const isFullscreenMobile = isMobile && mobileActiveView === 'preview';
  // Get active component from URL path param
  const activeComponentId = componentId || null;
  // Fetch the altaner on component mount
  useEffect(() => {
    if (altanerId) {
      dispatch(getAltanerById(altanerId));
    }
    return () => {
      dispatch(clearCurrentAltaner());
    };
  }, [altanerId]);

  // Load display mode preference for this project
  useEffect(() => {
    if (altanerId) {
      dispatch(loadDisplayModeForProject(altanerId));
    }
  }, [altanerId]);

  // Get the current component based on the active ID
  const currentComponent = useMemo(() => {
    if (!activeComponentId || !sortedComponents) return null;
    const component = sortedComponents[activeComponentId];
    // Current component type for rendering logic
    return component;
  }, [activeComponentId, sortedComponents]);

  // Set the first component as active when components are loaded
  useEffect(() => {
    if (sortedComponents && Object.keys(sortedComponents).length > 0 && !activeComponentId) {
      // Set first component as default if no component is selected
      const firstComponentId = Object.keys(sortedComponents)[0];

      // Navigate to the URL with the component ID in the path, preserving query params
      const currentSearch = window.location.search;
      history.push(`/project/${altanerId}/c/${firstComponentId}${currentSearch}`);
    }
  }, [sortedComponents, activeComponentId, altanerId, history]);

  // Note: Removed automatic display mode switching to preserve user's chat sidebar preference

  const { acType, acProps } = useMemo(() => {
    if (!altaner || !currentComponent) return {};

    // Map component types to the expected types in AltanerComponent
    const componentTypeMap = {
      interface: 'interface',
      base: 'base',
      flows: 'flows',
      agents: 'agents',
    };

    const type = componentTypeMap[currentComponent.type] || currentComponent.type;

    // Handle special props for specific component types
    const typeSpecificProps = {};

    // For base component, ensure we're passing the base IDs correctly
    if (type === 'base' && currentComponent.params?.ids) {
      typeSpecificProps.ids = currentComponent.params.ids;
      typeSpecificProps.altanerComponentType = type;
      typeSpecificProps.filterIds = currentComponent.params.ids; // Some components expect filterIds
    }

    return {
      acType: type,
      acProps: {
        ...transformProps(type, currentComponent.params || {}),
        ...typeSpecificProps,
        altanerComponentId: currentComponent.id,
      },
    };
  }, [altaner, currentComponent]);

  const renderComponent = () => {
    if (!acType) return null;

    // Get the item ID from URL path params if available

    if (acType === 'base' && currentComponent?.params?.ids?.[0]) {
      // Handle navigation between base, table, and view
      const handleBaseNavigation = (altanerComponentId, params) => {
        const { baseId, tableId, viewId, recordId } = params;
        let path = `/project/${altanerId}/c/${componentId}`;

        if (baseId) {
          path += `/b/${baseId}`;
          if (tableId) {
            path += `/tables/${tableId}`;
            if (viewId) {
              path += `/views/${viewId}`;
              if (recordId) {
                path += `/records/${recordId}`;
              }
            }
          }
        }

        history.push(path);
      };

      return (
        <div
          className="w-full h-full min-w-0 max-w-full overflow-hidden flex flex-col relative"
          style={{
            width: '100% !important',
            height: '100% !important',
            minWidth: '0 !important',
            maxWidth: '100% !important',
            overflow: 'hidden !important',
            display: 'flex !important',
            flexDirection: 'column !important',
            position: 'relative !important',
            contain: 'layout style size',
            boxSizing: 'border-box',
          }}
        >
          <Base
            ids={currentComponent.params.ids}
            onNavigate={handleBaseNavigation}
            altanerComponentId={currentComponent.id}
            hideChat={displayMode === 'preview'}
          />
        </div>
      );
    }

    // Check if this is a component type that needs an item ID (flows, agents)
    const isFlowType = ['flows', 'flow', 'setup_flow'].includes(acType);
    const isAgentType = ['agents', 'agent'].includes(acType);
    const needsItemId = isFlowType || isAgentType;

    // For all other component types, render normally
    return (
      <AltanerComponent
        key={`${currentComponent?.id}_${acType}_${altanerId}_${activeComponentId}_${itemId || ''}`}
        altanerComponentType={acType}
        altanerComponentId={currentComponent?.id || acType}
        // Pass the item ID directly to the component if it needs an item ID and we have one
        {...(needsItemId && itemId ? { id: itemId } : {})}
        altanerProps={{
          altanerId: altanerId,
          altanerComponentId: currentComponent?.id,
        }}
        chatIframeRef={chatIframeRef}
        {...(acProps || {})}
      />
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mobile layout - single persistent Room to maintain state
  if (isMobile && altaner?.room_id) {
    const previewComponent = activeComponentId && currentComponent ? renderComponent() : null;

    // Always render mobile as portal with single Room instance
    const mobileContent = (
      <div 
        className="fixed inset-0 w-full h-full"
        style={{ 
          zIndex: isFullscreenMobile ? 9999 : 1000,
          position: 'fixed',
          width: '100vw',
          height: isFullscreenMobile ? '100dvh' : 'calc(100dvh - 64px)',
          overflow: 'hidden',
          top: isFullscreenMobile ? 0 : '64px',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          className="relative h-full w-full"
          ref={mobileContainerRef}
          style={{
            height: '100%',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Room
            key={`mobile-room-${altaner?.room_id}`}
            roomId={altaner?.room_id}
            header={false}
            previewComponent={previewComponent}
            isMobile={true}
            mobileActiveView={mobileActiveView}
            renderCredits={true}
            renderFeedback={true}
            settings={false}
            tabs={true}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              zIndex: 1000,
              transform: 'translate3d(0, 0, 0)',
              WebkitTransform: 'translate3d(0, 0, 0)',
              position: 'absolute',
              width: '100%',
            }}
          >
            <FloatingTextArea
              threadId={mainThreadId}
              roomId={altaner.room_id}
              mode="mobile"
              containerRef={mobileContainerRef}
              mobileActiveView={mobileActiveView}
              onMobileToggle={handleMobileToggle}
              renderCredits={true}
              activeComponent={currentComponent}
              allComponents={sortedComponents}
              isFullscreen={isFullscreenMobile}
              currentItemId={itemId}
              onItemSelect={handleItemSelect}
            />
          </div>
        </div>
      </div>
    );

    // Always render as portal to maintain consistent state
    return (
      <>
        {/* Empty placeholder for routing */}
        <div style={{ display: 'none' }} />
        
        {/* Single mobile portal - maintains Room state */}
        {createPortal(mobileContent, document.body)}
      </>
    );
  }

  return (
    <CompactLayout
      title={altaner?.name || 'Project'}
      noPadding
      drawerVisible={false}
    >
      {/* Onboarding Tour */}
      <ProjectOnboardingTour
        altanerId={altanerId}
        currentComponent={currentComponent}
        sortedComponents={sortedComponents}
      />

      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, display: 'flex', height: '100%' }}
        >
          {/* Always use PanelGroup layout to prevent re-renders when toggling display mode */}
          <PanelGroup
            direction="horizontal"
            className="w-full h-full"
          >
            {/* Chat Panel - collapses to 0 when in preview mode */}
            <Panel
              ref={chatPanelRef}
              id="chat-panel"
              order={1}
              defaultSize={30}
              minSize={20}
              maxSize={65}
              collapsible={true}
              defaultCollapsed={displayMode === 'preview'}
              collapsedSize={0}
              className="overflow-hidden"
            >
              {altaner?.room_id && (
                <Box
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Room
                    key={altaner?.room_id}
                    roomId={altaner?.room_id}
                    header={false}
                    renderCredits={true}
                    renderFeedback={true}
                    settings={false}
                    tabs={true}
                  />
                </Box>
              )}
            </Panel>

            {/* Resize Handle - only show in both mode */}
            {displayMode === 'both' && (
              <PanelResizeHandle className="relative w-0.5 group cursor-ew-resize">
                <div className="absolute inset-y-0 left-0 right-0 bg-transparent group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:via-purple-500 group-hover:to-transparent transition-all duration-300 group-active:via-purple-600" />
                <div className="absolute inset-y-[20%] left-0 right-0 bg-transparent group-hover:shadow-[0_0_6px_rgba(168,85,247,0.3)] transition-shadow duration-300" />
              </PanelResizeHandle>
            )}

            {/* Preview Panel */}
            <Panel
              id="preview-panel"
              order={2}
              defaultSize={60}
              minSize={35}
              className="overflow-auto min-w-0"
            >
              <Box 
                sx={{ height: '100%', position: 'relative' }}
                data-tour={`component-preview-${currentComponent?.type || 'default'}`}
              >
                {activeComponentId && currentComponent && renderComponent()}
              </Box>
            </Panel>
          </PanelGroup>
        </Box>
      </Box>
    </CompactLayout>
  );
}
