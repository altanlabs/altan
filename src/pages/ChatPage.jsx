import React from 'react';

import { useAuthContext } from '../auth/useAuthContext';
import { CompactLayout } from '../layouts/dashboard';
import { Room } from '../lib/agents';

const ROOM_ID = '914c72e1-99c5-4e99-b77a-e61fb18953b4';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuthContext();

  // Prepare guest info based on authentication status
  const guestInfo =
    isAuthenticated && user
      ? {
          external_id: user.id.toString(),
          first_name: user.first_name || 'User',
          last_name: user.last_name || '',
          email: user.email || '',
          avatar_url: user.avatar_url || '',
        }
      : {
          first_name: 'Guest',
          last_name: 'User',
        };

  return (
    <CompactLayout
      noPadding
      title="Community Chat"
    >
      <Room
        mode="room"
        accountId="9d8b4e5a-0db9-497a-90d0-660c0a893285"
        roomId={ROOM_ID}
        guestInfo={guestInfo}
        onRoomJoined={(guest) => {
          console.log('Joined community chat:', guest.id);
        }}
        onAuthSuccess={(guest) => {
          console.log('Authenticated for chat:', guest.first_name);
        }}
        onError={(error) => {
          console.error('Chat error:', error);
        }}
      />
    </CompactLayout>
  );
}
