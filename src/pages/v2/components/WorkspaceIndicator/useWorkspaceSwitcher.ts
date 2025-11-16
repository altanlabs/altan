import { useState, useCallback } from 'react';
import type { UseWorkspaceSwitcherReturn } from './types';

export const useWorkspaceSwitcher = (): UseWorkspaceSwitcherReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

