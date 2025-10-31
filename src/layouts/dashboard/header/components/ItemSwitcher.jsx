import { TextField, InputAdornment, IconButton, Tooltip, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import NavDropdown from './NavDropdown';
import DynamicAgentAvatar from '../../../../components/agents/DynamicAgentAvatar';
import Iconify from '../../../../components/iconify';
import { selectAllAgents } from '../../../../redux/slices/agents';
import { deleteWorkflow, duplicateWorkflow } from '../../../../redux/slices/flows';
import { deleteAccountAgent, duplicateAgent } from '../../../../redux/slices/general';

// Constants
const COMPONENT_TYPES = {
  FLOW: 'flow',
  FLOWS: 'flows',
  AGENT: 'agent',
  AGENTS: 'agents',
  INTERFACE: 'interface',
  BASE: 'base',
};

const COMPONENT_ICONS = {
  [COMPONENT_TYPES.FLOW]: 'eva:activity-outline',
  [COMPONENT_TYPES.FLOWS]: 'eva:activity-outline',
  [COMPONENT_TYPES.AGENT]: 'eva:person-outline',
  [COMPONENT_TYPES.AGENTS]: 'eva:person-outline',
  [COMPONENT_TYPES.INTERFACE]: 'eva:monitor-outline',
  [COMPONENT_TYPES.BASE]: 'eva:layers-outline',
};

const ItemSwitcher = memo(
  ({ activeComponentType, currentI, componentId, activeComponent, onItemSelect }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const flows = useSelector((state) => state.flows.flows || []);
    const agents = useSelector(selectAllAgents);

    const [searchQuery, setSearchQuery] = useState('');

    // Helper functions
    const isFlowType = useCallback(
      (type) => type === COMPONENT_TYPES.FLOW || type === COMPONENT_TYPES.FLOWS,
      [],
    );

    const isAgentType = useCallback(
      (type) => type === COMPONENT_TYPES.AGENT || type === COMPONENT_TYPES.AGENTS,
      [],
    );

    const shouldHideComponent = useCallback(
      (type) => type === COMPONENT_TYPES.INTERFACE || type === COMPONENT_TYPES.BASE,
      [],
    );

    const getComponentIds = useCallback((component) => {
      if (!component) return [];

      return (
        component?.params?.ids ||
        component?.ids ||
        component?.params?.agentIds ||
        component?.params?.flowIds ||
        []
      );
    }, []);

    // Get relevant items based on component type
    const componentItems = useMemo(() => {
      if (!activeComponent || !activeComponentType || shouldHideComponent(activeComponentType)) {
        return [];
      }

      const ids = getComponentIds(activeComponent);

      if (isFlowType(activeComponentType)) {
        return ids.length > 0 ? flows.filter((flow) => ids.includes(flow.id)) : [];
      }

      if (isAgentType(activeComponentType)) {
        return ids.length > 0 ? agents.filter((agent) => ids.includes(agent.id)) : [];
      }

      return [];
    }, [
      activeComponent,
      activeComponentType,
      flows,
      agents,
      shouldHideComponent,
      getComponentIds,
      isFlowType,
      isAgentType,
    ]);

    // Filter items based on search query
    const filteredItems = useMemo(
      () =>
        componentItems.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      [componentItems, searchQuery],
    );

    // Auto-select first item if none is selected
    useEffect(() => {
      if (componentItems.length > 0 && !currentI && onItemSelect) {
        onItemSelect(componentItems[0].id);
      }
    }, [componentItems, currentI, onItemSelect]);

    // Get current item details
    const currentItem = useMemo(() => {
      if (!currentI) return null;

      if (isFlowType(activeComponentType)) {
        return flows.find((f) => f.id === currentI);
      }

      if (isAgentType(activeComponentType)) {
        return agents.find((a) => a.id === currentI);
      }

      return null;
    }, [currentI, activeComponentType, flows, agents, isFlowType, isAgentType]);

    const currentItemName = currentItem?.name || 'Select Item';

    // Render functions
    const renderStatusIndicator = useCallback((item, size = 'small') => {
      const sizeClasses = size === 'small' ? 'w-2 h-2' : 'w-3 h-3';
      return (
        <div
          className={`${sizeClasses} rounded-full ${
            item.is_active ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={item.is_active ? 'Active' : 'Inactive'}
        />
      );
    }, []);

    const renderAvatar = useCallback(
      (item, size = 16) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DynamicAgentAvatar
              agent={item}
              size={Math.floor(size * 1.5)}
              agentId={item.id}
              agentState={null}
            />
          </Box>
        );
      },
      [],
    );

    const renderItemIcon = useCallback(
      (item) => {
        if (isFlowType(activeComponentType)) {
          return renderStatusIndicator(item, 'large');
        }

        if (isAgentType(activeComponentType)) {
          return renderAvatar(item);
        }

        return (
          <Iconify
            icon={COMPONENT_ICONS[activeComponentType] || 'eva:file-outline'}
            width={16}
            className="text-gray-500 dark:text-gray-400"
          />
        );
      },
      [activeComponentType, isFlowType, isAgentType, renderStatusIndicator, renderAvatar],
    );

    const renderTriggerElement = useCallback(
      (isOpen) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.5,
              marginTop: 0.5,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              p: 0.25,
              gap: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {/* Item Icon/Avatar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 28,
                borderRadius: 1.25,
                backgroundColor: 'transparent',
              }}
            >
              {isFlowType(activeComponentType) && currentItem && renderStatusIndicator(currentItem)}
              {isAgentType(activeComponentType) && currentItem && renderAvatar(currentItem)}
              {!currentItem && (
                <Iconify
                  icon={COMPONENT_ICONS[activeComponentType] || 'eva:file-outline'}
                  width={16}
                  height={16}
                  sx={{ color: theme.palette.text.secondary }}
                />
              )}
            </Box>

            {/* Item Name */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                minWidth: 0, // Allow text to shrink
                maxWidth: 80, // Much smaller to match component switcher
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentItemName || 'Select Item'}
            </Box>

            {/* Chevron */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 28,
                borderRadius: 1.25,
                backgroundColor: 'transparent',
                color: theme.palette.text.secondary,
              }}
            >
              <m.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Iconify
                  icon="mdi:chevron-down"
                  width={16}
                />
              </m.span>
            </Box>
          </Box>
        </Box>
      ),
      [
        theme,
        activeComponentType,
        currentItem,
        currentItemName,
        isFlowType,
        isAgentType,
        renderStatusIndicator,
        renderAvatar,
      ],
    );

    const renderSearchInput = useCallback(
      () => (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <TextField
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    width={20}
                    sx={{ color: 'text.disabled' }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </div>
      ),
      [searchQuery],
    );

    const handleDuplicate = useCallback(
      async (e, itemId) => {
        e.stopPropagation();
        try {
          if (isFlowType(activeComponentType)) {
            await dispatch(duplicateWorkflow(itemId, componentId)());
          } else if (isAgentType(activeComponentType)) {
            await dispatch(duplicateAgent(itemId, componentId));
          }
          // Optional: Show success message
        } catch (error) {
          console.error(`Error duplicating ${activeComponentType}:`, error);
          // Optional: Show error message
        }
      },
      [dispatch, componentId, isFlowType, isAgentType, activeComponentType],
    );

    const handleDelete = useCallback(
      async (e, itemId) => {
        e.stopPropagation();
        const itemType = isFlowType(activeComponentType) ? 'flow' : 'agent';
        if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
          try {
            if (isFlowType(activeComponentType)) {
              await dispatch(deleteWorkflow(itemId)());
            } else if (isAgentType(activeComponentType)) {
              await dispatch(deleteAccountAgent(itemId));
            }
            // If the deleted item is the current one, select the first available item
            if (itemId === currentI && filteredItems.length > 0) {
              onItemSelect(filteredItems[0].id);
            }
          } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            // Optional: Show error message
          }
        }
      },
      [
        dispatch,
        currentI,
        filteredItems,
        onItemSelect,
        isFlowType,
        isAgentType,
        activeComponentType,
      ],
    );

    const renderItem = useCallback(
      (item, closeDropdown) => (
        <div
          key={item.id}
          onClick={() => {
            onItemSelect(item.id);
            closeDropdown();
          }}
          className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
            item.id === currentI ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {renderItemIcon(item)}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {item.name}
            </span>
          </div>
          {(isFlowType(activeComponentType) || isAgentType(activeComponentType)) && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity duration-200">
              <Tooltip title="Duplicate">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(e, item.id);
                  }}
                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Iconify
                    icon="eva:copy-outline"
                    width={16}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e, item.id);
                  }}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Iconify
                    icon="eva:trash-2-outline"
                    width={16}
                  />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      ),
      [
        currentI,
        onItemSelect,
        renderItemIcon,
        isFlowType,
        isAgentType,
        activeComponentType,
        handleDuplicate,
        handleDelete,
      ],
    );

    // Don't render if component type should be hidden or no items available
    if (shouldHideComponent(activeComponentType) || componentItems.length === 0) {
      return null;
    }

    return (
      <NavDropdown
        triggerElement={renderTriggerElement}
        items={filteredItems}
        renderItem={renderItem}
        dropdownStyle={{ right: -50 }}
        dropdownWidth="18rem"
        customHeader={renderSearchInput}
      />
    );
  },
);

ItemSwitcher.propTypes = {
  activeComponentType: PropTypes.string,
  currentI: PropTypes.string,
  componentId: PropTypes.string,
  activeComponent: PropTypes.object,
  onItemSelect: PropTypes.func.isRequired,
};

ItemSwitcher.displayName = 'ItemSwitcher';

export default ItemSwitcher;
