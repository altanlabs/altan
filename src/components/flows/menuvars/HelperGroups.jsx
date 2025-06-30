import { Stack } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';

import HelperGroup from './HelperGroup';
import {
  DATE_HELPERS,
  MATH_HELPERS,
  METHODS,
  OBJECT_HELPERS,
  RFC_HELPERS,
  STRING_HELPERS,
} from './helpers';

const HELPER_SECTIONS = [STRING_HELPERS, OBJECT_HELPERS, MATH_HELPERS, DATE_HELPERS, RFC_HELPERS];

const mapHelperSection = (lowerCaseSearchTerm) => (group) => {
  // Filter sections within the group
  const filteredSections = Object.entries(group.sections)
    .map(([name, section]) => {
      // Filter methods within the section
      const filteredMethods = section.methods.filter(
        (method) =>
          method.toLowerCase().includes(lowerCaseSearchTerm) ||
          METHODS[group.prefix][method].description.toLowerCase().includes(lowerCaseSearchTerm),
      );

      // Return the section with filtered methods only if there are matches
      if (filteredMethods.length > 0) {
        return {
          ...section,
          methods: filteredMethods,
        };
      }
      return null; // Filter out sections without matching methods
    })
    .filter((section) => section !== null);

  // Return the group with filtered sections only if there are matching sections
  if (filteredSections.length > 0) {
    return {
      ...group,
      sections: filteredSections,
    };
  }
  return null; // Filter out groups without matching sections
};

const HelperGroups = ({ searchTerm = '', selectedGroup = null, onSelect = null, ...other }) => {
  const helperSections = useMemo(() => {
    if (searchTerm.length < 2) {
      return HELPER_SECTIONS;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return HELPER_SECTIONS.map(mapHelperSection(lowerCaseSearchTerm)).filter(
      (group) => group !== null,
    );
  }, [searchTerm]);

  const filterHelperSections = useCallback(
    (group) => !selectedGroup || selectedGroup === group.prefix,
    [selectedGroup],
  );
  const renderHelperSection = useCallback(
    (group) => (
      <HelperGroup
        key={`helper-group-${group.title.toLowerCase()}`}
        group={group}
        searchTerm={searchTerm}
        selectedGroup={selectedGroup}
        onSelect={onSelect}
      />
    ),
    [onSelect, searchTerm, selectedGroup],
  );

  if (!helperSections.length) {
    return null;
  }

  return (
    <Stack
      spacing={2}
      padding={2}
      height="100%"
      width="100%"
      {...other}
    >
      {helperSections.filter(filterHelperSections).map(renderHelperSection)}
    </Stack>
  );
};

export default memo(HelperGroups);
