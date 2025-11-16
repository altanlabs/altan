import PropTypes from 'prop-types';
import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

// components
import ItemSwitcher from './components/ItemSwitcher';
import UnifiedNavigation from './components/UnifiedNavigation';
import { fetchAgentById, selectAllAgents } from '../../../redux/slices/agents.ts';
import { selectCurrentAltaner } from '../../../redux/slices/altaners.ts';

// Default icons in case component doesn't provide one
const DEFAULT_ICONS = {
  interface: 'mynaui:desktop-solid',
  base: 'material-symbols:cloud',
  flows: 'eva:activity-outline',
  flow: 'eva:activity-outline',
  agent: 'material-symbols:circle',
  agents: 'material-symbols:circle',
  external_link: 'eva:link-outline',
  plans: 'mdi:road-variant',
};

const ProjectNav = ({ components, altanerId, onEditAltaner }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { componentId, itemId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const agents = useSelector(selectAllAgents);

  // Detect if we're on the plans route
  const isOnPlansRoute = history.location.pathname.includes('/plans');

  // Convert components to array and sort by position
  const sortedComponents = useMemo(() => {
    if (!components) return [];

    // Map components to array with ids
    const componentsArray = Object.entries(components).map(([id, component]) => ({
      id,
      ...component,
      // Ensure icon is set
      icon: DEFAULT_ICONS[component.type.toLowerCase()] || 'eva:file-outline',
    }));

    // Artificially add Plans component at the end
    const plansComponent = {
      id: 'plans',
      name: 'Roadmap',
      type: 'plans',
      icon: DEFAULT_ICONS.plans,
      position: 9999, // Place at the end
      params: {},
    };

    // Sort by position
    const sorted = [...componentsArray, plansComponent].sort((a, b) => {
      // Ensure position is a number (or default to 999)
      const posA = typeof a.position === 'number' ? a.position : 999;
      const posB = typeof b.position === 'number' ? b.position : 999;
      return posA - posB;
    });
    return sorted;
  }, [components]);

  // Get current component from URL path params or use the first one
  const activeComponent = useMemo(() => {
    // If on plans route, return the plans component
    if (isOnPlansRoute) {
      return sortedComponents.find((comp) => comp.id === 'plans');
    }

    return (
      sortedComponents.find((comp) => comp.id === componentId) ||
      (sortedComponents.length > 0 ? sortedComponents[0] : null)
    );
  }, [componentId, sortedComponents, isOnPlansRoute]);

  // Fetch agents if they're not in the store yet
  useEffect(() => {
    if (activeComponent?.type?.toLowerCase() === 'agents' || activeComponent?.type?.toLowerCase() === 'agent') {
      const agentIds = activeComponent?.params?.ids || [];

      // Check which agents need to be fetched
      const missingAgentIds = agentIds.filter(
        (id) => !agents.find((agent) => agent.id === id),
      );

      // Fetch missing agents only if there are any missing
      if (missingAgentIds.length > 0) {
        missingAgentIds.forEach((agentId) => {
          dispatch(fetchAgentById(agentId));
        });
      }
    }
    // Only run when activeComponent changes, not when agents updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeComponent, dispatch]);

  // Handle component selection
  const handleComponentSelect = (compId) => {
    // Special handling for plans component
    if (compId === 'plans') {
      history.push(`/project/${altanerId}/plans`);
      return;
    }

    // Navigate to the new URL with the component ID in the path
    history.push(`/project/${altanerId}/c/${compId}`);
  };

  // When an item is selected, history.push to the new URL
  const handleItemSelected = (selectedItemId) => {
    history.push(`/project/${altanerId}/c/${componentId}/i/${selectedItemId}`);
  };

  if (sortedComponents.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <UnifiedNavigation
        altaner={altaner}
        components={sortedComponents}
        activeComponent={activeComponent}
        onComponentSelect={handleComponentSelect}
        onEditAltaner={onEditAltaner}
      />

      {activeComponent &&
        ['flows', 'flow', 'agents', 'agent'].includes(activeComponent.type.toLowerCase()) && (
        <ItemSwitcher
          activeComponentType={activeComponent.type.toLowerCase()}
          currentI={itemId}
          componentId={activeComponent.id}
          activeComponent={activeComponent}
          onItemSelect={handleItemSelected}
        />
      )}
    </div>
  );
};

ProjectNav.propTypes = {
  components: PropTypes.object,
  altanerId: PropTypes.string,
  onEditAltaner: PropTypes.func,
};

export default ProjectNav;
