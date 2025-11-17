/**
 * useCockpitState Hook
 * Manages the expand/collapse state of the action cockpit
 */

import { useState, useCallback } from 'react';

export const useCockpitState = (defaultExpanded = true) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return {
    isExpanded,
    toggleExpanded,
    expand,
    collapse,
  };
};

