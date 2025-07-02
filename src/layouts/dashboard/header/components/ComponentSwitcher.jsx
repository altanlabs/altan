import { Box } from '@mui/material';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo } from 'react';

import ComponentItem from './ComponentItem';
import NavDropdown from './NavDropdown';
import HeaderIconButton from '../../../../components/HeaderIconButton';
import Iconify from '../../../../components/iconify';

const ComponentSwitcher = memo(
  ({
    components,
    activeComponent,
    onComponentSelect,
    onAddClick,
    altanerId,
  }) => {
    const renderTriggerElement = (isOpen) => (
      <HeaderIconButton
        sx={{
          width: 'auto',
          px: 1.5,
          gap: 0.5,
          fontSize: '0.875rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {activeComponent?.icon && (
          <Iconify
            icon={activeComponent.icon}
            width={16}
          />
        )}
        <Box
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          {activeComponent?.name || 'Components'}
        </Box>
        <m.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Iconify
            icon="mdi:chevron-down"
            width={16}
          />
        </m.span>
      </HeaderIconButton>
    );

    const renderComponentItem = (component, closeDropdown) => (
      <ComponentItem
        component={component}
        isActive={component.id === activeComponent?.id}
        onClick={(componentId) => {
          onComponentSelect(componentId);
          closeDropdown(); // Close dropdown after selection
        }}
        altanerId={altanerId}
      />
    );

    const addComponentOption = {
      label: 'Add component',
      icon: 'eva:plus-fill',
      onClick: () => {
        onAddClick();
        // NavDropdown will call closeDropdown internally
      },
    };

    // Map `components` to the format expected by `NavDropdown`'s `items` prop
    const dropdownItems = components.map(comp => ({ ...comp, id: comp.id.toString() }));

    return (
      <NavDropdown
        triggerElement={renderTriggerElement} // Pass the function directly, NavDropdown will call it with isOpen
        items={dropdownItems}
        renderItem={renderComponentItem}
        addOption={addComponentOption}
        dropdownStyle={{ right: -50 }}
        dropdownWidth="12rem"
      />
    );
  },
);

ComponentSwitcher.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  activeComponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
  }),
  onComponentSelect: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
  altanerId: PropTypes.string,
};

ComponentSwitcher.displayName = 'ComponentSwitcher';

export default ComponentSwitcher;
