import React, { memo, useMemo, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AgentChatWindow from './AgentChatWindow';
import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';
import StaticGradientAvatar from '../../../components/agents/StaticGradientAvatar';
import { CustomAvatar } from '../../../components/custom-avatar';
import { LiquidGlassCard } from '../../../components/elevenlabs/liquid-glass';
import Iconify from '../../../components/iconify/Iconify';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import { fetchAgentDmRoom } from '../../../redux/slices/agents';
import { selectSortedAgents } from '../../../redux/slices/general';

// Memoized selectors - defined outside component for optimal performance
const selectAgents = (state) => selectSortedAgents(state) || [];
const selectAgentsInitialized = (state) => state.general.accountAssetsInitialized?.agents;

const AgentMessagingWidget = () => {
  // Optimized selectors
  const agents = useSelector(selectAgents);
  const agentsInitialized = useSelector(selectAgentsInitialized);
  const isLoading = !agentsInitialized;
  const dispatch = useDispatch();
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openChats, setOpenChats] = useState([]);
  const [expandedChats, setExpandedChats] = useState(new Set()); // Track which chats are expanded

  // Filter agents based on search - memoized
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => agent.name.toLowerCase().includes(query));
  }, [agents, searchQuery]);

  // Handlers - all memoized with useCallback for performance
  // OPTIMIZATION: Lazy load DM rooms only when agent is clicked, not on mount
  // This prevents N API calls on component mount where N = number of agents
  const handleAgentClick = useCallback((agent) => {
    // Check if chat is already open
    const existingChat = openChats.find((chat) => chat.id === agent.id);
    if (!existingChat) {
      setOpenChats((prev) => [...prev, agent]);
      // Fetch DM room only when agent is clicked (lazy loading)
      // fetchAgentDmRoom has internal caching, so repeated clicks won't re-fetch
      dispatch(fetchAgentDmRoom(agent.id));
    }
  }, [openChats, dispatch]);

  const handleEditAgent = useCallback((agent, e) => {
    e.stopPropagation(); // Prevent opening chat
    history.push(`/agent/${agent.id}`);
  }, [history]);

  const handleCloseChat = useCallback((agentId) => {
    setOpenChats((prev) => prev.filter((chat) => chat.id !== agentId));
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      newSet.delete(agentId);
      return newSet;
    });
  }, []);

  const handleToggleExpand = useCallback((agentId) => {
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

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleCreateAgent = useCallback(() => {
    const genesisAgent = agents.find(agent => agent.name.toLowerCase() === 'genesis');
    if (genesisAgent) {
      handleAgentClick(genesisAgent);
    }
  }, [agents, handleAgentClick]);

  const handleNavigateToAgents = useCallback(() => {
    history.push('/agents');
  }, [history]);

  // Render agent avatar based on available data - memoized
  const renderAgentAvatar = useCallback((agent, size = 48) => {
    const hasAvatarUrl = agent.avatar_url && agent.avatar_url.trim() !== '';

    if (hasAvatarUrl) {
      return (
        <CustomAvatar
          src={agent.avatar_url}
          alt={agent.name}
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
          }}
          name={agent.name}
          className="transition-transform group-hover:scale-105"
        />
      );
    }

    return (
      <StaticGradientAvatar
        size={size}
        colors={agent?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1']}
        className="transition-transform group-hover:scale-105"
      />
    );
  }, []);

  // Calculate cumulative offset for each chat window based on expanded states
  // Memoize to ensure it recalculates when expandedChats changes
  const calculateWindowOffset = useMemo(() => {
    return (index) => {
      const baseOffset = 378; // Messaging widget (360px) + gap (12px) + adjustment (6px)
      let cumulativeOffset = baseOffset;

      // Add up the widths of all windows BEFORE this one
      for (let i = 0; i < index; i++) {
        const chat = openChats[i];
        const isWindowExpanded = expandedChats.has(chat.id);
        const windowWidth = isWindowExpanded ? 600 : 400;
        cumulativeOffset += windowWidth + 12; // window width + gap
      }

      return cumulativeOffset;
    };
  }, [openChats, expandedChats]);

  // Collapsed widget - just shows header
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
            {/* Header */}
            <div
              onClick={handleExpand}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors"
            >
              <AgentOrbAvatar
                size={40}
                agentId="agents-widget"
                isStatic={false}
                className="shadow-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">Agents</h3>
                {agents.length > 0 && (
                  <p className="text-xs text-muted-foreground">{agents.length} available</p>
                )}
              </div>
              <Iconify icon="mdi:chevron-up" width={20} className="text-muted-foreground" />
            </div>
          </LiquidGlassCard>
        </div>

        {/* Render open chat windows */}
        {openChats.map((agent, index) => (
          <AgentChatWindow
            key={agent.id}
            agent={agent}
            windowIndex={index}
            isExpanded={expandedChats.has(agent.id)}
            onToggleExpand={() => handleToggleExpand(agent.id)}
            onClose={() => handleCloseChat(agent.id)}
            rightOffset={calculateWindowOffset(index)}
          />
        ))}
      </>,
      document.body,
    );
  }

  // Expanded widget - full interface
  return ReactDOM.createPortal(
    <>
      <div className="fixed bottom-0 right-6 z-[9999] w-[360px] h-[90vh] max-h-[calc(100vh-1rem)] flex flex-col">
        <LiquidGlassCard
          draggable={false}
          blurIntensity="md"
          shadowIntensity="sm"
          glowIntensity="xs"
          borderRadius="12px 12px 0 0"
          className="overflow-hidden border border-border/50 h-full flex flex-col"
        >
          {/* Agent List view */}
          <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-border/50"
            >
              <AgentOrbAvatar
                size={40}
                agentId="agents-widget"
                isStatic={false}
                className="flex-shrink-0 shadow-lg"
              />
              <h3 className="flex-1 font-semibold text-base text-foreground">Agents</h3>
              <Button
                onClick={handleCreateAgent}
                size="sm"
                className="rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground flex-shrink-0"
              >
                <Iconify icon="mdi:plus-circle" width={16} className="mr-1.5" />
                Create Agent
              </Button>
              <button
                onClick={handleCollapse}
                className="p-2 hover:bg-accent/30 rounded transition-colors flex-shrink-0"
                title="Minimize"
              >
                <Iconify icon="mdi:chevron-down" width={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search - Modern style */}
            <div className="px-3 py-2 border-b border-border/50">
              <div className="relative">
                <Iconify
                  icon="mdi:magnify"
                  width={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                />
                <Input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-9 bg-background/40 border border-border/30 focus-visible:ring-1 focus-visible:ring-ring"
                />
                {searchQuery && (
                  <Button
                    onClick={handleClearSearch}
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  >
                    <Iconify icon="mdi:close" width={14} />
                  </Button>
                )}
              </div>
            </div>

            {/* Agent List - Modern scrollable list */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-0">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3',
                        i % 2 === 0 ? 'bg-accent/20' : 'bg-background/20',
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                    <Iconify icon="mdi:robot-outline" width={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {searchQuery ? 'No agents found' : 'No agents yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search' : 'Create your first AI agent to get started'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleNavigateToAgents}
                      size="sm"
                      className="rounded-full"
                    >
                      Create agent
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredAgents.map((agent, index) => (
                    <div
                      key={agent.id}
                      className={cn(
                        'w-full relative flex items-center gap-2 pl-3 pr-12 py-3 transition-all group cursor-pointer',
                        index % 2 === 0
                          ? 'bg-accent/20 hover:bg-accent/30'
                          : 'bg-background/20 hover:bg-background/30',
                      )}
                      onClick={() => handleAgentClick(agent)}
                    >
                      <div className="relative flex-shrink-0">
                        {renderAgentAvatar(agent, 44)}
                        {/* Online status indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {agent.name}
                        </h4>
                      </div>
                      <Button
                        onClick={(e) => handleEditAgent(agent, e)}
                        variant="default"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary-foreground z-10"
                        title="Edit agent"
                      >
                        <Iconify icon="mdi:pencil" width={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Render open chat windows - positioned to the left of the messaging widget */}
      {openChats.map((agent, index) => (
        <AgentChatWindow
          key={agent.id}
          agent={agent}
          windowIndex={index}
          isExpanded={expandedChats.has(agent.id)}
          onToggleExpand={() => handleToggleExpand(agent.id)}
          onClose={() => handleCloseChat(agent.id)}
          rightOffset={calculateWindowOffset(index)}
        />
      ))}
    </>,
    document.body,
  );
};

export default memo(AgentMessagingWidget);
