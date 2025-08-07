import { Box } from '@mui/material';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Base from '../../components/databases/base/Base.jsx';
import LoadingFallback from '../../components/LoadingFallback.jsx';
import Room from '../../components/room/Room.jsx';
import useResponsive from '../../hooks/useResponsive';
import { CompactLayout } from '../../layouts/dashboard';
import ProjectHeader from '../../layouts/dashboard/header/ProjectHeader.jsx';
import {
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  getAltanerById,
  clearCurrentAltaner,
} from '../../redux/slices/altaners';
import { useSelector, dispatch } from '../../redux/store';
import AltanerComponent from './altaners/components/AltanerComponent.jsx';

// Component type configurations
const COMPONENT_TYPES = {
  interface: {
    icon: '🎨',
    label: 'Interface',
    color: 'bg-blue-500',
  },
  base: {
    icon: '🗄️',
    label: 'Database',
    color: 'bg-green-500',
  },
  flows: {
    icon: '🔄',
    label: 'Flows',
    color: 'bg-purple-500',
  },
  agents: {
    icon: '🤖',
    label: 'Agents',
    color: 'bg-orange-500',
  },
  chat: {
    icon: '💬',
    label: 'Chat',
    color: 'bg-indigo-500',
  },
};

// Component Preview Wrapper - renders the actual component in preview mode
const ComponentPreviewWrapper = ({ componentId, component, renderComponent }) => {
  // Create a mock environment for the component to render in
  const mockProps = React.useMemo(() => {
    const baseProps = {
      preview: true,
      hideChat: true,
      compact: true,
    };

    // Add component-specific props
    if (component.type === 'base' && component.params?.ids) {
      return { ...baseProps, ids: component.params.ids };
    }

    return baseProps;
  }, [component]);

  try {
    // Try to render the component with preview props
    return (
      <div className="w-full h-full bg-white dark:bg-gray-900">
        {renderComponent(componentId, mockProps)}
      </div>
    );
  } catch {
    // Fallback if component fails to render
    const config = COMPONENT_TYPES[component.type] || {
      icon: '📦',
      label: component.type,
    };

    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">{config.icon}</div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            {component.name || config.label}
          </div>
        </div>
      </div>
    );
  }
};

