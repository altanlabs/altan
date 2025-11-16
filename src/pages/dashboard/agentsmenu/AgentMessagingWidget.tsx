/**
 * AgentMessagingWidget - Main Component
 * Refactored following SOLID principles and DRY methodology
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Each component/hook has one clear purpose
 * - Open/Closed: Components are open for extension via props
 * - Liskov Substitution: Proper typing ensures substitutability
 * - Interface Segregation: Separate interfaces for different concerns
 * - Dependency Inversion: Depends on abstractions (types) not concrete implementations
 * 
 * DRY: Eliminated code duplication through component extraction and reusable hooks
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
import React, { memo, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { AgentList } from './components/AgentList';
import { ChatWindows } from './components/ChatWindows';
import { SearchBar } from './components/SearchBar';
import { CollapsedHeader, ExpandedHeader } from './components/WidgetHeader';
import { useAgentChat } from './hooks/useAgentChat';
import { useAgentSearch } from './hooks/useAgentSearch';
import type { Agent } from './types';
import { LiquidGlassCard } from '../../../components/elevenlabs/liquid-glass';
import { selectSortedAgents } from '../../../redux/slices/general/index';
import type { RootState } from '../../../redux/store';

// Memoized selectors for optimal performance
const selectAgents = (state: RootState): Agent[] => (selectSortedAgents(state as any) as Agent[]) || [];
const selectAgentsInitialized = (state: RootState): boolean => 
  (state as any).general.accountAssetsInitialized?.agents || false;

/**
 * Main Widget Component
 * Orchestrates all sub-components and manages widget state
 */
const AgentMessagingWidget: React.FC = () => {
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  // Redux selectors
  const agents = useSelector(selectAgents);
  const agentsInitialized = useSelector(selectAgentsInitialized);
  const isLoading = !agentsInitialized;

  // Custom hooks for business logic
  const {
    openChats,
    expandedChats,
    handleAgentClick,
    handleCloseChat,
    handleToggleExpand,
    calculateWindowOffset,
  } = useAgentChat();

  const {
    searchQuery,
    filteredAgents,
    handleSearchChange,
    handleClearSearch,
  } = useAgentSearch(agents);

  // UI event handlers
  const handleExpand = useCallback(() => setIsExpanded(true), []);
  const handleCollapse = useCallback(() => setIsExpanded(false), []);

  const handleEditAgent = useCallback(
    (agent: Agent, e: React.MouseEvent<Element, MouseEvent>) => {
      e.stopPropagation();
      (history as any).push(`/agent/${agent.id}`);
    },
    [history]
  );

  const handleCreateAgent = useCallback(() => {
    const genesisAgent = agents.find(
      (agent) => agent.name.toLowerCase() === 'genesis'
    );
    if (genesisAgent) {
      handleAgentClick(genesisAgent);
    }
  }, [agents, handleAgentClick]);

  const handleNavigateToAgents = useCallback(() => {
    (history as any).push('/agents');
  }, [history]);

  // Render collapsed widget
  if (!isExpanded) {
    return ReactDOM.createPortal(
      <>
        <div className="fixed bottom-0 right-6 z-[9999] w-80">
          <LiquidGlassCard
            draggable={false}
            blurIntensity="md"
            shadowIntensity="sm"
            glowIntensity="xs"
            borderRadius="12px 12px 0 0"
            className="overflow-hidden border border-border/50"
          >
            <CollapsedHeader agentCount={agents.length} onExpand={handleExpand} />
          </LiquidGlassCard>
        </div>

        <ChatWindows
          openChats={openChats}
          expandedChats={expandedChats}
          onToggleExpand={handleToggleExpand}
          onClose={handleCloseChat}
          calculateWindowOffset={calculateWindowOffset}
        />
      </>,
      document.body
    );
  }

  // Render expanded widget
  return ReactDOM.createPortal(
    <>
      <div className="fixed bottom-0 right-6 z-[9999] w-[360px] h-[90vh] max-h-[calc(100vh-1rem)]">
        <LiquidGlassCard
          draggable={false}
          blurIntensity="md"
          shadowIntensity="sm"
          glowIntensity="xs"
          borderRadius="12px 12px 0 0"
          className="overflow-hidden border border-border/50 h-full flex flex-col"
        >
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <ExpandedHeader
              onCollapse={handleCollapse}
              onCreateAgent={handleCreateAgent}
            />

            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />

            <AgentList
              agents={filteredAgents}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onAgentClick={handleAgentClick}
              onAgentEdit={handleEditAgent}
              onNavigateToAgents={handleNavigateToAgents}
            />
          </div>
        </LiquidGlassCard>
      </div>

      <ChatWindows
        openChats={openChats}
        expandedChats={expandedChats}
        onToggleExpand={handleToggleExpand}
        onClose={handleCloseChat}
        calculateWindowOffset={calculateWindowOffset}
      />
    </>,
    document.body
  );
};

export default memo(AgentMessagingWidget);

