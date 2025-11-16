/**
 * Chat Panel Component
 * Single Responsibility: Renders chat interface with room container
 */

import React from 'react';
import { Panel } from 'react-resizable-panels';

import type { ChatPanelProps } from '../types';
import { getChatPanelConfig } from '../utils/panel-config';
import RoomContainer from '../../../../components/new-room/RoomContainer';

export function ChatPanel({
  roomId,
  isOperateRoute,
  panelRef,
  shouldCollapse,
}: ChatPanelProps): React.ReactElement {
  const panelConfig = getChatPanelConfig(shouldCollapse);

  return (
    <Panel
      ref={panelRef}
      id="chat-panel"
      order={1}
      defaultSize={panelConfig.defaultSize}
      minSize={panelConfig.minSize}
      maxSize={panelConfig.maxSize}
      collapsible={true}
      collapsedSize={0}
      className="overflow-hidden"
    >
      <div className="h-full relative rounded-none overflow-hidden bg-transparent border-r border-neutral-200 dark:border-neutral-800">
        <RoomContainer
          key={`room-${roomId}`}
          roomId={roomId}
          mode={isOperateRoute ? 'ephemeral' : 'tabs'}
          showSettings={!isOperateRoute}
          showConversationHistory={true}
          showMembers={true}
          renderCredits={true}
          renderFeedback={true}
        />
      </div>
    </Panel>
  );
}