// iOS-style App Switcher with Horizontal Stacked Cards
const IOSStyleAppSwitcher = ({
  components,
  activeComponentId,
  focusedComponentId,
  onComponentChange,
  isVisible,
  renderComponent,
}) => {
  if (!isVisible || !components || Object.keys(components).length === 0) {
    return null;
  }

  const componentList = Object.entries(components);
  const focusedIndex = componentList.findIndex(([id]) => id === focusedComponentId);

  return (
    <div className="fixed inset-0 z-60 bg-black dark:bg-black bg-white">
      {/* Header */}
      <div className="absolute top-0 right-0 pt-safe-top p-4 z-10">
        <button
          onClick={() => onComponentChange(null)}
          className="w-10 h-10 rounded-full bg-black/20 dark:bg-white/20 flex items-center justify-center hover:bg-black/30 dark:hover:bg-white/30 transition-colors"
        >
          <span className="text-black dark:text-white text-xl">×</span>
        </button>
      </div>

      {/* Horizontal Stacked Cards */}
      <div className="absolute inset-0 pt-16 pb-32">
        <div className="h-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg max-h-[70vh] mx-6">
            {componentList.map(([componentId, component], index) => {
              const config = COMPONENT_TYPES[component.type] || {
                icon: '📦',
                label: component.type,
                color: 'bg-gray-500',
              };

              const isActive = componentId === activeComponentId;
              const isFocused = componentId === focusedComponentId;
              const offset = index - focusedIndex;

              // Calculate position and scale based on offset from focused card
              const getCardStyle = (offset) => {
                if (offset === 0) {
                  // Focused card - center and full size
                  return {
                    transform: 'translateX(0%) scale(1)',
                    zIndex: 20,
                    opacity: 1,
                  };
                } else if (offset === 1) {
                  // Next card - slightly to the right
                  return {
                    transform: 'translateX(70%) scale(0.85)',
                    zIndex: 19,
                    opacity: 0.7,
                  };
                } else if (offset === -1) {
                  // Previous card - slightly to the left
                  return {
                    transform: 'translateX(-70%) scale(0.85)',
                    zIndex: 19,
                    opacity: 0.7,
                  };
                } else if (offset > 1) {
                  // Cards further to the right
                  return {
                    transform: `translateX(${70 + (offset - 1) * 15}%) scale(0.7)`,
                    zIndex: 18 - offset,
                    opacity: Math.max(0.2, 0.7 - (offset - 1) * 0.3),
                  };
                } else {
                  // Cards further to the left
                  return {
                    transform: `translateX(${-70 + (offset + 1) * 15}%) scale(0.7)`,
                    zIndex: 18 + offset,
                    opacity: Math.max(0.2, 0.7 - (-offset - 1) * 0.3),
                  };
                }
              };

              const cardStyle = getCardStyle(offset);

              return (
                <button
                  key={componentId}
                  onClick={() => onComponentChange(componentId)}
                  className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-2xl bg-white dark:bg-gray-900"
                  style={{
                    ...cardStyle,
                    aspectRatio: '3/4',
                  }}
                >
                  {/* Live Component Preview */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="w-full h-full origin-top-left pointer-events-none"
                      style={{
                        transform: 'scale(0.3)',
                        transformOrigin: 'top left',
                        width: '333%',
                        height: '333%',
                      }}
                    >
                      <ComponentPreviewWrapper
                        componentId={componentId}
                        component={component}
                        renderComponent={renderComponent}
                      />
                    </div>
                  </div>

                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Component name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{config.icon}</span>
                      <span className="text-white font-medium text-sm truncate">
                        {component.name || config.label}
                      </span>
                    </div>
                  </div>

                  {/* Indicators */}
                  {isActive && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {isFocused && !isActive && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Tap to open
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Side Arrows */}
      {componentList.length > 1 && (
        <>
          {/* Left Arrow */}
          {focusedIndex > 0 && (
            <button
              onClick={() => onComponentChange(componentList[focusedIndex - 1][0])}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-4 rounded-full bg-white/20 dark:bg-black/30 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/50 transition-all duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {focusedIndex < componentList.length - 1 && (
            <button
              onClick={() => onComponentChange(componentList[focusedIndex + 1][0])}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-4 rounded-full bg-white/20 dark:bg-black/30 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/50 transition-all duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Bottom Tabs Only */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom">
        <div className="bg-gray-100/90 dark:bg-black/40 border-t border-gray-300 dark:border-white/10 px-4 py-3">
          {/* Component Tabs */}
          <div className="flex justify-center">
            <div className="flex space-x-2 max-w-sm overflow-x-auto scrollbar-hide">
              {componentList.map(([componentId, component]) => {
                const config = COMPONENT_TYPES[component.type] || {
                  icon: '📦',
                  label: component.type,
                };
                const isActive = componentId === activeComponentId;
                const isFocused = componentId === focusedComponentId;

                return (
                  <button
                    key={componentId}
                    onClick={() => onComponentChange(componentId)}
                    className={`
                      flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-all duration-200
                      ${isFocused
                      ? 'bg-gray-300 dark:bg-white/20'
                      : 'bg-gray-200/50 dark:bg-white/5 hover:bg-gray-300/70 dark:hover:bg-white/10'
                    }
                    `}
                  >
                    <div className="relative">
                      <span className="text-lg">{config.icon}</span>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-gray-100 dark:border-white"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-white/80 mt-1 max-w-12 truncate">
                      {component.name || config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mt-2">
            <p className="text-gray-600 dark:text-white/60 text-xs">
              Tap to focus • Tap again to open
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Toggle Button (to show/hide the switcher)
const FloatingToggleButton = ({ onToggle, isVisible }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 shadow-xl transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10"
    >
      <span className="text-2xl">
        {isVisible ? '✕' : '☰'}
      </span>
    </button>
  );
};

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

export default function ProjectPageMobileTest() {
  const chatIframeRef = React.useRef(null);
  const history = useHistory();
  const { altanerId, componentId, itemId } = useParams();
  const isLoading = useSelector(selectAltanersIsLoading);
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const isMobile = useResponsive('down', 'md');

  // Local state for mobile interface
  const [activeComponentId, setActiveComponentId] = useState(componentId || null);
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch the altaner on component mount
  useEffect(() => {
    if (altanerId) {
      dispatch(getAltanerById(altanerId));
    }
    return () => {
      dispatch(clearCurrentAltaner());
    };
  }, [altanerId]);

  // Set the first component as active when components are loaded
  useEffect(() => {
    if (sortedComponents && Object.keys(sortedComponents).length > 0 && !activeComponentId) {
      const firstComponentId = Object.keys(sortedComponents)[0];
      setActiveComponentId(firstComponentId);
    }
  }, [sortedComponents, activeComponentId]);

  // Enhanced sorted components with artificial chat component
  const enhancedComponents = useMemo(() => {
    if (!sortedComponents) return null;

    // Add artificial chat component
    const chatComponent = {
      id: 'chat',
      type: 'chat',
      name: 'Chat',
      params: {},
    };

    return {
      ...sortedComponents,
      chat: chatComponent,
    };
  }, [sortedComponents]);

  // Get the current component based on the active ID
  const currentComponent = useMemo(() => {
    if (!activeComponentId || !enhancedComponents) return null;
    return enhancedComponents[activeComponentId];
  }, [activeComponentId, enhancedComponents]);

  // State for managing card focus vs navigation
  const [focusedComponentId, setFocusedComponentId] = useState(activeComponentId);

  const handleComponentChange = (componentId) => {
    // If componentId is null, just close the switcher
    if (componentId === null) {
      setSwitcherVisible(false);
      return;
    }

    // If this is the already focused card, navigate to it
    if (componentId === focusedComponentId) {
      // Start transition
      setIsTransitioning(true);

      // Small delay to show transition effect
      setTimeout(() => {
        setActiveComponentId(componentId);
        setSwitcherVisible(false);

        // Update URL
        const newPath = itemId
          ? `/mobile-test/${altanerId}/c/${componentId}/i/${itemId}`
          : `/mobile-test/${altanerId}/c/${componentId}`;
        history.replace(newPath);

        // End transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 150);
    } else {
      // First tap - just focus the card (center it)
      setFocusedComponentId(componentId);
    }
  };

  // Update focused component when switcher becomes visible
  useEffect(() => {
    if (switcherVisible) {
      setFocusedComponentId(activeComponentId);
    }
  }, [switcherVisible, activeComponentId]);

  const handleToggleSwitcher = () => {
    setSwitcherVisible(!switcherVisible);
  };

  const { acType, acProps } = useMemo(() => {
    if (!altaner || !currentComponent) return {};

    const componentTypeMap = {
      interface: 'interface',
      base: 'base',
      flows: 'flows',
      agents: 'agents',
      chat: 'chat',
    };

    const type = componentTypeMap[currentComponent.type] || currentComponent.type;
    const typeSpecificProps = {};

    if (type === 'base' && currentComponent.params?.ids) {
      typeSpecificProps.ids = currentComponent.params.ids;
      typeSpecificProps.altanerComponentType = type;
      typeSpecificProps.filterIds = currentComponent.params.ids;
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

  // Helper function to render any component for previews
  const renderComponentForPreview = useCallback((componentId, additionalProps = {}) => {
    if (!enhancedComponents || !enhancedComponents[componentId]) return null;

    const component = enhancedComponents[componentId];
    const componentTypeMap = {
      interface: 'interface',
      base: 'base',
      flows: 'flows',
      agents: 'agents',
      chat: 'chat',
    };

    const type = componentTypeMap[component.type] || component.type;
    const typeSpecificProps = {};

    if (type === 'base' && component.params?.ids) {
      typeSpecificProps.ids = component.params.ids;
      typeSpecificProps.altanerComponentType = type;
      typeSpecificProps.filterIds = component.params.ids;
    }

    const finalProps = {
      ...transformProps(type, component.params || {}),
      ...typeSpecificProps,
      ...additionalProps,
      altanerComponentId: component.id,
    };

    // For chat component - render Room
    if (type === 'chat' && altaner?.room_id) {
      return (
        <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
          <Room
            key={altaner.room_id}
            roomId={altaner.room_id}
            header={false}
            renderCredits={false}
          />
        </Box>
      );
    }

    // For base component
    if (type === 'base' && component?.params?.ids?.[0]) {
      return (
        <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
          <Base
            ids={component.params.ids}
            altanerComponentId={component.id}
            hideChat={true}
            {...finalProps}
          />
        </Box>
      );
    }

    // For other component types
    const isFlowType = ['flows', 'flow', 'setup_flow'].includes(type);
    const isAgentType = ['agents', 'agent'].includes(type);
    const needsItemId = isFlowType || isAgentType;

    return (
      <AltanerComponent
        key={`preview_${component?.id}_${type}_${altanerId}`}
        altanerComponentType={type}
        altanerComponentId={component?.id || type}
        {...(needsItemId && itemId ? { id: itemId } : {})}
        altanerProps={{
          altanerId: altanerId,
          altanerComponentId: component?.id,
        }}
        chatIframeRef={chatIframeRef}
        {...finalProps}
      />
    );
  }, [enhancedComponents, altanerId, itemId, chatIframeRef, altaner]);

  const renderComponent = () => {
    if (!acType) return null;

    // For chat component - render Room fullscreen
    if (acType === 'chat' && altaner?.room_id) {
      return (
        <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
          <Room
            key={altaner.room_id}
            roomId={altaner.room_id}
            header={false}
            renderCredits={false}
          />
        </Box>
      );
    }

    if (acType === 'base' && currentComponent?.params?.ids?.[0]) {
      const handleBaseNavigation = (altanerComponentId, params) => {
        const { baseId, tableId, viewId, recordId } = params;
        let path = `/project/${altanerId}/c/${activeComponentId}`;

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
        <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
          <Base
            ids={currentComponent.params.ids}
            onNavigate={handleBaseNavigation}
            altanerComponentId={currentComponent.id}
            hideChat={true} // Always hide chat in this test
          />
        </Box>
      );
    }

    const isFlowType = ['flows', 'flow', 'setup_flow'].includes(acType);
    const isAgentType = ['agents', 'agent'].includes(acType);
    const needsItemId = isFlowType || isAgentType;

    return (
      <AltanerComponent
        key={`${currentComponent?.id}_${acType}_${altanerId}_${activeComponentId}_${itemId || ''}`}
        altanerComponentType={acType}
        altanerComponentId={currentComponent?.id || acType}
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
    return <LoadingFallback />;
  }

  // For desktop, show a message that this is mobile-only
  if (!isMobile) {
    return (
      <CompactLayout
        title="Mobile Test View"
        noPadding
        drawerVisible={false}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Mobile Test View</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is a mobile-only test interface. Please resize your browser window or use mobile view to see the interface.
            </p>
          </div>
        </div>
      </CompactLayout>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-white dark:bg-gray-900 z-50">
      {/* Project Header - only visible when switcher is open */}
      {switcherVisible && (
        <div className="relative z-10">
          <ProjectHeader />
        </div>
      )}

      {/* Fullscreen component container */}
      <div className={`relative h-full w-full overflow-hidden ${switcherVisible ? 'pt-16' : ''}`}>
        {/* Main component - fullscreen with transition */}
        <div className={`absolute inset-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {activeComponentId && currentComponent && renderComponent()}
        </div>

        {/* Transition overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-white/90 font-medium">Switching...</span>
              </div>
            </div>
          </div>
        )}

        {/* iOS-style app switcher */}
        <IOSStyleAppSwitcher
          components={enhancedComponents}
          activeComponentId={activeComponentId}
          focusedComponentId={focusedComponentId}
          onComponentChange={handleComponentChange}
          isVisible={switcherVisible}
          renderComponent={renderComponentForPreview}
        />

        {/* Floating toggle button */}
        <FloatingToggleButton
          onToggle={handleToggleSwitcher}
          isVisible={switcherVisible}
        />
      </div>
    </div>
  );
}
