/**
 * Custom hook for managing agent chat state
 * Following Single Responsibility Principle - handles only chat state management
 */

import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAgentDmRoom } from '../../../../redux/slices/agents';
import type { Agent } from '../types';

interface UseAgentChatReturn {
  openChats: Agent[];
  expandedChats: Set<string>;
  handleAgentClick: (agent: Agent) => void;
  handleCloseChat: (agentId: string) => void;
  handleToggleExpand: (agentId: string) => void;
  calculateWindowOffset: (index: number) => number;
}

export const useAgentChat = (): UseAgentChatReturn => {
  const dispatch = useDispatch();
  const [openChats, setOpenChats] = useState<Agent[]>([]);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  /**
   * OPTIMIZATION: Lazy load DM rooms only when agent is clicked
   * Prevents N API calls on component mount
   */
  const handleAgentClick = useCallback(
    (agent: Agent) => {
      const existingChat = openChats.find((chat) => chat.id === agent.id);
      if (!existingChat) {
        setOpenChats((prev) => [...prev, agent]);
        // fetchAgentDmRoom has internal caching
        dispatch(fetchAgentDmRoom(agent.id));
      }
    },
    [openChats, dispatch]
  );

  const handleCloseChat = useCallback((agentId: string) => {
    setOpenChats((prev) => prev.filter((chat) => chat.id !== agentId));
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      newSet.delete(agentId);
      return newSet;
    });
  }, []);

  const handleToggleExpand = useCallback((agentId: string) => {
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  }, []);

  /**
   * Calculate cumulative offset for chat windows based on expanded states
   * Memoized to recalculate only when dependencies change
   */
  const calculateWindowOffset = useCallback(
    (index: number): number => {
      const baseOffset = 378; // Messaging widget (360px) + gap (12px) + adjustment (6px)
      let cumulativeOffset = baseOffset;

      for (let i = 0; i < index; i++) {
        const chat = openChats[i];
        const isWindowExpanded = expandedChats.has(chat.id);
        const windowWidth = isWindowExpanded ? 600 : 400;
        cumulativeOffset += windowWidth + 12;
      }

      return cumulativeOffset;
    },
    [openChats, expandedChats]
  );

  return {
    openChats,
    expandedChats,
    handleAgentClick,
    handleCloseChat,
    handleToggleExpand,
    calculateWindowOffset,
  };
};

