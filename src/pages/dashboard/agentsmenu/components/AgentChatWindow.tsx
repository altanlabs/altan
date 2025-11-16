/**
 * AgentChatWindow Component
 * Displays a floating chat window for agent DMs with minimize, expand/collapse, and open in new tab features
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

// @ts-expect-error - JSX component without types
import StaticGradientAvatar from '../../../../components/agents/StaticGradientAvatar';
// @ts-expect-error - JS component without types
import { CustomAvatar } from '../../../../components/custom-avatar';
// @ts-expect-error - JSX component without types
import Iconify from '../../../../components/iconify/Iconify';
import { fetchAgentRoom, selectAgentRoom } from '../../../../redux/slices/agents';
import type { Agent } from '../types';

interface AgentChatWindowProps {
  agent: Agent;
  onClose: () => void;
  windowIndex?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  rightOffset?: number;
}

const DEFAULT_COLORS = ['#CADCFC', '#A0B9D1'];

const AgentChatWindow: React.FC<AgentChatWindowProps> = ({
  agent,
  onClose,
  windowIndex = 0,
  isExpanded = false,
  onToggleExpand,
  rightOffset: providedOffset,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const agentRoom = useSelector(selectAgentRoom(agent.id));
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (agent) {
      // Pass setAsCurrent=false to avoid setting this as the main current agent
      // @ts-expect-error - Redux thunk type mismatch
      dispatch(fetchAgentRoom(agent.id, false));
    }
  }, [agent, dispatch]);

  const handleNavigateToAgent = (): void => {
    history.push(`/agent/${agent.id}`);
  };

  // Render agent avatar based on available data
  const renderAgentAvatar = (size = 32): React.ReactNode => {
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
            cursor: 'pointer',
          }}
          name={agent.name}
          onClick={handleNavigateToAgent}
        />
      );
    }

    // @ts-expect-error - meta_data type definition incomplete
    const colors = agent?.meta_data?.avatar_orb?.colors || DEFAULT_COLORS;
    return (
      <StaticGradientAvatar
        size={size}
        colors={colors}
        onClick={handleNavigateToAgent}
        className="cursor-pointer"
      />
    );
  };

  // Determine window dimensions based on expanded state
  const windowWidth = isExpanded ? 600 : 400;
  const windowHeight = isExpanded ? '95vh' : '70vh';

  // Use provided offset or fallback to simple calculation
  const rightOffset = providedOffset ?? 378 + windowIndex * 412;

  return (
    <div
      className="fixed bottom-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
      style={{
        right: `${rightOffset}px`,
        width: isMinimized ? '260px' : `${windowWidth}px`,
        maxHeight: isMinimized ? '52px' : 'calc(100vh - 1rem)',
        height: isMinimized ? '52px' : windowHeight,
        zIndex: 9999,
      }}
    >
      <div className="rounded-t-xl shadow-2xl overflow-hidden flex flex-col h-full bg-background">
        {/* Chat Header */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-background cursor-pointer hover:bg-accent/20 transition-colors flex-shrink-0"
        >
          {/* Avatar - clickable to navigate to agent page */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateToAgent();
            }}
          >
            {renderAgentAvatar(32)}
          </div>

          {/* Agent name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{agent.name}</h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Open in new tab button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (agentRoom?.dmRoomId) {
                  window.open(`/r/${agentRoom.dmRoomId}`, '_blank');
                }
              }}
              className="p-2 hover:bg-accent/30 rounded transition-colors"
              title="Open chat in new tab"
              disabled={!agentRoom?.dmRoomId}
            >
              <Iconify
                icon="mdi:open-in-new"
                width={16}
                className={
                  agentRoom?.dmRoomId ? 'text-muted-foreground' : 'text-muted-foreground/30'
                }
              />
            </button>

            {/* Expand/Collapse width button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="p-2 hover:bg-accent/30 rounded transition-colors"
              title={isExpanded ? 'Collapse width' : 'Expand width'}
            >
              <Iconify
                icon={isExpanded ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'}
                width={16}
                className="text-muted-foreground"
              />
            </button>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-accent/30 rounded transition-colors"
              title="Close"
            >
              <Iconify icon="mdi:close" width={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Content - Iframe to DM Room - Always rendered to preserve state */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            display: isMinimized ? 'none' : 'flex',
          }}
        >
          {agentRoom?.dmRoomId ? (
            <iframe
              key={`dm-${agent.id}`}
              src={`/r/${agentRoom.dmRoomId}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={`Chat with ${agent.name}`}
              allow="microphone; camera; clipboard-write"
            />
          ) : (
            <div className="flex items-center justify-center h-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(AgentChatWindow);

