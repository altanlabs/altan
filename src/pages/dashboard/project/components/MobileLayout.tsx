/**
 * Mobile layout component
 * Single Responsibility: Mobile-specific layout and rendering
 * Theme-aware with transparent backgrounds
 */

import React from 'react';
import { createPortal } from 'react-dom';

import RoomContainer from '../../../../components/new-room/RoomContainer';
import type { Altaner } from '../types';

interface MobileLayoutProps {
  altaner: Altaner;
  isOperateRoute: boolean;
  isFullscreenMobile: boolean;
}

export function MobileLayout({
  altaner,
  isOperateRoute,
  isFullscreenMobile,
}: MobileLayoutProps): React.ReactElement {
  const mobileContent = (
    <div
      className="fixed inset-0 w-full h-full bg-transparent"
      style={{
        zIndex: isFullscreenMobile ? 9999 : 1000,
        position: 'fixed',
        width: '100vw',
        height: isFullscreenMobile ? '100dvh' : 'calc(100dvh - 64px)',
        overflow: 'hidden',
        top: isFullscreenMobile ? 0 : '64px',
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          height: '100%',
          width: '100vw',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <RoomContainer
          key={`mobile-room-${(altaner as { room_id?: string }).room_id}`}
          roomId={(altaner as { room_id?: string }).room_id as string}
          mode={isOperateRoute ? 'ephemeral' : 'tabs'}
          showSettings={!isOperateRoute}
          showConversationHistory={true}
          showMembers={true}
          renderCredits={true}
          renderFeedback={true}
        />
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'none' }} />
      {createPortal(mobileContent, document.body)}
    </>
  );
}
