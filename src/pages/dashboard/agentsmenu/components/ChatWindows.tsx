/**
 * ChatWindows Component
 * Following Single Responsibility Principle - handles rendering of chat windows
 */

import { memo } from 'react';
import AgentChatWindow from './AgentChatWindow';
import type { Agent } from '../types';

interface ChatWindowsProps {
  openChats: Agent[];
  expandedChats: Set<string>;
  onToggleExpand: (agentId: string) => void;
  onClose: (agentId: string) => void;
  calculateWindowOffset: (index: number) => number;
}

export const ChatWindows = memo<ChatWindowsProps>(({
  openChats,
  expandedChats,
  onToggleExpand,
  onClose,
  calculateWindowOffset,
}) => (
  <>
    {openChats.map((agent, index) => (
      <AgentChatWindow
        key={agent.id}
        agent={agent}
        windowIndex={index}
        isExpanded={expandedChats.has(agent.id)}
        onToggleExpand={() => onToggleExpand(agent.id)}
        onClose={() => onClose(agent.id)}
        rightOffset={calculateWindowOffset(index)}
      />
    ))}
  </>
));

ChatWindows.displayName = 'ChatWindows';

