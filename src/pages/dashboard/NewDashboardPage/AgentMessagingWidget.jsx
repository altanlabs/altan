import React, { memo, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { AgentOrbAvatar } from '../../../components/agents/AgentOrbAvatar';
import StaticGradientAvatar from '../../../components/agents/StaticGradientAvatar';
import { CustomAvatar } from '../../../components/custom-avatar';
import { LiquidGlassCard } from '../../../components/elevenlabs/liquid-glass';
import Iconify from '../../../components/iconify/Iconify';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import AgentChatWindow from './AgentChatWindow';

const AgentMessagingWidget = ({ agents = [], isLoading = false }) => {
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openChats, setOpenChats] = useState([]);
  const [expandedChats, setExpandedChats] = useState(new Set()); // Track which chats are expanded

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => agent.name.toLowerCase().includes(query));
  }, [agents, searchQuery]);

  const handleAgentClick = (agent) => {
    // Check if chat is already open
    const existingChat = openChats.find((chat) => chat.id === agent.id);
    if (!existingChat) {
      setOpenChats((prev) => [...prev, agent]);
    }
  };

  const handleEditAgent = (agent, e) => {
    e.stopPropagation(); // Prevent opening chat
    history.push(`/agent/${agent.id}`);
  };

  const handleCloseChat = (agentId) => {
    setOpenChats((prev) => prev.filter((chat) => chat.id !== agentId));
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      newSet.delete(agentId);
      return newSet;
    });
  };

  const handleToggleExpand = (agentId) => {
    setExpandedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  // Render agent avatar based on available data
  const renderAgentAvatar = (agent, size = 48) => {
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
  };

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
              onClick={() => setIsExpanded(true)}
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
      document.body
    );
  }

  // Expanded widget - full interface
  return ReactDOM.createPortal(
    <>
      <div className="fixed bottom-0 right-6 z-[9999] w-[360px] h-[800px] flex flex-col">
        <LiquidGlassCard
          draggable={false}
          blurIntensity="md"
          shadowIntensity="sm"
          glowIntensity="xs"
          borderRadius="12px 12px 0 0"
          className="overflow-hidden border border-border/50"
        >
          {/* Agent List view */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div 
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-accent/20 transition-colors"
            >
              <AgentOrbAvatar
                size={40}
                agentId="agents-widget"
                isStatic={false}
                className="flex-shrink-0 shadow-lg"
              />
              <h3 className="flex-1 font-semibold text-base text-foreground">Agents</h3>
              <Iconify icon="mdi:chevron-down" width={20} className="text-muted-foreground" />
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 bg-background/40 border border-border/30 focus-visible:ring-1 focus-visible:ring-ring"
                />
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
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
                        "flex items-center gap-3 px-4 py-3",
                        i % 2 === 0 ? "bg-accent/20" : "bg-background/20"
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
                      onClick={() => history.push('/agents')}
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
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 transition-all text-left group",
                        index % 2 === 0
                          ? "bg-accent/20 hover:bg-accent/30"
                          : "bg-background/20 hover:bg-background/30"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        {renderAgentAvatar(agent, 48)}
                        {/* Online status indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {agent.name}
                          </h4>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {agent.date_creation && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(agent.date_creation).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                            {/* Edit button - appears below date on hover */}
                            <Button
                              onClick={(e) => handleEditAgent(agent, e)}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Edit agent"
                            >
                              <Iconify icon="mdi:pencil" width={12} className="text-muted-foreground mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description || 'AI Agent ready to assist'}
                        </p>
                      </div>
                    </button>
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
          onClose={() => handleCloseChat(agent.id)}
        />
      ))}
    </>,
    document.body
  );
};

export default memo(AgentMessagingWidget);

