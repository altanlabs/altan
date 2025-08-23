import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

// components
import ItemSwitcher from './components/ItemSwitcher';
import UnifiedNavigation from './components/UnifiedNavigation';
import { selectCurrentAltaner } from '../../../redux/slices/altaners';

// Default icons in case component doesn't provide one
const DEFAULT_ICONS = {
  interface: 'eva:monitor-outline',
  base: 'eva:layers-outline',
  flows: 'eva:activity-outline',
  flow: 'eva:activity-outline',
  agent: 'eva:person-outline',
  agents: 'eva:person-outline',
  external_link: 'eva:link-outline',
};

const ProjectNav = ({ components, altanerId, onEditAltaner }) => {
  const history = useHistory();
  const { componentId, itemId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);

  // Convert components to array and sort by position
  const sortedComponents = useMemo(() => {
    if (!components) return [];

    // Map components to array with ids
    const componentsArray = Object.entries(components).map(([id, component]) => ({
      id,
      ...component,
      // Ensure icon is set
      icon: component.icon || DEFAULT_ICONS[component.type.toLowerCase()] || 'eva:file-outline',
    }));
    // Sort by position
    const sorted = [...componentsArray].sort((a, b) => {
      // Ensure position is a number (or default to 999)
      const posA = typeof a.position === 'number' ? a.position : 999;
      const posB = typeof b.position === 'number' ? b.position : 999;
      return posA - posB;
    });
    return sorted;
  }, [components]);

  // Get current component from URL path params or use the first one
  const activeComponent = useMemo(() => {
    return (
      sortedComponents.find((comp) => comp.id === componentId) ||
      (sortedComponents.length > 0 ? sortedComponents[0] : null)
    );
  }, [componentId, sortedComponents]);

  // Handle component selection
  const handleComponentSelect = (compId) => {
    // Navigate to the new URL with the component ID in the path
    history.push(`/project/${altanerId}/c/${compId}`);
  };

  // When an item is selected, history.push to the new URL
  const handleItemSelected = (selectedItemId) => {
    history.push(`/project/${altanerId}/c/${componentId}/i/${selectedItemId}`);
  };

  if (sortedComponents.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 42,
        gap: 0.5,
      }}
    >
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
    </Box>
  );
};

ProjectNav.propTypes = {
  components: PropTypes.object,
  altanerId: PropTypes.string,
  onEditAltaner: PropTypes.func,
};

export default ProjectNav;
