import { m } from 'framer-motion';
import { memo, useCallback, useState } from 'react';

import { cn } from '@lib/utils';

import AgentVarsInput from './AgentVarsInput.jsx';
import ModuleInputVars from './ModuleInputVars.jsx';
import HelperGroups from '../../../../../components/flows/menuvars/HelperGroups.jsx';
import Iconify from '../../../../../components/iconify';

// Helper group configuration with icons
const GROUPS = {
  vars: {
    icon: 'tabler:variable',
    label: 'Variables',
  },
  string: {
    icon: 'carbon:string-text',
    label: 'String',
  },
  object: {
    icon: 'lets-icons:json',
    label: 'Object',
  },
  math: {
    icon: 'tabler:math',
    label: 'Math',
  },
  date: {
    icon: 'ph:calendar-dots-duotone',
    label: 'Date',
  },
  rfc: {
    icon: 'mdi:standard-definition',
    label: 'RFC',
  },
};

// Group toggle button component
const GroupToggleButton = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center h-8 px-3 rounded-md transition-all',
      'hover:bg-accent/80',
      isActive
        ? 'bg-accent text-foreground shadow-sm'
        : 'bg-transparent text-muted-foreground hover:text-foreground',
    )}
    aria-label={label}
  >
    <m.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Iconify icon={icon} width={16} />
    </m.div>
  </button>
);

/**
 * ModuleInput - Main input component for selecting variables and helpers
 * Displays categorized helper groups and variables based on mode
 */
const ModuleInput = ({ onSelect = null, mode = 'flow', ...other }) => {
  const [selectedHelperGroup, setSelectedHelperGroup] = useState('vars');

  const handleGroupSelect = useCallback((groupKey) => {
    setSelectedHelperGroup(groupKey);
  }, []);

  return (
    <div
      className="relative flex flex-col items-start w-full h-full"
      {...other}
    >
      {/* Group selector header */}
      <div className="w-full flex flex-col gap-2 px-2 py-2">
        <div className="flex items-center gap-1 w-full overflow-x-auto scrollbar-hide bg-muted/30 p-1 rounded-lg">
          {Object.entries(GROUPS).map(([key, value]) => (
            <GroupToggleButton
              key={`group-${key}`}
              icon={value.icon}
              label={value.label}
              isActive={selectedHelperGroup === key}
              onClick={() => handleGroupSelect(key)}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 w-full overflow-y-auto">
        {(!selectedHelperGroup || selectedHelperGroup !== 'vars') && (
          <HelperGroups
            selectedGroup={selectedHelperGroup}
            onSelect={onSelect}
          />
        )}

        {(!selectedHelperGroup || selectedHelperGroup === 'vars') &&
          (mode === 'agent' ? (
            <AgentVarsInput onSelect={onSelect} />
          ) : (
            <ModuleInputVars onSelect={onSelect} />
          ))}
      </div>
    </div>
  );
};

export default memo(ModuleInput);
