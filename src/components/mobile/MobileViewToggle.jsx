import { memo, useCallback, useState, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Iconify from '../iconify/Iconify.jsx';

const MobileViewToggle = memo(({
  mobileActiveView,
  onMobileToggle,
  activeComponent,
  allComponents,
  isFullscreen = false,
  currentItemId = null,
  onItemSelect = null,
}) => {
  const history = useHistory();
  const { altanerId } = useParams();
  const [componentMenuAnchor, setComponentMenuAnchor] = useState(null);
  
  // Get flows and agents from Redux
  const flows = useSelector((state) => state.flows.flows || []);
  const agents = useSelector((state) => state.general.account?.agents || []);

  // Component type display logic
  const getComponentDisplayInfo = (component) => {
    if (!component) return { name: 'Preview', icon: 'eva:eye-outline' };
    
    const typeMap = {
      interface: { name: 'Interface', icon: 'eva:monitor-outline' },
      base: { name: 'Database', icon: 'eva:layers-outline' },
      flows: { name: 'Flows', icon: 'eva:activity-outline' },
      flow: { name: 'Flow', icon: 'eva:activity-outline' },
      agents: { name: 'Agents', icon: 'eva:person-outline' },
      agent: { name: 'Agent', icon: 'eva:person-outline' },
      external_link: { name: 'Link', icon: 'eva:link-outline' },
    };
    
    const info = typeMap[component.type?.toLowerCase()];
    return info || { name: component.type || 'Preview', icon: component.icon || 'eva:file-outline' };
  };

  // Helper functions
  const isFlowType = (type) => type === 'flow' || type === 'flows';
  const isAgentType = (type) => type === 'agent' || type === 'agents';
  const needsItemSelection = activeComponent && (isFlowType(activeComponent.type) || isAgentType(activeComponent.type));

  // Get items for current component
  const getComponentItems = useMemo(() => {
    if (!activeComponent || !needsItemSelection) return [];
    
    const ids = activeComponent?.params?.ids || 
                activeComponent?.ids || 
                activeComponent?.params?.agentIds || 
                activeComponent?.params?.flowIds || 
                [];
    
    if (isFlowType(activeComponent.type)) {
      return ids.length > 0 ? flows.filter((flow) => ids.includes(flow.id)) : [];
    }
    
    if (isAgentType(activeComponent.type)) {
      return ids.length > 0 ? agents.filter((agent) => ids.includes(agent.id)) : [];
    }
    
    return [];
  }, [activeComponent, flows, agents, needsItemSelection]);

  // Get current item
  const currentItem = useMemo(() => {
    if (!currentItemId || !needsItemSelection) return null;
    
    if (isFlowType(activeComponent?.type)) {
      return flows.find((f) => f.id === currentItemId);
    }
    
    if (isAgentType(activeComponent?.type)) {
      return agents.find((a) => a.id === currentItemId);
    }
    
    return null;
  }, [currentItemId, activeComponent, flows, agents, needsItemSelection]);

  const componentInfo = getComponentDisplayInfo(activeComponent);

  // Convert components object to sorted array with specific order
  const sortedComponentsArray = allComponents
    ? Object.entries(allComponents)
        .map(([id, component]) => ({ id, ...component }))
        .sort((a, b) => {
          // Define the desired order
          const order = { interface: 1, base: 2, agents: 3, flows: 4 };
          const aOrder = order[a.type?.toLowerCase()] || 999;
          const bOrder = order[b.type?.toLowerCase()] || 999;
          return aOrder - bOrder;
        })
    : [];

  // Component navigation handlers
  const handleComponentSelect = useCallback((componentId) => {
    if (altanerId) {
      history.push(`/project/${altanerId}/c/${componentId}`);
    }
    setComponentMenuAnchor(null);
  }, [altanerId, history]);

  // Item selection handler
  const handleItemSelect = useCallback((itemId) => {
    if (onItemSelect) {
      onItemSelect(itemId);
    }
    setComponentMenuAnchor(null);
  }, [onItemSelect]);

  const handlePreviewClick = useCallback((event) => {
    if (mobileActiveView === 'chat') {
      // If in chat mode, switch to preview mode
      onMobileToggle('preview');
    } else {
      // If in preview mode, always show the menu (either items or components)
      setComponentMenuAnchor(event.currentTarget);
    }
  }, [mobileActiveView, onMobileToggle]);

  return (
    <>
      <div className={`flex items-center gap-0.5 p-0.5 rounded-full transition-all duration-200 ${
        isFullscreen 
          ? 'bg-black/20 dark:bg-white/20 backdrop-blur-md border border-white/20 dark:border-black/20'
          : 'bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
      }`}>
        <button
          onClick={() => onMobileToggle('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            mobileActiveView === 'chat'
              ? isFullscreen
                ? 'bg-white/90 dark:bg-black/90 text-black dark:text-white shadow-lg'
                : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-sm'
              : isFullscreen
                ? 'text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black hover:bg-white/20 dark:hover:bg-black/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Iconify
            icon="mdi:chat-outline"
            width={16}
            height={16}
          />
          <span>Chat</span>
        </button>
        <button
          onClick={handlePreviewClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            mobileActiveView === 'preview'
              ? isFullscreen
                ? 'bg-white/90 dark:bg-black/90 text-black dark:text-white shadow-lg'
                : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-sm'
              : isFullscreen
                ? 'text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black hover:bg-white/20 dark:hover:bg-black/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Iconify
            icon={componentInfo.icon}
            width={16}
            height={16}
          />
          <span>{needsItemSelection && currentItem ? currentItem.name : componentInfo.name}</span>
          {mobileActiveView === 'preview' && (
            <Iconify
              icon="mdi:chevron-down"
              width={14}
              height={14}
              className="ml-1"
            />
          )}
        </button>
      </div>

      {/* Component Selection Menu */}
      <Menu
        anchorEl={componentMenuAnchor}
        open={Boolean(componentMenuAnchor)}
        onClose={() => setComponentMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: -1,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* Items Section - show items for flows/agents */}
        {needsItemSelection && getComponentItems.length > 0 && 
          getComponentItems.map((item) => {
            const isActive = item.id === currentItemId;
            
            return (
              <MenuItem
                key={item.id}
                onClick={() => handleItemSelect(item.id)}
                sx={{
                  py: 1,
                  px: 2,
                  minHeight: 40,
                  backgroundColor: isActive ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'action.selected' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {isFlowType(activeComponent.type) ? (
                    // Status indicator for flows
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={item.is_active ? 'Active' : 'Inactive'}
                    />
                  ) : isAgentType(activeComponent.type) && item.avatar_url ? (
                    // Avatar for agents
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      className="w-4 h-4 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    // Default icon
                    <Iconify
                      icon={componentInfo.icon}
                      width={18}
                      height={18}
                      sx={{
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
                {isActive && (
                  <Iconify
                    icon="mdi:check"
                    width={16}
                    height={16}
                    sx={{ color: 'primary.main', ml: 1 }}
                  />
                )}
              </MenuItem>
            );
          })
        }

        {/* Divider between items and components */}
        {needsItemSelection && getComponentItems.length > 0 && sortedComponentsArray.length > 0 && (
          <div className="my-1 mx-2 border-t border-gray-200 dark:border-gray-700" />
        )}

        {/* Components Section - always show all components */}
        {sortedComponentsArray.map((component) => {
          const info = getComponentDisplayInfo(component);
          const isActive = component.id === activeComponent?.id;
          
          return (
            <MenuItem
              key={`component-${component.id}`}
              onClick={() => handleComponentSelect(component.id)}
              sx={{
                py: 1,
                px: 2,
                minHeight: 40,
                backgroundColor: isActive ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'action.selected' : 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Iconify
                  icon={info.icon}
                  width={18}
                  height={18}
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={component.name}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'primary.main' : 'text.primary',
                }}
              />
              {isActive && !needsItemSelection && (
                <Iconify
                  icon="mdi:check"
                  width={16}
                  height={16}
                  sx={{ color: 'primary.main', ml: 1 }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
});

MobileViewToggle.propTypes = {
  mobileActiveView: PropTypes.oneOf(['chat', 'preview']).isRequired,
  onMobileToggle: PropTypes.func.isRequired,
  activeComponent: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    icon: PropTypes.string,
    params: PropTypes.object,
  }),
  allComponents: PropTypes.object,
  isFullscreen: PropTypes.bool,
  currentItemId: PropTypes.string,
  onItemSelect: PropTypes.func,
};

MobileViewToggle.displayName = 'MobileViewToggle';

export default MobileViewToggle;
