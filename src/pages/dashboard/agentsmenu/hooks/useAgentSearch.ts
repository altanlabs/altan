/**
 * Custom hook for agent search functionality
 * Following Single Responsibility Principle - handles only search logic
 */

import { useState, useCallback, useMemo } from 'react';
import type { Agent } from '../types';

interface UseAgentSearchReturn {
  searchQuery: string;
  filteredAgents: Agent[];
  handleSearchChange: (value: string) => void;
  handleClearSearch: () => void;
}

export const useAgentSearch = (agents: Agent[]): UseAgentSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => agent.name.toLowerCase().includes(query));
  }, [agents, searchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    filteredAgents,
    handleSearchChange,
    handleClearSearch,
  };
};

